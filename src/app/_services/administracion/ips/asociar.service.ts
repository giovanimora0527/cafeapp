import { Injectable } from '@angular/core';
import { AutenticacionService } from '../../autenticacion/autenticacion.service';
import { QueryService } from '../../query/query.service';
import { HttpClient } from '@angular/common/http';
import { Relacion } from 'src/app/_models/administracion/erp-ips/relacion';

export enum Ruta {
  relacion = "/relacion/",
  listar = "/relacion/listar/" 
}


@Injectable({
  providedIn: 'root'
})
export class AsociarService {

  private readonly endpoint: string = "fae/v1";

  constructor(private http: HttpClient,
    private autenticacionService: AutenticacionService,
    private queryService: QueryService) { }


  /**
   * Genera la url del endpoint y la url base del servicio rest
   */
  private getUrlService(ruta: Ruta) {
    return this.queryService.getBaseUrl(this.endpoint) + ruta;
  }

  /**
   * Metodo que obtiene las IPS registradas en el sistema
   */
  getRelacionIPS() {
    return this.http.get<Array<Relacion>>(this.getUrlService(Ruta.listar) +  this.autenticacionService.getEntidadId());
  }

  /**
   * Servicio que guarda un cups en creación
   * @param cups
   */
  createAsociacionIPS(relacion: Relacion) {
    return this.http.post(this.getUrlService(Ruta.relacion), relacion);
  }

  /**
   * Servicio que guarda un cups en creación
   * @param cups
   */
  editAsociacionIPS(relacion: Relacion) {
    return this.http.put(this.getUrlService(Ruta.relacion), relacion);
  }

  /**
   * Metodo que obtiene los datos de la relacion dado su ID
   * @param id 
   */
  getRelacionById(id: string){
    if(id == undefined) {
      return;
    }
    return this.http.get<Relacion>(this.getUrlService(Ruta.relacion) + id);
  }


}
