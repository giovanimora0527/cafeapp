import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Directivas } from 'src/app/_directives/directiva/directiva.directive';
import { NgxSpinnerService } from 'ngx-spinner';
import * as jwt_decode from "jwt-decode";

/**
 * SweetAlert
 */
import swal from "sweetalert2";


/**
 * Modelos
 */
import { TipologiaDocumento } from 'src/app/_models/administracion/tipologias/tipologias-documentos';
import { Estado } from 'src/app/_models/administracion/menus/estado';


/**
 * Servicios
 */
import { TipologiasService } from '../../../_services/shared/tipologia-documentos/tipologias.service';
import { EntidadService } from '../../../_services/administracion/entidad/entidad.service';
import { Entidad } from 'src/app/_models/administracion/entidad/entidad';
import { Router } from '@angular/router';
import { AutenticacionService } from 'src/app/_services/autenticacion/autenticacion.service';
import { PerfilPermiso } from 'src/app/_models/administracion/menus/perfil-permiso';
import { PermisosService } from 'src/app/_services/administracion/permisos/permisos.service';
import { first } from 'rxjs/operators';



@Component({
  selector: 'app-tipologias',
  templateUrl: './tipologias.component.html'
})
export class TipologiasComponent implements OnInit {
  title: string = "Gestionar tipologías de documentos";
  tipologiasDocumento: TipologiaDocumento[] = [];
  tipologiasDocumentoAux: TipologiaDocumento[] = [];
  tipologiasDocumentoFilters: TipologiaDocumento[] = [];
  estados: Estado[];
  submitted = false;
  isEdicion : boolean = false;
  tipologiaSelected: TipologiaDocumento;
  entidadId: string;
  entidad: Entidad;
  
  
  mfData: any[];

  public tipologiaForm: FormGroup; 

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

  constructor(private formBuilder: FormBuilder, private tipologiasService: TipologiasService,
    private spinner: NgxSpinnerService, private entidadService: EntidadService,
    private router: Router, private autentication: AutenticacionService,
    private permisosService: PermisosService) {
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
    this.inicializarFormulario();
    this.cargarEstadosTipoDoc();
    this.getTipologiasDocumentos();
  }

  
  /**
   * Metodo que obtiene las tipologias de documentos registradas en el sistema
   */
  getTipologiasDocumentos() {
     this.tipologiasService.getTipologiasDocumentos()
     .subscribe(
       data => {
         this.tipologiasDocumento = Directivas.orderAsc(data, "detalleTipologia");
         this.mfData = data;
         this.tipologiasDocumentoAux = data;        
       }
     );
  }

  /**
   * Metodo que permite inicializar el formulario de documentos
   */
  inicializarFormulario(){
    /**
     * Validadores del formulario de creacion de menus
     */
    this.tipologiaForm = this.formBuilder.group({
      estado: new FormControl("", Validators.compose([Validators.required])),
      nombre: new FormControl("", Validators.compose([Validators.required, Validators.maxLength(255)]))     
    });    
    Directivas.resetFormValidator(this.tipologiaForm);
  }
 
  // convenience getter for easy access to form fields
  get f() {
    return this.tipologiaForm.controls;
  }

  /**
   * Metodo que obtiene los estados activo/inactivo
   */
  cargarEstadosTipoDoc() {
    this.estados = Directivas.cargarEdosMenu();
  }

  /**
   * Metodo que permite inicializar el formulario al crear un nuevo documento de identidad
   */
  abrirNewForm(){
    this.inicializarFormulario();
  }

  /**
    * Observador que esta pendiente de los cambios del search de la tabla
    * @param search
    */
   validarSearch(search: string) {
     if (search == "") {
       return (this.tipologiasDocumento = this.tipologiasDocumentoAux, this.mfData = this.tipologiasDocumento);
     }     
     this.filterBy(search);
   }

   /**
    * Metodo que permite filtrar los datos de la tabla
    * @param busqueda
    */
   filterBy(search: string) {
    this.tipologiasDocumento = this.tipologiasDocumentoAux;
    this.mfData = this.tipologiasDocumento
    this.tipologiasDocumentoFilters = this.tipologiasDocumento.filter((tipoId: TipologiaDocumento) =>
          tipoId.detalleTipologia
           .toLocaleLowerCase()
           .includes(search.toLocaleLowerCase()) || 
           tipoId.entidad.nombre
           .toLocaleLowerCase()
           .includes(search.toLocaleLowerCase()) 
     );    

     this.tipologiasDocumento = this.tipologiasDocumentoFilters;
     this.mfData = this.tipologiasDocumento;   
   }
   
