/*
* Archivo: autenticacion.service.ts
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

import { Injectable } from "@angular/core";
import { HttpHeaders, HttpClient } from "@angular/common/http";

import { Session } from "../../_models/autenticacion/session";
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from "@angular/router";

import { PermisosService } from "../../_services/administracion/permisos/permisos.service";
import * as jwt_decode from "jwt-decode";

/**
 * Componente de sweetalert
 */
import swal from "sweetalert2";

/**
 * Servicios
 */
import * as queryService from "../query/query.service";
import { Directivas } from "src/app/_directives/directiva/directiva.directive";
import { PerfilPermiso } from "src/app/_models/administracion/menus/perfil-permiso";
import { first } from "rxjs/operators";
import { PermisoUsuario } from "src/app/_models/administracion/perfil/permiso";

/**
 * @author Giovanni Mora Jaimes
 * @summary versión realizada para el proyecto de facturación electrónica
 * Servicio REST para autenticación en el sistema
 */
@Injectable({
  providedIn: "root"
})
export class AutenticacionService {
  headers_object = new HttpHeaders();
  private endpoint: string = "fae/v1";
  private clase: string = "/accesos/autenticar";
  private currentSession: Session = null;
  private perfilId: number;

  /**
   * Variables para permisos
   */
  arrayPermisos: any[] = [];
  route: ActivatedRouteSnapshot;
  state: RouterStateSnapshot;

  constructor(
    private queryService: queryService.QueryService,
    private http: HttpClient,
    private router: Router,
    private permisosService: PermisosService
  ) {
    this.headers_object.append("Authorization", "Bearer " + this.getToken());
    this.currentSession = this.loadSessionData();
    this.cargarDataInicial();
  }

  cargarDataInicial() {
    var token = sessionStorage.getItem("currentUser");
    if (token != null) {
      let info = jwt_decode(token);
      this.perfilId = info.perid;
    }
  }

  /**
   * Método que obtiene la url del endpoint y la url base del servicio rest
   */
  getUrlService() {
    return this.queryService.getBaseUrl(this.endpoint) + this.clase;
  }

  /**
   * Retorna la url
   */
  getUrlBase() {
    return this.queryService.getBaseUrl(this.endpoint);
  }

  /**
   * Metodo que permite cargar los datos de la sesion
   */
  loadSessionData(): Session {
    var sessionStr = sessionStorage.getItem("session");
    return sessionStr ? <Session>JSON.parse(sessionStr) : null;
  }

  /**
   * Metodo que setea una sesion
   * @param session
   */
  setCurrentSession(session: Session): void {
    this.currentSession = session;
    sessionStorage.setItem("session", JSON.stringify(session));
  }

  /**
   * Metodo que obtiene la sesion activa
   */
  getCurrentSession(): Session {
    return this.currentSession;
  }

  /**
   * Metodo que remueve la sesion activa
   */
  removeCurrentSession(): void {
    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("Authorized");
    sessionStorage.removeItem("Menu");
    sessionStorage.removeItem("session");
    this.currentSession = null;
  }

  /**
   * Metodo que obtiene si el usuario esta autenticado
   */
  isAuthenticated(): boolean {
    return this.getCurrentToken() != null ? true : false;
  }

  /**
   * Metodo que obtiene el token actual de la sesion
   */
  getCurrentToken(): string {
    var session = this.getCurrentSession();
    return session && session.token ? session.token : null;
  }

  /**
   * Metodo que crea la session para poder interactuar en el sistema
   */
  createSession(objeto: Object) {
    return this.http.post(this.getUrlService(), objeto);
  }

  /**
   * Metodo que setea eñ token en el local storage
   * @param status
   * @param token
   */
  setToken(status: string, token: string, menu) {
    let obj: Object = {
      status: status,
      token: token
    };
    sessionStorage.setItem("currentUser", obj["token"]);
    localStorage.setItem("currentUser", obj["token"]);
    sessionStorage.setItem("Authorized", obj["status"]);
    sessionStorage.setItem("Menu", JSON.stringify(menu));
  }

  /**
   * Metodo que obtiene el token de la sesion
   */
  getToken() {
    return sessionStorage.getItem("currentUser");
  }

