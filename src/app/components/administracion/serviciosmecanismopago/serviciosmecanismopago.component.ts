import { Component, OnInit } from '@angular/core';
import { moveItemInArray, transferArrayItem, CdkDragDrop } from '@angular/cdk/drag-drop';

/**
 * Componente de sweetalert
 */
import swal from "sweetalert2";

/**
 * Modelos
 */
import { TipologiaDocumento } from '../../../_models/administracion/tipologias/tipologias-documentos';

/**
 * Directivas
 */
import { Directivas } from "../../../_directives/directiva/directiva.directive";

 /**
  * Servicios
  */
import { NgxSpinnerService } from "ngx-spinner";
import { TipologiasService } from 'src/app/_services/shared/tipologia-documentos/tipologias.service';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Estado } from 'src/app/_models/administracion/menus/estado';
import { ServicioMecanismoPago } from '../../../_models/administracion/mecanismo-pago/servicio-mec-pago';
import { MecanismoPago } from '../../../_models/administracion/mecanismo-pago/mecanismo-pago';
import { ServiciosxmecanismopagoService } from 'src/app/_services/administracion/servicios/serviciosxmecanismopago.service';
import { SoportesMecanismoPago } from '../../../_models/administracion/mecanismo-pago/soportes-mecanismo-pago';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { PermisosService } from 'src/app/_services/administracion/permisos/permisos.service';
import { AutenticacionService } from '../../../_services/autenticacion/autenticacion.service';
import { first } from 'rxjs/operators';
import { PerfilPermiso } from 'src/app/_models/administracion/menus/perfil-permiso';

@Component({
  selector: 'app-serviciosmecanismopago',
  templateUrl: './serviciosmecanismopago.component.html'
})
export class ServiciosmecanismopagoComponent implements OnInit {

  title: string = "Servicios por mecanismos de pago";
  titleModal: string = "Servicio por mecanismo de pago";
  
  mecanismos: MecanismoPago[] = [];
  servicios: ServicioMecanismoPago[] = [];
  soportes: SoportesMecanismoPago[] = [];

  tipologiasDocumento: TipologiaDocumento[] = [];
  tdocsSeleccionadas: TipologiaDocumento[] = [];
  estados: Estado[]; 
  isEdicion: boolean = false;
  mecPagoSeleccionado: MecanismoPago;
  servicioSeleccionado: ServicioMecanismoPago;
  soporteSeleccionado: SoportesMecanismoPago;
  enabledBtnCrear: boolean = false;
  public servicioForm: FormGroup;
  submitted = false; 

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

  constructor( private tipologiasService: TipologiasService,
    private spinner: NgxSpinnerService, private formBuilder: FormBuilder,
    private serviciosxmecanismopagoService: ServiciosxmecanismopagoService,    
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
    this.cargarEstados();
    this.inicializarFormulario();
    this.getMecanismosPago();    
  }
  
  /**
   * Metodo que permite listar los mecanismos de pago registrados en el sistema
   */
  getMecanismosPago() {
     this.serviciosxmecanismopagoService.obtenerMecanismosPago()
     .subscribe(
       data => {
         this.mecanismos = data;         
       }
     );
  }
  
  /**
   * Metodo que obtiene los servicios asociados para cada mecanismo de pago
   * @param mecanismo 
   */
  getServiciosByMecanismoPago(index) { 
    this.enabledBtnCrear = true;
    this.mecPagoSeleccionado = this.mecanismos.find(x => x.id == index);
    this.serviciosxmecanismopagoService.listarServiciosXMecanismoPago(this.mecPagoSeleccionado)
    .subscribe(
      data => {       
        this.servicios = data;
      }
    );
  }

  /**
   * Metodo que permite listar los soportes asociados a un servicio
   * @param servicio 
   */
  getSoportesByServicios(servicio: ServicioMecanismoPago) {
    this.servicioSeleccionado = servicio;
    this.pintarServiciosSeleccionado(servicio.id);
    this.serviciosxmecanismopagoService.listarSoportesXServicio(this.servicioSeleccionado)
    .subscribe(
      data => {
         this.soportes = data; 
         this.obtenerTipologiasDocumentos();              
      }
    );
  }
  