  /**
   * Metodo que permite editar una tipologia de documento
   * @param tipoDoc 
   */
  editarTipoDoc(tipoDoc: TipologiaDocumento){
    this.isEdicion = true;
    this.tipologiaForm.get("estado").setValue(tipoDoc.estado, { onlySelf: true });    
    this.tipologiaForm.get("nombre").setValue(tipoDoc.detalleTipologia);
    this.tipologiaSelected = tipoDoc;
 }

   /**
    * Metodo que permite guardar la toipologia de documento
    */
   guardarTipologiaDocumento(){
    this.spinner.show(); 
    this.submitted = true;
    // stop here if form is invalid    
    if (this.tipologiaForm.invalid) {
      this.spinner.hide(); 
      return;
    } 
    
   
    if(this.isEdicion) {  
      let tipologia: TipologiaDocumento = new TipologiaDocumento();
      tipologia = this.obtenerObjetoAGuardar(this.tipologiaSelected);
      tipologia.entidadId = this.tipologiaSelected.entidad.id;
      this.tipologiasService.updateTipoDocumento(tipologia) 
      .subscribe(
        data => {
          Directivas.resetFormValidator(this.tipologiaForm);
          this.submitted = false;
          this.spinner.hide();
          document.getElementById("close-btn-modal").click();
          swal("Éxito","La tipología documental " + tipologia.detalleTipologia + " se ha actualizado satisfactoriamente.","success");
          this.getTipologiasDocumentos();
          this.isEdicion = false;
          return;
        },
        error => {
          swal("Error", error.message, "error");
          this.spinner.hide();
          return;
        }
      );
    } else {
      let nuevaTipologia: TipologiaDocumento = new TipologiaDocumento(); 
      nuevaTipologia = this.obtenerObjetoAGuardar(nuevaTipologia); 
      this.obtenerEntidadId();
      this.entidadService.getEntidadesById(this.entidadId)
      .subscribe(
        data => {         
            nuevaTipologia.entidad = data;
            nuevaTipologia.entidadId = nuevaTipologia.entidad.id; 
            this.tipologiasService.createTipoDocumento(nuevaTipologia)
            .subscribe(
              data => {
                Directivas.resetFormValidator(this.tipologiaForm);
                this.submitted = false;
                document.getElementById("close-btn-modal").click();
                swal("Éxito","La tipología documental " + nuevaTipologia.detalleTipologia + " se ha creado satisfactoriamente.","success");                
                this.getTipologiasDocumentos();
                this.spinner.hide();
                return;
              }, 
              error => {
                swal("Error", error.message, "error");
                this.spinner.hide();
                return;
              }
            );
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
    * Metodo que obtiene el objeto a guardar o actualizar de tipologia de documento
    */
   obtenerObjetoAGuardar(tipologia: TipologiaDocumento) {
    tipologia.detalleTipologia = this.tipologiaForm.get('nombre').value; 
    tipologia.estado = this.tipologiaForm.get("estado").value == "1"? 1: 0;
    tipologia.entidadId = "";
    
    return tipologia;
   }
   

    /**
   * Metodo que realiza las acciones necesaria cuando el usuario da clic en el modal cancelar
   */
   cancelarAction() {
    var instancia = this.tipologiaForm
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
  cancelar() {   
    Directivas.resetFormValidator(this.tipologiaForm);
    this.submitted = false;
  }

  /**
   * Metodo que permite crear la ventana de confirmación de eliminar
   * @param perfil 
   */
  async createAlert(tipoDocumento: TipologiaDocumento) {    
    try {
      let result = await swal({
        text:
          "¿Desea eliminar '" +
          tipoDocumento.detalleTipologia.toLowerCase() +
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
    * Metodo que permite remover una tipologia de documento
    * @param tipo 
    */
  removerTipologiaDoc(tipo: TipologiaDocumento) {
    var service = this.tipologiasService;
    let onConfirm = this.createAlert(tipo);
    var instancia = this;

    onConfirm.then(function(response) {
      if (response.value) {
        service.deleteTipoDocumento(tipo).subscribe(
            data => {
              swal( "Éxito", `La tipología ${tipo.detalleTipologia} se eliminó satisfactoriamente`, "success");
              instancia.getTipologiasDocumentos();
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
   * Metodo que permite obtener el id de la entidad dado el token
   */
  obtenerEntidadId(){
    var token = sessionStorage.getItem('currentUser');
    let info = jwt_decode(token);
    this.entidadId = info.ent;
  }

}