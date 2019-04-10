/*
* Archivo: glosas.service.ts
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
import { HttpClient, HttpHeaders } from '@angular/common/http';

/**
 * Servicios
 */
import { QueryService } from '../../query/query.service';
import { AutenticacionService } from '../../autenticacion/autenticacion.service';

/**
 * Modelos
 */
import { GlosaGeneral, GlosaEspecifica } from '../../../_models/administracion/glosas';

export enum Ruta {
  General,
  Especifica,
  Mixta
}

/**
 * @author Giovanni Mora Jaimes 
 * @summary versión realizada para el proyecto de facturación electrónica
 * Servicio REST para la gestión de las glosas del sistema
 */
@Injectable({
  providedIn: 'root'
})
export class GlosasService {
  private readonly endpoint: string = 'fae/v1';
  private readonly claseGeneral = '/codigo-glosa';
  private readonly claseEspecifica = '/codigo-glosa-esp';

  header: HttpHeaders;

  constructor(private queryService: QueryService,
    private http: HttpClient,
    private autenticacionService: AutenticacionService) {
    this.header = this.autenticacionService.initHeaders();
  }

  /**
   * Genera la url del endpoint y la url base del servicio rest
   * @param ruta - indica la dirección de la ruta
   */
  private getUrlService(ruta: Ruta) {
    let url = this.queryService.getBaseUrl(this.endpoint);
    switch (ruta) {
      case Ruta.General:
        url += this.claseGeneral;
        break;
      case Ruta.Especifica:
        url += this.claseEspecifica;
        break;
      case Ruta.Mixta:
        url += this.claseEspecifica + this.claseGeneral;
        break;
      default:
        throw new Error('this should not happen (panic time)');
    }
    return url + '/';
  }

  /**
   * Servicio que permite obtener los estados de una glosa especifica
   */
  getEstadosGlosaEspecifica() {
    return this.http.get(this.getUrlService(Ruta.General));
  }

  /**
   * Servicio que obtiene las glosas generales
   */
  getGlosasGenerales() {
    return this.http.get<Array<GlosaGeneral>>(this.getUrlService(Ruta.General), { headers: this.header });
  }

  /**
   * Servicio que consulta las glosas específicas dada la general
   * @param id
   */
  getGlosasEspecificas(id: number) {
    return this.http.get<Array<GlosaEspecifica>>(this.getUrlService(Ruta.Mixta) + id, { headers: this.header });
  }

  /**
   * Servicio que obtiene la glosa especifica dado su id
   * @param id 
   */
  getGlosaEspecifica(id: number) {
    return this.http.get<GlosaEspecifica>(this.getUrlService(Ruta.Especifica) + id, { headers: this.header });
  }

  /**
   * Servicio que elimina una glosa específica
   * @param id 
   */
  deleteGlosaEspecifica(id: number) {
    return this.http.delete(this.getUrlService(Ruta.Especifica) + id, { headers: this.header });
  }

  /**
  * Servicio que guarda una glosa específica en creación
  * @param glosa
  */
  createGlosaEspecifica(glosa: GlosaEspecifica) {
    return this.http.post(this.getUrlService(Ruta.Especifica), glosa, { headers: this.header });
  }

  /**
  * Servicio que guarda una glosa específica en edición
  * @param glosa
  */
  editGlosaEspecifica(glosa: GlosaEspecifica) {
    return this.http.put(this.getUrlService(Ruta.Especifica), glosa, { headers: this.header });
  }
}
