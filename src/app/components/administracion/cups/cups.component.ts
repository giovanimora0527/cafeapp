import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import swal, { SweetAlertType } from "sweetalert2";
import { IMyDpOptions } from "mydatepicker";

import { Cups } from "./../../../_models/administracion/cups/cups";
import { CupsService } from "../../../_services/administracion/cups/cups.service";
import { Directivas } from "../../../_directives/directiva/directiva.directive";
import { NormaService } from "../../../_services/administracion/norma/norma.service";
import { Norma } from "src/app/_models/administracion/shared/norma";

import * as jwt_decode from "jwt-decode";
import { Router } from "@angular/router";
import { AutenticacionService } from "src/app/_services/autenticacion/autenticacion.service";
import { PerfilPermiso } from "src/app/_models/administracion/menus/perfil-permiso";
import { PermisosService } from "src/app/_services/administracion/permisos/permisos.service";
import { first } from "rxjs/operators";
import { EntidadService } from "src/app/_services/administracion/entidad/entidad.service";

@Component({
  selector: "app-cups",
  templateUrl: "./cups.component.html",
  styleUrls: ["./cups.component.css"]
})
export class CupsComponent implements OnInit {
  readonly title: string = "CUPS";
  readonly titleModalCups: string =
    "Clasificación única de procedimientos de salud";
  readonly titleRenovarCups: string = "Datos de Cups";
  readonly cupsPattern: string = "[A-Za-zÀ-ü0-9]{1,6}"; // según la resolución debe tener 6 carácteres y son alfanuméricos

  readonly titleModal: string =
    "Importar Clasificación única de procedimientos de salud";
  readonly formatos: Array<string> = [
    "csv"
    // 'xls',
    // 'xlsx'
  ];
  @ViewChild("fileInput") fileInput: ElementRef;

  idEntidad: string;
  banderaOpciones: boolean = false;

  /**
   * Variables para validacion de permisos
   */
  permisosXPerfilArray: PerfilPermiso[] = [];
  arrayPermisos: any[] = [];
  permisosCode: Map<string, string>;
  hasPermissionsUpload: boolean = false;  
  hasPermissionsCreate: boolean = false; 
  hasPermissionsDelete: boolean = false; 
  hasPermissionsUpdate: boolean = false; 
  hasPermissionsDownload: boolean = false;
  hasPermissionRead: boolean = false;
  
  tipoEntidadID: string;

  public readonly datePickerOptions: IMyDpOptions = {
    // other options...
    dateFormat: "dd/mm/yyyy",
    showClearDateBtn: true,
    editableDateField: false,
    openSelectorOnInputClick: true
  };

  msjSpinner: string;

  cupsForm: FormGroup;

  cupsArray: Array<Cups>;
  resultados: Array<Cups> = [];

  cupsSeleccionado: Cups;
  codigoCupsConfirmado: string;

  submitted: boolean = false;
  edicion: boolean = false;

  normas: Norma[] = [];
  normaSelected: Norma = null;
  normaActual: Norma = null;
  normaSelectedModal: Norma = null;

  fileTxt = "";

  constructor(
    private formBuilder: FormBuilder,
    private cupsService: CupsService,
    private spinner: NgxSpinnerService,
    private normaService: NormaService,
    private router: Router,
    private autentication: AutenticacionService,
    private permisosService: PermisosService,
    private entidadService: EntidadService
  ) {
    this.validarPermisos();    
    let url: string = this.router.routerState.root.children[0].firstChild.routeConfig.path; 
    this.validarAcciones(url);
  }

  /**
   * Metodo que obtiene el tipo de entidad logueada
   * 1. ERPS
   * 2. IPS
   */
  async obtenerTipoEntidad(){
    var token = sessionStorage.getItem("currentUser");
    let info = jwt_decode(token);
    this.entidadService.getEntidadesById(info.ent)
    .pipe(first())
    .subscribe(
      data => {
        this.tipoEntidadID = data["tipoEntidad"];       
        if(this.tipoEntidadID == Directivas.TIPO_ENTIDAD_EPS.toString()) {
          this.hasPermissionsUpload = false;
          this.hasPermissionsCreate = false;         
        }        
        else if(this.tipoEntidadID == Directivas.TIPO_ENTIDAD_IPS.toString()) {
          this.hasPermissionsUpload = false;
          this.hasPermissionsCreate = true;
        }
        else if(this.tipoEntidadID == Directivas.TIPO_ENTIDAD_ASD.toString()){
          this.hasPermissionsUpload = true;
          this.hasPermissionsCreate = false;
        }

        if(this.tipoEntidadID == Directivas.TIPO_ENTIDAD_IPS.toString()) {
          let norma: Norma = new Norma();
          norma.id = 0;
          norma.nombre = "Cups Internos";
          norma.estado = 1;
          norma.tipo = Directivas.TIPO_NORMA_CUPS;
          this.normas.push(norma);
        }  
      }
    );
  }

