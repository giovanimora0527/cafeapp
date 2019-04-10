import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  Output,
  EventEmitter
} from "@angular/core";

/**
 * Servicios
 */
import swal, { SweetAlertType } from "sweetalert2";
import { Directivas } from "src/app/_directives/directiva/directiva.directive";
import { NgxSpinnerService } from "ngx-spinner";

/**
 * Modelos
 */
import { Cie } from "src/app/_models/administracion/cie/cie";
import { Router } from "@angular/router";
import { NormaService } from "src/app/_services/administracion/norma/norma.service";
import { Norma } from "src/app/_models/administracion/shared/norma";
import { CieService } from "src/app/_services/administracion/cie/cie.service";
import { AutenticacionService } from "src/app/_services/autenticacion/autenticacion.service";
import { PerfilPermiso } from "src/app/_models/administracion/menus/perfil-permiso";
import { PermisosService } from "src/app/_services/administracion/permisos/permisos.service";
import { first } from "rxjs/operators";

@Component({
  selector: "app-cie",
  styleUrls: ["./cie.component.css"],
  templateUrl: "./cie.component.html"
})
export class CieComponent implements OnInit {
  title: string = "CIE";
  msjSpinner: string = "Cargando";
  cieArray: Array<Cie> = [];
  resultados: Array<Cie> = [];

  readonly formatos: Array<string> = ["csv"];
  readonly csvContent = "data:text/csv;charset=utf-8,%EF%BB%BF";

  @ViewChild("fileInput") fileInput: ElementRef;
  @Output() cargaCompletaEvent = new EventEmitter<any>();

  fileTxt = "";
  normas: Norma[] = [];
  normaSelected: Norma = null;
  normaActual: Norma = null;
  normaSelectedModal: Norma = null;

  readonly titleModal: string =
    "Importar Clasificación Estadística Internacional de Enfermedades";

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

  constructor(
    private spinner: NgxSpinnerService,
    private router: Router,
    private normaService: NormaService,
    private cieService: CieService,
    private autentication: AutenticacionService,
    private permisosService: PermisosService
  ) {
    this.validarPermisos();
    let url: string = this.router.routerState.root.children[0].firstChild.routeConfig.path;
     this.validarAcciones(url);
  }

  /**
   * Método que permite validar si el usuario tiene permisos para acceder al módulo
   */
  async validarPermisos() {
    let url: string = this.router.routerState.root.children[0].firstChild
      .routeConfig.path;
    this.autentication.validarPermisosUsuario(url);
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
      
    
  }

  ngOnInit() {
    this.getNormas();
  }

  /**
   * Metodo que permite listar las normas registradas para CIE
   */
  getNormas() {
    this.normaService
      .getNormasByTipo(Directivas.TIPO_NORMA_CIE)
      .subscribe(data => {
        this.normas = data;
        if (this.normas != null && this.normas.length > 0) {
          this.normaActual = this.normas[0];
          this.normaSelected = this.normaActual;
          this.cieService.getCIEByNorma(this.normas[0].id).subscribe(data => {
            this.cieArray = Directivas.orderAsc(data, "codigo");
            this.resultados = this.cieArray;
          });
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
   * Operaciones con archivos
   */

  /**
   * Genera la descarga del formato csv
   */
  descargaCsv() {
    const contenido = "codigo;descripcion\r\n001;Dengue Clásico";
    const blob = new Blob([contenido], { type: "csv/plain" });
    Directivas.downloadBlobFile(blob, "formato_carga_cie.csv");
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
    this.normaSelectedModal = null;
  }

  /**
   * Metodo que permite importar un archivo CIE
   */
  importarCie() {
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
        this.cieService
          .uploadFile(fileToUpload, "" + this.normaSelectedModal.id)
          .subscribe(
            data => {
              var instance = this; 
              instance.normaSelected = this.normaSelectedModal;           
              this.generarModalSencillo(data.mensaje, "success").then(
                response => {
                  if (data.status == "201") {
                    this.router.navigate([
                      "/home",
                      { outlets: { content: ["historico-cie"] } }
                    ]);
                  } else { 
                    instance.cieService
                      .getCIEByNorma(instance.normaSelected.id)
                      .subscribe(data => {
                        instance.cieArray = data;
                        instance.resultados = instance.cieArray;
                      });
                  }
                }
              );
              document.getElementById("close-btn-modal_carga").click();
              this.spinner.hide();
            },
            error => {
              this.generarModalSencillo(error.message, "warning");
              this.spinner.hide();
            }
          );
      } else {
        this.generarModalSencillo(
          "Formatos permitidos: \r\r\n .CSV",
          "warning"
        );
      }
    } else {
      swal("Campo obligatorio", "Por favor seleccione un archivo", "warning");
    }
  }

  /**
   * Metodo que detecta el cambio en el selector de la norma
   * @param norma
   */
  selectNorma(event?: any) {
    this.normas.filter(norma => {
      if (norma.id == event.target.value) {
        this.cargarCieByNormaId(norma);
        return norma;
      }
    });
  }

  /**
   * Metodo que detecta el cambio en el selector de la norma
   * @param norma
   */
  selectNormaModal(event: any) {
    this.normas.filter(norma => {
      if (norma.id == event.target.value) {
        this.normaSelectedModal = norma;
        return norma;
      }
    });
  }

  /**
   * Metodo que permite cargar los CIE por norma seleccionada
   */
  cargarCieByNormaId(norma: Norma) {
    this.normaSelected = norma;
    this.cieService.getCIEByNorma(this.normaSelected.id).subscribe(data => {
      this.cieArray = data;
      this.resultados = this.cieArray;
    });
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
      
    this.resultados = this.cieArray.filter((cie: Cie) => {
      const noCodigoWords: Array<string> = [];
      for (let i = 0; i < splitted.length; i++) {
        const word = splitted[i].trim();
        if (
          !cie.codigo.toLocaleLowerCase().includes(word) &&
          !cie.detalle.toLocaleLowerCase().includes(word)
        ) {
          noCodigoWords.push(word);
        }
      }
      return cie.detalle
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase()
        .normalize("NFD")
        .match(`.*${noCodigoWords.join(".*")}.*`);
    });
  }
}
