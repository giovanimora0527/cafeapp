/*
* Archivo: menu.service.ts
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


import { Injectable} from '@angular/core';
import { HttpClient, HttpHeaders} from "@angular/common/http";

/**
 * Models
 */
import { Menu } from '../../../_models/administracion/menus/menu';

/**
 * Services
 */
import { QueryService } from "../../query/query.service";
import { Acciones } from '../../../_models/administracion/menus/acciones';
import { AutenticacionService } from '../../../_services/autenticacion/autenticacion.service';

/**
 * @author Giovanni Mora Jaimes 
 * @summary versión realizada para el proyecto de facturación electrónica
 * Servicio REST para la gestión de menús del sistema
 */
@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private endpoint: string = "fae/v1"; 
  private clase: string = "/menu/";
  headers_object = new HttpHeaders();   
  menus: Menu[] = [];
  header: any;

  constructor(private queryService: QueryService,
    private http: HttpClient, private autenticacionService: AutenticacionService) {      
      this.header = this.autenticacionService.initHeaders();          
    } 

  /**
   * Método que obtiene la url del endpoint y la url base del servicio rest
   */
  getUrlService() {
    return this.queryService.getBaseUrl(this.endpoint) + this.clase;
  }


  /**
   * Metodo que permite obtener los menús del sistema
   */
  getMenus(){ 
    return this.http.get<Menu[]>(this.getUrlService(), { headers: this.header});
  }
  
  /**
   * Metodo que permite obtener un menú dado su id
   * @param idMenu 
   */
  getMenyById(menuId: number){
    return this.http.get<Menu>(this.getUrlService() + "/" + menuId, { headers: this.header});
  }
  
  /**
   * Metodo que permite crear un menú en el sistema
   * @param menu 
   */
  createMenu(menu: Menu){
    return this.http.post(this.getUrlService(), menu, { headers: this.header});
  }
  
   /**
    * Metodo que permite eliminar el menu seleccionado
    * @param menu 
    */
  eliminarMenu(menu: Menu){
    return this.http.delete(this.getUrlService() + menu.codigo);
  }

  /**
   * Metodo que permite actualizar los datos de un menú
   * @param menu 
   */
  updateMenú(menu: Menu){
    return this.http.put(this.getUrlService(), menu, { headers: this.header});
  }


  /**
   * Metodo que permite listar las acciones de un menú
   */
  getAccionesMenu(){
    return this.http.get<Acciones[]>(this.queryService.getBaseUrl(this.endpoint) + "/accion/", { headers: this.header});
  }

  /**
   * Metodo que obtiene los menus dado el id del perfil
   * @param idPerfil 
   */
  getMenuByPerfil(idPerfil: number) {
    let url:  string = "";
    let api: string = "/perfil/menu/";
    url = this.queryService.getBaseUrl(this.endpoint) + api;
    return this.http.get<Menu[]>(url + idPerfil, { headers: this.header});
  }

  
}