  /**
   * Metodo el cual valida las acciones que tiene permiso el perfil
   */
  validarAcciones(url: string){
    this.permisosService.getPermisosPerfiles()
    .pipe(first())
    .subscribe(
      data => { 
        this.permisosXPerfilArray = data;         
        if(this.permisosXPerfilArray != null && this.permisosXPerfilArray.length > 0) {
          let menu: string = "";
          for(let i=0; i<this.permisosXPerfilArray.length; i++) {
            let element = this.permisosXPerfilArray[i];
            menu = element["menuCodigo"]["rutaMenu"];
            if (menu == url && this.autentication.getPerfilId() == element["perfilId"]["id"]  && element["estado"] == 1) {                          
                this.arrayPermisos.push(element.perfilPermisoIdentity.menuFuncionCodigo);
              } 
          }  
        }
        this.leerPermisos();       
      });
  }
  
  /**
   * Metodo que lee los permisos asociados y los implementa en la vista
   */
  async leerPermisos(){    
    if(this.arrayPermisos != null && this.arrayPermisos.length > 0) {     
      for(let i=0; i < this.arrayPermisos.length; i++) {
        if(this.arrayPermisos[i] == Directivas.TIPO_PERMISO_UPL) {
          this.hasPermissionsUpload = true;
        }
        if(this.arrayPermisos[i] == Directivas.TIPO_PERMISO_DWL) {
          this.hasPermissionsDownload = true;
        }
        if(this.arrayPermisos[i] == Directivas.TIPO_PERMISO_ADD) {
          this.hasPermissionsCreate = true;
        }
        if(this.arrayPermisos[i] == Directivas.TIPO_PERMISO_UPD) {
          this.hasPermissionsUpdate = true;
        }
        if(this.arrayPermisos[i] == Directivas.TIPO_PERMISO_DEL) {
          this.hasPermissionsDelete = true;
        }
        if(this.arrayPermisos[i] == Directivas.TIPO_PERMISO_LECT) {
          this.hasPermissionRead = true;
        }
      }
    }
    this.obtenerTipoEntidad();   
  }

  ngOnInit() {
    this.getNormas();
    this.cargarDataInicial();
    this.inicializarFormulario();
  }

  /**
   * Método que permite validar si el usuario tiene permisos para acceder al módulo
   */
  async validarPermisos() {
    let url: string = this.router.routerState.root.children[0].firstChild
      .routeConfig.path;
    this.autentication.validarPermisosUsuario(url);
    return;
  }

