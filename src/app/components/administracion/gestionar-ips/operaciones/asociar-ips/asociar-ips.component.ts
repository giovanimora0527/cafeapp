import { Component, OnInit, Input } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators
} from "@angular/forms";
import {
  Router,
  ActivatedRoute  
} from "@angular/router";
import { IMyDpOptions } from "mydatepicker";
import * as jwt_decode from "jwt-decode";

/**
 * Modelos
 */
import { Relacion } from "src/app/_models/administracion/erp-ips/relacion";
import { Entidad } from "src/app/_models/administracion/entidad/entidad";

/**
 * Servicios y  Directivas
 */
import { NgxSpinnerService } from "ngx-spinner";
import { Directivas } from "src/app/_directives/directiva/directiva.directive";
import { EntidadService } from "src/app/_services/administracion/entidad/entidad.service";
import { AsociarService } from "src/app/_services/administracion/ips/asociar.service";

/**
 * Componente de sweetalert
 */
import swal from "sweetalert2";
import { AutenticacionService } from "src/app/_services/autenticacion/autenticacion.service";
import { first } from "rxjs/operators";
import { Subscription } from "rxjs";
import { GestionarIpsComponent } from "../../gestionar-ips.component";
import { PerfilPermiso } from "src/app/_models/administracion/menus/perfil-permiso";
import { PermisosService } from "src/app/_services/administracion/permisos/permisos.service";

export let browserRefresh = false;

@Component({
  selector: "app-asociar-ips",
  templateUrl: "./asociar-ips.component.html",
  styleUrls: ["./asociar-ips.component.css"]
})
export class AsociarIpsComponent implements OnInit {
  relacionForm: FormGroup;
  titleModalIps: string = "Asociar IPS";
  submitted = false;
  @Input() isCalledModal: boolean;
  @Input() ipsSelected: Entidad = null;
  ips: Entidad[] = [];
  relacionIdSeleccionada: Relacion;
  relacionId: string;
  msjSpinner: string = "";
  idIpsSelected: string;
  nameEntidadLogueada: string;
  entidadLogueada: Entidad;
  isEdicion: boolean = true;
  isSoloLectura: boolean = false;

  ipsEdited: Entidad;
  relacionArray: Relacion[] = [];
  entidaAMostrar: Entidad;

  subscription: Subscription;
  isPagador: boolean = false;
  isPrestador: boolean = false;
  entidadNombre: string = "";
  isRefreshPage: boolean = false;

  ipsComboSelected: string = "";

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
  hasPermissionHomologar: boolean = false

  emailRegex = /([\w\.\-_]+)?\w+@[\w-_]+(\.\w+){1,255}/;
  justAlphaCharactersRegex = /^[A-Za-zÀ-ü]+( [A-Za-zÀ-ü]+)*$/;
  soloNumeros = /[\d]+/i;

  constructor(
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private entidadService: EntidadService,
    private asociarService: AsociarService,
    private autenticacion: AutenticacionService,
    private permisosService: PermisosService
  ) {
    this.cargarInfoEntLogueada();
    this.route.params
      .pipe(first())
      .subscribe((params: { idRelacion: number }) => {
        this.relacionId = "" + params.idRelacion;
        if (this.relacionId != undefined) {
          this.asociarService
            .getRelacionById(this.relacionId)
            .pipe(first())
            .subscribe(data => {
              this.relacionIdSeleccionada = data;
              this.listarIPS();                         
            });

        }
      });
  }

  /**
   * Metodo el cual valida las acciones que tiene permiso el perfil
   */
  validarAcciones(url: string) {
    this.permisosService
      .getPermisosPerfiles()
      .pipe(first())
      .subscribe(data => {
        this.permisosXPerfilArray = data;
        if (this.permisosXPerfilArray != null && this.permisosXPerfilArray.length > 0) {
          let menu: string = "";
          for (let i = 0; i < this.permisosXPerfilArray.length; i++) {
            let element = this.permisosXPerfilArray[i];
            menu = element["menuCodigo"]["rutaMenu"];
            if (
              menu == url &&
              this.autenticacion.getPerfilId() == element["perfilId"]["id"] &&
              element["estado"] == 1
            ) {
              this.arrayPermisos.push(
                element.perfilPermisoIdentity.menuFuncionCodigo
              );
            }
          }
        }
        this.leerPermisos();
      });
  }

