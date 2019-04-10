/*
* Archivo: accionmenu.service.ts
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
import { MenuAccion } from '../../../_models/administracion/menus/menu-accion';
import { QueryService } from '../../query/query.service';
import { AutenticacionService } from '../../autenticacion/autenticacion.service';

/**
 * @author Giovanni Mora Jaimes 
 * @summary versión realizada para el proyecto de facturación electrónica
 * Servicio REST para la gestión de las acciones por menú del sistema
 */
@Injectable({
  providedIn: 'root'
})
export class AccionMenuService {

  private endpoint: string = "fae/v1";
  private clase = "/menu-accion/"; 
  header: any; 
  
  accionesMenu: MenuAccion[] = [];

  constructor(private queryService: QueryService,
    private http: HttpClient,
    private autenticacionService: AutenticacionService) { 
      this.header = this.autenticacionService.initHeaders();
    }
    
  /**
   * Método que obtiene la url del endpoint y la url base del servicio rest
   */
  getUrlService() {
    return this.queryService.getBaseUrl(this.endpoint) + this.clase;
  }

  /**
   * Metodo que permite crear una accion asociada a un menú
   * @param accionMenu 
   */
  createMenuAccion(accionMenu: MenuAccion){
    return this.http.post(this.getUrlService(), accionMenu, { headers: this.header});
  }

  /**
   * metodo que permite obtener las acciones registradas a los menus
   */
  getMenuAcciones() {
    return this.http.get<MenuAccion[]>(this.getUrlService(), { headers: this.header});
  }

  /**
   * Metodo que permite obtener las acciones registradas al menu seleccionado
   */
  getMenuAccionesByMenu(codigo: string) {
    return this.http.get<MenuAccion[]>(this.getUrlService() + "menu/" + codigo, { headers: this.header});
  }


  /**
   * Metodo que permite crear una accion asociada a un menú
   * @param accionMenu 
   */
  updateMenuAccion(accionMenu: MenuAccion){
    return this.http.put(this.getUrlService(), accionMenu, { headers: this.header});
  }
}
