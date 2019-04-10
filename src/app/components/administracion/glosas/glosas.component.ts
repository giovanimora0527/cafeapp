import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from '@angular/forms';

/**
 * Componente de sweetalert
 */
import swal, { SweetAlertType } from 'sweetalert2';

/**
 * Servicios
 */
import { GlosasService } from '../../../_services/administracion/glosas/glosas.service';

/**
 * Modelos
 */
import { GlosaGeneral, GlosaEspecifica } from '../../../_models/administracion/glosas/index';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { AutenticacionService } from 'src/app/_services/autenticacion/autenticacion.service';
import { PerfilPermiso } from 'src/app/_models/administracion/menus/perfil-permiso';
import { PermisosService } from 'src/app/_services/administracion/permisos/permisos.service';
import { Directivas } from 'src/app/_directives/directiva/directiva.directive';
import { first } from 'rxjs/operators';


@Component({
  selector: 'app-glosas',
  templateUrl: './glosas.component.html'
})
export class GlosasComponent implements OnInit {
  readonly title = 'Gestionar glosas';
  readonly titleModalGlosaEspecifica = 'Datos de la Glosa Específica';

  glosaEspecificaForm: FormGroup;

  resultados: Array<GlosaEspecifica> = [];
  glosasGenerales: Array<GlosaGeneral> = [];
  glosasEspecificas: Array<GlosaEspecifica> = [];

  glosaGeneralSeleccionada: GlosaGeneral;
  glosaEspecificaSeleccionada: GlosaEspecifica;

  submitted: boolean = false;