  /**
   * Metodo que lee los permisos asociados y los implementa en la vista
   */
  async leerPermisos() {
    //El usuario logueado de la entidad solo tiene el permiso de visualizar
    if (this.arrayPermisos != null && this.arrayPermisos.length == 1 && this.arrayPermisos[0] == "M") {      
      this.hasPermissionsUpload = false;
      this.hasPermissionsDownload = false;
      this.hasPermissionsCreate = false;
      this.hasPermissionsUpdate = false;
      this.hasPermissionsDelete = false;
      this.hasPermissionRead = true;
      if(!this.isCalledModal) {
        this.isEdicion = false;
        this.isSoloLectura = true;
      }
      return;
    }

    if (this.arrayPermisos != null && this.arrayPermisos.length > 0) {
      for (let i = 0; i < this.arrayPermisos.length; i++) {
        if (this.arrayPermisos[i] == Directivas.TIPO_PERMISO_UPL) {
          this.hasPermissionsUpload = true;
        }
        if (this.arrayPermisos[i] == Directivas.TIPO_PERMISO_DWL) {
          this.hasPermissionsDownload = true;
        }
        if (this.arrayPermisos[i] == Directivas.TIPO_PERMISO_ADD) {
          this.hasPermissionsCreate = true;
        }
        if (this.arrayPermisos[i] == Directivas.TIPO_PERMISO_UPD) {
          this.hasPermissionsUpdate = true;
        }
        if (this.arrayPermisos[i] == Directivas.TIPO_PERMISO_DEL) {
          this.hasPermissionsDelete = true;
        }
        if (this.arrayPermisos[i] == Directivas.TIPO_PERMISO_LECT) {
          this.hasPermissionRead = true;
        }
      }

      /**
       * No tiene permiso para editar y se deja solo modo lectura
       */
      if(this.hasPermissionRead && !this.hasPermissionsUpdate) {
        if(!this.isCalledModal) {
          this.isEdicion = false;
          this.isSoloLectura = true;
        } else {
          this.isEdicion = true;
          this.isSoloLectura = false;
        }
      }      
    }
  }

  ngOnInit() {
    /**  
     * Se verifica si el evento pertenece a un refresh de la pagina
     * Si es asi, se redirecciona al componente padre
     */
    if (!this.isCalledModal) {
      if(document.readyState.includes("loading")) {
        this.router.navigate(['/home', {outlets: {'content': [ 'gestionar-ent']}}]);
      } 
    }

    if(this.isCalledModal) {
       this.listarIPS();
    }

    this.cargarInfoEntLogueada();
    let url: string = "gestionar-ent";
    this.validarAcciones(url);
    this.inicializarFormulario();
  }

  /**
   * Método que permite cargar los datos basicos para mostrar de la entidad logueada
   */
  cargarInfoEntLogueada() {
    var token = sessionStorage.getItem("currentUser");
    let info = jwt_decode(token);
    this.nameEntidadLogueada = info.ent;
    this.entidadService
      .getEntidadesById(info.ent)
      .pipe(first())
      .subscribe(data => {
        this.entidadLogueada = data;
        this.nameEntidadLogueada = data["nombre"];
        this.validarEstadosFormulario(this.relacionIdSeleccionada);
      });
  }

  /**
   * Metodo que valida el estado de la relacion para ajustar el formulario
   * a modo edicion o modo lectura
   */
  validarEstadosFormulario(relacion: Relacion) {
    if (this.entidadLogueada.id == relacion.entidadIdErpsId) {
      this.isEdicion = true;
      this.isSoloLectura = false;
      this.isPagador = true;
      this.isPrestador = false;
    }
    if (this.entidadLogueada.id == relacion.entidadIdIpsId) {
      this.isEdicion = false;
      this.isSoloLectura = true;
      this.isPagador = false;
      this.isPrestador = true;
    }
  }

  /**
   * Metodo que permite listar entidades de tipo IPS para llenar el combo
   */
  listarIPS() {
    this.entidadService
      .listarByTipoEntidad(Directivas.TIPO_ENTIDAD_IPS)
      .pipe(first())
      .subscribe(
        data => {
          this.ips = data;
          this.ips = Directivas.orderAsc(this.ips, "nombre");
          if (this.isCalledModal) {
            this.asociarService
                .getRelacionIPS()
                .pipe(first())
                .subscribe(
                  data => {
                  this.relacionArray = data;
                  if(this.relacionArray != null && this.relacionArray.length > 0) {
                    this.ips.filter((ips: Entidad) => {
                      for (let i = 0; i < this.relacionArray.length; i++) {
                        if (this.relacionArray[i].entidadIdIpsId == ips.id) {
                          this.ips.splice(this.ips.indexOf(ips), 1);
                        }
      
                        if (ips.id == this.entidadLogueada.id) {
                          this.ips.splice(this.ips.indexOf(ips), 1);
                        }
                      }
                    });
                  } else {
                    this.ips.filter((ips: Entidad) => {
                    for (let i = 0; i < this.relacionArray.length; i++) {  
                      if (ips.id == this.entidadLogueada.id) {
                        this.ips.splice(this.ips.indexOf(ips), 1);
                      }
                    }
                  });
                }
              });
         } else {
            this.cargarDataFormulario(this.relacionIdSeleccionada);
        }
      });
  }

