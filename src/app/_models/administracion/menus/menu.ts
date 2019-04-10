import { MenuAccion } from "./menu-accion";

export class Menu {
    codigo: string;
    nombreMenu: string;
    padre: string;
    rutaMenu: string;
    estado: number;
    iconoMenu: string;    
    menusHijos: Menu[];
    descripcionMenu: string;
    ordenMenu: number;
    padreMenu: string;
    creadoPor: string;
    menuFuncion: MenuAccion[];
    checkeado: boolean;
}