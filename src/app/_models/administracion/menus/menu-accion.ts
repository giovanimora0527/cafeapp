import { Menu } from "./menu";

export class MenuAccion {
  menuFuncionIdentity: {
    funcionCodigo: string;
    menuCodigo: string;
  };
  funcionCodigo: {
    funcionCodigo: string;
    detalleMenuFuncion: string;
    estado: number;
    creadoPor: number;
    fechaCreacion: string;
    modificadoPor: number;
    fechaModificacion: string;
    chekeado: number;
  };
  menuCodigo: {
    padreMenu: string; 
    ordenMenu: string;
    nombreMenu: string;
    rutaMenu: string;
    iconoMenu: string;
    descripcionMenu: string;
    estado: number;
    creadoPor: number;
    fechaCreacion: string;
    modificadoPor: number;
    fechaModificacion: string;
    menusHijos: Menu[];
    handler: {};
    hibernateLazyInitializer: {};
    codigo: string;    
  }
  estado: number;
  creadoPor: number;
  fechaCreacion: string;
  modificadoPor: number;
  fechaModificacion: number;
  checkeado: boolean;
}
