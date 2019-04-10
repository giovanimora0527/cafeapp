import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

/**
 * Modelos
 */
import { TipoDocumento } from '../../../_models/administracion/shared/tipo-documento';
import { Estado } from 'src/app/_models/administracion/menus/estado';


/**
 * Servicios
 */
import { TipoDocumentoService } from '../../../_services/shared/tipo-documento.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Directivas } from 'src/app/_directives/directiva/directiva.directive';

/**
 * SweetAlert
 */
import swal from "sweetalert2";
import { Router } from '@angular/router';
import { AutenticacionService } from 'src/app/_services/autenticacion/autenticacion.service';
import { PerfilPermiso } from 'src/app/_models/administracion/menus/perfil-permiso';
import { PermisosService } from 'src/app/_services/administracion/permisos/permisos.service';
import { first } from 'rxjs/operators';


@Component({
  selector: 'app-tipo-documentos',
  templateUrl: './tipo-documentos.component.html'
})
export class TipoDocumentosComponent implements OnInit {
  title: string = "Gestionar tipo de documentos";
  tiposDocumentos: TipoDocumento[] = [];
  tiposDocumentosAux: TipoDocumento[] = [];
  tiposDocumentosFilters: TipoDocumento[] = [];
  mfData: any[] = [];
  isEdicion: boolean = false;
  estados: Estado[];
  submitted = false;
  tipoDocumentoSelect: TipoDocumento;
  justAlphaCharactersRegex = /^[A-Za-zÀ-ü]+( [A-Za-zÀ-ü]+)*$/;

  public documentoForm: FormGroup; 

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

  constructor(private tipoDocumentoService: TipoDocumentoService,
    private formBuilder: FormBuilder, private spinner: NgxSpinnerService,
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
    this.getTiposDocumentos();
    this.cargarEstadosTipoDoc();
    this.inicializarFormulario();
  }
   

  /**
   * Metodo que permite inicializar el formulario de documentos
   */
  inicializarFormulario(){
    /**
     * Validadores del formulario de creacion de menus
     */
    this.documentoForm = this.formBuilder.group({
      estado: new FormControl("", Validators.compose([Validators.required])),
      codigo: new FormControl("", Validators.compose(
        [
          Validators.required, 
          Validators.maxLength(3),
          Validators.pattern(this.justAlphaCharactersRegex)
        ]
          )),      
      nombre: new FormControl("", Validators.compose(
        [
          Validators.required,
          Validators.maxLength(255),
          Validators.pattern(this.justAlphaCharactersRegex)]))     
    });    
    Directivas.resetFormValidator(this.documentoForm);
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.documentoForm.controls;
  }

  /**
   * Metodo que obtiene los estados del menu
   */
  cargarEstadosTipoDoc() {
    this.estados = Directivas.cargarEdosMenu();
  }
  
  /**
   * Metodo que obtiene los tipos de documentos registrados
   */
  getTiposDocumentos() {
     this.tipoDocumentoService.getTiposDocumentos()
     .subscribe(
       data => {
           this.tiposDocumentos = Directivas.orderAsc(data, "detalleTipoDocumento");
           this.tiposDocumentosAux = data; 
           this.mfData = data;
       });
  }

  /**
   * Observador que esta pendiente de los cambios del search de la tabla
   * @param search
   */
  validarSearch(search: string) {
    if (search == "") {
      return (this.tiposDocumentos = this.tiposDocumentosAux, this.mfData = this.tiposDocumentos);
    }
    this.filterBy(search);
  }

  /**
   * Metodo que permite filtrar los datos de la tabla
   * @param busqueda
   */
  filterBy(search: string) { 
    const splitted: Array<string> = search
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase()
      .normalize("NFD")
      .replace(/\s\s+/g, " ")
      .split(" ");
      
    this.tiposDocumentos = this.tiposDocumentosAux.filter((c: TipoDocumento) => {
      const noCodigoWords: Array<string> = [];
   
      for (let i = 0; i < splitted.length; i++) {
        const word = splitted[i].trim();
        if (!c.codigoTipoDocumento.toLocaleLowerCase().includes(word) &&
            !c.detalleTipoDocumento.toLocaleLowerCase().includes(word)) {
             noCodigoWords.push(word);
          }
      }    

      return c.detalleTipoDocumento
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase()
        .normalize("NFD")
        .match(`.*${noCodigoWords.join(".*")}.*`);
    });
  }

   
  /**
   * Metodo que permite inicializar el formulario al crear un nuevo documento de identidad
   */
  abrirNewForm(){
    this.inicializarFormulario();
  }

