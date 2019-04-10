/*
* Archivo: cie.service.ts
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
import { QueryService } from '../../query/query.service';
import { AutenticacionService } from '../../autenticacion/autenticacion.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Cie } from 'src/app/_models/administracion/cie/cie';


export enum RUTA {
  Cie = "/cie/",
  Archivo = "/cie/archivos/",
  Descargar = "/cie/descargar/",
  Cargar = "/cie/upload-file/",
  Listar = "/cie/listar",
  ListarXNorma = "/cie/norma/"
}

/**
 * @author Giovanni Mora Jaimes 
 * @summary versión realizada para el proyecto de facturación electrónica
 * Servicio REST para la gestión de CIE del sistema
 */
@Injectable({
  providedIn: 'root'
})
export class CieService {

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
  private getUrlService(ruta: RUTA) {    
    return this.queryService.getBaseUrl(this.endpoint) + ruta;
  }

  /**
   * Servicio que permite obtener la lista de cie
   */
  getCIE() {
    return this.http.get<Array<Cie>>(this.getUrlService(RUTA.Cie));
  }

  /**
   * Servicio que permite obtener la lista de cie dada la norma
   */
  getCIEByNorma(normaId: number) {
    return this.http.get<Array<Cie>>(this.getUrlService(RUTA.ListarXNorma) + normaId);
  }
  

  /**
   * Servicio que carga un archivo de cie
   * @param file - archivo a cargar
   */
  uploadFile(file: File, normaId: string) {
    const formData: FormData = new FormData();
    const fileHeader = this.header;
    formData.append('file', file);
    formData.append('norma', "" + normaId);
    fileHeader.append('reportProgress', 'true');
    return this.http.post<any>(this.getUrlService(RUTA.Cargar), formData, { headers: fileHeader });
  }

  /**
   * Servicio para obtener los archivos disponibles a descargar
   */
  getFiles() {
    return this.http.get<Array<string>>(this.getUrlService(RUTA.Archivo), { headers: this.header });
  }

  /**
   * Servicio para descargar el archivo
   * @param filename - nombre completo del archivo a descargar
  */
  downloadFile(filename: string) {
    return this.http.get(this.getUrlService(RUTA.Descargar) + filename, { responseType: 'blob' });
  }


}
