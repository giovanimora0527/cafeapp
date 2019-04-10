import { Perfil } from "../perfil/perfil";
import { Menu } from "./menu";

export class PerfilPermiso {
    creadoPor: number;
    estado: number;
    fechaCreacion: string;
    fechaModificacion: string;
    menuCodigo: Menu;
    modificadoPor: number;
    perfilId: Perfil;
    perfilPermisoIdentity: {
        menuCodigo: string,
        menuFuncionCodigo: string,
        perfilId: number        
    };
    
    
    
    
    
    
    
}