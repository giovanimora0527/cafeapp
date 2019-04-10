import { Component, OnInit, OnDestroy } from "@angular/core";
import { first } from "rxjs/operators";
import * as jwt_decode from "jwt-decode";
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder
} from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";

/**
 * Modelos
 */
import { Usuario } from "../../../_models/administracion/usuario/usuario";
import { Estado } from "src/app/_models/administracion/menus/estado";
import { Directivas } from "src/app/_directives/directiva/directiva.directive";
import { Entidad } from "../../../_models/administracion/entidad/entidad";
import { Perfil } from "src/app/_models/administracion/perfil/perfil";
import { TipoDocumento } from '../../../_models/administracion/shared/tipo-documento';

/**
 * Componente de sweetalert
 */
import swal from "sweetalert2";

/**
 * Servicios
 */
import { UsuarioService } from "../../../_services/administracion/usuario/usuario.service";
import { EntidadService } from "../../../_services/administracion/entidad/entidad.service";
import { PerfilesService } from "../../../_services/administracion/perfiles/perfiles.service";
import { TipoDocumentoService } from '../../../_services/shared/tipo-documento.service';
import { Router } from "@angular/router";
import { AutenticacionService } from "src/app/_services/autenticacion/autenticacion.service";
import { PermisosService } from "src/app/_services/administracion/permisos/permisos.service";
import { PerfilPermiso } from "src/app/_models/administracion/menus/perfil-permiso";


@Component({
  selector: "app-usuarios",
  templateUrl: "./usuarios.component.html",
  styleUrls: ["./usuarios.component.css"]
})
export class UsuariosComponent implements OnInit {
  title: string = "usuarios";
  isEdicion: boolean = false;
  estados: Estado[];
  submitted = false;
  users: Usuario[] = [];
  usersAux: Usuario[] = [];
  usersFilters: Usuario[] = [];
  entidades: Entidad[] = [];
  perfiles: Perfil[] = [];  
  emailRegex = /([\w\.\-_]+)?\w+@[\w-_]+(\.\w+){1,}/;
  justAlphaCharactersRegex = /^[A-Za-zÀ-ü]+( [A-Za-zÀ-ü]+)*$/;
  usuarioSelected: Usuario;
  tiposDocumentos: TipoDocumento[] = [];
  msjSpinner: string = "";

  public usuarioForm: FormGroup;  