  /**
   * Metodo que filtra los soportes que ya tiene asignados el servicio
   * y depura la lista de tipologias presentadas en la vista
   * @param soportes 
   */
  depurarListaTipologias() {     
     if(this.soportes != null && this.soportes.length > 0) {       
        for(let i= 0; i < this.soportes.length; i++) {           
           let tipologia: TipologiaDocumento = this.soportes[i].tipologiaDocumento
           for(let j=0; j<this.tipologiasDocumento.length; j++) {
             if(tipologia.id == this.tipologiasDocumento[j].id) {
               this.tipologiasDocumento.splice(j, 1);
             }
           }           
        }
     }
  }



  /**
   * Metodo que permite obtener las tipologias de documentos registradas en el sistema
   */
  obtenerTipologiasDocumentos() {
    this.tipologiasService.getTipologiasDocumentos()
    .subscribe(
      data => {
        this.tipologiasDocumento = data; 
        this.depurarListaTipologias();       
      }
    );
  }

  /**
   * Metodo que obtiene los estados activo/inactivo
   */
  cargarEstados() {
    this.estados = Directivas.cargarEdosMenu();
  }
  
  /**
   * Metodo que permite inicializar el formulario de creacion/edicion de servicios
   */
  inicializarFormulario() {
    /**
     * Validadores del formulario de creacion de menus
     */
    this.servicioForm = this.formBuilder.group({
      estado: new FormControl("", Validators.compose([Validators.required])),
      detalleServiciomec: new FormControl("", Validators.compose([Validators.required, Validators.maxLength(255)]))     
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.servicioForm.controls;
  }

  /**
   * Metodo que permite editar una tipologia de documento
   * @param tipoDoc 
   */
  editarTipoDoc(tipoDoc: TipologiaDocumento){
    Directivas.resetFormValidator(this.servicioForm);
    this.isEdicion = true;
    this.servicioForm.get("estado").setValue(tipoDoc.estado);    
    this.servicioForm.get("nombre").setValue(tipoDoc.detalleTipologia);    
 }
  
  /**
   * Evento del Drag and Drop
   * @param event 
   */
  addToList(event: CdkDragDrop<string[]>) {
    if(!this.hasPermissionsUpdate){
      return;
    }
    this.obtenerElementoSeleccionado(event.currentIndex);
  }
  
  /**
   * Metodo que obtiene el indice del elemento seleccionado del drag
   * y lo guarda en la lista de soportes
   * @param index 
   */
  obtenerElementoSeleccionado(index: number){ 
    let tipoDoc = this.tipologiasDocumento[index];
    if(tipoDoc != null) {
      let soporte = new SoportesMecanismoPago();
      soporte.mecanismoPagoId = this.mecPagoSeleccionado.id;
      soporte.serviciomecPagoId = this.servicioSeleccionado.id;
      soporte.tipologiaDocumentoId = tipoDoc.id;
      soporte.estado = tipoDoc.estado;    
       this.serviciosxmecanismopagoService.addSoporteAServicioMecPago(soporte)
       .subscribe(
         data => {
             this.getSoportesByServicios(this.servicioSeleccionado);
             console.log("Se añadio la tipologia");
         },
         error => {
          console.log("Error => " + error.message);
          swal("Error", error.message);
         }
       );
    }
   
  }
  
  /**
   * Metodo que crea la ventana de confirmacion al eliminar un elemento soporte de la lista
   */
  async createAlertDeleteTipologia(){ 
    var instancia = this;    
    try {
      let result = await swal({
        text:
          "¿Desea eliminar la tipología '" + 
          instancia.soporteSeleccionado.tipologiaDocumento.detalleTipologia.toLowerCase() + 
          "'  asociada al servicio " + instancia.servicioSeleccionado.detalleServiciomec + "? ",
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
   * Metodo que permite eliminar una tipologia de la seccion de soportes
   */
  eliminarItem(soporte: SoportesMecanismoPago){
    this.soporteSeleccionado = soporte;
    var instancia = this;
    let onConfirm = this.createAlertDeleteTipologia();   
    onConfirm.then(
      function(response) {
        if (response.value) {
          instancia.serviciosxmecanismopagoService
          .deleteSoporteAServicioMecPago(soporte)
          .subscribe(
            data => {
              instancia.obtenerTipologiasDocumentos();
              instancia.getSoportesByServicios(instancia.servicioSeleccionado);        
              swal("Éxito", "La tipología " + instancia.soporteSeleccionado.tipologiaDocumento.detalleTipologia + 
              " se eliminó satisfactoriamente", "success");
            },
            error => {
               swal("Error", error.message);
            }
          );
        }
      }
    );
  }
  
  /**
   * Metodo que permite crear una ventana de confirmacion al momento de eliminar un servicio seleccionado
   */
  async createAlertDeleteServicio(){ 
    var instancia = this; 
    try {
      let result = await swal({
        text:
          "¿Desea eliminar el servicio por mecanismo de pago '" + 
          instancia.servicioSeleccionado.detalleServiciomec.toLowerCase() + "' ? ",
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
   * Metodo que permite eliminar un servicio por mecanismo de pago
   */
  eliminarServicio(servicio : ServicioMecanismoPago) {
    this.servicioSeleccionado = servicio;
    var instancia = this;
    let onConfirm = this.createAlertDeleteServicio();

    onConfirm.then(
      function(response) {
        if (response.value) {
          instancia.serviciosxmecanismopagoService.deleteServicioMecanismoPago(servicio)
          .subscribe(
            data => {
              instancia.getServiciosByMecanismoPago(instancia.mecPagoSeleccionado.id); 
              instancia.tipologiasDocumento = [];     
              swal("Éxito", "El servicio " + servicio.detalleServiciomec + 
              " se eliminó satisfactoriamente", "success");
            },
            error => {
               swal("Error", error.message);
            }
          );
        }
      }
    );
   

  }
  
  /**
   * Metodo que permite cerrar el modal y limpiar el formulario
   */
  cancelar(){
    Directivas.resetFormValidator(this.servicioForm);
    this.submitted = false;
  }

  /**
   * Metodo que resetea el formulario a su estado inicial 
   */
  cancelBtnAction() {   
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
   * Pintar los servicios de pago cuando el usuario selecciona un item de la lista
   */
  pintarServiciosSeleccionado(index: number) {
    var idx = "servicio_" + index;
    var item;
    /**
     * Se remueve la clase active de todos los items de servicios
     */
    if(this.servicios != null && this.servicios.length > 0) {
       for(let i=0; i < this.servicios.length; i++) {        
         item = document.getElementById("servicio_" + this.servicios[i].id);         
         item.classList.remove("active");
       }
    }
    // Se procede a colocar la clase active para seleccionar el item
    item = document.getElementById(idx).classList.add("active");                 
  }
  

  /**
   * Metodo que permite guardar un nuevo servicio o editar uno existente
   */
  guardarServicio(){
    this.submitted = true;
    // stop here if form is invalid
    if (this.servicioForm.valid) {
      this.spinner.show();
    } else {
      return;
    }

    let servicio: ServicioMecanismoPago;
    if(!this.isEdicion) {
      servicio = this.servicioForm.value;
      servicio.mecanismoPagoId = this.mecPagoSeleccionado.id;
      this.serviciosxmecanismopagoService.createServicioMecanismoPago(servicio)
      .subscribe(
        data => {          
            this.getServiciosByMecanismoPago(this.mecPagoSeleccionado.id);
            this.spinner.hide();            
            swal("Éxito", "El servicio " + servicio.detalleServiciomec + " se ha creado satisfactoriamente",  "success");
            this.submitted = false;
            document.getElementById("close-btn-modal").click();
        }, 
        error => {
          swal("Error", error.message, "error"); 
          this.spinner.hide();
        }
      )
    } else {
       this.servicioSeleccionado.estado = this.servicioForm.value.estado;
       this.servicioSeleccionado.detalleServiciomec = this.servicioForm.value.detalleServiciomec;
       this.servicioSeleccionado.mecanismoPagoId = this.mecPagoSeleccionado.id;      
       this.serviciosxmecanismopagoService.updateServicioMecanismoPago(this.servicioSeleccionado)
       .subscribe(
         data => {
          this.getServiciosByMecanismoPago(this.mecPagoSeleccionado.id);
          this.spinner.hide();         
          swal("Éxito", "El servicio " + this.servicioSeleccionado.detalleServiciomec + " se ha actualizado satisfactoriamente",  "success");
          this.submitted = false;
          document.getElementById("close-btn-modal").click();
         },
         error => {
            swal("Error", error.message, "error"); 
            this.spinner.hide();
         },

       );
    }
  }
  
  /**
   * Metodo que permite habilitar la ventana en modo edicion
   */
  abrirEdicion(servicio: ServicioMecanismoPago) {
    Directivas.resetFormValidator(this.servicioForm);
    this.submitted = false;
    this.isEdicion = true;
    this.servicioForm.patchValue(servicio);
  }

  /**
   * Configura los flags necesarios para el modo creación
   */
  abrirCreacion() {
    Directivas.resetFormValidator(this.servicioForm);
    this.submitted = false;
    this.isEdicion = false;
  }

}
