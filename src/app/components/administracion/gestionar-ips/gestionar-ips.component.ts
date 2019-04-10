import { Component, OnInit, Output, Input, ViewChild } from '@angular/core';
import { Relacion } from 'src/app/_models/administracion/erp-ips/relacion';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { AutenticacionService } from 'src/app/_services/autenticacion/autenticacion.service';
import { AsociarIpsComponent } from './operaciones/asociar-ips/asociar-ips.component';

import * as jwt_decode from "jwt-decode";
/**
 * Componente de sweetalert
 */
import swal from "sweetalert2";
import { IpsService } from 'src/app/_services/administracion/ips/ips.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AsociarService } from 'src/app/_services/administracion/ips/asociar.service';
import { PerfilPermiso } from 'src/app/_models/administracion/menus/perfil-permiso';
import { PermisosService } from 'src/app/_services/administracion/permisos/permisos.service';
import { Directivas } from 'src/app/_directives/directiva/directiva.directive';
import { first } from 'rxjs/operators';
import { EntidadService } from 'src/app/_services/administracion/entidad/entidad.service';
import { Entidad } from 'src/app/_models/administracion/entidad/entidad';

@Component({
  selector: 'app-gestionar-ips',
  templateUrl: './gestionar-ips.component.html',
  styleUrls: ['./gestionar-ips.component.css']
})
export class GestionarIpsComponent implements OnInit {

  title: string = "Entidades Asociadas";
  titleModalCups: string = "Asociar IPS";
  msjSpinner: string = "";
  @ViewChild(AsociarIpsComponent) asociarIps: AsociarIpsComponent; 

  relacionArray: Relacion[] = [];
  resultados: Relacion[] = [];
  mfData: any[] = [];
  entidadId: string = "";
  relacionSelected: Relacion = null;
  submitted = false;
  relacionForm: FormGroup;
  isSoloLectura: boolean = false;  

  entidadLogueada: Entidad;

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
  hasPermissionHomologar: boolean = false;

  tipoEntidadID: string;

  constructor(private formBuilder: FormBuilder,
    private autentication: AutenticacionService, 
    private router: Router, 
    private ipsService: IpsService,
    private asociarService: AsociarService,
    private spinner: NgxSpinnerService,
    private permisosService: PermisosService,
    private entidadService: EntidadService) {
      this.validarPermisos();
      let url: string = this.router.routerState.root.children[0].firstChild.routeConfig.path;
      this.validarAcciones(url);
      this.cargarInfoEntLogueada(); 
      this.cargarRelacionIPS();      
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
        this.entidadLogueada = data;      
      }
    );
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
     //El usuario logueado de la entidad solo tiene el permiso de visualizar
    if(this.arrayPermisos != null && this.arrayPermisos[0] == 'M'){
      this.hasPermissionsUpload = false;
      this.hasPermissionsDownload = false;
      this.hasPermissionsCreate = false;
      this.hasPermissionsUpdate = false;
      this.hasPermissionsDelete = false;
      this.hasPermissionRead = true;      
      return;
    }  

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
        if(this.tipoEntidadID == Directivas.TIPO_ENTIDAD_ASD.toString()) {         
           this.hasPermissionsCreate = false;
           this.hasPermissionHomologar = false;           
        }       
        else if(this.tipoEntidadID == Directivas.TIPO_ENTIDAD_IPS.toString()) {        
          this.hasPermissionHomologar = true;
          this.hasPermissionsCreate = true;        
        }
        else if(this.tipoEntidadID == Directivas.TIPO_ENTIDAD_EPS.toString()) {
          this.hasPermissionHomologar = false;
          this.hasPermissionsCreate = true;         
        }
      }
    );
  }

  ngOnInit() {
    var token = sessionStorage.getItem("currentUser");
    let info = jwt_decode(token);
    this.entidadId = info.ent;
  }

  
  /**
   * Metodo que permite listar todas las ips relacionadas y registradas por la EPS
   */
  cargarRelacionIPS() {
    this.msjSpinner = "Cargando";
    this.spinner.show();       
    this.asociarService.getRelacionIPS()
    .pipe(first())
    .subscribe(
       data => {         
         this.relacionArray = data; 
         this.resultados = this.relacionArray;
         this.spinner.hide();       
       }, error => {
         console.log(error);
         this.spinner.hide();
       }
     );
  }

  /**
   * Metodo que permite abrir la ventana con la cinta de opciones asociadas a la IPS
   * @param idEntidad 
   */
  redireccionarOperacionesIPS(idEntidad: string) {
    this.router.navigate(["/operaciones-ips", idEntidad]);
  }


  /**
   * Metodo que permite guardar los datos diligenciados en la ventana modal
   * para asociar informacion
   */
  guardarIPS() {
   this.asociarIps.guardarAsociacion(this.asociarIps.relacionForm, this);
  }
  

   /**
   * Metodo que cierra y limpia el modal
   * @param menu
   */
  cancelButtonAction() {  
    var instancia2 = this;
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
        instancia2.cancelar(); 
        instancia2.submitted = false;       
      }
    });
  }
  

  /**
   * Metodo que permite cancelar y limpiar el formulario de la ventana modal
   */
  cancelar() {
    document.getElementById("close-btn-modal").click();
    this.limpiarFormulario();
  }
  
  /**
   * Metodo que permite limpiar los campos del formulario del modal
   */
  limpiarFormulario(){
    this.asociarIps.limpiarFormulario();
    this.submitted = false;
    this.relacionSelected = null;
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
    this.resultados = this.relacionArray.filter((r: Relacion) => {
      const noCodigoWords: Array<string> = [];
      for (let i = 0; i < splitted.length; i++) {
        const word = splitted[i].trim();
        if (
          !r.entidadIdIps.nombre.toLocaleLowerCase().includes(word) &&
          !r.nombreResponsableIps.toLocaleLowerCase().includes(word)
        ) {
          noCodigoWords.push(word);
        }
      }
      return r.entidadIdIps.nombre
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase()
        .normalize("NFD")
        .match(`.*${noCodigoWords.join(".*")}.*`);
    });
  }

  /**
   * Metodo que permite redireccionar
   * @param relacion 
   */
  pasarInfoRelacion(relacion: Relacion) {
    this.router.navigate(['/home', {outlets: {'content': [ 'operaciones-ent', relacion.id ]}}]);
  }

}
