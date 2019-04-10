import { Component, OnInit, Input } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import * as jwt_decode from "jwt-decode";
import { EntidadService } from "src/app/_services/administracion/entidad/entidad.service";
import { Entidad } from "src/app/_models/administracion/entidad/entidad";
import { AsociarService } from "src/app/_services/administracion/ips/asociar.service";
import { first } from "rxjs/operators";

@Component({
  selector: "app-operaciones-ips",
  templateUrl: "./operaciones-ips.component.html",
  styleUrls: ["./operaciones-ips.component.css"]
})
export class OperacionesIpsComponent implements OnInit {
  idEntidad: string;
  tabHomologar: boolean = false;
  ips: Entidad = null;
  eps: Entidad = null;
  entidadEpsId: string;
  relacionId: string = "";

  @Input() isModal: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private asociarService: AsociarService
  ) {
    var token = sessionStorage.getItem("currentUser");
    let info = jwt_decode(token);
    this.entidadEpsId = info.ent;
    this.cargarDataInicial();
  }
  
  /**
   * Metodo que carga la eps e ips de la relacion
   */
  cargarDataInicial() {
    this.route.params
      .pipe(first())
      .subscribe((params: { idRelacion: number }) => {
        this.relacionId = "" + params.idRelacion;
        this.asociarService.getRelacionById(""+ this.relacionId)
        .pipe(first())
        .subscribe(
           data => {           
             this.eps = data["entidadIdErps"];             
             this.ips = data["entidadIdIps"];
           }
        );
      });

    
  }

  ngOnInit() {
    
  }



}
