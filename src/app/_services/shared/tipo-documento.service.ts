/*
* Archivo: tipo-documento.service.ts
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
import { HttpClient } from '@angular/common/http';
import { QueryService } from '../query/query.service';

/**
 * Modelos
*/
import { TipoDocumento } from '../../_models/administracion/shared/tipo-documento';

/**
 * @author Giovanni Mora Jaimes 
 * @summary versión realizada para el proyecto de facturación electrónica
 * Servicio REST para la gestión de tipos de documentos de identidad
 */
@Injectable({
  providedIn: 'root'
})
export class TipoDocumentoService {

  private endpoint: string = "fae/v1";
  private clase: string = "/tipo-documento/";

  constructor(private http: HttpClient,
    private queryService: QueryService) { }

  /**
   * Método que obtiene la url del endpoint y la url base del servicio rest
   */
  getUrlService() {
    return this.queryService.getBaseUrl(this.endpoint) + this.clase;
  }

  /**
   * Metodo que obtiene todos los tipos de documentos de identidad del sistema
   */
  getTiposDocumentos() {
    return this.http.get<TipoDocumento[]>(this.getUrlService());
  }
  
  /**
   * Metodo que obtiene un tipo de documento dado su id
   * @param id 
   */
  getTipoDocumentoById(id: number){
    return this.http.get<TipoDocumento>(this.getUrlService() + id);
  }

  /**
   * Metodo que permite crear un tipo de documento nuevo
   * @param tipoDocumento 
   */
  createTipoDocumento(tipoDocumento: TipoDocumento){
    return this.http.post(this.getUrlService(), tipoDocumento);
  }
  
  /**
   * Metodo que permite actualizar un tipo de documento
   * @param tipoDocumento 
   */
  updateTipoDocumento(tipoDocumento: TipoDocumento){
    return this.http.put(this.getUrlService(), tipoDocumento);
  }

  /**
   * Metodo que permite eliminar un tipo de documento
   * @param tipoDocumento 
   */
  deleteTipoDocumento(tipoDocumento: TipoDocumento){
    return this.http.delete(this.getUrlService() + tipoDocumento.id);
  }

}
