import { Directive } from "@angular/core";
import { AbstractControl, FormGroup } from "@angular/forms";

/**
 * Modelos
 */
import { Estado } from "../../_models/administracion/menus/estado";
import { Menu } from "src/app/_models/administracion/menus/menu";
import { TipoPerfil } from "src/app/_models/administracion/perfil/tipoPerfil";
import { TipoDocumento } from "src/app/_models/administracion/shared/tipo-documento";
import { first } from "rxjs/operators";

import { TipoDocumentoService } from '../../_services/shared/tipo-documento.service';
import { Router } from "@angular/router";

@Directive({
  selector: "[appDirectiva]"
})
export class Directivas {  
  
  static TIPO_NORMA_CUPS: number= 1;
  static TIPO_NORMA_CIE: number= 2;
  static TIPO_ENTIDAD_ASD: number = 0;
  static TIPO_ENTIDAD_EPS: number = 1;
  static TIPO_ENTIDAD_IPS: number = 2;  
  static TIPO_ENTIDAD_PRESTADOR: number = 3;
  static TIPO_PERMISO_ADD: string = "ADD";
  static TIPO_PERMISO_UPD: string = "UPD";
  static TIPO_PERMISO_DEL: string = "DEL";
  static TIPO_PERMISO_UPL: string = "UPL";
  static TIPO_PERMISO_DWL: string = "DWL";
  static TIPO_PERMISO_LECT: string = "M"; 
  

  constructor() {}

  /**
   * Metodo que permite limpiar un formulario y borrando los ng-validators
   */
  static resetFormValidator(formGroup: FormGroup) {   
    let control: AbstractControl = null; 
    formGroup.markAsUntouched();
    formGroup.markAsPristine();
    formGroup.markAsTouched();
    
    formGroup.reset();   
    Object.keys(formGroup.controls).forEach(name => {
      control = formGroup.controls[name];
      control.markAsUntouched();
      control.markAsPristine();
      control.reset();
    }); 
  }

