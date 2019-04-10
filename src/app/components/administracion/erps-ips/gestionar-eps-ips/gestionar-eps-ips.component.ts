import { Component, OnInit, ViewChild } from "@angular/core";

import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  AbstractControl
} from "@angular/forms";
import { first } from "rxjs/operators";
import { Directivas } from "src/app/_directives/directiva/directiva.directive";
/**
 * Componente de sweetalert
 */
import swal from "sweetalert2";

/**
 * Modelos
 */
import { Estado } from "src/app/_models/administracion/menus/estado";
import { Usuario } from "src/app/_models/administracion/usuario/usuario";
import { Entidad } from "src/app/_models/administracion/entidad/entidad";
import { Perfil } from "src/app/_models/administracion/perfil/perfil";
import { OperadorFE } from "../../../../_models/administracion/erp-ips/operador-fe";
import { TipoDocumento } from "src/app/_models/administracion/shared/tipo-documento";

/**
 * Servicios
 */
import { UsuarioService } from "src/app/_services/administracion/usuario/usuario.service";
import { EntidadService } from "src/app/_services/administracion/entidad/entidad.service";
import { TipoDocumentoService } from "src/app/_services/shared/tipo-documento.service";
import { OperadorfaeService } from "src/app/_services/administracion/entidad/operadorfae.service";
import { NgxSpinnerService } from "ngx-spinner";
import { WizardComponent } from "angular-archwizard";
import { Router } from "@angular/router";
import { AutenticacionService } from "src/app/_services/autenticacion/autenticacion.service";
import { PerfilPermiso } from "src/app/_models/administracion/menus/perfil-permiso";
import { PermisosService } from "src/app/_services/administracion/permisos/permisos.service";

@Component({
  selector: "app-gestionar-eps-ips",
  templateUrl: "./gestionar-eps-ips.component.html"
})
export class GestionarEpsIpsComponent implements OnInit {
  title: string = " ERPS / IPS";
  titleModal: string = " Entidad ";
  @ViewChild('wizard')
  public wizard: WizardComponent;
  isReturnEntidades: boolean = false;

  isCompleted: boolean = false;
  entidades: Entidad[] = [];
  entidadesAux: Entidad[] = [];
  entidadesFilters: Entidad[] = [];
  operadoresFE: OperadorFE[] = [];

  entidad: Entidad = new Entidad();
  entidadSelected: Entidad;
  isEdicion: boolean = false;
  entidadAGuardar: Entidad;
  usuarioAGuardar: Usuario;
  usuarioCreado: Usuario = new Usuario();

