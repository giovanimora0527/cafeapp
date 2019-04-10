import { ServicioMecanismoPago } from "./servicio-mec-pago";
import { MecanismoPago } from './mecanismo-pago';
import { TipologiaDocumento } from '../tipologias/tipologias-documentos';

export class SoportesMecanismoPago {
    soporteServMecPagoId: number;
    serviciomecPagoId: number;
    servicioMecPag: ServicioMecanismoPago;
    mecanismoPagoId: number;
    mecanismoPago: MecanismoPago;
    tipologiaDocumentoId: number;
    tipologiaDocumento: TipologiaDocumento;
    estado: number;
    creadoPor: number;
    fechaCreacion: string;
    modificadoPor: number;
    fechaModificacion: string;
    id: number;
}