/*
* Archivo: serviciosxmecanismopago.service.ts
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
import { MecanismoPago } from 'src/app/_models/administracion/mecanismo-pago/mecanismo-pago';
import { HttpClient } from '@angular/common/http';
import { ServicioMecanismoPago } from 'src/app/_models/administracion/mecanismo-pago/servicio-mec-pago';
import { SoportesMecanismoPago } from 'src/app/_models/administracion/mecanismo-pago/soportes-mecanismo-pago';

/**
 * @author Giovanni Mora Jaimes 
 * @summary versión realizada para el proyecto de facturación electrónica
 * Servicio REST para la gestión de los servicios x mecanismo de pago
 */
@Injectable({
  providedIn: 'root'
})
export class ServiciosxmecanismopagoService {
  
  private endpoint: string = "fae/v1"; 
  private clase1: string = "/mecanismo-pago/";
  private clase2: string = "/servicio-mec-pago/mecanismo-pago/"; // Servicios por Mecanismo de pago
  private clase3: string = "/soportes-serv-mec-pago/"; // Servicios
  private clase4: string = "/soportes-serv-mec-pago/servicio/"; // Servicios
  private clase5 = "/servicio-mec-pago/";

  constructor(private queryService: QueryService,
    private http: HttpClient) { }

  /**
   * Método que obtiene la url del endpoint y la url base del servicio rest
   * para los mecanismos de pago
   */
  getUrlService() {
    return this.queryService.getBaseUrl(this.endpoint) + this.clase1;
  }

   /**
   * Método que obtiene la url del endpoint y la url base del servicio rest
   * para los mecanismos de pago
   */
  getUrlSoporteServicioPago() {
    return this.queryService.getBaseUrl(this.endpoint) + this.clase3;
  }

  /**
   * Método que obtiene la url del endpoint y la url base del servicio rest
   * para los mecanismos de pago
   */
  getUrlServicioMecanismoPago() {
    return this.queryService.getBaseUrl(this.endpoint) + this.clase2;
  }

  /**
   * Método que obtiene la url del endpoint y la url base del servicio rest
   * para los mecanismos de pago
   */
  getUrlServicioMecanismoPagoOperaciones() {
    return this.queryService.getBaseUrl(this.endpoint) + this.clase5;
  }

  /**
  * Método que obtiene la url del endpoint y la url base del servicio rest
  * para los mecanismos de pago
  */
  getUrlSoportesPorServicio() {
   return this.queryService.getBaseUrl(this.endpoint) + this.clase4;
 }

  
  /**
   * Metodo que permite obtener los servicios por mecanismos de pago registrados en el sistema
   */
  obtenerMecanismosPago() {
    return this.http.get<MecanismoPago[]>(this.getUrlService());
  }
  
  /**
   * Metodo que permite listar los servicios asociados a un mecanismo de pago
   * @param mecanismo 
   */
  listarServiciosXMecanismoPago(mecanismo: MecanismoPago){    
    return this.http.get<ServicioMecanismoPago[]>(this.getUrlServicioMecanismoPago() + mecanismo.id);
  }

  /**
   * Metodo que permite listar los soportes asociados a un servicio de mecanismo de pago
   * @param servicio 
   */
  listarSoportesXServicio(servicio: ServicioMecanismoPago) {
    return this.http.get<SoportesMecanismoPago[]>(this.getUrlSoportesPorServicio() + servicio.id);
  }

  /**
   * Metodo que permite crear un nuevo servicio por mecanismo de pago
   * @param servicio 
   */
  createServicioMecanismoPago(servicio: ServicioMecanismoPago) {
    return this.http.post<ServicioMecanismoPago>(this.getUrlServicioMecanismoPagoOperaciones(), servicio);
  }

  /**
   * Metodo que permite actualizar un registro de un servicio por mecanismo de pago
   * @param servicio 
   */
  updateServicioMecanismoPago(servicio: ServicioMecanismoPago) {
    return this.http.put<SoportesMecanismoPago>(this.getUrlServicioMecanismoPagoOperaciones(), servicio);
  }

  /**
   * Metodo que permite eliminar un servicio por mecanismo de pago del sistema
   */
  deleteServicioMecanismoPago(servicio: ServicioMecanismoPago) {
    return this.http.delete(this.getUrlServicioMecanismoPagoOperaciones() + servicio.id);
  }

  /**
   * Metodo que permite agregar soportes a un servicio de mecanismo de pago
   * Soporte es igual a las tipologias de documentos 
   * @param soporte 
   */
  addSoporteAServicioMecPago(soporte: SoportesMecanismoPago) {
    return this.http.post<SoportesMecanismoPago>(this.getUrlSoporteServicioPago(),  soporte);
  }
  
  /**
   * Metodo que permite eliminar un soporte de un servicio x mecanismo de pago
   * Soporte es igual a las tipologias de documentos
   */
  deleteSoporteAServicioMecPago(soporte: SoportesMecanismoPago) {
    return this.http.delete<SoportesMecanismoPago>(this.getUrlSoporteServicioPago() + soporte.id);
  }






}