  /**
   * Componentes de Usuario
   */
  estados: Estado[];
  submitted1 = false;
  submitted2 = false;
  submitted3 = false;
  users: Usuario[] = [];
  usersAux: Usuario[] = [];
  usersFilters: Usuario[] = [];
  perfiles: Perfil[] = [];
  emailRegex = /([\w\.\-_]+)?\w+@[\w-_]+(\.\w+){1,}/;
  justAlphaCharactersRegex = /^[a-zA-ZÀ-Ü-à-ÿ\u00f1\u00d1]+( [a-zA-ZÀ-Ü-à-ÿ\u00f1\u00d1]+)*$/;
  soloAlfaNumericoRegex = /^\s*([0-9a-zA-ZÀ-Ü-à-ÿ]*)+\s*([0-9a-zA-ZÀ-Ü-à-ÿ]*)*$/;
  validarDominioRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,80}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/i;
  soloNumeros = /[\d]+/i;
  usuarioSelected: Usuario;
  tiposDocumentos: TipoDocumento[] = [];
  tiempos: any[];
  vigencia: any[];
  intentos: any[];
  tiposEntidades: any[] = [];
  unAlmac: any[] = [];
  showUserForm: boolean = true;

  spinMessage = "Cargando";

  public usuarioForm: FormGroup;
  public entidadForm: FormGroup;
  public planServicioForm: FormGroup;

  /**
   * Componentes de la tabla
   */
  mfData: any[];

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
    private formBuilder: FormBuilder,
    private usuarioService: UsuarioService,
    private entidadService: EntidadService,    
    private tipoDocumentoService: TipoDocumentoService,
    private spinner: NgxSpinnerService,
    private operadorfaeService: OperadorfaeService,
    private autentication: AutenticacionService,
    private permisosService: PermisosService,
    private router: Router
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
    return;
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
    this.inicializarFormularios();
    this.obtenerEntidades();
    this.cargarEstadosUsuario();
    this.cargarTiposDocumentos();
    this.cargarCombos();
  }

  cargarCombos() {
    this.tiempos = Directivas.obtenerTiposInactividad();
    this.vigencia = Directivas.obtenerVigenciaContrasena();
    this.intentos = Directivas.obtenerIntentosFallidosList();
    this.tiposEntidades = Directivas.obtenerTiposEntidades();
    this.unAlmac = Directivas.obtenerUnidadesAlmacenamiento();
    this.obtenerOperadoresFAE();
  }

  /**
   * Metodo que obtiene los operadores de facturacion electronica
   */
  obtenerOperadoresFAE() {
    this.operadorfaeService.getOperadores().subscribe(data => {
      this.operadoresFE = data;
      this.operadoresFE = Directivas.orderAsc(this.operadoresFE, "operador");
    });
  }

  /**
   * Metodo que permite inicializar los 3 formularios del wizard
   */
  inicializarFormularios() {
    this.inicializarFormsEntidades();
    this.inicializarFormsUsuario();
    this.inicializarFormsPlanServicio();
  }

  // Retorna a la vista el formulario de usuario
  get f() {
    return this.usuarioForm.controls;
  }

  /**
   * Metodo que retorna a la vista el formulario de entidad
   */
  get g() {
    return this.entidadForm.controls;
  }

  /**
   * Metodo que retorna a la vista el formulario de plan de servicio
   */
  get h() {
    return this.planServicioForm.controls;
  }

  /**
   * Metodo que inicializa el formulario de entidad
   */
  inicializarFormsEntidades() {
    this.entidadForm = this.formBuilder.group({
      estado: new FormControl("", Validators.compose([Validators.required])),
      tipoEntidad: new FormControl("",Validators.compose([Validators.required])),
      operadorFeId: new FormControl("",Validators.compose([Validators.required])),
      tipoDocumentoId: new FormControl("",Validators.compose([Validators.required])),
      nit: new FormControl("", [Validators.required, Validators.maxLength(50)]),
      nombre: new FormControl("", [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(this.soloAlfaNumericoRegex)
      ]),
      direccion: new FormControl("", [
        Validators.required,
        Validators.maxLength(255)
      ]),
      telefono: new FormControl("", [
        Validators.required,
        Validators.maxLength(20)
      ]),
      dominio: new FormControl("", [      
        Validators.pattern(this.validarDominioRegex),
        Validators.maxLength(255)
      ]),
      tiempoInactividad: new FormControl("", Validators.compose([Validators.required])),
      vigenciaPassword: new FormControl("", Validators.compose([Validators.required])),
      intentosFallidos: new FormControl("", Validators.compose([Validators.required]))
    });
  }

  /**
   * Metodo que inicializa el formulario de plan de servicio
   */
  inicializarFormsUsuario() {
    /**
     * Validadores del formulario de creacion de menus
     */
    this.usuarioForm = this.formBuilder.group({
      estado: new FormControl("", Validators.compose([Validators.required])),      
      tipoDocumentoId: new FormControl("", [Validators.required]),
      identificacion: new FormControl("", [
        Validators.required, 
        Validators.maxLength(50)
      ]),
      nombreUsuario: new FormControl("", [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(this.justAlphaCharactersRegex)
      ]),
      direccion: new FormControl("", [
        Validators.required,
        Validators.maxLength(255)
      ]),
      telefono: new FormControl("", [
        Validators.required,
        Validators.maxLength(20)
      ]),
      email: new FormControl("", [
        Validators.required,
        Validators.pattern(this.emailRegex),
        Validators.maxLength(255)
      ])
    });
  }

  /**
   * Metodo que permite inicializar el plan de servicio
   */
  inicializarFormsPlanServicio() {
    /**
     * Validadores del formulario de creacion de menus
     */
    this.planServicioForm = this.formBuilder.group({
      almacenamiento: new FormControl("", Validators.compose(
        [Validators.required, Validators.pattern(this.soloNumeros)]     
        )),
      unidad: new FormControl("", Validators.compose([Validators.required])),
      numeroUsuarios: new FormControl("", Validators.compose(
        [Validators.pattern(this.soloNumeros)]       
      )),
      costoUsuarios: new FormControl(""),
      documentosProcesados: new FormControl("", Validators.compose(
        [Validators.pattern(this.soloNumeros)]
      )),
      costoDocumento: new FormControl("", Validators.compose(
        [Validators.pattern(this.soloNumeros)]
      ))
    });
  }

  /**
   * Metodo que obtiene las entidades registradas en el sistema
   */
  obtenerEntidades() {
    this.spinMessage = "Cargando";
    this.spinner.show();
    this.entidadService.getEntidades().subscribe(
      data => {
      this.entidades = data;
      this.entidades = Directivas.orderAsc(this.entidades, "nombre");
      this.entidadesAux = data;
      this.mfData = this.entidades;
      this.spinner.hide();
    }, error => {
      this.spinner.hide();
      swal("Error", error.message,"error");
    });
  }

  /**
   * Metodo que permite cargar los tipos documentales del sistema
   */
  cargarTiposDocumentos() {
    this.tipoDocumentoService
      .getTiposDocumentos()
      .pipe(first())
      .subscribe(data => {
        this.tiposDocumentos = data;
      });
  }

  /**
   * Metodo que obtiene los estados del usuario
   */
  cargarEstadosUsuario() {
    this.estados = Directivas.cargarEdosMenu();
  }

  /**
   * Metodo que permite abrir el formulario de nueva entidad
   */
  abrirNewForm() {
    this.isEdicion = false;
    this.wizard.navigation.goToStep(0); 
    Directivas.resetFormValidator(this.entidadForm);
    Directivas.resetFormValidator(this.usuarioForm);
    Directivas.resetFormValidator(this.planServicioForm);
    this.submitted1 = false;
    this.submitted2 = false;
    this.submitted3 = false;
    this.showUserForm = true;
    document.getElementById("tipoEntidad").removeAttribute("disabled");
  }

  /**
   * Metodo que permite filtrar
   * @param search
   */
  filterBy(search: string) {
    this.entidades = this.entidadesAux;
    this.mfData = this.entidades;

    this.entidadesFilters = this.mfData.filter(
      (entidad: Entidad) =>
        entidad.nombre.toLowerCase().includes(search.toLowerCase())
        || entidad.nit.toLowerCase().includes(search.toLowerCase())
        || entidad.operadorFe.operador.toLowerCase().includes(search.toLowerCase())
        || (entidad.dominio && entidad.dominio.toLowerCase().includes(search.toLowerCase()))
    );

    this.entidades = this.entidadesFilters;
    this.mfData = this.entidades;
  }

  /**
   * Observador que esta pendiente de los cambios del search de la tabla
   * @param search
   */
  validarSearch(search: string) {
    if (search == "") {
      return (
        (this.entidades = this.entidadesAux), (this.mfData = this.entidades)
      );
    }
    this.filterBy(search);
  }
  
  /**
   * Método que completa el obj json de entidad para proceder a guardar
   */
  addCamposFaltantesEntidad(entidad: Entidad) {
    let entidadNueva: Entidad = new Entidad();
    entidadNueva.direccion = entidad.direccion;
    entidadNueva.dominio = entidad.dominio;
    entidadNueva.estado = entidad.estado;
    entidadNueva.intentosFallidos = entidad.intentosFallidos;
    entidadNueva.nit = entidad.nit;
    entidadNueva.nombre = entidad.nombre;
    entidadNueva.operadorFeId = entidad.operadorFeId;
    entidadNueva.telefono = entidad.telefono;
    entidadNueva.tiempoInactividad = entidad.tiempoInactividad;
    entidadNueva.tipoDocumentoId = entidad.tipoDocumentoId;
    entidadNueva.tipoEntidad = entidad.tipoEntidad;
    entidadNueva.vigenciaPassword = entidad.vigenciaPassword;
    return entidadNueva;
  } 

  /**
   * Metodo que permite definir el modo edicion del formulario
   */
  editarUsuario(user: Usuario) {
    this.isEdicion = true;
    this.wizard.navigation.goToStep(0);
    document.getElementById("tipoEntidad").setAttribute("disabled", "disabled");
    this.usuarioSelected = user;
    this.usuarioForm.get("nombres").setValue(this.usuarioSelected.nombreUsuario);
    this.usuarioForm.get("estado").setValue(this.usuarioSelected.estado, { onlySelf: true });    
    this.usuarioForm.get("tipoId").setValue(this.usuarioSelected.tipoDocumentoId, { onlySelf: true });
    this.usuarioForm.get("direccion").setValue(this.usuarioSelected.direccion);
    this.usuarioForm.get("telefono").setValue(this.usuarioSelected.telefono);
    this.usuarioForm.get("email").setValue(this.usuarioSelected.email);
    this.usuarioForm.get("identificacion").setValue(this.usuarioSelected.identificacion);
  }

  async createAlert() {
    try {
      let result = await swal({
        text:
          "¿Desea salir sin guardar los cambios? Tenga en cuenta que los cambios no guardados se perderán. ",
        type: "warning",
        showCancelButton: true,
        confirmButtonText: "Aceptar",
        cancelButtonText: "Cancelar",
        reverseButtons: false,
        allowOutsideClick: false
      });
      // SUCCESS
      return result;
    } catch (e) {
      // Fail!
      console.error(e);
    }
  }


  /**
   * Metodo que permite cancelar la accion desde el modal
   */
  cancelar() { 
    var instancia = this;
    var directivas = Directivas;
    swal({
      text:
        "¿Desea salir sin guardar los cambios? Tenga en cuenta que se perderán los campos que no se hayan guardado.",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Aceptar",
      allowOutsideClick: false
    }).then(function(response) {
      if (response.value) {
        document.getElementById("close-btn-modal").click();
        instancia.inicializarFormularios();
        directivas.resetFormValidator(instancia.entidadForm);
        directivas.resetFormValidator(instancia.usuarioForm);
        directivas.resetFormValidator(instancia.planServicioForm);
      }     
    });

    
  }

  /**
   * Metodo que permite validar si los campos del formulario estan ok para aprobar
   * el siguiente paso del wizard
   */
  validarPasoSiguiente(paso: number) {    
    switch (paso) {
      case 1: {
        this.submitted1 = true;
        if (this.entidadForm.invalid) {
          this.spinner.hide();
          this.wizard.navigation.isNavigable(0);
          return;
        }
        if (this.isEdicion) {
          let entidadAux: Entidad = this.entidadSelected;
          this.entidadSelected = this.entidadForm.value;
          this.entidadSelected.id = entidadAux.id;
        } else {
          this.entidadAGuardar = new Entidad();
          this.entidadAGuardar = this.entidadForm.value;
        }        
        this.wizard.navigation.goToNextStep();
        break;
      }
      case 2: {
         this.submitted2 = true;       
         if (this.usuarioForm.invalid) {
           this.spinner.hide();
           this.wizard.navigation.isNavigable(0);
           return;
         }          
         /**
          * Creamos el usuario nuevo que se va a guardar
          */
         this.usuarioAGuardar = new Usuario();
         this.usuarioAGuardar = this.usuarioForm.value;
         this.wizard.navigation.goToNextStep();
         break;
      }
      case 3: {
         this.submitted3 = true;          
         if (this.planServicioForm.invalid) {
           this.spinner.hide();
           this.wizard.navigation.isNavigable(0);
           return;
         }

        this.editarPlanDeServicio();       
        this.finalizarGuardar();
      }
    }
  }

  /**
   * Metodo que permite validar el modo edicion del wizard
   */
  abrirEdicion(entidad: Entidad, isCalledModal: boolean) {
    this.isEdicion = true;
    
    document.getElementById("tipoEntidad").setAttribute("disabled", "disabled");
    if (isCalledModal) {
      this.wizard.navigation.goToPreviousStep();
      this.entidadSelected = this.entidadAGuardar;
    } else {
      this.entidadSelected = entidad;
      this.wizard.navigation.goToStep(0);
      this.showUserForm = false;
    }

    this.inicializarFormsEntidades();
    Directivas.resetFormValidator(this.entidadForm);   
    this.entidadForm.get("estado").setValue(this.entidadSelected.estado, { onlySelf: true });
    this.entidadForm.get("tipoEntidad").setValue(this.entidadSelected.tipoEntidad, { onlySelf: true });
    this.entidadForm.get("operadorFeId").setValue(this.entidadSelected.operadorFeId, { onlySelf: true });
    this.entidadForm.get("tipoDocumentoId").setValue(this.entidadSelected.tipoDocumentoId, { onlySelf: true });
    this.entidadForm.get("nit").setValue(this.entidadSelected.nit);
    this.entidadForm.get("nombre").setValue(this.entidadSelected.nombre);
    this.entidadForm.get("direccion").setValue(this.entidadSelected.direccion);
    this.entidadForm.get("telefono").setValue(this.entidadSelected.telefono);
    this.entidadForm.get("dominio").setValue(this.entidadSelected.dominio);
    this.entidadForm.get("tiempoInactividad").setValue(this.entidadSelected.tiempoInactividad, { onlySelf: true });
    this.entidadForm.get("vigenciaPassword").setValue(this.entidadSelected.vigenciaPassword, { onlySelf: true });
    this.entidadForm.get("intentosFallidos").setValue(this.entidadSelected.intentosFallidos, { onlySelf: true });
    
    this.planServicioForm.get("almacenamiento").setValue(this.entidadSelected.almacenamiento);
    this.planServicioForm.get("unidad").setValue(this.entidadSelected.unidad, { onlySelf: true });
    this.planServicioForm.get("numeroUsuarios").setValue(this.entidadSelected.numeroUsuarios);
    this.planServicioForm.get("costoUsuarios").setValue(this.entidadSelected.costoUsuarios);
    this.planServicioForm.get("documentosProcesados").setValue(this.entidadSelected.documentosProcesados);
    this.planServicioForm.get("costoDocumento").setValue(this.entidadSelected.costoDocumento);
    
  } 

  /**
   * Metodo que permite cargar la información del usuario creado
   */
  cargarDataUsuarioForm() {
    this.usuarioSelected = this.usuarioCreado;
    this.usuarioForm
      .get("nombres")
      .setValue(this.usuarioSelected.nombreUsuario);
    this.usuarioForm
      .get("estado")
      .setValue(this.usuarioSelected.estado, { onlySelf: true });
    this.usuarioForm
      .get("perfil")
      .setValue(this.usuarioSelected.perfilId, { onlySelf: true });    
    this.usuarioForm
      .get("tipoId")
      .setValue(this.usuarioSelected.tipoDocumentoId, { onlySelf: true });
    this.usuarioForm.get("direccion").setValue(this.usuarioSelected.direccion);
    this.usuarioForm.get("telefono").setValue(this.usuarioSelected.telefono);
    this.usuarioForm.get("email").setValue(this.usuarioSelected.email);
    this.usuarioForm
      .get("identificacion")
      .setValue(this.usuarioSelected.identificacion);
  }

  /**
   * Metodo que edita los cambios en el modal para plan de servicio y los asocia a la entidad para guardar
   */
  editarPlanDeServicio() {   
    if(this.isEdicion) {
      this.entidadSelected.almacenamiento = this.planServicioForm.get("almacenamiento").value;
      this.entidadSelected.unidad = this.planServicioForm.get("unidad").value;
      this.entidadSelected.numeroUsuarios = this.planServicioForm.get("numeroUsuarios").value;
      this.entidadSelected.costoUsuarios = this.planServicioForm.get("costoUsuarios").value;
      this.entidadSelected.documentosProcesados = this.planServicioForm.get("documentosProcesados" ).value;
      this.entidadSelected.costoDocumento = this.planServicioForm.get("costoDocumento").value;
    } else {
      this.entidadAGuardar.almacenamiento = this.planServicioForm.get("almacenamiento").value;
      this.entidadAGuardar.unidad = this.planServicioForm.get("unidad").value;
      this.entidadAGuardar.numeroUsuarios = this.planServicioForm.get("numeroUsuarios").value;
      this.entidadAGuardar.costoUsuarios = this.planServicioForm.get("costoUsuarios").value;
      this.entidadAGuardar.documentosProcesados = this.planServicioForm.get("documentosProcesados" ).value;
      this.entidadAGuardar.costoDocumento = this.planServicioForm.get("costoDocumento").value;
    }
    
  }

  /**
   * Metodo que permite guardar los cambios hechos en entidades finalizado el wizard
   */
  finalizarGuardar() { 
    this.spinMessage = "Guardando"
    this.spinner.show();
   
    if (this.isEdicion) {      
      this.entidadService.updateEntidad(this.entidadSelected).subscribe(
        data => {               
          this.isEdicion = false;
          this.submitted1 = false;
          this.submitted2 = false;
          this.submitted3 = false;
          this.entidadForm.reset();
          this.usuarioForm.reset();
          this.planServicioForm.reset();         
          Directivas.resetFormValidator(this.entidadForm);         
          Directivas.resetFormValidator(this.planServicioForm);
          this.spinner.hide();
          this.obtenerEntidades();          
          swal(
            "Éxito",
            "La entidad " +
            this.entidadSelected.nombre +
              " se ha modificado satisfactoriamente.",
            "success"
          );  
          document.getElementById("close-btn-modal").click(); 
        },
        error => {
          this.spinner.hide();
          swal("Error", error.message, "error");          
          return;
        }
      );  
    } else {     
      this.entidadService.createEntidad(this.entidadAGuardar)
      .subscribe(
        data => {
          this.entidad = data;
          if(this.entidad != null && data != null) {
             /**
              * Se setea el id de la entidad creada al objeto usuario a guardar
              */ 
             if(this.usuarioAGuardar != null) {
                this.usuarioAGuardar.entidadId = data["id"];
                this.usuarioAGuardar.perfilId = data["perfil"]["id"];  
             } 
             let usuarioNuevo: Usuario = new Usuario();
             usuarioNuevo = this.usuarioAGuardar;                       
             this.usuarioService
            .createUsuario(usuarioNuevo)
            .subscribe(
              data => {
                this.usuarioCreado = data; 
                this.spinner.hide();
              },
              error => {
                swal("Error", error.message, "error");
                this.spinner.hide();
                this.submitted2 = false;
                return;
              }
           );
          }
          this.isEdicion = false;
          this.submitted1 = false;
          this.submitted2 = false;
          this.submitted3 = false;
          this.entidadForm.reset();
          this.usuarioForm.reset();
          this.planServicioForm.reset();         
          Directivas.resetFormValidator(this.entidadForm);
          Directivas.resetFormValidator(this.usuarioForm);
          Directivas.resetFormValidator(this.planServicioForm);
          this.spinner.hide();
          this.obtenerEntidades();          
          swal(
            "Éxito",
            "La entidad " +
              this.entidad.nombre +
              " se ha creado satisfactoriamente.",
            "success"
          );  
          document.getElementById("close-btn-modal").click();       
        },
        error => {
          swal("Error", error.message, "error");
          this.spinner.hide();
          return;
        }
      );
    }
  }

  /**
   * Valida el nombre de la entidad como existente o no
   */
  validarNombreEntidad() {
    const campo = this.entidadForm.controls.nombre;
    if (campo.value && campo.value.trim() && (!this.isEdicion || this.entidadSelected.nombre !== campo.value)) {
      this.entidadService.getByNombre(campo.value).subscribe(
        data => {
          if (data) {
            campo.setErrors({existente: true});
          } else {
            campo.setErrors(null);
          }
        }
      );
    }
  }

  /**
   * Valida el correo del usuario como existente o no
   */
  validarCorreoUsuario() {
    const campo = this.usuarioForm.controls.email;
    if (campo.value && campo.value.trim()) {
      this.usuarioService.getByEmail(campo.value).subscribe(
        data => {
          if (data) {
            campo.setErrors({existente: true});
          } else {
            this.usuarioForm.updateValueAndValidity();
          }
        }
      );
    }
  }

  /**
   * Metodo que valida si la entidad existe por el numero y tipo de documento
   */
  validarIfExiste(){
    const campo = this.entidadForm.controls.nit;
    if (campo.value && campo.value.trim()) {
      let tipoDocumento = this.entidadForm.get('tipoDocumentoId').value;
      let documento = this.entidadForm.get('nit').value;  
      if(tipoDocumento != null && documento != null) {
        this.entidadService.validateIfExistEntidad(tipoDocumento, documento)
        .subscribe(
          data => {
           console.log("No existe y puede continuar");
          },
          error => {
            console.log(error.message);
            campo.setErrors({existente: true});
          }
        );
      }
    }
  }

}
