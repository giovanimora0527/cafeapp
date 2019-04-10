import { Menu } from "./menu";
import { Acciones } from 'src/app/_models/administracion/menus/acciones';

export class MenuPermiso {
    perfilPermisoIdentity : {
        perfilId: number,
        menuFuncionCodigo: string,
        menuCodigo: string
    } 
    estado: number   
}