  /**
   * Genera dado un contenido el archivo a descargar
   * @param blob - objeto con la información del archivo
   * @param filename - nombre del archivo
   * @param scFix - en caso de necesitar arreglo por poseer carácteres especiales
   */
  static downloadBlobFile(blob: Blob, filename: string) {
    if (navigator.msSaveBlob) {
      // IE 10+
      navigator.msSaveBlob(blob, filename);
    } else {
      const link = document.createElement('a');
      // Browsers that support HTML5 download attribute
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }

  /**
   * Metodo que permite cargar los estados de un menú
   */
  static cargarEdosMenu(): Estado[] {
    let edos: Estado[] = [];
    let edo = new Estado();
    edo.id = 0;
    edo.valor = "Inactivo";
    edos.push(edo);

    edo = new Estado();
    edo.id = 1;
    edo.valor = "Activo";
    edos.push(edo);

    edos = Directivas.orderAsc(edos, 'valor');

    return edos;
  }

  /**
   * Metodo que permite cargar los estados de un menú
   */
  static cargarEdos(): Estado[] {
    let edos: Estado[] = [];
    let edo = new Estado();
    edo.id = 0;
    edo.valor = "Inactivo";
    edos.push(edo);

    edo = new Estado();
    edo.id = 1;
    edo.valor = "Activo";
    edos.push(edo);

    edos = Directivas.orderAsc(edos, 'valor');

    return edos;
  }

  static validaCodigoMenu(nombreMenu: string, arrayMenu: Menu[]) {
    if (arrayMenu.length == 0) {
      return false;
    }
    for (let i = 0; i < arrayMenu.length; i++) {
      if (arrayMenu[i].codigo == nombreMenu) {
        return true;
      }
    }

    return false;
  }
  
  /**
   *  Convierte una fecha con formato yyyy-mm-dd a dd/MM/yyyy
   *  @param original
   */
  static parseJsonDate(original: string): string {
    if(original != null) {
      const datos = original.split('-');
      return `${datos[2]}/${datos[1]}/${datos[0]}`; 
    } else {
      return original;
    }
  }


  /**
   * 
   */
  static obtenerTiposIdentificacion(): TipoDocumento[] {
    let tipoDocumentoService: TipoDocumentoService;
    let tiposDocumentos: TipoDocumento[] = [];
    tipoDocumentoService.getTiposDocumentos()
    .pipe(first())
    .subscribe(
      data => {
       tiposDocumentos = data;
       return tiposDocumentos;       
      },
      error => {
        console.log(error);
      }
    );

    return [];
  }
  
  /**
   * Metodo que obtiene el tipo de perfil de un usuario. 
   * 1. Base ERPS
   * 2. Base IPS
   */
  static getTipoPerfil(){
    let tipoPerfil: TipoPerfil;
    let tiposPerfiles: TipoPerfil[] = [];
    tipoPerfil = new TipoPerfil();
    tipoPerfil.id = 1;
    tipoPerfil.descripcion = "Base ERPS"; 
    tiposPerfiles.push(tipoPerfil);

    tipoPerfil = new TipoPerfil();
    tipoPerfil.id = 2;
    tipoPerfil.descripcion = "Base IPS";
    tiposPerfiles.push(tipoPerfil);

    return tiposPerfiles;
  }


  /**
   * Metodo que permite cargar los estados de un perfil
   */
  static cargarEdosPerfil(): Estado[] {
    let edos: Estado[] = [];
    let edo = new Estado();
    edo.id = 0;
    edo.valor = "Inactivo";
    edos.push(edo);

    edo = new Estado();
    edo.id = 1;
    edo.valor = "Activo";
    edos.push(edo);

    return edos;
  }
  

  /**
   * Metodo que obtiene el objeto json de iconos de menú
   */
  static getIconosMenu(): any[] {
    let obj = JSON.stringify([
        {      
          "id": 1,      
          "nombre": "Usuario",      
          "value": "fa fa-user",
          "code": "&#xf007;"  
        },      
        {      
          "id": 2,      
          "nombre": "Estrella",      
          "value": "fa fa-star",
          "code": "&#xf005;"            
        },      
        {      
          "id": 3,      
          "nombre": "Favorito",      
          "value": "fa fa-heart",
          "code": "&#xf004;"      
        },      
        {      
          "id": 4,      
          "nombre": "Eliminar",      
          "value": "ti-trash",
          "code": "&#xf014;"      
        },       
        {      
          "id": 5,      
          "nombre": "Tabla",      
          "value": "fa fa-th-large",
          "code": "&#xf009;"      
        },
        {      
          "id": 6,      
          "nombre": "Lista",      
          "value": "fa fa-th-list",
          "code": "&#xf00b;"      
        },
        {      
          "id": 7,      
          "nombre": "Ok",      
          "value": "fa fa-check",
          "code": "&#xf00c;"      
        },      
        {      
          "id": 8,      
          "nombre": "Zoom In",      
          "value": "fa fa-search-plus",
          "code": "&#xf00e;"      
        },      
        {      
          "id": 9,      
          "nombre": "Zoom out",      
          "value": "fa fa-search-minus",
          "code": "&#xf010;"      
        },      
        {      
          "id": 10,      
          "nombre": "Remover",      
          "value": "fa fa-close",
          "code": "&#xf00d;"      
        },      
        {      
          "id": 11,      
          "nombre": "Apagar",      
          "value": "fa-power-off ",
          "code": "&#xf011;"      
        },      
        {      
          "id": 12,      
          "nombre": "Señal",      
          "value": "fa fa-signal",
          "code": "&#xf012;"      
        },       
        {      
          "id": 13,      
          "nombre": "Ajustar",      
          "value": "fa fa-cog",
          "code": "&#xf013;"      
        },        
        {      
          "id": 14,      
          "nombre": "Inicio",      
          "value": "fa fa-home",
          "code": "&#xf015;"      
        },      
        {      
          "id": 15,      
          "nombre": "Archivo",      
          "value": "fa fa-file-o",
          "code": "&#xf016;"      
        },
      
        {      
          "id": 16,      
          "nombre": "Lápiz",      
          "value": "fa fa-pencil",
          "code": "&#xf040;"      
        },      
        {      
          "id": 17,      
          "nombre": "Servidor",      
          "value": "fa fa-server",
          "code": "&#xf233;"      
        },      
        {      
          "id": 18,      
          "nombre": "Reloj",      
          "value": "fa fa-clock-o",
          "code": "&#xf017;"      
        },      
        {      
          "id": 19,      
          "nombre": "Descargar",      
          "value": "fa fa-download",
          "code": "&#xf019;"      
        },      
        {      
          "id": 20,      
          "nombre": "Cargar",      
          "value": "fa fa-arrow-circle-o-up",
          "code": "&#xf01b;"      
        },       
        {      
          "id": 21,      
          "nombre": "Inbox",      
          "value": "fa fa-inbox",
          "code": "&#xf01c;"      
        },        
        {      
          "id": 22,      
          "nombre": "Play",      
          "value": "fa fa-play-circle-o",
          "code": "&#xf01d;"      
        },        
        {      
          "id": 23,      
          "nombre": "Repetir",      
          "value": "fa fa-repeat",
          "code": "&#xf01e;"      
        },      
        {      
          "id": 24,      
          "nombre": "Refrescar",      
          "value": "fa fa-refresh",
          "code": "&#xf021;"      
        },      
        {      
          "id": 25,      
          "nombre": "Bloquear",      
          "value": "fa fa-lock",
          "code": "&#xf023;"      
        },
        {      
          "id": 26,      
          "nombre": "Bandera",      
          "value": "fa fa-flag",
          "code": "&#xf024;"      
        },      
        {      
          "id": 27,      
          "nombre": "Codigo QR",      
          "value": "fa-qrcode",
          "code": "&#xf029;"      
        },      
        {      
          "id": 28,      
          "nombre": "Codigo de Barras",      
          "value": "fa fa-barcode",
          "code": "&#xf02a;"      
        },       
        {      
          "id": 29,      
          "nombre": "Tag",      
          "value": "fa fa-tag",
          "code": "&#xf02b;"      
        },      
        {
          "id": 30,      
          "nombre": "Libro",      
          "value": "fa fa-book",
          "code": "&#xf02d;"      
        },        
        {      
          "id": 31,      
          "nombre": "Impresora",      
          "value": "fa fa-print",
          "code": "&#xf02f;"      
        },      
        {      
          "id": 32,      
          "nombre": "Cámara",      
          "value": "fa fa-camera",
          "code": "&#xf030;"      
        },      
        {      
          "id": 33,      
          "nombre": "Marcador",      
          "value": "fa fa-bookmark",
          "code": "&#xf02e;"      
        },      
        {      
          "id": 34,      
          "nombre": "Video",      
          "value": "fa fa-video-camera",
          "code": "&#xf03d;"      
        },      
        {      
          "id": 35,      
          "nombre": "Imagen",      
          "value": "fa  fa-photo",
          "code": "&#xf03e;"      
        },      
        {      
          "id": 36,      
          "nombre": "Copiar",      
          "value": "fa icon-copy",
          "code": "&#xf0c5;"      
        },       
        {      
          "id": 37,      
          "nombre": "Editar",      
          "value": "fa fa-edit",
          "code": "&#xf044;"      
        },       
        {      
          "id": 38,      
          "nombre": "Compartir",      
          "value": "fa-share-square-o",
          "code": "&#xf045;"      
        },        
        {      
          "id": 39,      
          "nombre": "Check",      
          "value": "fa fa-check-square-o",
          "code": "&#xf046;"      
        },      
        {      
          "id": 40,      
          "nombre": "Izquierda",      
          "value": "fa fa-chevron-left",
          "code": "&#xf053;"      
        },      
        {      
          "id": 41,      
          "nombre": "Derecha",      
          "value": "fa-chevron-right",
          "code": "&#xf054;"      
        },      
        {      
          "id": 42,      
          "nombre": "Ubicación",      
          "value": "fa fa-map-marker",
          "code": "&#xf041;"      
        },      
        {      
          "id": 43,      
          "nombre": "Más",      
          "value": "fa fa-plus-circle",
          "code": "&#xf055;"      
        },      
        {      
          "id": 44,      
          "nombre": "Menos",      
          "value": "fa fa-minus-circle",
          "code": "&#xf056;"      
        },       
        {      
          "id": 45,      
          "nombre": "Interrogación",      
          "value": "fa fa-question-circle",
          "code": "&#xf059;"      
        },       
        {      
          "id": 46,      
          "nombre": "Información",      
          "value": "fa fa-info-circle",
          "code": "&#xf05a;"      
        },        
        {      
          "id": 47,      
          "nombre": "Asterisco",      
          "value": "fa fa-asterisk",
          "code": "&#xf069;"      
        },      
        {      
          "id": 48,      
          "nombre": "Exclamación",      
          "value": "fa fa-exclamation-circle",
          "code": "&#xf06a;"      
        },      
        {      
          "id": 49,
          "nombre": "Regalo",      
          "value": "fa fa-gift",
          "code": "&#xf06b;"      
        },      
        {      
          "id": 50,      
          "nombre": "Hoja",      
          "value": "fa fa-language",
          "code": "&#xf06c;"      
        },      
        {      
          "id": 51,      
          "nombre": "Fuego",      
          "value": "fa fa-fire",
          "code": "&#xf06d;"      
        },      
        {      
          "id": 52,      
          "nombre": "Ojo",      
          "value": "fa fa-eye",
          "code": "&#xf06e;"      
        },       
        {      
          "id": 53,      
          "nombre": "Precaución",      
          "value": "fa fa-exclamation-triangle",
          "code": "&#xf071;"      
        },        
        {      
          "id": 54,      
          "nombre": "Avión",      
          "value": "fa fa-plane",
          "code": "&#xf072;"      
        },        
        {      
          "id": 55,      
          "nombre": "Calendario",      
          "value": "fa fa-calendar",
          "code": "&#xf073;"      
        },      
        {      
          "id": 56,      
          "nombre": "Aleatorio",      
          "value": "fa fa-random",
          "code": "&#xf074;"      
        },      
        {      
          "id": 57,      
          "nombre": "Comentario",      
          "value": "fa fa-comment",
          "code": "&#xf075;"      
        },
        {      
          "id": 58,      
          "nombre": "Imán",
          "value": "fa fa-magnet",
          "code": "&#xf076;"     
        },      
        {      
          "id": 59,      
          "nombre": "Arriba",      
          "value": "fa fa-chevron-up",
          "code": "&#xf077;"      
        },      
        {      
          "id": 60,      
          "nombre": "Abajo",      
          "value": "fa fa-chevron-down",
          "code": "&#xf078;"      
        },       
        {      
          "id": 61,      
          "nombre": "Carrito",      
          "value": "fa fa-shopping-cart",
          "code": "&#xf07a;"      
        },      
        {      
          "id": 62,      
          "nombre": "Folder",      
          "value": "fa fa-folder",
          "code": "&#xf07b;"      
        },     
        {      
          "id": 63,      
          "nombre": "Carpeta",      
          "value": "fa fa-folder-open",
          "code": "&#xf07c;"      
        },      
        {      
          "id": 64,      
          "nombre": "Gráfica Barras",      
          "value": "fa fa-bar-chart",
          "code": "&#xf080;"      
        },      
        {      
          "id": 65,      
          "nombre": "Llave",      
          "value": "fa fa-key",
          "code": "&#xf084;"      
        },      
        {      
          "id": 66,
          "nombre": "Engranes",      
          "value": "fa fa-cogs",
          "code": "&#xf085;"      
        },      
        {      
          "id": 67,      
          "nombre": "Aprobado",      
          "value": "fa fa-thumbs-o-up",
          "code": "&#xf087;"      
        },      
        {      
          "id": 68,      
          "nombre": "No aprobado",      
          "value": "fa fa-thumbs-o-down",
          "code": "&#xf088;"      
        },       
        {      
          "id": 69,      
          "nombre": "Link",      
          "value": "fa fa-external-link",
          "code": "&#xf08e;"      
        },        
        {      
          "id": 70,      
          "nombre": "Ingreso",      
          "value": "fa fa-sign-in",
          "code": "&#xf090;"      
        },
        {      
          "id": 71,      
          "nombre": "Teléfono",      
          "value": "fa fa-phone",
          "code": "&#xf095;"      
        },      
        {      
          "id": 72,      
          "nombre": "Tarjeta Crédito",      
          "value": "fa fa-credit-card",
          "code": "&#xf09d;"      
        },      
        {      
          "id": 73,      
          "nombre": "Campana",      
          "value": "fa fa-bell-o",
          "code": "&#xf0a2;"      
        },      
        {      
          "id": 74,      
          "nombre": "Desbloqueado",      
          "value": "fa fa-unlock",
          "code": "&#xf09c;"      
        },      
        {      
          "id": 75,      
          "nombre": "Certificado",      
          "value": "fa fa-certificate",
          "code": "&#xf0a3;"      
        },      
        {      
          "id": 76,      
          "nombre": "Llave Inglesa",      
          "value": "fa fa-wrench",
          "code": "&#xf0ad;"      
        },       
        {      
          "id": 77,      
          "nombre": "Tareas",      
          "value": "fa fa-tasks",
          "code": "&#xf0ae;"     
        },       
        {      
          "id": 78,      
          "nombre": "Filtro",      
          "value": "fa fa-filter",
          "code": "&#xf0b0;"      
        },        
        {      
          "id": 79,      
          "nombre": "Trofeo",      
          "value": "fa fa-trophy",
          "code": "&#xf091;"      
        },      
        {      
          "id": 80,      
          "nombre": "Grupo",      
          "value": "fa fa-users",
          "code": "&#xf0c0;"      
        },      
        {      
          "id": 81,      
          "nombre": "Nube",      
          "value": "fa fa-cloud",
          "code": "&#xf0c2;"      
        },      
        {      
          "id": 82,      
          "nombre": "Tijera",      
          "value": "fa fa-scissors",
          "code": "&#xf0c4;"      
        },      
        {      
          "id": 83,      
          "nombre": "Clip",      
          "value": "fa fa-paperclip",
          "code": "&#xf0c6;"      
        },      
        {      
          "id": 84,      
          "nombre": "Pantalla Completa",      
          "value": "fa fa-arrows-alt",
          "code": "&#xf0b2;"      
        },       
        {      
          "id": 85,      
          "nombre": "Guardar",      
          "value": "fa-floppy-o",
          "code": "&#xf0c7;"      
        },      
        {      
          "id": 86,      
          "nombre": "Camión",      
          "value": "fa fa-truck",
          "code": "&#xf0d1;"      
        },        
        {      
          "id": 87,      
          "nombre": "Dinero",      
          "value": "fa fa-money",
          "code": "&#xf0d6;"      
        },      
        {      
          "id": 88,      
          "nombre": "Mail",      
          "value": "fa fa-envelope",
          "code": "&#xf0e0;"      
        },      
        {      
          "id": 89,      
          "nombre": "Legal",      
          "value": "fa fa-gavel",
          "code": "&#xf0e3;"      
        },      
        {      
          "id": 90,      
          "nombre": "Rehacer",      
          "value": "fa fa-rotate-left",
          "code": "&#xf0e2;"      
        },      
        {      
          "id": 91,      
          "nombre": "Rayo",      
          "value": "fa fa-bolt",
          "code": "&#xf0e7;"      
        },      
        {      
          "id": 92,      
          "nombre": "Mapa del sitio",      
          "value": "fa fa-sitemap",
          "code": "&#xf0e8;"      
        },      
        {      
          "id": 93,      
          "nombre": "Mira",      
          "value": "fa fa-crosshairs",
          "code": "&#xf05b;"      
        },
        {      
          "id": 94,      
          "nombre": "Bombilla",      
          "value": "fa fa-lightbulb-o",
          "code": "&#xf0eb;"      
        },
        {      
          "id": 95,      
          "nombre": "Médico",      
          "value": "fa fa-user-md",
          "code": "&#xf0f0;"      
        },
        {      
          "id": 96,      
          "nombre": "Comida",      
          "value": "fa fa-cutlery",
          "code": "&#xf0f5;"      
        },
        {      
          "id": 97,      
          "nombre": "Ambulancia",      
          "value": "fa fa-ambulance",
          "code": "&#xf0f9;"      
        },
        {      
          "id": 98,      
          "nombre": "Hospital",      
          "value": "fa fa-hospital-o",
          "code": "&#xf0f8;"      
        },
        {      
          "id": 99,      
          "nombre": "Estetoscopio",      
          "value": "fa fa-stethoscope",
          "code": "&#xf0f1;"      
        },
        {      
          "id": 100,      
          "nombre": "Equipo Médico",      
          "value": "fa fa-medkit",
          "code": "&#xf0fa;"      
        },
        {      
          "id": 101,      
          "nombre": "Computador",      
          "value": "fa fa-desktop",
          "code": "&#xf108;"      
        },
        {      
          "id": 102,      
          "nombre": "Sombrilla",      
          "value": "fa fa-umbrella",
          "code": "&#xf0e9;"      
        },
        {      
          "id": 103,      
          "nombre": "Laptop",      
          "value": "fa fa-laptop",
          "code": "&#xf109;"      
        },
        {      
          "id": 104,      
          "nombre": "Tablet",      
          "value": "fa fa-tablet",
          "code": "&#xf10a;"      
        },
        {      
          "id": 105,      
          "nombre": "Mobile",      
          "value": "fa fa-mobile",
          "code": "&#xf10b;"      
        },
        {      
          "id": 106,      
          "nombre": "Círculo",      
          "value": "fa fa-circle-o",
          "code": "&#xf10c;"      
        },
        {      
          "id": 107,      
          "nombre": "Spinner",      
          "value": "fa fa-spinner",
          "code": "&#xf110;"      
        },
        {      
          "id": 108,      
          "nombre": "Responder",      
          "value": "fa fa-mail-reply",
          "code": "&#xf112;"      
        },
        {      
          "id": 109,      
          "nombre": "Bases de Datos",      
          "value": "fa fa-database",
          "code": "&#xf1c0;"      
        },
        {      
          "id": 110,      
          "nombre": "Archivos",      
          "value": "fa fa-clipboard",
          "code": "&#xf0ea;"      
        },        
        {      
          "id": 111,      
          "nombre": "Libreta Direcciones",      
          "value": "fa fa-address-book-o",
          "code": "&#xf0ea;"      
        },
        {      
          "id": 112,      
          "nombre": "Gráficas",      
          "value": "fa fa-area-chart",
          "code": "&#xf1fe;"      
        },
        {      
          "id": 113,      
          "nombre": "Acuerdos",      
          "value": "fa fa-handshake-o",
          "code": "&#xf2b5;"      
        }, 
        {      
          "id": 114,      
          "nombre": "Tipo Documentos",      
          "value": "fa fa-address-card",
          "code": "&#xf2bb;"      
        } ,
        {      
          "id": 115,      
          "nombre": "Perfiles",      
          "value": "fa fa-users",
          "code": "&#xf0c0;"  
        }, 
        {      
          "id": 116,      
          "nombre": "Termómetro",      
          "value": "fa fa-thermometer",
          "code": "&#xf2ca;"  
        },
        {      
          "id": 117,      
          "nombre": "Técnico",      
          "value": "fa fa-coaches",
          "code": "&#xf183;"  
        },
        {      
          "id": 118,      
          "nombre": "Panel",      
          "value": "fa fa-columns",
          "code": "&#xf0db;"  
        },  
        {      
          "id": 119,      
          "nombre": "Agenda",      
          "value": "fa fa-calendar",
          "code": "&#xf073;"  
        },  
        {      
          "id": 120,      
          "nombre": "Metas",      
          "value": "fa fa-trophy",
          "code": "&#xf091;"  
        },  
        {      
            "id": 121,      
            "nombre": "Mano Derecha",      
            "value": "fa fa-hand-right",
            "code": "&#xf0a4;"  
        },          
        {      
            "id": 122,      
            "nombre": "Edificio",      
            "value": "fa fa-building",
            "code": "&#xf0f7;"  
        },
        {      
          "id": 123,      
          "nombre": "Señal",      
          "value": "fa fa-h-square",
          "code": "&#xf0fd;"  
        }
       ]);

       /**
        * Ordenando los resultados de manera ascendente alfabeticamente
        */
       var json = [];       
       json = JSON.parse(obj); 
       json = json.sort(function(a, b){
        var x = a.nombre.toLowerCase();
        var y = b.nombre.toLowerCase();
        if (x < y) {return -1;}
        if (x > y) {return 1;}
        return 0;
        })   ;
    return json;
  }

  static getTipoPerfilSuper(){
    return "S";
  }

  static getTipoPerfilAdmin(){
    return "A";
  }
  
  
  static orderAsc(array: any[], field: string): any[] {
    if(array == null) {
      return array;
    }
    array.sort((a: any, b: any) => {
      if (a[field] < b[field]) {
        return -1;
      } else if (a[field] > b[field]) {
        return 1;
      } else {
        return 0;
      }
    });
    return array;
  }

   /**
    * Metodo que obtiene el listado del combobox para los
    * tiempos de inactividad
    */
  static obtenerTiposInactividad() {
    let obj = JSON.stringify([
      {      
        "id": 1,      
        "nombre": "5 minutos",      
        "value": 5
      },   
      {      
        "id": 2,      
        "nombre": "10 minutos",      
        "value": 10
      }, 
      {      
        "id": 3,      
        "nombre": "15 minutos",      
        "value":15
      },    
      {      
        "id": 4,      
        "nombre": "20 minutos",      
        "value": 20
      }, 
      {      
        "id": 5,      
        "nombre": "25 minutos",      
        "value": 25
      }, 
      {      
        "id": 6,      
        "nombre": "30 minutos",      
        "value": 30
      }, 
    ])

     /**
      * Ordenando los resultados de manera ascendente alfabeticamente
      */
    var json = [];       
    json = JSON.parse(obj); 
    json = json.sort(function(a, b){
    var x = a.value;
    var y = b.value;
    if (x < y) {return -1;}
    if (x > y) {return 1;}
    return 0;
    })   ;
    return json;
  }
  
  /**
   * Metodo que obtiene el listado del combobox para la
   * vigencia de la contraseña
   */
  static obtenerVigenciaContrasena() {
    let obj = JSON.stringify([
      {      
        "id": 1,      
        "nombre": "1 mes",      
        "value": 1
      },   
      {      
        "id": 2,      
        "nombre": "2 meses",      
        "value": 2
      }, 
      {      
        "id": 3,      
        "nombre": "3 meses",      
        "value": 3
      } 
    ])

     /**
      * Ordenando los resultados de manera ascendente alfabeticamente
      */
    var json = [];       
    json = JSON.parse(obj); 
    json = json.sort(function(a, b){
    var x = a.value;
    var y = b.value;
    if (x < y) {return -1;}
    if (x > y) {return 1;}
    return 0;
    })   ;
    return json;
  }

  /**
   * Metodo que obtiene el listado del combobox para los parametros
   * de los intentos fallidos
   */
  static obtenerIntentosFallidosList(){
    let obj = JSON.stringify([
      {      
        "id": 1,      
        "nombre": "2 intentos",      
        "value": 2
      },   
      {      
        "id": 2,      
        "nombre": "3 intentos",      
        "value": 3
      }, 
      {      
        "id": 3,      
        "nombre": "4 intentos",      
        "value": 4
      },
      {      
        "id": 3,      
        "nombre": "5 intentos",      
        "value": 5
      } 
    ])

     /**
      * Ordenando los resultados de manera ascendente alfabeticamente
      */
    var json = [];       
    json = JSON.parse(obj); 
    json = json.sort(function(a, b){
    var x = a.value;
    var y = b.value;
    if (x < y) {return -1;}
    if (x > y) {return 1;}
    return 0;
    })   ;
    return json;
  }
   
  /**
   * Metodo que permite llenar los combos de los tipo de entidad
   */
  static obtenerTiposEntidades() {
    let obj = JSON.stringify([
      {      
        "id": 1,      
        "nombre": "ERPS",      
        "value": 1
      },   
      {      
        "id": 2,      
        "nombre": "IPS",      
        "value": 2
      },
      {      
        "id": 3,      
        "nombre": "PRESTADOR",      
        "value": 3
      }
    ])

     /**
      * Ordenando los resultados de manera ascendente alfabeticamente
      */
    var json = [];       
    json = JSON.parse(obj); 
    json = json.sort(function(a, b){
    var x = a.value;
    var y = b.value;
    if (x < y) {return -1;}
    if (x > y) {return 1;}
    return 0;
    })   ;
    return json;
  }


  static obtenerUnidadesAlmacenamiento() {
    let obj = JSON.stringify([
      {      
        "id": 1,      
        "nombre": "Gigabyte",      
        "value": "Gb"
      },   
      {      
        "id": 2,      
        "nombre": "Terabyte",      
        "value": "Tb"
      }
    ])

     /**
      * Ordenando los resultados de manera ascendente alfabeticamente
      */
    var json = [];       
    json = JSON.parse(obj); 
    json = json.sort(function(a, b){
    var x = a.value;
    var y = b.value;
    if (x < y) {return -1;}
    if (x > y) {return 1;}
    return 0;
    })   ;
    return json;
  }

  
  validarCampoEmail(email: string) {
    let emailRegex = /^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i;
    if (emailRegex.test(email)) {
      return true;
    } else {
      return false;
    }
  }
  
  /**
   * Utilidad que convierte un tiempo dado en minutos a milisegundos
   * @param tiempo 
   */
  static convertirMinutosAMilisegundos(tiempo: number) {
    return tiempo * 60000;
  }
  
  /**
   * Directiva para validar que los numeros digitados sean positivos
   * @param numero 
   */
  static validarNumerosPositivos(numero: string) {
    return parseInt(numero) >= 0 ? true : false;
  }


  static validateAccessByURL(arrayPermisos: any[], perfilId: number, url: string) {   
     let respuesta: boolean = true;
     let router: Router;    
      if(arrayPermisos != null && arrayPermisos.length > 0) {
       let menu: string = "";
       arrayPermisos.forEach(function(element) { 
        menu = element["menuCodigo"]["rutaMenu"];
        if(menu == url && perfilId == element["perfilId"]["id"] &&
          element["menuFuncion"] == "M" && element["estado"] == 0) {            
            router.navigateByUrl('/', {skipLocationChange: true});      
           /*  router.navigate(['home'], {
              skipLocationChange: true
            }); */
            return false;
        } 
      });
     } 
     return respuesta;
  }

  static parseDateToLocaleDate(dia: string, mes: string, anio: string) {
    return new Date(anio + "-" + mes + "-" + dia).toISOString();
  }

  /**
   *  Convierte una fecha con formato yyyy-mm-dd a dd/MM/yyyy HH:mm:ss
   *  @param original
   */
  static parseDateFormat(original: string): string {
    if(original != null) {
      const datos = original.split('-');
      return `${datos[2]}/${datos[1]}/${datos[0]}`; 
    } else {
      return original;
    }
  }
 
  /**
   * Metodo que permite validar si un menú en edición no se encuentra en la lista de menus registrados
   * @param menuAvalidar 
   * @param menus 
   * @param nombreMenu 
   */
  static validarIsMenuEquals(menuAvalidar: Menu, menus: Menu[]): number {
     let menusRaiz: Menu[] = menus[0].menusHijos;
     let bandera: number = -1;

    let submenus: Menu[] = menus;
    for(var i=0; i<submenus.length; i++) {
      if(submenus[i].nombreMenu == menuAvalidar.nombreMenu && submenus[i].codigo != menuAvalidar.codigo) {
        bandera = 2;
      } 
    }
    if(menusRaiz != null) {
      for(var i=0; i<menusRaiz.length; i++) {
        if(menusRaiz[i].nombreMenu == menuAvalidar.nombreMenu && menusRaiz[i].codigo != menuAvalidar.codigo) {
         bandera = 1;
        } 
     }
    }
    
    return bandera;
  }


  static validarEstadoVigenciaFechas(fecha1: string): boolean{
    var fechaHoy = Date();
    var fechaVigencia = new Date(fecha1);
    return (new Date(fechaHoy).getTime() >= fechaVigencia.getTime());
  }
  

  /**
   * Método que permite quitar caracters como /, [, ], (, )
   * @param parametro 
   */
  static normalizarParamsURL(parametro: string): string {
    const splitted: Array<string> = parametro
    .replace(/[\u0020,\u002F,\u0028,\u0029, \u005B, \u005D]/g, "%")
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/\s\s+/g, " ")
    .split(" ");   
    return (splitted.toString().trim());
  }
  
  /**
   * Metodo que devuelve la url del componente permisos
   */
  static returnUrlParametrizadas(){
     let arrayUrl: string[] = [];
     arrayUrl.push("permisos");
     arrayUrl.push("historico-cups");
     arrayUrl.push("historico-cie");
     arrayUrl.push("historico-cums");

    return arrayUrl;
  }


  /**
   * Metodo que permite limpiar un formulario y borrando los ng-validators
   */
  static disabledFormValidator(formGroup: FormGroup) { 
    let control: AbstractControl = null;
    Object.keys(formGroup.controls).forEach(name => {
      control = formGroup.controls[name];
      control.disable();
    });
  }



  
}
