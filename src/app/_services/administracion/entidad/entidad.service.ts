/*
* Archivo: entidad.service.ts
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
import { QueryService } from '../../query/query.service';
import { Entidad } from '../../../_models/administracion/entidad/entidad';
import * as jwt_decode from "jwt-decode";
import { first } from 'rxjs/operators';

/**
 * @author Giovanni Mora Jaimes 
 * @summary versión realizada para el proyecto de facturación electrónica
 * Servicio REST para la gestión de las entidades EPS-IPS-Aseguradoras, etc... del sistema
 */
@Injectable({
  providedIn: 'root'
})
export class EntidadService {

  private endpoint: string = "fae/v1";
  private clase: string = "/entidad/";

  constructor(private http: HttpClient,
    private queryService: QueryService) { }

  /**
   * Método que obtiene la url del endpoint y la url base del servicio rest
   */
  getUrlService() {
    return this.queryService.getBaseUrl(this.endpoint) + this.clase;
  }

  /**
   * Metodo que obtiene las entidades
   */
   getEntidades(){
      return this.http.get<Entidad[]>(this.getUrlService());
   }


  /**
   * Metodo que obtiene la entidad dado su ID
   */
  getEntidadesById(id: string){
    return this.http.get<Entidad>(this.getUrlService() + id);
  }

  /**
   * Metodo que permite crear una entidad nueva en el sistema
   * @param entidad 
   */
  createEntidad(entidad: Entidad){
    return this.http.post<Entidad>(this.getUrlService(), entidad);
  }
  
  /**
   * Metodo que permite actualizar una entidad del sistema
   * @param entidad 
   */
  updateEntidad(entidad: Entidad){
    return this.http.put(this.getUrlService(), entidad);
  }

 /**
  * Metodo que permite eliminar una entidad del sistema
  * @param entidad 
  */
  deleteEntidad(entidad: Entidad){
    return this.http.delete<Entidad>(this.getUrlService() + entidad.id);
  }

  /**
   * Servicio para consultar una entidad por nombre
   * @param nombre
   */
  getByNombre(nombre: string) {
    return this.http.get<Entidad>(this.getUrlService() + 'nombre/' + nombre);
  }
  
  /**
   * Metodo que permite consultar si una entidad está registrada con ese tipo y
   * numero de documento
   * @param idDoc Id del tipo de documento
   * @param doc  Numero de documento
   */
  validateIfExistEntidad(idDoc: number, doc: string){
    return this.http.get<Boolean>(this.getUrlService() + "buscar/" + idDoc +  "/" + doc);
  }


  /**
   * Metodo que permite listar las entidades dado su tipo de entidad
   * Tipo 1: ERPS
   * Tipo 2. IPS
   * @param tipo 
   */
  listarByTipoEntidad(tipo: number){
    return this.http.get<Entidad[]>(this.getUrlService() + "listar/" + tipo);
  }

}
