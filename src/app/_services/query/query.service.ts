/*
* Archivo: query.service.ts
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
import { environment } from './../../../environments/environment';

/**
 * @author Giovanni Mora Jaimes 
 * @summary versión realizada para el proyecto de facturacion electronica
 * Servicio para devolver la url del entorno de desarollo o produccion
 */
@Injectable({
  providedIn: 'root'
})
export class QueryService {  

  constructor() { }

  /**
   * Metodo que obtiene la direccion base de desarrollo
   * @param endpoint 
   */
  getBaseUrl(endpoint:string): string{
    return (environment.urlBase + endpoint);
  }
  
}
