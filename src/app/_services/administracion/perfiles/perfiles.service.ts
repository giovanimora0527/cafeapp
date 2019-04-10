/*
* Archivo: perfiles.service.ts
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
import { QueryService } from "../../query/query.service";
import { Perfil } from 'src/app/_models/administracion/perfil/perfil';

/**
 * @author Giovanni Mora Jaimes 
 * @summary versión realizada para el proyecto de facturación electrónica
 * Servicio REST para la gestión de perfiles del sistema
 */
@Injectable({
  providedIn: 'root'
})
export class PerfilesService {

  private endpoint: string = "fae/v1";
  private clase : string = "/perfil/";

  constructor(private http: HttpClient,
    private queryService: QueryService) { }


  /**
   * Método que obtiene la url del endpoint y la url base del servicio rest
   */
  getUrlService() {
    return this.queryService.getBaseUrl(this.endpoint) + this.clase;
  }

  /**
   * Metodo que permite obtener todos los perfiles registrados en el sistema 
   */
  getPerfiles(){
    return this.http.get<Perfil[]>(this.getUrlService());
  }
  
  /**
   * Metodo que permite obtener un perfil dado su Id
   * @param id 
   */
  getPerfilById(id: number){
    return this.http.get<Perfil>(this.getUrlService() + id);
  }
  
  /**
   * Metodo que permite crear un perfil dentro del sistema
   * @param perfil 
   */
  createPerfil(perfil: Perfil){
    return this.http.post(this.getUrlService(), perfil);
  }

  /**
   * Metodo que permite actualizar un perfil
   * @param perfil 
   */
  updatePerfil(perfil: Perfil){
    return this.http.put(this.getUrlService(), perfil);
  }

  /**
   * Metodo que permite eliminar un perfil del sistema
   * @param perfil 
   */
  deletePerfil(perfil: Perfil){
    return this.http.delete(this.getUrlService() + perfil.id);
  }


  /**
   * Metodo que permite obtener todos los perfiles registrados en el sistema 
   */
  getPerfilesByEntidad(id: string){
    return this.http.get<Perfil[]>(this.getUrlService() + id);
  }

}
