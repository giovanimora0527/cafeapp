import { Component, OnInit, ViewChild, Output, ElementRef, EventEmitter } from '@angular/core';
import { Cum } from 'src/app/_models/administracion/cums/cum';

import swal, { SweetAlertType } from 'sweetalert2';

/**
 * Servicios y Directivas
 */
import { NgxSpinnerService } from 'ngx-spinner';
import { Directivas } from 'src/app/_directives/directiva/directiva.directive';
import { Router } from '@angular/router';
import { CumsService } from '../../../_services/administracion/cums/cums.service';
import { AutenticacionService } from 'src/app/_services/autenticacion/autenticacion.service';
import { PerfilPermiso } from 'src/app/_models/administracion/menus/perfil-permiso';
import { first } from 'rxjs/operators';
import { PermisosService } from 'src/app/_services/administracion/permisos/permisos.service';

@Component({
  selector: 'app-cums',
  styleUrls: ['./cums.component.css'],
  templateUrl: './cums.component.html'
})
export class CumsComponent implements OnInit {
  
  title: string = "CUM";
  msjSpinner: string = "Cargando"; 
  cumsArray: Array<Cum> = [];
  resultados: Array<Cum> = [];
  
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

  readonly titleModal: string = 'Importar Código Único de Medicamentos';

  readonly formatos: Array<string> = [
    'csv'
  ];

  @ViewChild('fileInput') fileInput: ElementRef;
  @Output() cargaCompletaEvent = new EventEmitter<any>();

  fileTxt = '';  

  constructor(private spinner: NgxSpinnerService, 
    private router: Router,
    private cumService: CumsService, 
    private autentication: AutenticacionService,
    private permisosService: PermisosService
    ) { 
      this.validarPermisos();
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

  ngOnInit() {
    this.cargarCums();
    let url: string = this.router.routerState.root.children[0].firstChild.routeConfig.path;
    this.validarAcciones(url); 

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
  
  /**
   * Metodo que permite cargar los cums registrados en el sistema
   */
  cargarCums(){
    this.cumService.getCups()
    .subscribe(
      data => {
        this.cumsArray = Directivas.orderAsc(data, "nombre");
        this.resultados = this.cumsArray;
      }
    );    
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
    return swal({
      text: mensaje,
      type: tipo,
      showCancelButton: false,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Aceptar',
      allowOutsideClick: false
    });
  }

  /**
   * Operaciones con archivos
   */


  /**
   * Genera la descarga del formato csv
   */
  descargaCsv() {
    const contenido = 'codigo;nombre;nombreComercial;concentracion;presentacion;fechaInactivo\r\n'+
                      '4545-1;Aspirina;Aspirina Efervescente;100mg;tabletas;\r\n4545-2;Aspirina;Aspirinita;150mg;tabletas;2017-06-25';
    const blob = new Blob([contenido], { type: 'csv/plain' });
    Directivas.downloadBlobFile(blob, 'formato_carga_cum.csv');
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
    document.getElementById('file_input_cups')['value'] = '';
    this.fileTxt = '';    
  }


  importarCums(){
    const file: HTMLInputElement = this.fileInput.nativeElement;
    if (file.files && file.files[0]) {
      const fileToUpload: File = file.files[0];
      if (this.formatos.includes(fileToUpload.name.split('.').pop())) {
        this.msjSpinner = 'Cargando Archivo';
        this.spinner.show();
         this.cumService.uploadFile(fileToUpload).subscribe(
          data => {
            this.cargaCompletaEvent.emit(null);
            this.generarModalSencillo(data.mensaje, 'success').then(
              response => {
                if (data.status == '201') {
                  this.router.navigate(['/home', {outlets: {'content': [ 'historico-cums' ]}}]);
                }
              }
            );
            document.getElementById('close-btn-modal_carga').click();
            this.cargarCums();
            this.spinner.hide();
          }, error => {
            this.generarModalSencillo(error.message, 'warning');
            this.spinner.hide();
          }
        ); 
      } else {
        this.generarModalSencillo("Formatos permitidos: \r\r\n .CSV", 'warning');
      }
    } else {
      this.generarModalSencillo('Por favor seleccione un archivo', 'warning');
    }
  }

  /**
   * Filtrar los datos de la tabla
   * @param patron - texto ingresado a buscar
   */
  filterBy(patron: string) {
    const splitted: Array<string> = patron.replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/\s\s+/g, "  ")
    .split("  ");  
   
    this.resultados = this.cumsArray.filter((cums: Cum) => {
      const noCodigoWords: Array<string> = [];
      for (let i = 0; i < splitted.length; i++) {
        const word = splitted[i].trim();
        if (word && !cums.codigo.toLocaleLowerCase().includes(word)
        && !cums.nombre.toLocaleLowerCase().includes(word)
          && !cums.nombreComercial.toLocaleLowerCase().includes(word)
          && !cums.presentacion.toLocaleLowerCase().includes(word)
          && !cums.concentracion.toLocaleLowerCase().includes(word)
          && (Directivas.parseJsonDate(cums.fechaInactivo) == null || !Directivas.parseJsonDate(cums.fechaInactivo).includes(word))
         ) {
          noCodigoWords.push(word);
        }
      }
      return cums.nombre.replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase()
      .normalize('NFD')
      .match(`.*${noCodigoWords.join('\.\*')}.*`)  || 
      cums.nombreComercial.replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase()
      .normalize('NFD')
      .match(`.*${noCodigoWords.join('\.\*')}.*`)  ||
      cums.presentacion.replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase()
      .normalize('NFD')
      .match(`.*${noCodigoWords.join('\.\*')}.*`);
    });
  }
  
}