  /**
   * Metodo que permite  cerrar la sesion y eliminarla
   */
  logout() {
    this.removeCurrentSession();
    this.router.navigateByUrl("/", { skipLocationChange: true });
    return this.http.post(this.getUrlBase() + "/accesos/cerrar-sesion", null);
  }

  /**
   * Metodo que inicializa los headers de la peticion
   */
  public initHeaders(): HttpHeaders {
    var headers = new HttpHeaders({
      Authorization: "Bearer " + this.getToken(),
      "Access-Control-Allow-Origin": "*",
      Pragma: "no-cache"
    });
    return headers;
  }

  /**
   * Metodo que permite cambiar la contraseña del usuario
   */
  cambiarPassword(obj: Object) {
    return this.http.post(this.getUrlBase() + "/accesos/cambio-clave/", obj);
  }

  /**
   * Metodo que permite recordar la contraseña. Se envia un correo y se procede a validar
   */
  rememberPassword(obj: Object) {
    return this.http.post(this.getUrlBase() + "/accesos/restaurar/", obj);
  }

  /**
   * Metodo que permite validar si el token es valido para poder cambiar la contraseña
   * @param token
   */
  validarToken(token: string) {
    let header = {
      Accept: "application/json",
      "Content-Type": "application/json"
    };
    let url = this.getUrlBase() + "/accesos/restaurar/validar?key=" + token;
    return this.http.get<Object>(url, { headers: header });
  }

  /**
   * Metodo que permite cambiar la contraseña despues de que el usuario
   * entro al correo y se valido la informacion. Por lo tanto solo se recibe
   * el objeto con la nueva contraseña
   */
  cambiarContraseña(obj: Object) {
    return this.http.post(
      this.getUrlBase() + "/accesos/restaurar/cambio-clave",
      obj
    );
  }

  /**
   * Metodo que permite validar los permisos del usuario para visualizar el modulo
   * @param url
   */
  async validarPermisosUsuario(url: string) {
    let perId = this.perfilId;
    var instance = this;
    var permisosXPerfilArray: PerfilPermiso[] = [];
    this.permisosService.getPermisosPerfiles().subscribe(
      data => {
        let arrayPermisos = data;        
        if (arrayPermisos != null && arrayPermisos.length > 0) {
          let menu: string = "";
          arrayPermisos.forEach(function(element) {
            menu = element["menuCodigo"]["rutaMenu"];
              if (menu == url && perId == element["perfilId"]["id"]  && element["estado"] == 1) {
                permisosXPerfilArray.push(element);
              }
           });
         }
        
        var isPermitidoAcceso: boolean = false;
        
        if(permisosXPerfilArray != null && permisosXPerfilArray.length > 0) {
          for(let i=0; i < permisosXPerfilArray.length; i++){
            let menu: string = "";
            menu = permisosXPerfilArray[i]["menuCodigo"]["rutaMenu"];            
              if(menu.includes(url) && permisosXPerfilArray[i]["menuFuncion"] == "M") {
                isPermitidoAcceso = true;
                break;
              }
          }
        }

        /**
         * Valido sobre las urls parametrizadas
         */
        let arrayUrl: string[] = [];
        arrayUrl = Directivas.returnUrlParametrizadas();         
        for(let i=0; i<arrayUrl.length; i++) {
          if(url.includes(arrayUrl[i])) {
            isPermitidoAcceso = true;
          }       
        }
        
        if(!isPermitidoAcceso) {
          swal("Info", "No existe la url o no tiene permisos.", "info");
            instance.router.navigate(["home"]);
            return;
        } 
    });

  }

  /**
   * Metodo que obtiene el id de la entidad del usuario que esta logueado
   */
  getEntidadId() {
    var token = sessionStorage.getItem("currentUser");
    let info = jwt_decode(token);  
    return info.ent;
  }  

  /**
   * Metodo que obtiene el perfil del usuario que esta logueado en el sistema
   */
  getPerfilId() {
    return this.perfilId;
  }

  /**
   * Metodo que obtiene los permisos dados a un perfil
   */
  async obtenerPermisosXPerfil(){
      await this.permisosService.getPermisosPerfiles()
        .pipe(first())
        .subscribe(
          data => { 
            console.log(data);
            return data; 
        });
  }
}