  /**
   * Metodo que carga los datos iniciales del componente
   */
  cargarDataInicial() {
    var token = sessionStorage.getItem("currentUser");
    let info = jwt_decode(token);
    this.idEntidad = info.ent;
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
          this.cupsService
            .getCUPSByNorma("" + this.normas[0].id)
            .subscribe(data => {
              this.cupsArray = Directivas.orderAsc(data, "codigo");
              this.resultados = this.cupsArray;
            });
        }
      });
  }

  /**
   * Metodo que permite cargar los cups dada una norma seleccionada
   * @param norma
   */
  cargarCupsByNormaId(norma: Norma) {
    this.normaSelected = norma;
    this.cupsService
      .getCUPSByNorma("" + this.normaSelected.id)
      .subscribe(data => {
        this.cupsArray = data;
        this.cupsArray.sort((a, b) => {
          return <any>a.codigo - <any>b.codigo;
        });
        this.resultados = this.cupsArray;
      });
  }

  /**
   * Inicializa el formulario para crear/editar CUPS y renovar
   */
  inicializarFormulario() {
    this.cupsForm = this.formBuilder.group({
      codigo: new FormControl("", [
        Validators.required,
        Validators.pattern(this.cupsPattern)
      ]),
      detalle: new FormControl("", [
        Validators.required,
        Validators.maxLength(255)
      ]),
      fechaInicioVigencia: new FormControl(null, [Validators.required])
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.cupsForm.controls;
  }

  /**
   * Cancelación del modal
   */
  cancelar() {
    this.generarModalConfirmacion("¿Desea salir sin guardar cambios?").then(
      response => {
        if (response.value) {
          Directivas.resetFormValidator(this.cupsForm);
          this.submitted = false;
          document.getElementById("close-btn-modal").click();
        }
      }
    );
  }

  /**
   * Cierra un modal de acuerdo a su id
   */
  cerrarModal(botonCierre: string) {
    Directivas.resetFormValidator(this.cupsForm);
    document.getElementById(botonCierre).click();
  }

  /**
   * Identifica qué modalidad posee el modal, edición o creación
   * @param cups - si se manda este paramétro se considera una edición, de lo contrario una creación
   */
  abrirModalCups(cups?: Cups) {   
    Directivas.resetFormValidator(this.cupsForm);
    this.submitted = false;
    if (cups) {
      this.cupsForm.controls.fechaInicioVigencia.markAsPristine();
      this.edicion = true;
      this.cupsSeleccionado = cups;
      const fecha = new Date(
        this.cupsSeleccionado.fechaInicioVigencia
      ).toISOString();
      const fechaVigencia: Date = new Date(fecha);
      fechaVigencia.setDate(fechaVigencia.getDate() + 1);
      this.cupsForm.patchValue({
        fechaInicioVigencia: {
          jsdate: fechaVigencia
        }
      });
      this.cupsForm.get("codigo").setValue(cups.codigo);
      this.cupsForm.get("detalle").setValue(cups.detalle);
    } else {
      this.edicion = false;
    }
  }

  validarEstadoCUPS(fechaVigencia: string) {
    Directivas.validarEstadoVigenciaFechas(fechaVigencia);
    return Directivas.validarEstadoVigenciaFechas(fechaVigencia);
  }

  /**
   * Crea un cups con la información dada
   * @param cups - Datos del cups
   */
  crearCups(cups: Cups) {
    cups.norma = this.idEntidad;
    this.normaSelected = this.normas[this.normas.length - 1];
    this.msjSpinner = "Guardando Cups...";
    this.spinner.show();
    var instance = this;
    this.validarEstadoCUPS(cups.fechaInicioVigencia)
      ? (cups.estado = 1)
      : (cups.estado = 0);

    this.cupsService.createCups(cups).subscribe(
      response => {
        if (response.status == 202) {
          var msj = "Se encontró un código y/o descripción relacionada al CUPS  " +
            cups.codigo +
            ' con el CUPS de norma <label style="cursor: pointer;" ' +
            'title="Detalle del CUPS: ' +
            response["body"]["detalle"] +
            '">   ' +
            response["body"]["codHomologar"] +
            "</label>";              
          this.generarModalHomologar(msj).then(resp => {
            if (resp.value) {             
              cups.codHomologar = response["body"]["codHomologar"];
              cups.id = response["body"]["id"];
              instance.cupsService.editCups(cups).subscribe(
                data => {                  
                  swal(
                    "Éxito",
                    "El CUPS " +
                      cups.codigo +
                      " se creó y homologó satistactoriamente con el CUPS de norma " +
                      response["body"]["codigo"],
                    "success"
                  );
                  instance.cupsService
                  .getCUPSByNorma("" + this.idEntidad)
                  .subscribe(data => {
                    instance.cupsArray = data;
                    instance.resultados = instance.cupsArray;
                  });
                  document.getElementById("close-btn-modal").click();
                },
                error => {
                  swal("Error", error.message, "error");
                  return;
                }
              );
            } else {
              swal(
                "Éxito",
                `El CUPS ${cups.detalle} se ha creado satisfactoriamente`,
                "success"
              );
              Directivas.resetFormValidator(instance.cupsForm);
            }
          });

          this.submitted = false;
          this.cupsService
            .getCUPSByNorma("" + this.idEntidad)
            .subscribe(data => {
              this.cupsArray = data;
              this.resultados = this.cupsArray;
            });

          document.getElementById("close-btn-modal").click();
        } else {
          swal(
            "Éxito",
            `El CUPS ${cups.detalle} se ha creado satisfactoriamente`,
            "success"
          );
          Directivas.resetFormValidator(this.cupsForm);
          this.submitted = false;
          this.cupsService
            .getCUPSByNorma("" + this.idEntidad)
            .subscribe(data => {
              this.cupsArray = data;
              this.resultados = this.cupsArray;
            });
        }

        this.banderaOpciones = true;
        this.spinner.hide();
        document.getElementById("close-btn-modal").click();
      },
      error => {
        swal("Error", error.message, "error");
        this.spinner.hide();
      }
    );
  }

  /**
   * Edita un cups específica con la información dada
   * @param cups - Datos del cups
   */
  editarCups(cups: Cups) {  
    var instance = this;
    this.validarEstadoCUPS(cups.fechaInicioVigencia)
      ? (cups.estado = 1)
      : (cups.estado = 0);
   
    this.cupsService.editCups(cups).subscribe(
      response => {
        if (response.status == 202) {
          var msj =
            "Se encontró un código y/o descripción relacionada al CUPS  " +
            cups.codigo +
            ' con el CUPS de norma <label style="cursor: pointer;" ' +
            'title="Detalle del CUPS: ' +
            response["body"]["detalle"] +
            '">   ' +
            response["body"]["codHomologar"] +
            "</label>";

          this.generarModalHomologarEdicion(msj).then(resp => {
            if (resp.value) {
              cups.codHomologar = response["body"]["codHomologar"];
              cups.id = response["body"]["id"];                   
              instance.cupsService.editCups(cups).subscribe(
                data => {
                  console.log("El cups se actualizó");
                  swal(
                    "Éxito",
                    "El CUPS " +
                      cups.codigo +
                      " se actualizó y homologó satistactoriamente con el CUPS de norma " +
                      response["body"]["codHomologar"],
                    "success"
                  );
                  document.getElementById("close-btn-modal").click();
                },
                error => {
                  swal("Error", error.message, "error");
                  return;
                }
              );
            } else {
              document.getElementById("close-btn-modal").click();
              swal(
                "Éxito",
                `El CUPS ${cups.detalle} se ha actualizado satisfactoriamente`,
                "success"
              );
            }
            Directivas.resetFormValidator(instance.cupsForm);
          });

          this.submitted = false;
          this.cupsService
            .getCUPSByNorma("" + this.idEntidad)
            .subscribe(data => {
              this.cupsArray = data;
              this.resultados = this.cupsArray;
            });
        } else {
          swal(
            "Éxito",
            `El CUPS ${cups.detalle} se ha actualizado satisfactoriamente`,
            "success"
          );
        }

        Directivas.resetFormValidator(this.cupsForm);
        this.submitted = false;
        document.getElementById("close-btn-modal").click();
        this.spinner.hide();
        this.banderaOpciones = true;
        // Cargando los cups internos
        this.cupsService.getCUPSByNorma("" + cups.norma).subscribe(data => {
          this.cupsArray = data;
          this.resultados = this.cupsArray;
        });
      },
      error => {
        this.generarModalSencillo(error.message, "warning");
        this.spinner.hide();
      }
    );
  }

  /**
   * Filtrar los datos de la tabla
   * @param patron - texto ingresado a buscar
   */
  filterBy(patron: string) {
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
          !cups.detalle.toLocaleLowerCase().includes(word) &&
          !Directivas.parseJsonDate(cups.fechaInicioVigencia).includes(word)
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
      confirmButtonText: "Aceptar",
      allowOutsideClick: false
    });
  }

  /**
   * Genera el modal de confirmación
   * @param mensaje - mensaje a mostrar en el modal
   */
  generarModalHomologar(mensaje: string) {
    return swal({
      type: "info",
      html: mensaje,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#9EA0A0",
      cancelButtonText: "Crear",
      confirmButtonText: "Crear y homologar",
      reverseButtons: false,
      allowOutsideClick: false
    });
  }

  /**
   * Genera el modal de confirmación
   * @param mensaje - mensaje a mostrar en el modal
   */
  generarModalHomologarEdicion(mensaje: string) {
    return swal({
      type: "info",
      html: mensaje,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#9EA0A0",
      cancelButtonText: "Editar",
      confirmButtonText: "Actualizar y homologar",
      reverseButtons: false,
      allowOutsideClick: false
    });
  }

  /*
   * Metodo que permite guardar los datos de edicion/creacion de cups
   */
  guardarCups() {
    this.submitted = true;
    if (this.cupsForm.valid) {
      const cups: Cups = this.cupsForm.getRawValue();
      cups.codigo = cups.codigo.trim();
      cups.detalle = cups.detalle.trim();
      cups.fechaInicioVigencia = this.cupsForm.get(
        "fechaInicioVigencia"
      ).value.jsdate;

      if (this.edicion) {        
        cups.norma = this.cupsSeleccionado.norma;
        cups.id = this.cupsSeleccionado.id;
        cups.codHomologar = this.cupsSeleccionado.codHomologar;
        this.editarCups(cups);
      } else {
        this.crearCups(cups);
      }
    }
  }

  /**
   * Realiza la carga del archivo seleccionado
   */
  importarCups() {
    if (
      this.normaSelectedModal == null ||
      this.normaSelectedModal == undefined
    ) {
      swal(
        "Campo obligatorio",
        "Debe seleccionar una norma antes de cargar el archivo.",
        "warning"
      );
      return;
    }

    const file: HTMLInputElement = this.fileInput.nativeElement;
    if (file.files && file.files[0]) {
      const fileToUpload: File = file.files[0];
      if (this.formatos.includes(fileToUpload.name.split(".").pop())) {
        this.msjSpinner = "Cargando Archivo";
        this.spinner.show();
        var instance = this;
        this.cupsService
          .uploadFile(fileToUpload, "" + this.normaSelectedModal.id)
          .subscribe(
            data => {
              this.banderaOpciones = false;
              this.generarModalSencillo(data.mensaje, "success").then(
                response => {
                  if (data.status == "201") {
                    instance.router.navigate([
                      "/home",
                      { outlets: { content: ["historico-cups"] } }
                    ]);
                  } else {
                    instance.cargarCupsByNormaId(instance.normaSelectedModal);
                  }
                }
              );
              document.getElementById("close-btn-modal_carga").click();
              this.spinner.hide();
            },
            error => {
              this.generarModalSencillo(error.message, "warning");
              this.spinner.hide();
              this.banderaOpciones = false;
            }
          );
      } else {
        this.generarModalSencillo(
          "Por favor seleccione un formato válido",
          "warning"
        );
      }
    } else {
      swal("Campo obligatorio", "Por favor seleccione un archivo", "warning");
    }
  }

  /**
   * Genera un modal sencillo
   * @param mensaje - texto a mostrar en el modal
   * @param exito - indica tipo de icono
   */
  generarModalSencillo(mensaje: string, tipo: SweetAlertType = "success") {
    return swal({
      text: mensaje,
      type: tipo,
      showCancelButton: false,
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Aceptar"
    });
  }

  /**
   * Genera la descarga del formato csv
   */
  descargaCsv() {
    const contenido =
      "codigo;detalle;fecha_vigencia\r\nej0001;CUPS EJEMPLO;2018-06-25\r\nej0002;CUPS EJEMPLO 2;2018-05-30";
    const blob = new Blob([contenido], { type: "csv/plain" });
    Directivas.downloadBlobFile(blob, "formato_carga_cups.csv");
  }

  /**
   * Guarda el elemento seleccionado
   * @param input
   */
  onFileChange(input) {
    if (input.srcElement.files) {
      this.fileTxt = input.srcElement.files[0].name;
    }
  }

  /**
   * Limpia el input file
   */
  limpiarFile() {
    document.getElementById("file_input_cups")["value"] = "";
    this.fileTxt = "";
    this.normaSelected = null;
    this.normas = [];
    this.getNormas();
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
      this.cupsService.getCUPSByNorma("" + this.normaSelected.id).subscribe(
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
          this.spinner.hide();
        }
      );
      this.spinner.hide();
      this.banderaOpciones = false;
    } else {
      this.banderaOpciones = true;
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
          /* swal("Error", error.message, "error"); */
          this.spinner.hide();
        }
      );
      this.spinner.hide();
    }
  }

  /**
   * Evento que captura el evento de el select de la norma dentro de la ventana modal
   */
  onSelectNormaModal(event) {
    this.normas.filter((norma: Norma) => {
      if (norma.id == event.target.value) {
        this.normaSelectedModal = norma;
      }
    });
  }
}
