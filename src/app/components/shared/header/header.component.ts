import * as jwt_decode from "jwt-decode";
import { Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';

/**
 * Servicios
 */
import { AutenticacionService } from '../../../_services/autenticacion/autenticacion.service';

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"]
})
export class HeaderComponent implements OnInit {
  name: string = "";
  activo: boolean = false;
  idEntidad: string;
  nombreEntidad: string = "";
 

  constructor(private autenticacionService: AutenticacionService,
    private router: Router) {}

  ngOnInit() {
    this.cargarNombreUsuario();
  }
  
  /**
   * Método que permite cargar los datos basicos para mostrar en el header de la aplicación
   */
  cargarNombreUsuario() {
    var token = sessionStorage.getItem('currentUser');
    let info = jwt_decode(token);
    this.name = info.nom;
    this.idEntidad = info.ent;
    this.obtenerEntidadUsuario();
  }

  /**
   * Metodo que cierra la sesion del usuario
   */
  cerrarSesion() {
    this.autenticacionService.logout();
  }
  
  /**
   * Metodo que permite obtener la entidad del usuario logueado en el sistema
   */
  obtenerEntidadUsuario() {
     /* this.entidadService.getEntidadesById(this.idEntidad)
     .subscribe(
       data => {
         this.nombreEntidad = data["nombre"];          
       }
     ) */
  }



}
