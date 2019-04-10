import { Component, OnInit } from "@angular/core";
import { first } from "rxjs/operators";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from "@angular/forms";

import { Router, ActivatedRoute } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import * as jwt_decode from "jwt-decode";

/**
 * Modelos y directivas
 */
import { Estado } from "src/app/_models/administracion/menus/estado";
import { Directivas } from "src/app/_directives/directiva/directiva.directive";
import { Perfil } from "src/app/_models/administracion/perfil/perfil";
import { TipoPerfil } from "src/app/_models/administracion/perfil/tipoPerfil";

/**
 * Servicios
 */
import { PerfilesService } from '../../../_services/administracion/perfiles/perfiles.service';

/**
 * SweetAlert
 */
import swal from "sweetalert2";
import { AutenticacionService } from "src/app/_services/autenticacion/autenticacion.service";
import { PerfilPermiso } from "src/app/_models/administracion/menus/perfil-permiso";
import { PermisosService } from "src/app/_services/administracion/permisos/permisos.service";

@Component({
  selector: "app-perfiles",
  templateUrl: "./perfiles.component.html"
})
export class PerfilesComponent implements OnInit {
  title: string = "Perfiles";
  estados: Estado[] = [];
  tiposPerfiles: TipoPerfil[] = [];
  perfiles: Perfil[] = [];
  perfilesFilter: Perfil[] = [];
  perfilesAux: Perfil[] = [];
  values = "";
  rowsOnPage = 20;
  totPags = 1;
  pagNumber = 0;
  orden: number = 0;
  isEdicion = false;
  titleModal: string = "Datos del perfil";
  perfilSelected: Perfil;
  isSelectedBase : boolean = false;
  isSuper: boolean = false;
  isActivatedSuper: boolean = false;

  public perfilForm: FormGroup;
  submitted = false;

