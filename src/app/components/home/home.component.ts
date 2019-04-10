import { Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import "rxjs/add/operator/delay";

import { AutenticacionService } from '../../_services/autenticacion/autenticacion.service';
import { NgxSpinnerService } from "ngx-spinner";
import { EntidadService } from "src/app/_services/administracion/entidad/entidad.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit {
  title: string = "Home";   

  constructor(router: Router, private autenticacionService:AutenticacionService,
    private spinner: NgxSpinnerService, private entidadService: EntidadService) {
      let value = sessionStorage.getItem("refresh");
      if (value == "0") {
        sessionStorage.removeItem("refresh");
        localStorage.removeItem("refresh");
        window.location.reload();
      }  
  }

  ngOnInit() {
  
  }

  
}
