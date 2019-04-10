import { Injectable } from "@angular/core";
import { AutenticacionService } from "../../autenticacion/autenticacion.service";
import { QueryService } from "../../query/query.service";
import { Relacion } from "src/app/_models/administracion/erp-ips/relacion";
import { HttpClient } from "@angular/common/http";

export enum Ruta {
  ips = "/ips/",
  ListaripsCoincidencias = "/ips/listar-coincidencias/"
}

@Injectable({
  providedIn: "root"
})
export class IpsService {
  private readonly endpoint: string = "fae/v1";

  constructor(
    private http: HttpClient,
    private autenticacionService: AutenticacionService,
    private queryService: QueryService
  ) {}

  /**
   * Genera la url del endpoint y la url base del servicio rest
   */
  private getUrlService(ruta: Ruta) {
    return this.queryService.getBaseUrl(this.endpoint) + ruta;
  }

}
