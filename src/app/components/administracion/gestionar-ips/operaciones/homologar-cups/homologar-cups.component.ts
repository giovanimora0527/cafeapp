import { Component, OnInit, Input, Inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import * as jwt_decode from "jwt-decode";

/**
 * Modelos
 */
import { Norma } from "src/app/_models/administracion/shared/norma";
import { Cups } from "src/app/_models/administracion/cups";

import { Directivas } from "src/app/_directives/directiva/directiva.directive";

/**
 * Servicios
 */
import { NormaService } from "../../../../../_services/administracion/norma/norma.service";
import { CupsService } from "../../../../../_services/administracion/cups/cups.service";
import { NgxSpinnerService } from "ngx-spinner";
import swal from "sweetalert2";
import { AsociarService } from "src/app/_services/administracion/ips/asociar.service";
import { EntidadService } from "src/app/_services/administracion/entidad/entidad.service";
import { first } from "rxjs/operators";

@Component({
  selector: "app-homologar-cups",
  templateUrl: "./homologar-cups.component.html",
  styleUrls: ["./homologar-cups.component.css"]
})
export class HomologarCupsComponent implements OnInit {
  @Input() idEntidad: string;
  msjSpinner: string;
  cupsInternosArray: Cups[];
  allCupsArray: Cups[];
  allCupsInternosArray: Cups[];
  cupsArray: Cups[];
  resultados: any[] = [];
  resultadosInternos: any[] = [];
  isCheckedInternos: boolean = false;
  isCheckedNorma: boolean = false;

  normas: Norma[] = [];
  normaSelected: Norma = null;
  normaActual: Norma = null;
  isDisabledSelect: boolean = false;
  cupsSelectedInterno: Cups;
  cupsSelectedNorma: Cups;
  isNormaSelectedActual: boolean = false;
  cupsHomologado: Cups;
  isHomologado: boolean = false;
  habilitarBtns: boolean = false;
  existCodNormaEquivalenteHomologado: Boolean = false;

  constructor(
    private route: ActivatedRoute,
    private normaService: NormaService,
    private entidadService: EntidadService, 
    private cupsService: CupsService,
    private spinner: NgxSpinnerService,
    private asociarService: AsociarService
  ) {
    
  }


  ngOnInit() {
    this.cargarInfoEntLogueada();      
    this.cargarDataInicial();
  }

  /**
   * Método que permite cargar los datos basicos para mostrar de la entidad logueada
   */
  cargarInfoEntLogueada() {
    var token = sessionStorage.getItem('currentUser');
    let info = jwt_decode(token); 
    this.entidadService.getEntidadesById(info.ent)
    .pipe(first())  
    .subscribe(
      data => {        
        this.idEntidad = data["id"];
        this.cargarCupsInternos(this.idEntidad);    
      }
    );
  }
  
  /**
   * Metodo que carga los datos iniciales que necesita la vista
   */
  cargarDataInicial() {    
    this.getNormas();
    this.cargarCupsInternosAll();
  }

  /**
   * Metodo que carga por defecto todos los cups de norma
   */
  cargarCupsNormaAll() {
    this.cupsService.getCUPSByNorma("" + this.normaActual.id).subscribe(
      data => {
        this.allCupsArray = data;
        Directivas.orderAsc(this.allCupsArray, "detalle");
      },
      error => {
        this.spinner.hide();
      }
    );
  }

  /**
   * Metodo que carga por defecto todos los cups de norma
   */
  cargarCupsInternosAll() {
    this.cupsService.getCUPSByNorma("" + this.idEntidad).subscribe(
      data => {
        this.allCupsInternosArray = data;
        Directivas.orderAsc(this.allCupsArray, "detalle");
      },
      error => {
        this.spinner.hide();
      }
    );
  }

  /**
   * Metodo que permite cargar los cups internos que son candidatos para homologar
   */
  cargarCupsInternos(idEntidad?: string) {   
    if(idEntidad != undefined && idEntidad != null) {
      this.idEntidad = idEntidad; 
    }
    this.cupsInternosArray = [];
    this.resultadosInternos = [];    
    this.cupsService.getCupsForHomologar(this.idEntidad).subscribe(data => {
      this.cupsInternosArray = data;      
      this.resultadosInternos = Directivas.orderAsc(this.cupsInternosArray, "codigo");
    });
  }

  /**
   * Metodo que permite controlar el evento de seleccionar el checkbox y
   * cargar todos los cups internos
   * @param event
   */
  mostrarTodoCupsInternos(event?) {
    this.isCheckedInternos = event;
    this.habilitarBtns = this.isCheckedInternos || this.isCheckedNorma;
    if (event) {
      this.cupsService.getCUPSByNorma(this.idEntidad).subscribe(data => {
        this.cupsInternosArray = [];
        this.resultadosInternos = [];
        this.cupsInternosArray = data;
        this.resultadosInternos = this.cupsInternosArray;
        this.resultadosInternos = Directivas.orderAsc(this.resultadosInternos, "codigo");
      });
    } else {
      this.cargarCupsInternos();
    }
    this.resultados = [];
  }

  /**
   * Metodo que permite listar las normas registradas para CUPS
   */
  getNormas() {
    this.normas = [];
    this.normaService
      .getNormasByTipo(Directivas.TIPO_NORMA_CUPS)
      .subscribe(data => {
        this.normas = data;
        if (this.normas != null && this.normas.length > 0) {
          this.normaActual = this.normas[0];
          this.normaSelected = this.normaActual;
          this.isNormaSelectedActual = true;
          this.cargarCupsNormaAll();
        }
      });
  }

  /**
   * Metodo que detecta el cambio en el selector de la norma en el formulario principal
   * @param norma
   */
  selectNorma(event?) {
    this.normas.filter((norma: Norma) => {
      if (norma.id == event.target.value) {
        this.normaSelected = norma;
      }
    });
    this.msjSpinner = "Cargando Cups...";
    this.spinner.show();
    if (this.normaSelected != null && event.target.value != 0) {
      this.cupsService.getCUPSByNormaHomologar("" + this.normaSelected.id).subscribe(
        data => {
          this.cupsArray = data;
          this.cupsArray.sort((a, b) => {
            return (
              <any>new Date(b.fechaInicioVigencia) -
              <any>new Date(a.fechaInicioVigencia)
            );
          });
          this.resultados = this.cupsArray;          
          this.validarCups(this.resultados);
          this.isNormaSelectedActual = this.normaSelected.id == this.normaActual.id ? true : false;
          this.spinner.hide();        
        },
        error => {
          this.spinner.hide();
        }
      );
      this.spinner.hide();
    } else {
      this.cupsService.getCUPSByNorma(this.idEntidad).subscribe(
        data => {
          this.cupsArray = data;
          this.cupsArray.sort((a, b) => {
            return (
              <any>new Date(b.fechaInicioVigencia) -
              <any>new Date(a.fechaInicioVigencia)
            );
          });
          this.resultados = this.cupsArray;          
          this.spinner.hide();
        },
        error => {
          console.log(error);
          this.spinner.hide();
        }
      );
      this.spinner.hide();
    }
  }

  /**
   * Metodo que captura el evento de seleccionar un elemento de la tabla
   * Cups Internos
   * @param idMenu
   */

  selectItemInternos(c?: Cups) {
    this.cupsSelectedInterno = c;
    this.habilitarBtns = true;
    var checkbox = document.getElementById("checkCups2") as HTMLInputElement;
    checkbox.checked = false;
    for (let i = 0; i < this.cupsInternosArray.length; i++) {
      let cod: string = "int_" + this.cupsInternosArray[i].id;
      var item = document.getElementById(cod);
      if (item != null && item.classList != null) {
        item.classList.remove("table-primary");
      }
    }

    let codigo = "int_" + c.id;
    var item = document.getElementById(codigo);
    item.classList.add("table-primary");
    var instance = this;

    if (!this.isNormaSelectedActual) {
      this.cupsService
        .getCUPSByNorma("" + this.normaSelected.id)
        .subscribe(data => {
          this.cupsArray = [];
          this.resultados = [];
          this.cupsArray = data;
          this.resultados = this.cupsArray;
          this.validarCups(this.resultados);
          this.resultados = Directivas.orderAsc(this.resultados, "codigo");         
        });
      return;
    }

    this.existCodNormaEquivalenteHomologado = false;
    this.cupsService.getCupsByNormaAHomologar(c.codigo, c.detalle).subscribe(
      data => {
        this.cupsArray = data;
        this.resultados = this.cupsArray;
        this.resultados = Directivas.orderAsc(this.cupsArray, "codigo");
        this.normaSelected = this.normas[0];        
        if (this.resultados != null && this.resultados.length > 0) {         
          for (var i = 0; i < this.resultados.length; i++) {             
            if (this.resultados[i].codigo == c.codHomologar) {
              instance.cupsHomologado = this.resultados[i];             
              let codigo = "norma_" + instance.cupsHomologado.id;            
              setTimeout(() => {
                this.selectCupAsync(codigo);
              }, 0);
              this.isDisabledSelect = true;
              this.existCodNormaEquivalenteHomologado = true;
              break;
            }
          }
          this.isDisabledSelect = false;
        }
        this.validarEnAllCupsNorma();
      },
      error => {
        console.log(error);
      }
    );
  }
  
  /**
   * Metodo que valida si existen cups homologados con el cup interno seleccionado
   * @param cupsArray 
   */
  validarCups(cupsArray: Cups[]){   
    let arrayAux = [];
    arrayAux = cupsArray.filter((c: Cups) => {
      return c.codigo == this.cupsSelectedInterno.codHomologar;
    });

    if (arrayAux.length > 0) {
      this.resultados = arrayAux;
      return;
    }
    this.resultados = []; 
  }

  /**
   * Metodo que permite validar y devolver si un cups de norma se encuentra homologado
   * fuera de las coincidencias
   */
  validarEnAllCupsNorma() {
    if (this.cupsSelectedInterno != null) {
      let arrayAux = [];
      arrayAux = this.allCupsArray.filter((c: Cups) => {        
        return c.codigo == this.cupsSelectedInterno.codHomologar;
      }); 

      if (arrayAux.length > 0) {
        this.resultados = arrayAux;        
      }
    }
  }

  /**
   * Método asincrono para seleccionar un item de Cups por norma
   * @param codigo
   */
  async selectCupAsync(codigo: string) {
    var item = document.getElementById(codigo) as HTMLElement;
    item.classList.add("table-primary");
  }

  /**
   * Metodo que captura el evento de seleccionar un elemento de la tabla
   * Cups X Norma
   * @param idMenu
   */
  selectItemCupsXNorma(s: Cups) {
    this.cupsSelectedNorma = s;
    if (this.isDisabledSelect || !this.isNormaSelectedActual) {
      return;
    }   
    for (let i = 0; i < this.resultados.length; i++) {
      let cod: string = "norma_" + this.resultados[i].id;
      var item = document.getElementById(cod);      
      if (item != null && item.classList != null) {
        item.classList.remove("table-primary");
      }
    }
    let codigo = "norma_" + this.cupsSelectedNorma.id;
    var item = document.getElementById(codigo);
    item.classList.add("table-primary");
  }

  /**
   * Filtrar los datos de la tabla de los cups internos
   * @param patron - texto ingresado a buscar
   */
  filterBy(patron: string) {
    if (patron == "") {
      this.cargarCupsInternos();
      return;
    }
    const splitted: Array<string> = patron
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase()
      .normalize("NFD")
      .replace(/\s\s+/g, " ")
      .split(" ");
    this.resultadosInternos = this.allCupsInternosArray.filter((cups: Cups) => {
      const noCodigoWords: Array<string> = [];
      for (let i = 0; i < splitted.length; i++) {
        const word = splitted[i].trim();
        if (
          !cups.codigo.toLocaleLowerCase().includes(word) &&
          !cups.detalle.toLocaleLowerCase().includes(word)
        ) {
          noCodigoWords.push(word);
        }
      }
      return cups.detalle
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase()
        .normalize("NFD")
        .match(`.*${noCodigoWords.join(".*")}.*`);
    });
  }

  /**
   * Filtrar los datos de la tabla de los cups por norma
   * @param patron - texto ingresado a buscar
   */
  filterByNorma(patron: string) {
    if (patron == "") {
      this.resultados = [];
      return;
    }
    this.habilitarBtns = true;
    if (!this.isNormaSelectedActual) {
      const splitted: Array<string> = patron
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase()
        .normalize("NFD")
        .replace(/\s\s+/g, " ")
        .split(" ");
      this.resultados = this.cupsArray.filter((cups: Cups) => {
        const noCodigoWords: Array<string> = [];
        for (let i = 0; i < splitted.length; i++) {
          const word = splitted[i].trim();
          if (
            !cups.codigo.toLocaleLowerCase().includes(word) &&
            !cups.detalle.toLocaleLowerCase().includes(word)
          ) {
            noCodigoWords.push(word);
          }
        }
        return cups.detalle
          .replace(/[\u0300-\u036f]/g, "")
          .toLocaleLowerCase()
          .normalize("NFD")
          .match(`.*${noCodigoWords.join(".*")}.*`);
      });
      return;
    }

    const splitted: Array<string> = patron
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase()
      .normalize("NFD")
      .replace(/\s\s+/g, " ")
      .split(" ");
    this.resultados = this.allCupsArray.filter((cups: Cups) => {
      const noCodigoWords: Array<string> = [];
      for (let i = 0; i < splitted.length; i++) {
        const word = splitted[i].trim();
        if (
          !cups.codigo.toLocaleLowerCase().includes(word) &&
          !cups.detalle.toLocaleLowerCase().includes(word)
        ) {
          noCodigoWords.push(word);
        }
      }
      return cups.detalle
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase()
        .normalize("NFD")
        .match(`.*${noCodigoWords.join(".*")}.*`);
    });
  }

  /**
   * Metodo que homologa un cup interno con uno de norma
   * @param cupsSelecInterno
   * @param cupsSelecNorma
   */
  homologar(cups?: Cups) {
    var banderaHomologacion: boolean = false;
    if (this.cupsSelectedInterno == null) {
      swal(
        "Advertencia",
        "Debe seleccionar un CUPS interno para poder continuar.",
        "warning"
      );
      return;
    }
    var instance = this; 
    this.cupsSelectedNorma = cups;   
    banderaHomologacion =  this.cupsSelectedNorma != null && this.cupsSelectedNorma.codHomologar != null && 
    this.cupsSelectedNorma.codHomologar != ""? true: false;  

    if (banderaHomologacion) {
      let msj2 =
        "El CUPS de norma  " +
        cups.codigo +
        " ya se encuentra homologado con el CUPS interno " +
        cups.codHomologar +
        ", ¿Desea quitar la homologación y asociarlo al CUPS interno seleccionado?";

      this.generarModalConfirmacion(msj2).then(response => {
        if (response.value) {
          let cupsAHomologar = instance.cupsSelectedInterno;
          cupsAHomologar.codHomologar = cups.codigo;           
         
          instance.cupsService.editCups(cupsAHomologar).subscribe(
            data => {
              swal("Éxito", "Los cambios se han guardado con éxito", "success");
              instance.cargarCupsInternos();
              var checkbox = document.getElementById("checkCups") as HTMLInputElement;
              checkbox.checked = false;
              instance.resultados = [];
              instance.cupsArray = [];
              instance.cargarCupsInternosAll();
            },
            error => {
              swal("Error", error.message, "error");
            }
          );
        }
        if (response.dismiss){
          banderaHomologacion = false;
        }
      });
      banderaHomologacion = false;
    } else {
      var msj = "¿Desea Homologar el código Interno " + this.cupsSelectedInterno.codigo +
      " por " + cups.codigo +"?";  
      this.generarModalConfirmacion(msj).then(response => {
        if (response.value) {
          let cupsAHomologar = instance.cupsSelectedInterno;
          cupsAHomologar.codHomologar = cups.codigo;          
            
          instance.cupsService.editCups(cupsAHomologar).subscribe(
            data => {
              swal("Éxito", "Los cambios se han guardado con éxito", "success");
              instance.cargarCupsInternos();
              var checkbox = document.getElementById(
                "checkCups"
              ) as HTMLInputElement;
              checkbox.checked = false;
              instance.resultados = [];
              instance.cupsArray = [];
              instance.cargarCupsInternosAll();
            },
            error => {
              swal("Error", error.message, "error");
            }
          );
        }
      });
    }
  }

  /**
   * Metodo que permite deshomologar un CUP de Norma
   */
  deshomologar(cups: Cups) {
    var instance = this;
    var msj =
      "¿Desea quitar la homologación entre el código Interno " +
      this.cupsSelectedInterno.codigo +
      " y " +
      cups.codigo +
      "?";

    this.generarModalConfirmacion(msj).then(response => {
      if (response.value) {
        this.cupsSelectedInterno.codHomologar = null;
        instance.cupsService.editCups(this.cupsSelectedInterno).subscribe(
          data => {
            swal("Éxito", "Los cambios se han guardado con éxito", "success");
            instance.cargarCupsInternos();
            var checkbox = document.getElementById(
              "checkCups"
            ) as HTMLInputElement;
            checkbox.checked = false;
            instance.resultados = [];
            instance.cupsArray = [];
            instance.cargarCupsInternosAll();
          },
          error => {
            swal("Error", error.message, "error");
          }
        );
      }
    });
  }

  /**
   * Genera el modal de confirmación
   * @param mensaje - mensaje a mostrar en el modal
   */
  generarModalConfirmacion(mensaje: string) {
    return swal({
      text: mensaje,
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Aceptar"
    });
  }

  /**
   * Metodo que permite controlar el evento de seleccionar el checkbox y
   * cargar todos los cups por norma
   * @param event
   */
  mostrarTodoCupsXNorma(event?) {
    this.isCheckedNorma = event;
    this.habilitarBtns = true;
    if (event) {
      this.cupsService
        .getCUPSByNorma("" + this.normaSelected.id)
        .subscribe(data => {
          this.cupsArray = [];
          this.resultados = [];
          this.cupsArray = data;
          this.resultados = this.cupsArray;
          this.resultados = Directivas.orderAsc(this.resultados, "codigo");          
          if (this.cupsSelectedInterno != null) {
            let codigo = "int_" + this.cupsSelectedInterno.id;
            var item = document.getElementById(codigo);
            item.classList.remove("table-primary");          
          }         
        });
    } else {
      this.cupsArray = [];
      this.resultados = [];
      if (this.cupsSelectedInterno != null) {
        let codigo = "int_" + this.cupsSelectedInterno.id;
        var item = document.getElementById(codigo);
        item.classList.remove("table-primary");
      }
      this.cupsSelectedInterno = null;
    }
  }
}