  // Maneja el estado del modal de glosa específica: 0-edición, 1-creación
  estadoModalGlosaEspecifica: number;

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
    private glosasService: GlosasService,
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
    this.estadoModalGlosaEspecifica = 0;
    this.cargarGlosasGenerales();
    this.inicializarFormulario();
  }

  /**
   * Metodo que inicializa el formulario para crear/editar glosas especificas
   */
  inicializarFormulario() {
    this.glosaEspecificaForm = this.formBuilder.group({
      estado: new FormControl('', [Validators.required]),
      glosaGeneral: new FormControl({ value: '', disabled: true }, [Validators.required]),
      codigoGlosaesp: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      detalleGlosaEspecifica: new FormControl('', [Validators.required, Validators.maxLength(255)])
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.glosaEspecificaForm.controls;
  }

  /**
   * Metodo que obtiene las glosas generales guardadas en el sistema
   */
  cargarGlosasGenerales() {
    this.glosasService.getGlosasGenerales().subscribe(
      data => {
        this.glosasGenerales = data;        
        this.glosasGenerales = this.glosasGenerales.sort( (a,b) => {
          return <any> a.detalleGlosa.localeCompare(b.detalleGlosa);
        });
      });
  }

  /**
   * Metodo que obtiene las glosas genericas dada su glosa general
   * @param glosaGeneral
   */
  cargarGlosasEspecificas(glosaGeneral = this.glosaGeneralSeleccionada) {
    this.glosaGeneralSeleccionada = glosaGeneral;
    this.glosaEspecificaSeleccionada = null;
    this.glosasGenerales.forEach(itemGlosa => {
      const item = document.getElementById(`glosag_${itemGlosa.codigoGlosa}`);
      if (itemGlosa.codigoGlosa === glosaGeneral.codigoGlosa) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
    this.glosasService.getGlosasEspecificas(this.glosaGeneralSeleccionada.id)
      .subscribe(
        data => {
          document.getElementById('buscar_glosae')['value'] = '';
          this.glosasEspecificas = data;
          this.resultados = this.glosasEspecificas.sort((a,b) => {           
            return <any> a.detalleGlosaEspecifica - <any> b.detalleGlosaEspecifica;
          });         
        }
      );
  }

  /**
   * Guarda para modo crear/editar una glosa especifica
   */
  guardarGlosaEspecifica() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.glosaEspecificaForm.valid) {
      this.spinner.show();
      const glosaEspecificaGuardar: GlosaEspecifica = this.glosaEspecificaForm.value;
      glosaEspecificaGuardar.codigoGlosaId = this.glosaGeneralSeleccionada.id;
      if (this.estadoModalGlosaEspecifica === 1) {
        glosaEspecificaGuardar.id = this.glosaEspecificaSeleccionada.id;
        this.editarGlosaEspecifica(glosaEspecificaGuardar);
      } else {
        this.crearGlosaEspecifica(glosaEspecificaGuardar);
      }
    }
  }

  /**
   * Crea una glosa específica con la información dada
   * @param glosa - Datos de la glosa
   */
  crearGlosaEspecifica(glosa: GlosaEspecifica) {
    this.glosasService.createGlosaEspecifica(glosa).subscribe(
      data => {
        this.generarModalSencillo(`La glosa ${glosa.detalleGlosaEspecifica} se ha creado satisfactoriamente`);
        this.cargarGlosasEspecificas();
        document.getElementById('close-btn-modal').click();
        this.spinner.hide();
      }, error => {
        this.generarModalSencillo(error.message, 'warning');
        this.spinner.hide();
      }
    );
  }

  /**
   * Edita una glosa específica con la información dada
   * @param glosa - Datos de la glosa
   */
  editarGlosaEspecifica(glosa: GlosaEspecifica) {
    this.estadoModalGlosaEspecifica = 1;
    this.glosasService.editGlosaEspecifica(glosa).subscribe(
      data => {
        this.generarModalSencillo(`La glosa ${glosa.detalleGlosaEspecifica} se ha actualizado satisfactoriamente`);
        this.cargarGlosasEspecificas();
        document.getElementById('close-btn-modal').click();
        this.spinner.hide();
      }, error => {
        this.generarModalSencillo(error.message, 'warning');
        this.spinner.hide();
      }
    );
  }

  /**
   * Identifica qué modalidad posee el modal, edición o creación
   * @param glosaEspecifica - si se manda este paramétro se considera una edición, de lo contrario una creación
   */
  abrirModalGlosa(glosaEspecifica?: GlosaEspecifica) {
    this.prepararModalGlosaEspecifica(glosaEspecifica);
    if (glosaEspecifica) {
      this.estadoModalGlosaEspecifica = 1;
      this.glosaEspecificaSeleccionada = glosaEspecifica;
    } else {
      this.estadoModalGlosaEspecifica = 2;
    }
  }

  /**
   * Inicializar el formulario de creacion/edicion de glosa especifica
   * @param glosaEspecifica - cuando es modo edición se debe enviar como paramétro la glosa específica
   */
  prepararModalGlosaEspecifica(glosaEspecifica?: GlosaEspecifica) {
    this.submitted = false;
    this.glosaEspecificaSeleccionada = glosaEspecifica;

    if (glosaEspecifica) {
      this.glosaEspecificaForm.get('codigoGlosaesp').setValue(this.glosaEspecificaSeleccionada.codigoGlosaesp);
      this.glosaEspecificaForm.get('estado').setValue(this.glosaEspecificaSeleccionada.estado);
      this.glosaEspecificaForm.get('glosaGeneral').setValue(this.glosaGeneralSeleccionada.detalleGlosa);
      this.glosaEspecificaForm.get('detalleGlosaEspecifica').setValue(this.glosaEspecificaSeleccionada.detalleGlosaEspecifica);
    } else {
      this.glosaEspecificaForm.reset({ glosaGeneral: this.glosaGeneralSeleccionada.detalleGlosa });
    }
  }

  /**
   * Elimina la glosa específica
   * @param glosa
   */
  removeGlosa(glosa: GlosaEspecifica) {
    this.generarModalConfirmacion(`¿Desea eliminar la glosa '${glosa.detalleGlosaEspecifica}'?`).then(
      response => {
        if (response.value) {
          this.glosasService.deleteGlosaEspecifica(glosa.id)
            .subscribe(
              data => {
                this.generarModalSencillo(`La glosa ${glosa.detalleGlosaEspecifica} se eliminó satisfactoriamente`);
                this.cargarGlosasEspecificas();
              }
            );
        }
      }
    );
  }

  /**
   * Filtrar los datos de la tabla
   * @param patron - texto ingresado a buscar
   */
  filterBy(patron: string) {
    const regexPatron = patron.replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().normalize('NFD').replace(' ', '.*');
    this.resultados = this.glosasEspecificas.filter((glosaEspecifica: GlosaEspecifica) =>
      glosaEspecifica.detalleGlosaEspecifica.replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().normalize('NFD').match(regexPatron)
    );
  }

  /**
   * Genera el mensaje de confirmación
   */
  cancelBtnAction() {
    this.generarModalConfirmacion('¿Desea salir sin guardar cambios?').then(
      response => {
        if (response.value) {
          document.getElementById('close-btn-modal').click();
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
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Aceptar',
      allowOutsideClick: false
    });
  }

  /**
   * Genera un modal sencillo
   * @param mensaje - texto a mostrar en el modal
   * @param exito - indica tipo de icono
   */
  generarModalSencillo(mensaje: string, tipo: SweetAlertType = 'success') {
    swal({
      text: mensaje,
      type: tipo,
      showCancelButton: false,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Aceptar'
    });
  }

}
