/*
* Archivo: app.component.ts
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

import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import "rxjs/add/operator/delay";
import { Subject } from 'rxjs';
import * as jwt_decode from "jwt-decode";
import { Directivas } from './_directives/directiva/directiva.directive';

/**
 * Componente de sweetalert
 */
import swal, { SweetAlertType } from 'sweetalert2';
import { AutenticacionService } from './_services/autenticacion/autenticacion.service';


/**
 * @author Giovanni Mora Jaimes 
 * @summary versión realizada para el proyecto de facturacion electronica
 * Componente principal de la aplicación
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']

})
export class AppComponent {
  title = 'Alice';
  userActivity: any;
  userInactive: Subject<any> = new Subject();
  tiempoInactivacion: number;
 
  tiempoTranscurrido: number;
  isFinshedSession: boolean = false;

  constructor(private router: Router, 
    private autenticacionService: AutenticacionService) {     
     if(sessionStorage.getItem("currentUser") != undefined){     
       this.tiempoInactivacion = parseInt(sessionStorage.getItem("time"));  
       //this.obtenerEntidadUsuario();
       this.setTimeout();        
       this.userInactive.subscribe(() => {
            var instancia = this.router;
            var auth = this.autenticacionService;
            if(this.isFinshedSession) {             
              swal("Información", "La sesión ha caducado por inactividad.", "info").then(
                function(){
                  auth.logout();
                  instancia.navigate(['']);
                }
              );
            }
        });
      }
  }

  setTimeout() { 
    this.tiempoTranscurrido = Date.now();       
    if(this.tiempoTranscurrido >= this.tiempoInactivacion) { 
      this.isFinshedSession = true;     
      this.userActivity = setTimeout(() =>  this.userInactive.next(undefined), this.tiempoInactivacion);
    }
    
  }

  @HostListener('window:mousemove') onMouseMove() {
    clearTimeout(this.userActivity);
    this.setTimeout();
  } 

  /**
   * Metodo que permite obtener la entidad del usuario logueado en el sistema
   */
   /* obtenerEntidadUsuario() {
    var token = sessionStorage.getItem('currentUser');
    let info = jwt_decode(token);  
    var idEntidad = info.ent;
    this.entidadService.getEntidadesById(idEntidad)
    .subscribe(
      data => {
        this.entidad = data; 
        this.tiempoInactivacion = Directivas.convertirMinutosAMilisegundos(this.entidad.tiempoInactividad);       
        sessionStorage.setItem("time", "" + this.tiempoInactivacion);
      }
    )
 } */

  
}
