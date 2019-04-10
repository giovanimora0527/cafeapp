import { Component, OnInit } from '@angular/core';
import { Observable } from "rxjs/Rx";

/**
 * Models
 */
import { Menu } from '../../../_models/administracion/menus/menu';

/**
 * Services
 */
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  
  public navMenu: string = "";
  dangerousUrl:string = 'javascript:void(0)';
  trustedUrl: SafeUrl = "";
  class: string = "collapse";
  isLoading: boolean = false;

  $menus: Menu[] = []; 

  constructor() {
  }

  ngOnInit() {
    this.cargarMenus();    
  }

   
  /**
   * Metodo que permite cargar los menus y submenus del sistema
   * Se ordena por la propiedad ordenMenu
   */
  public cargarMenus(){
    const obj: Array<Menu> = JSON.parse(sessionStorage.getItem("Menu"));
    this.$menus = obj[0].menusHijos.sort((a: Menu, b: Menu) => {
      return a.ordenMenu - b.ordenMenu;
    });
    for (let i = 0; i < this.$menus.length; i++) {
      this.$menus[i].menusHijos = this.$menus[i].menusHijos.sort((a: Menu, b: Menu) => {
        return a.ordenMenu - b.ordenMenu || <any> a.nombreMenu - <any> b.nombreMenu;
      });
    }
  }

  /**
   * Metodo que permite adicionar la clase collapse in y collapse al submenu
   */
  selectMenu(menu: Menu){   
    if(this.esMenuRaiz(menu)) {
      return;
    } 
    
    let codigo = "menu_" + menu.nombreMenu;
    let item = document.getElementById(codigo);
    if(item.classList.contains("collapse in")) {
      item.classList.remove("collapse in");
      item.classList.add("collapse");
    } else {
      item.classList.add("collapse");
    }
  }
  
  /**
   * Metodo que permite validar si el menú seleccionado es raiz
   */
  esMenuRaiz(menu: Menu) {
    return menu.padreMenu == "---";
  }

  
}