  isAdmin: FormControl;
  estado: FormControl;
  tipoBase: FormControl;
  nombrePerfil: FormControl;
  idEntidad: string;

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
    private perfilesService: PerfilesService,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private autentication: AutenticacionService,
    private router: Router,
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
    // Cargar Tipo Perfil del usuario que esta logueado
    var token = sessionStorage.getItem("currentUser");
    let info = jwt_decode(token);
    this.idEntidad = info.ent;    
    this.cargarEstadosPerfil();
    this.getPerfiles();
    this.cargarFormularioPerfiles();
  }

  /**
   * Metodo que permite cargar e inicializar el formulario de crear7editar perfil
   */
  cargarFormularioPerfiles() {
    /**
     * Validadores del formulario de creacion de menus
     */
    this.perfilForm = this.formBuilder.group({
      isAdmin: new FormControl(""),
      isBase: new FormControl(""),
      estado: new FormControl("", Validators.required),
      tipoBase: new FormControl(""),
      nombrePerfil: new FormControl("", [
        Validators.required,
        Validators.maxLength(255)
      ])
    });

    this.tiposPerfiles = Directivas.getTipoPerfil();
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.perfilForm.controls;
  }

  /**
   * Metodo que obtiene los estados del perfil
   */
  cargarEstadosPerfil() {   
    this.estados = Directivas.orderAsc(Directivas.cargarEdosPerfil(), 'valor');
  }

  /**
   * Metodo que obtiene los perfiles registrados y los pinta en la tabla principal
   * Si es base y tipoCampo = 1 Es base ERPS si es 0 es IPS
   */
  getPerfiles() {
    this.perfilesService.getPerfiles().subscribe(data => {
      this.perfiles = Directivas.orderAsc(data, "nombrePerfil");
      this.perfilesAux = data;
      this.mfData = data;
    });
  }

  /**
   * Metodo que permite filtrar los datos de la tabla
   * @param busqueda
   */
  filterBy(search: string) {
    this.perfiles = this.perfilesAux;
    this.mfData = this.perfiles;

    this.perfilesFilter = this.perfiles.filter((perfil: Perfil) =>
      perfil.nombrePerfil
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase())
    );

    this.perfiles = this.perfilesFilter;
    this.mfData = this.perfiles;
  }

  /**
   * Observador que esta pendiente de los cambios del search de la tabla
   * @param search
   */
  validarSearch(search: string) {
    if (search == "") {
      return (this.perfiles = this.perfilesAux, this.mfData = this.perfiles);
    }
    this.filterBy(search);
  }

  /**
   * Metodo que permite guardar un perfil de usuario
   */
  guardarPerfil(perfilForm: FormGroup) {
    this.spinner.show();
    this.submitted = true;

    // stop here if form is invalid
    if (this.perfilForm.invalid) {
      this.spinner.hide();
      return;
    }

    /**
     * Ingresa porque esta editando el perfil
     */

    if (this.isEdicion) {      
      this.perfilSelected.esAdmin = this.perfilForm.get("isAdmin").value == false ? 0 : 1;
      this.perfilSelected.estado = this.perfilForm.get("estado").value;
      this.perfilSelected.nombrePerfil = this.perfilForm.get("nombrePerfil").value;
      this.perfilSelected.entidadId = this.idEntidad;
      this.perfilSelected.esBase = this.perfilForm.get("isBase").value;
      if (this.perfilForm.get("isBase").value == null || this.perfilForm.get("isBase").value == false) {
        this.perfilSelected.esBase = 0;
      }  else {
        this.perfilSelected.esBase = 1;
      } 

      if(this.perfilSelected.esBase == 1) {
        if (this.perfilForm.get("tipoBase").value == null) {
          swal("Error", "El tipo de base es obligatorio para poder continuar", "error");         
          this.spinner.hide();
          return;
        }
        this.perfilSelected.tipoBase = this.perfilForm.get("tipoBase").value;  
      } else {
        this.perfilSelected.tipoBase = null;
      }

      this.perfilesService.updatePerfil(this.perfilSelected).subscribe(
        data => {        
          Directivas.resetFormValidator(perfilForm);
          this.getPerfiles();
          this.submitted = false;
          this.spinner.hide();
          this.isEdicion = false;
          document.getElementById("close-btn-modal").click();
          swal("Éxito","El perfil " + this.perfilSelected.nombrePerfil + " se ha actualizado satisfactoriamente.","success");
          return;
        },
        error => {
          swal("Error", error.message, "error");
          this.spinner.hide();
          return;
        }
      );
    } else {
      /**
       * Ingresa si el perfil es nuevo
       */
      let perfilNew: Perfil = new Perfil();      
      perfilNew.esAdmin = this.perfilForm.get("isAdmin").value == false || 
      this.perfilForm.get("isAdmin").value == null? 0 : 1;
      perfilNew.estado = this.perfilForm.get("estado").value;      
      if(this.perfilForm.get("isBase").value == null || this.perfilForm.get("isBase").value == false) {
        perfilNew.esBase = 0;
      } else {
        perfilNew.esBase = 1;
      }

      if (perfilNew.esBase == 1) {       
        if (this.perfilForm.get("tipoBase").value == null) {
          swal("Error", "El tipo de base es obligatorio para poder continuar", "error");
          this.spinner.hide();
          return;
        }
        perfilNew.tipoBase = this.perfilForm.get("tipoBase").value;
      } else {
        perfilNew.tipoBase = null;
      }

      perfilNew.nombrePerfil = this.perfilForm.get("nombrePerfil").value;
      perfilNew.entidadId = this.idEntidad;
      
      this.perfilesService.createPerfil(perfilNew).subscribe(
        data => {
          Directivas.resetFormValidator(perfilForm);
          this.getPerfiles();
          document.getElementById("close-btn-modal").click();
          swal("Éxito", "El perfil " + perfilNew.nombrePerfil + " se ha creado satisfactoriamente.", "success");
          this.submitted = false;
          this.spinner.hide();
          return;
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
   * Metodo que carga las opciones para editar el perfil
   */
  abrirEdicion(perfil: Perfil) {
    this.isEdicion = true;
    this.titleModal = "Editar datos del perfíl";
    this.perfilSelected = perfil;
    this.perfilForm.get("isAdmin").setValue(this.perfilSelected.esAdmin, { onlySelf: true });
    this.perfilForm.get("isBase").setValue(this.perfilSelected.esBase, { onlySelf: true }); 
    this.isSelectedBase = this.perfilForm.get("isBase").value == 1? true: false;
    this.perfilForm.get("estado").setValue(this.perfilSelected.estado, { onlySelf: true });   
    this.perfilForm.get("tipoBase").setValue(this.perfilSelected.tipoBase == "0"  ||
    this.perfilSelected.tipoBase == null? null: this.perfilSelected.tipoBase, { onlySelf: true });
    
    this.perfilForm.get("nombrePerfil").setValue(this.perfilSelected.nombrePerfil);  
    this.isSuper = perfil.esSuper === 1? true: false; 
    if(this.isSuper) {
      document.getElementById("select_estado_perfil").setAttribute("disabled","disabled");
    } else {
      document.getElementById("select_estado_perfil").removeAttribute("disabled");
    }
  }

  /**
   * Metodo que permite eliminar un perfil del sistema
   */
  eliminarPerfil(perfil: Perfil) {
    var service = this.perfilesService;
    let onConfirm = this.createAlert(perfil);
    var instancia = this;

    onConfirm.then(function(response) {
      if (response.value) {
        service.deletePerfil(perfil).subscribe(
            data => {
              swal( "Éxito","Se ha eliminado el perfil satisfactoriamente.", "success");
              instancia.getPerfiles();
              return;
            },
            error => {
              swal("Error", error.message, "error");
            }
          );
        return;
      }      
    });
  }
  
  /**
   * Metodo que permite crear la ventana de confirmación de eliminar
   * @param perfil 
   */
  async createAlert(perfil: Perfil) {
    try {
      let result = await swal({
        text:
          "¿Desea eliminar el perfil '" +
          perfil.nombrePerfil.toLowerCase() +
          "' seleccionado?",
        type: "warning",
        showCancelButton: true,
        confirmButtonText: "Aceptar",
        cancelButtonText: "Cancelar",
        cancelButtonColor: "#d33",
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
   * Metodo que resetea el formulario a su estado inicial
   * @param perfilForm
   */
  cancelBtnAction(perfilForm: FormGroup) {
    swal({
      text: "¿Desea salir sin guardar cambios?",
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
      }
    });
  }

  /**
   * Metodo que permite cancelar la accion del modal
   */
  Cancelar() {   
    Directivas.resetFormValidator(this.perfilForm);
    this.getPerfiles();
    this.submitted = false;
  }

  /**
   * Metodo que permite abrir la ventana de permisos
   */
  abrirPermisos(idPerfil: number) {
    this.router.navigate(["/permisos", idPerfil]);
  }

  /**
   * Metodo que maneja el evento de mostrar/ocultar selector de base
   */
  selectedBase(){
    this.isSelectedBase = !this.isSelectedBase;
  }
  
  /**
   * Metodo que permite limpiar todo al momento de crear un perfil
   */
  abrirNuevoPerfil(){
    this.titleModal = "Datos del Perfil";
    this.isSelectedBase = false;
    this.isEdicion = false;
    Directivas.resetFormValidator(this.perfilForm);
    this.submitted = false;
    document.getElementById("select_estado_perfil").removeAttribute("disabled");
  }
}