  /**
   * Metodo que inicializa el formulario para crear/editar glosas especificas
   */
  inicializarFormulario() {
    this.relacionForm = this.formBuilder.group({
      entidadIdIpsId: new FormControl("", [Validators.required]),
      correoResponsableIps: new FormControl("", [
        Validators.required,
        Validators.email,
        Validators.pattern(this.emailRegex),
        Validators.maxLength(255)
      ]),
      nombreResponsableIps: new FormControl("", [
        Validators.required,
        Validators.pattern(this.justAlphaCharactersRegex),
        Validators.maxLength(255)
      ]),
      correoResponsableIps2: new FormControl("", [
        Validators.email,
        Validators.pattern(this.emailRegex),
        Validators.maxLength(255)
      ]),
      nombreResponsableIps2: new FormControl("", [
        Validators.pattern(this.justAlphaCharactersRegex),
        Validators.maxLength(255)
      ]),
      correoResponsableErps: new FormControl("", [
        Validators.required,
        Validators.email,
        Validators.pattern(this.emailRegex),
        Validators.maxLength(255)
      ]),
      nombreResponsableErps: new FormControl("", [
        Validators.required,
        Validators.pattern(this.justAlphaCharactersRegex),
        Validators.maxLength(255)
      ]),
      correoResponsableErps2: new FormControl("", [
        Validators.email,
        Validators.pattern(this.emailRegex),
        Validators.maxLength(255)
      ]),
      nombreResponsableErps2: new FormControl("", [
        Validators.pattern(this.justAlphaCharactersRegex),
        Validators.maxLength(255)
      ])
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.relacionForm.controls;
  }

  /**
   * Metodo que permite limpiar los campos del formulario
   */
  limpiarFormulario() {
    Directivas.resetFormValidator(this.relacionForm);
    this.submitted = false;
    this.ipsSelected = null;
  }

  /**
   * Metodo que permite cancelar la accion de configurar una relacion y redirecciona
   * a la vista anterior.
   */
  cancelar() {
    this.limpiarFormulario();
    this.router.navigate([
      "/home",
      { outlets: { content: ["gestionar-ent"] } }
    ]);
  }

  /**
   * Metodo que permite capturar el evento de seleccion del combo
   * @param event
   */
  onChangeIpsCombo(event) {
    this.idIpsSelected = event.target.value;
  }

  /*
   * Metodo que permite armar el objeto para guardar dado la relacion
   */
  guardarAsociacion(form?: FormGroup, padre?: GestionarIpsComponent) {
    this.msjSpinner = "Guardando";
    this.submitted = true;
    this.spinner.show();
    if (form != null || form != undefined) {
      this.relacionForm = form;
    }

    if (this.relacionForm.valid) {
      const relacion: Relacion = this.relacionForm.getRawValue();
      relacion.estado = 1;
      relacion.nombreResponsableErps = relacion.nombreResponsableErps.trim();
      relacion.correoResponsableErps = relacion.correoResponsableErps.trim();
      relacion.nombreResponsableIps = relacion.nombreResponsableIps.trim();
      relacion.correoResponsableIps = relacion.correoResponsableIps.trim();

      relacion.nombreResponsableErps2 =
        relacion.nombreResponsableErps2 != null ||
        relacion.nombreResponsableErps != ""
          ? relacion.nombreResponsableErps2
          : null;
      relacion.nombreResponsableIps2 =
        relacion.nombreResponsableIps2 != null ||
        relacion.nombreResponsableIps2 != ""
          ? relacion.nombreResponsableIps2
          : null;
      relacion.correoResponsableErps2 =
        relacion.correoResponsableErps2 != null ||
        relacion.correoResponsableErps2 != ""
          ? relacion.correoResponsableErps2
          : null;
      relacion.correoResponsableIps2 =
        relacion.correoResponsableIps2 != null ||
        relacion.correoResponsableIps2 != ""
          ? relacion.correoResponsableIps2
          : null;

      relacion.entidadIdIpsId = this.idIpsSelected;
      relacion.entidadIdErpsId = this.autenticacion.getEntidadId();
      var ipsGuardada;

      this.asociarService.createAsociacionIPS(relacion).subscribe(
        data => {
          this.ips.filter((ips: Entidad) => {
            if (ips.id == relacion.entidadIdIpsId) {
              ipsGuardada = ips;
            }
          });
          swal(
            "Éxito",
            "La información " +
              ipsGuardada.nombre +
              " se ha guardado con éxito",
            "success"
          );
          this.spinner.hide();
          Directivas.resetFormValidator(this.relacionForm);
          padre.cargarRelacionIPS();
          padre.cancelar();
          return data;
        },
        error => {
          swal("Error", error.message, "error");
          this.spinner.hide();
          return error;
        }
      );
    }
  }

  /**
   * Metodo que permite cargar la data iniciar si el  formulario viene desde el bton de configurar
   */
  cargarDataFormulario(relacion: Relacion) {
    this.relacionForm
      .get("nombreResponsableIps")
      .setValue(relacion.nombreResponsableIps);
    this.relacionForm
      .get("correoResponsableIps")
      .setValue(relacion.correoResponsableIps);
    this.relacionForm
      .get("nombreResponsableIps2")
      .setValue(relacion.nombreResponsableIps2);
    this.relacionForm
      .get("correoResponsableIps2")
      .setValue(relacion.correoResponsableIps2);

    this.relacionForm
      .get("nombreResponsableErps")
      .setValue(relacion.nombreResponsableErps);
    this.relacionForm
      .get("correoResponsableErps")
      .setValue(relacion.correoResponsableErps);
    this.relacionForm
      .get("nombreResponsableErps2")
      .setValue(relacion.nombreResponsableErps2);
    this.relacionForm
      .get("correoResponsableErps2")
      .setValue(relacion.correoResponsableErps2);
    
      let ips: Entidad;
      let eps: Entidad;      
      eps = relacion.entidadIdErps;
      ips = relacion.entidadIdIps;
      this.ipsSelected = ips;
      this.relacionForm
      .get("entidadIdIpsId")
      .setValue(this.ipsSelected.nombre);
      this.entidadNombre = eps.nombre;
  }

  /**
   * Metodo que permite guardar la relacion desde la ventana de configuracion
   */
  guardarRelacionConfiguracion() {
    this.submitted = true;
    this.msjSpinner = "Guardando";
    this.spinner.show();   
    this.relacionForm.get("entidadIdIpsId").setValue(this.ipsSelected.id);

    // stop here if form is invalid
    if (this.relacionForm.invalid) {
      this.spinner.hide();
      return;
    }

    if (this.relacionForm.valid) {
      const relacion: Relacion = this.relacionForm.getRawValue();
      relacion.estado = 1;
      relacion.nombreResponsableErps = relacion.nombreResponsableErps.trim();
      relacion.correoResponsableErps = relacion.correoResponsableErps.trim();
      relacion.nombreResponsableIps = relacion.nombreResponsableIps.trim();
      relacion.correoResponsableIps = relacion.correoResponsableIps.trim();

      relacion.nombreResponsableErps2 =
        relacion.nombreResponsableErps2 != null ||
        relacion.nombreResponsableErps != ""
          ? relacion.nombreResponsableErps2
          : null;
      relacion.nombreResponsableIps2 =
        relacion.nombreResponsableIps2 != null ||
        relacion.nombreResponsableIps2 != ""
          ? relacion.nombreResponsableIps2
          : null;
      relacion.correoResponsableErps2 =
        relacion.correoResponsableErps2 != null ||
        relacion.correoResponsableErps2 != ""
          ? relacion.correoResponsableErps2
          : null;
      relacion.correoResponsableIps2 =
        relacion.correoResponsableIps2 != null ||
        relacion.correoResponsableIps2 != ""
          ? relacion.correoResponsableIps2
          : null;

      relacion.entidadIdIpsId = relacion.entidadIdIpsId;
      relacion.entidadIdErpsId = this.autenticacion.getEntidadId();
      relacion.id = this.relacionIdSeleccionada.id;

      this.asociarService.editAsociacionIPS(relacion).subscribe(
        data => {
          swal(
            "Éxito",
            "La información " +
              this.ipsSelected.nombre +
              " se ha actualizado satisfactoriamente",
            "success"
          );
          this.submitted = false;
          this.relacionIdSeleccionada = relacion;
          this.cargarDataFormulario(relacion);
          this.spinner.hide();
        },
        error => {
          swal("Error", error.message, "error");
          this.spinner.hide();
        }
      );
    }
  }

}