  /**
   * Metodo que permite editar un tipo de documento
   * @param tipoDoc 
   */
  editarTipoDoc(tipoDoc: TipoDocumento){
     this.isEdicion = true;
     this.documentoForm.get("estado").setValue(tipoDoc.estado, { onlySelf: true });
     this.documentoForm.get("codigo").setValue(tipoDoc.codigoTipoDocumento);
     this.documentoForm.get("nombre").setValue(tipoDoc.detalleTipoDocumento);
     this.tipoDocumentoSelect = tipoDoc;
  }
  
  /**
   * Metodo que realiza las acciones necesaria cuando el usuario da clic en el modal cancelar
   */
  cancelarAction() {
    var instancia = this.documentoForm
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
    Directivas.resetFormValidator(this.documentoForm);
    this.submitted = false;
  }

  /**
   * Metodo que permite guardar los tipos de documento de identidad
   */
  guardarTipoDocumento() {
    this.spinner.show(); 
    this.submitted = true;
   
    // stop here if form is invalid    
    if (this.documentoForm.invalid) {
      this.spinner.hide(); 
      return;
    }  
    
    if(this.isEdicion) {
      let tipoDoc = new TipoDocumento();
      tipoDoc = this.obtenerObjetoAGuardar(this.tipoDocumentoSelect);
      this.tipoDocumentoService.updateTipoDocumento(tipoDoc)
      .subscribe(
        data => {
          Directivas.resetFormValidator(this.documentoForm);
          this.getTiposDocumentos();
          this.submitted = false;
          this.spinner.hide();
          this.isEdicion = false;
          document.getElementById("close-btn-modal").click();
          swal("Éxito","El tipo de documento " + tipoDoc.detalleTipoDocumento + " se ha actualizado satisfactoriamente.","success");
          return;
        },
        error => {
          swal("Error",  error.message, "error");
          this.spinner.hide();
          return;
        }
      );
    } else {
      let newTipoDoc = new TipoDocumento();      
      this.tipoDocumentoService.createTipoDocumento(this.obtenerObjetoAGuardar(newTipoDoc))
      .subscribe(
        data => {
          Directivas.resetFormValidator(this.documentoForm);
          this.getTiposDocumentos();
          this.submitted = false;
          this.spinner.hide();
          document.getElementById("close-btn-modal").click();
          swal("Éxito","El tipo de documento " + newTipoDoc.detalleTipoDocumento + " se ha creado satisfactoriamente.","success");
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
   * 
   */
  obtenerObjetoAGuardar(tipoDocumento: TipoDocumento) {
    tipoDocumento.codigoTipoDocumento = this.documentoForm.get("codigo").value;
    tipoDocumento.detalleTipoDocumento =  this.documentoForm.get("nombre").value;
    tipoDocumento.estado = this.documentoForm.get("estado").value == "1"? 1: 0;
    return tipoDocumento;
  }

  /**
   * Metodo que elimina un tipo de documento de identidad
   * @param tipoDocumento 
   */
  removerTipoDoc(tipoDocumento: TipoDocumento){
    var service = this.tipoDocumentoService;
    let onConfirm = this.createAlert(tipoDocumento);
    var instancia = this;

    onConfirm.then(function(response) {
      if (response.value) {
        service.deleteTipoDocumento(tipoDocumento).subscribe(
            data => {
              swal( "Éxito","El tipo de documento " + tipoDocumento.detalleTipoDocumento + 
              " se eliminó satisfactoriamente", "success");
              instancia.getTiposDocumentos();
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
  async createAlert(tipoDocumento: TipoDocumento) {    
    try {
      let result = await swal({
        text:
          "¿Desea eliminar el tipo de documento '" +
          tipoDocumento.detalleTipoDocumento.toLowerCase() +
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

}
