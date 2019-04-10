/*
* Archivo: permisos.service.ts
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
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { QueryService } from '../../query/query.service';

/**
 * Modelos
 */
import { PerfilPermiso } from '../../../_models/administracion/menus/perfil-permiso';

/**
 * @author Giovanni Mora Jaimes 
 * @summary versión realizada para el proyecto de facturación electrónica
 * Servicio REST para la gestión de permisos del sistema
 */
@Injectable({
  providedIn: 'root'
})
export class PermisosService {
   
  private endpoint: string = "fae/v1";
  private clase : string = "/perfil-permiso/";

  constructor(private http: HttpClient,
    private queryService: QueryService) { }


  /**
   * Método que obtiene la url del endpoint y la url base del servicio rest
   */
  getUrlService() {
    return this.queryService.getBaseUrl(this.endpoint) + this.clase;
  }
   
  /**
   * Metodo que obtiene todos los permisos registrados en DB
   */
  getPermisosPerfiles(){   
    return this.http.get<PerfilPermiso[]>(this.getUrlService());
  }

  /**
   * Metodo que obtiene los permisos dado un perfil de usuario
   * @param idPerfil 
   */
  getPermisosByPerfil(idPerfil: number) {
    return this.http.get<PerfilPermiso>(this.getUrlService() + idPerfil);
  }
   
  /**
   * Metodo que permite crear un registro de un permiso asociado a un perfil
   * @param perfilPermiso 
   */
  createPermisosPorPerfil(perfilPermiso: PerfilPermiso){
    return this.http.post(this.getUrlService(), perfilPermiso);
  }
   
  /**
   * Metodo que permite actualizar un registro de un permiso asociado a un perfil
   * @param perfilPermiso 
   */
  updatePermisosPorPerfil(perfilPermiso: PerfilPermiso){
    return this.http.put(this.getUrlService(), perfilPermiso);
  }

  
}
