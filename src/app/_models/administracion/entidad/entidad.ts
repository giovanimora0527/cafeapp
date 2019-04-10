import { OperadorFE } from "../erp-ips/operador-fe";
import { Perfil } from "../perfil/perfil";

export class Entidad  {
    tipoDocumentoId: number;
    nit: string;
    direccion: string;
    telefono: string;
    tipoEntidad: string;
    operadorFe: OperadorFE;
    operadorFeId: number;
    dominio: string
    estado: number;
    id: string;
    nombre: string;
    intentosFallidos: number = 0;
    tiempoInactividad: number = 0;
    vigenciaPassword: number = 0;
    almacenamiento: number = 0;
    unidad: string = "";
    numeroUsuarios: number = 0;
    costoUsuarios: number = 0;
    costoDocumento: number = 0;
    documentosProcesados: number = 0;  
    perfil: Perfil;   
}