import { Entidad } from "../entidad/entidad";

export class Relacion {
    id:number;
    estado: number;
    entidadIdErps: Entidad;
    entidadIdIps: Entidad;
    entidadIdErpsId: string;
    entidadIdIpsId: string;
    nombreResponsableErps: string;
    nombreResponsableIps: string;
    correoResponsableErps: string;
    correoResponsableIps: string;
    nombreResponsableErps2: string;
    nombreResponsableIps2: string;
    correoResponsableErps2: string;
    correoResponsableIps2: string;    
}