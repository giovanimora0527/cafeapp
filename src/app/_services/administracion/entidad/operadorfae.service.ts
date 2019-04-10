/*
* Archivo: operadorfae.service.ts
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
import { HttpClient } from '@angular/common/http';
import { OperadorFE } from 'src/app/_models/administracion/erp-ips/operador-fe';

/**
 * @author Giovanni Mora Jaimes 
 * @summary versión realizada para el proyecto de facturación electrónica
 * Servicio REST para la gestión de operadores fae del sistema
 */
@Injectable({
  providedIn: 'root'
})
export class OperadorfaeService {

  private endpoint: string = "fae/v1";
  private clase: string = "/operador/";

  constructor(private http: HttpClient,
    private queryService: QueryService) { }

  /**
   * Método que obtiene la url del endpoint y la url base del servicio rest
   */
  getUrlService() {
    return this.queryService.getBaseUrl(this.endpoint) + this.clase;
  }

  /**
   * Metodo que obtiene los operadores fae
   */
  getOperadores(){
    return this.http.get<OperadorFE[]>(this.getUrlService());
 }


  
}