  /**
   * Opciones de la tabla
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
    private perfilesService: PerfilesService,
    private tipoDocumentoService: TipoDocumentoService,
    private spinner: NgxSpinnerService,
    private router: Router, 
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
    let url : string =  this.router.routerState.root.children[0].firstChild.routeConfig.path;
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
    this.inicializarFormsUsuario();
    this.cargarEstadosUsuario();
    this.obtenerUsuarios();
    this.cargarEntidades();
    this.cargarPerfiles();
    this.cargarTiposDocumentos();
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.usuarioForm.controls;
  }

  inicializarFormsUsuario() {
    /**
     * Validadores del formulario de creacion de menus
     */
    this.usuarioForm = this.formBuilder.group({
      estado: new FormControl('', Validators.compose([Validators.required])),
      entidad: new FormControl("", Validators.required),
      perfil: new FormControl("", Validators.required),
      tipoId: new FormControl("", [Validators.required]),
      identificacion: new FormControl("", Validators.required),
      
      nombres: new FormControl("", [
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
        Validators.email,
        Validators.maxLength(255)
      ])
    });
  }

  /**
   * Metodo que permite cargar las entidades del sistema
   */
  cargarEntidades() {
    this.entidadService.getEntidades().subscribe(data => {
      this.entidades = data;
      this.entidades = Directivas.orderAsc(this.entidades, 'nombre');
    });
  }

  /**
   * Metodo que permite cargar los perfiles del sistema
   */
  cargarPerfiles() {
    this.perfilesService.getPerfiles().subscribe(data => {
      this.perfiles = data;       
      this.perfiles = Directivas.orderAsc(this.perfiles, 'nombrePerfil');
    });
  }

  /**
   * Metodo que obtiene los usuarios registrados del sistema
   */
  obtenerUsuarios() {
    this.msjSpinner = "Cargando";
    this.spinner.show();
    this.usuarioService.getUsuarios().subscribe(
      data => {
      this.users = Directivas.orderAsc(data, "email");     
      this.usersAux = this.users; 
      this.mfData = this.usersAux;
      
      this.spinner.hide();
    },
    error => {
      swal("Error", error.message,"error");
      this.spinner.hide();
    });
  }

  /**
   * Metodo que permite cargar los tipos documentales del sistema
   */
  cargarTiposDocumentos(){
    this.tipoDocumentoService.getTiposDocumentos()
    .pipe(first())
    .subscribe(
      data => {
        this.tiposDocumentos = data; 
        this.tiposDocumentos = Directivas.orderAsc(this.tiposDocumentos, 'detalleTipoDocumento');     
      }
    );
  }

  /**
   * Metodo que permite mostrar el modal de confirmacion
   */
  cancelButtonAction(usuarioForm: FormGroup) {   
    swal({
      text: "¿Desea salir sin guardar cambios?",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Aceptar"
    }).then(function(response) {
      if (response.value) {
        document.getElementById("close-btn-modal").click();
        Directivas.resetFormValidator(usuarioForm);
        this.submitted = false;
      }    
    });
  }

  /**
   * Metodo que permite definir el modo edicion del formulario
   */
  editarUsuario(user: Usuario) {
    this.isEdicion = true;
    this.usuarioSelected = user;
    this.usuarioForm.get("nombres").setValue(this.usuarioSelected.nombreUsuario);
    this.usuarioForm.get("estado").setValue(this.usuarioSelected.estado, { onlySelf: true });
    this.usuarioForm.get('perfil').setValue(this.usuarioSelected.perfilId, { onlySelf: true });
    this.usuarioForm.get("entidad").setValue(this.usuarioSelected.entidadId, { onlySelf: true });
    this.usuarioForm.get("tipoId").setValue(this.usuarioSelected.tipoDocumentoId, { onlySelf: true });
    this.usuarioForm.get("direccion").setValue(this.usuarioSelected.direccion);
    this.usuarioForm.get("telefono").setValue(this.usuarioSelected.telefono);
    this.usuarioForm.get("email").setValue(this.usuarioSelected.email);
    this.usuarioForm.get("identificacion").setValue(this.usuarioSelected.identificacion);
    document.getElementById("email").setAttribute("disabled", "disabled");
  }

  /**
   * Metodo que obtiene los estados del usuario
   */
  cargarEstadosUsuario() {
    this.estados = Directivas.cargarEdos();
  }

  /**
   * Metodo que permite agregar un usuario nuevo en el sistema
   * @param usuario
   */
  guardarUsuarioNuevo() {
    this.msjSpinner = "Guardando";
    this.spinner.show();
    this.submitted = true;

    // stop here if form is invalid
    if (this.usuarioForm.invalid) {
      this.spinner.hide();
      return;
    }

    /**
     * Ingresa si esta en modo edicion
     */
    if (this.isEdicion) {
      
      /**
       * Validacion que el usuario en sesion no se desactive en el sistema
       */
      var token = sessionStorage.getItem('currentUser');
      let info = jwt_decode(token);
      let userId = info.id;
      if(userId == this.usuarioSelected.id && this.usuarioForm.get("estado").value == 0) {
         swal("Error","No se puede inactivar al usuario de la sesión. Verifique e intente nuevo.","error");
         this.spinner.hide();
         return;
      }

      this.usuarioSelected.estado = this.usuarioForm.get("estado").value;
      this.usuarioSelected.entidadId = this.usuarioForm.get("entidad").value;
      this.usuarioSelected.perfilId = this.usuarioForm.get("perfil").value;
      this.usuarioSelected.tipoDocumentoId = this.usuarioForm.get("tipoId").value;
      this.usuarioSelected.identificacion = this.usuarioForm.get("identificacion").value;
      this.usuarioSelected.nombreUsuario = this.usuarioForm.get("nombres").value;
      this.usuarioSelected.direccion = this.usuarioForm.get("direccion").value;
      this.usuarioSelected.telefono = this.usuarioForm.get("telefono").value;
      this.usuarioSelected.email = this.usuarioForm.get("email").value.toLowerCase();     
      this.usuarioService.updateUsuario(this.usuarioSelected).subscribe(
        data => {
          this.obtenerUsuarios();
          Directivas.resetFormValidator(this.usuarioForm);
          document.getElementById("close-btn-modal").click();
          swal("Éxito","El usuario " + this.usuarioSelected.nombreUsuario +" se ha modificado satisfactoriamente.","success");
          this.submitted = false;
          this.spinner.hide();
          this.isEdicion = false;
          return;
        },
        error => {
          swal("Error", error.message,"error");
          this.obtenerUsuarios();
          this.spinner.hide();
          return;
        }
      );
      return;
    } else {
    /**
     * Creamos el usuario nuevo
     */  
    let user: Usuario = new Usuario();
    user.estado = this.usuarioForm.get("estado").value == false ? 0 : 1;
    user.entidadId = this.usuarioForm.get("entidad").value;   
    user.perfilId = this.usuarioForm.get("perfil").value;
    user.tipoDocumentoId = this.usuarioForm.get("tipoId").value;
    user.identificacion = this.usuarioForm.get("identificacion").value;
    user.nombreUsuario = this.usuarioForm.get("nombres").value;
    user.direccion = this.usuarioForm.get("direccion").value;
    user.telefono = this.usuarioForm.get("telefono").value;
    user.email = this.usuarioForm.get("email").value.toLowerCase();    
    this.usuarioService
      .createUsuario(user)
      .pipe(first())
      .subscribe(
        data => {
          this.obtenerUsuarios();
          Directivas.resetFormValidator(this.usuarioForm);
          this.submitted = false;
          document.getElementById("close-btn-modal").click();
          swal("Éxito","El usuario " + user.nombreUsuario + " se ha creado satisfactoriamente.","success");
          this.spinner.hide();
          return;
        },
        error => {
          swal("Error", error.message, "error" );
          this.spinner.hide();
          return;
        }
      );
    }
    
  }

  /**
   * Metodo que permite cancelar la accion desde el modal
   */
  cancelarAction() {
    Directivas.resetFormValidator(this.usuarioForm);
    this.submitted = false;   
  }

  /**
   * Metodo que resetea el formulario a su estado inicial
   * @param usuarioForm
   */
  cancelBtnAction() {   
    swal({
      text: "¿Desea salir sin guardar cambios?",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Aceptar"
    }).then(function(response) {
      if (response.value) {               
        document.getElementById("close-btn-modal").click();
      }
    });
  }

  /**
   * Metodo que permite filtrar los datos de la tabla
   * @param busqueda
   */
  filterBy(search: string) {
    this.users = this.usersAux;
    this.mfData = this.users;

    this.usersFilters = this.users.filter((usuario: Usuario) =>
        usuario.email
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        usuario.identificacion
          .includes(search.toLowerCase())  ||
        usuario.nombreUsuario.toLowerCase()
        .includes(search.toLowerCase())  ||
        usuario.perfil.nombrePerfil.toLowerCase()
        .includes(search.toLowerCase())
    );    

    this.users = this.usersFilters;
    this.mfData = this.users;   
  }

  /**
   * Observador que esta pendiente de los cambios del search de la tabla
   * @param search
   */
  validarSearch(search: string) {
    if (search == "") {
      return (this.users = this.usersAux, this.mfData = this.users);
    }
    this.filterBy(search);
  }

/**
   * Metodo que permite cargar el formulario de nuevo menu y sus diferentes opciones
   */
  abrirNewForm() {
    this.inicializarFormsUsuario();
    this.cargarEstadosUsuario(); 
    document.getElementById("email").removeAttribute("disabled");   
  }


}
