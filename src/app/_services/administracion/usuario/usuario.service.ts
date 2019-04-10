/*
* Archivo: usuario.service.ts
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
import { HttpClient, HttpParams } from "@angular/common/http";
import { QueryService } from "../../query/query.service";

/**
 * Modelos
 */
import { Usuario } from '../../../_models/administracion/usuario/usuario';


/**
 * @author Giovanni Mora Jaimes 
 * @summary versión realizada para el proyecto de facturación electrónica
 * Servicio REST para la gestión de usuarios del sistema
 */
@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private endpoint: string = "fae/v1";
  private clase: string = "/usuario/";

  constructor(private http: HttpClient,
    private queryService: QueryService) { }

  /**
   * Método que obtiene la url del endpoint y la url base del servicio rest
   */
  getUrlService() {
    return this.queryService.getBaseUrl(this.endpoint) + this.clase;
  }

  /**
   * Metodo que retorna la lista de usuarios
   */
  getUsuarios(){
    return this.http.get<Usuario[]>(this.getUrlService());
  }

  /**
   * Metodo que permite retornar un usuario dado su id
   * @param userId 
   */
  getUsuarioById(userId: number){
    return this.http.get<Usuario>(this.getUrlService() + userId);
  }
  
  /**
   * Metodo que permite crear un usuario nuevo en el sistema
   * @param usuario 
   */
  createUsuario(usuario: Usuario){
    return this.http.post<Usuario>(this.getUrlService(), usuario);
  }

  /**
   * Metodo que permite actualizar un usuario
   * @param usuario 
   */
  updateUsuario(usuario: Usuario){
    return this.http.put(this.getUrlService(), usuario);
  }

  /**
    * Metodo que permite inhabilitar un usuario del sistema
    * @param usuario 
   */
  inhabilitarUsuario(usuario: Usuario){
    usuario.estado = 0;
    return this.http.put(this.getUrlService(), usuario);
  }

  /**
   * Servicio para consultar un usuario por email
   * @param email
   */
  getByEmail(email: string) {
    const params = new HttpParams().set("email", email);
    return this.http.get<Usuario>(this.getUrlService() + 'email', { params });   
  }
}
