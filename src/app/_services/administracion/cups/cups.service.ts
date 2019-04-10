/*
* Archivo: cups.service.ts
* Fecha: 01/01/2019
* Todos los derechos de propiedad intelectual e industrial sobre esta
* aplicacion son de propiedad exclusiva del GRUPO ASESORIA EN
* SISTEMATIZACION DE DATOS SOCIEDAD POR ACCIONES SIMPLIFICADA GRUPO ASD
  S.A.S.
* Su uso, alteracion, reproduccion o modificacion sin la debida
* consentimiento por escrito de GRUPO ASD S.A.S.
* autorizacion por parte de su autor quedan totalmente prohibidos.
*
* Este programa se encuentra protegido por las disposiciones de la
* Ley 23 de 1982 y demas normas concordantes sobre derechos de autor y
* propiedad intelectual. Su uso no autorizado dara lugar a las sanciones
* previstas en la Ley.
*/

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';

import { QueryService } from '../../query/query.service';
import { AutenticacionService } from '../../autenticacion/autenticacion.service';
import { Cups } from '../../../_models/administracion/cups/cups';

export enum Ruta {
  Cups = "/cups/",
  Archivo = "/cups/archivos/",
  Descargar = "/cups/descargar/",
  Cargar = "/cups/upload-file/",
  Listar = "/cups/listar",
  Homologar = "/cups/homologar/",
  ListarXNorma = "/cups/norma/",
  CupsInternoByHomolog = "/cups/buscar",
  ListarCupsCoincidencias = "/cups/listar-coincidencias/"
}

/**
 * @author Giovanni Mora Jaimes 
 * @summary versión realizada para el proyecto de facturación electrónica
 * Servicio REST para la gestión de CUPS del sistema
 */
@Injectable({
  providedIn: 'root'
})
export class CupsService {
  private readonly endpoint: string = 'fae/v1';  
  header: HttpHeaders;

  constructor(private queryService: QueryService,
    private http: HttpClient,
    private autenticacionService: AutenticacionService) {
    this.header = this.autenticacionService.initHeaders();
  }

  /**
   * Genera la url del endpoint y la url base del servicio rest
   */
  private getUrlService(ruta: Ruta) {    
    return this.queryService.getBaseUrl(this.endpoint) + ruta;
  }

  /**
   * Servicio que permite obtener la lista de cups
   */
  getCups() {
    return this.http.get<Array<Cups>>(this.getUrlService(Ruta.Cups));
  }

  /**
  * Servicio que guarda un cups en creación
  * @param cups
  */
  createCups(cups: Cups) {
    return this.http.post(this.getUrlService(Ruta.Cups), cups, { headers: this.header, observe: 'response' });
  }

  /**
  * Servicio que guarda un cups en edición
  * @param cups
  */
  editCups(cups: Cups) {
    return this.http.put(this.getUrlService(Ruta.Cups), cups, { headers: this.header, observe: 'response' });
  }

  /**
  * Servicio que renueva un cups
  * @param cups
  */
  refreshCups(cups: Cups) {
    return this.http.put(this.getUrlService(Ruta.Cups), cups, { headers: this.header });
  }

  /**
   * Servicio para obtener los archivos disponibles a descargar
   */
  getFiles() {
    return this.http.get<Array<string>>(this.getUrlService(Ruta.Archivo), { headers: this.header });
  }

  /**
   * Servicio para descargar el archivo
   * @param filename - nombre completo del archivo a descargar
   */
  downloadFile(filename: string) {
    return this.http.get(this.getUrlService(Ruta.Descargar) + filename, { responseType: 'blob' });
  }

  /**
   * Servicio que carga un archivo de cups
   * @param file - archivo a cargar
   */
  uploadFile(file: File, normaId: string) {
    const formData: FormData = new FormData();
    const fileHeader = this.header;
    formData.append('file', file);
    formData.append('norma', normaId); 
    fileHeader.append('reportProgress', 'true');
    return this.http.post<any>(this.getUrlService(Ruta.Cargar), formData, { headers: fileHeader });
  }

  /**
   * @deprecated funciona, pero no se va a usar porque es lo mismo que trae el csv de downloadFile
   *    así que no aporta valor
   * Servicio para obtener el estado de los registros de una carga
   * @param filename - nombre completo del archivo consultar
   */
  getRegistros(filename: string) {
    return this.http.get<Array<any>>(this.getUrlService(Ruta.Listar) + filename);
  }

  /**
   * Servicio que permite obtener la lista de cie dada la norma
   */
  getCUPSByNorma(normaId: string) {
    return this.http.get<Array<Cups>>(this.getUrlService(Ruta.ListarXNorma) + normaId);
  }
  
  /**
   * Metodo que permite homologar un cup
   * @param cup 
   */
  homologarCups(cup: Cups) {
    return this.http.post(this.getUrlService(Ruta.Cups) + "/homologar/", cup, { headers: this.header });
  }
  
  /**
   * Metodo que permite crear un cups sin homologar
   * @param cup 
   */
  createCupsSinHomologar(cup: Cups) {
    return this.http.post(this.getUrlService(Ruta.Cups), cup, { headers: this.header });
  }
    
  /**
   * Metodo que permite cargar dada una descripcion de cups
   * sus posibles referencias para homologar
   * @param descripcion 
   */
  getCupsByNormaAHomologar(codigo: string, descripcion: string){    
    var descEncode: string = encodeURIComponent(descripcion);
    const params = new HttpParams().append("codigo", codigo)
    .append("detalle", descEncode)
    .append("normaInterna", this.autenticacionService.getEntidadId());    
    
    return this.http.get<Array<Cups>>(this.getUrlService(Ruta.CupsInternoByHomolog), { params });
  }

  /**
   * Servicio que permite obtener la lista de cups con coincidencias para homologar
   * Se guia en la lista de cups internos que son candidatos para homologar
   */
  getCupsForHomologar(entidadId: string) { 
    return this.http.get<Array<Cups>>(this.getUrlService(Ruta.ListarCupsCoincidencias) + entidadId);
  }

   /**
   * Servicio que permite obtener la lista de CUPS dada la norma
   */
  getCUPSByNormaHomologar(normaId: string) {    
    return this.http.get<Array<Cups>>(this.getUrlService(Ruta.ListarXNorma) + normaId);
   
  }

}
