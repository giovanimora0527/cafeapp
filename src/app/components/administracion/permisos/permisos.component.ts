import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import * as jwt_decode from "jwt-decode";
/**
 * Componente de sweetalert
 */
import swal from "sweetalert2";

import { first } from "rxjs/operators";
import { MenuAccion } from "src/app/_models/administracion/menus/menu-accion";
import { Acciones } from "src/app/_models/administracion/menus/acciones";
import { Perfil } from "src/app/_models/administracion/perfil/perfil";
import { Menu } from "src/app/_models/administracion/menus/menu";
import { PerfilPermiso } from "src/app/_models/administracion/menus/perfil-permiso";

/**
 * Servicios
 */
import { PerfilesService } from "../../../_services/administracion/perfiles/perfiles.service";
import { MenuService } from "../../../_services/administracion/menu/menu.service";
import { PermisosService } from "src/app/_services/administracion/permisos/permisos.service";
import { Directivas } from "src/app/_directives/directiva/directiva.directive";
import { AutenticacionService } from "src/app/_services/autenticacion/autenticacion.service";

@Component({
  selector: "app-permisos",
  templateUrl: "./permisos.component.html"
})
export class PermisosComponent implements OnInit {
  title: string = "Permisos";
  nombreperfil: string;
  perfilSelected: Perfil;
  idPerfil: number;

  menus: Menu[] = [];
  submenus: Menu[] = [];
  menuSelected: Menu;
  accionesByMenu: MenuAccion[] = [];
  menuAcciones: MenuAccion[] = [];
  acciones: Acciones[] = [];
  menusSeleccionados: Menu[] = [];
  perfilesPermisos: PerfilPermiso[] = [];
  tipoPerfil: string;
  isMenu: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private perfilesService: PerfilesService,
    private menuService: MenuService,
    private permisosService: PermisosService,
    private spinner: NgxSpinnerService,
    private autentication: AutenticacionService,
    private router: Router
  ) {
    this.validarPermisos();
  }

  ngOnInit() {
    // Cargar Tipo Perfil del usuario que esta logueado
    var token = sessionStorage.getItem("currentUser");
    let info = jwt_decode(token);
    this.tipoPerfil = info.tip;
    this.cargarMenus();   
  }

  /**
   * Método que permite validar si el usuario tiene permisos para acceder al módulo
   */
  async validarPermisos() {
    let url: string = this.router.routerState.root.children[0].firstChild
      .routeConfig.path;
    this.autentication.validarPermisosUsuario(url);
    return;
  }

  /**
   * Metodo que permite cargar los menus y submenus del sistema
   */
  public cargarMenus() {
    this.route.params.subscribe((params: { idPerfil: number }) => {
      this.idPerfil = params.idPerfil;
      this.perfilesService.getPerfilById(params.idPerfil).subscribe(data => {
        this.perfilSelected = data;
        this.nombreperfil = this.perfilSelected.nombrePerfil;
        if (this.tipoPerfil === Directivas.getTipoPerfilSuper()) {         
          this.menuService.getMenus().subscribe(
            data => {             
               this.menus = data[0].menusHijos;
               Directivas.orderAsc(this.menus, "nombreMenu");
               this.checkearPermisosRegistrados();
               return;
          });
        } else {
          /**
           *  El usuario logueado no es super admin por lo tanto se discrimina el acceso a menus
           */         
         this.menuService
              .getMenuByPerfil(this.perfilSelected.id)
              .subscribe(data => {
                this.menus = data[0].menusHijos;
                Directivas.orderAsc(this.menus, "nombreMenu");
                this.checkearPermisosRegistrados();
                return;
          });
        }
      });
    });
  }

 

  /**
   * Metodo que permite checkear automaticamente los menus y acciones que estan
   * registradas en el sistema
   */
  checkearPermisosRegistrados() {      
    this.permisosService
      .getPermisosPerfiles()
      .pipe(first())
      .subscribe(data => {
        this.perfilesPermisos = data;      
        if (this.perfilesPermisos.length == 0) {
          return;
        }        
        this.checkearMenus(this.menus);        
      });
  }

  /**
   * Metodo que permite checkear automaticamente los menus que vienen registrados con permisos
   * en el sistema
   */
  checkearMenus(menus: Menu[]) {
    /**
     * Chequeo los menus que tienen permisos activos
     */
    for (let i = 0; i < menus.length; i++) {
      for (let j = 0; j < this.perfilesPermisos.length; j++) {       
        if (this.idPerfil == this.perfilesPermisos[j].perfilId.id && this.perfilesPermisos[j].perfilPermisoIdentity.menuCodigo == menus[i].codigo
          && this.perfilesPermisos[j].perfilPermisoIdentity.menuFuncionCodigo == "M") {
          menus[i].checkeado = this.perfilesPermisos[j].estado == 1 ? true : false;
        }
      }
      if(this.esMenu(menus[i]) && menus[i].menusHijos != null){
        this.checkearSubMenus(menus[i].menusHijos);
      } 

      if(this.esMenu(menus[i]) && menus[i].menuFuncion != null) {        
        this.checkearAcciones(menus[i].menuFuncion);
      } 
     
    }
  }

   /**
   * Metodo que permite checkear automaticamente los submenus que vienen registrados con permisos
   * en el sistema al momento del usuario seleccionar un menu raiz
   */
  checkearSubMenus(menus: Menu[]) {
    /**
     * Chequeo los menus que tienen permisos activos
     */   
    for (let i = 0; i < menus.length; i++) {
      for (let j = 0; j < this.perfilesPermisos.length; j++) {         
        if (this.idPerfil == this.perfilesPermisos[j].perfilId.id && menus[i].codigo == this.perfilesPermisos[j].perfilPermisoIdentity.menuCodigo 
          && this.perfilesPermisos[j].perfilPermisoIdentity.menuFuncionCodigo == "M") {          
          menus[i].checkeado = this.perfilesPermisos[j].estado == 1 ? true : false;
        }
      }
      if(menus[i].menuFuncion != null) {
        this.checkearAcciones(menus[i].menuFuncion);
      }
    }
  }
  

  /**
   * Metodo que permite cargar los submenus cuando el usuario da clic en el menu raiz
   * @param idMenu
   */
  public cargarSubmenus(menu: Menu) {    
    this.selectMenu(menu, this.esMenu(menu));  
    if (menu.menuFuncion != null) {
      this.cargarAccionesMenu(menu);
    }
    if (menu != null) {
      if (menu.menusHijos != null) {
        this.submenus = menu.menusHijos; 
        Directivas.orderAsc(this.submenus, "nombreMenu");      
      } else {
        this.submenus = [];
        this.cargarAccionesMenu(menu);
      }
    }
  }

  /**
   * Metodo que permite cargar las acciones validas para un menu o submenu
   * @param menuId
   */
  cargarAccionesMenu(menu: Menu) {   
    this.selectMenu(menu, this.esMenu(menu));      
    if (menu != null && menu.menuFuncion != null) {
      this.accionesByMenu = menu.menuFuncion;
    } else {
      this.accionesByMenu = [];
    }
  }

  /**
   * Metodo que me permite checkear las acciones con permisos registradas para cada menu/submenu
   * @param menuAcciones
   */
  checkearAcciones(menuAcciones: MenuAccion[]) { 
      for(let i=0; i < this.perfilesPermisos.length; i++){
        for(let j=0; j < menuAcciones.length; j++) {         
          if(this.idPerfil == this.perfilesPermisos[i].perfilId.id && 
         this.perfilesPermisos[i].perfilPermisoIdentity.menuCodigo == menuAcciones[j].menuFuncionIdentity.menuCodigo
           && this.perfilesPermisos[i].perfilPermisoIdentity.menuFuncionCodigo == menuAcciones[j].menuFuncionIdentity.funcionCodigo) {                    
            menuAcciones[j].checkeado = this.perfilesPermisos[i].estado == 1 ? true: false;
          }
        }
      }
  }

  /**
   * Metodo que permite validar si el menu seleccionado es raiz o submenu
   * @param menu 
   */
  esMenu(menu: Menu) {
    return menu.padreMenu == "---" ? true: false;
  }

  /**
   * metodo que quita la clase active de la lista de menus/submenus
   * @param menus 
   */
  desactivarSelectMenu(menus: Menu[]) {  
    if(menus == null) {
       return;
    }
    for(let i=0; i < menus.length; i++) {
      let codigo = menus[i].nombreMenu;      
      var item = document.getElementById(codigo);
      if(item != null) {
        item.classList.remove("active");
      }
     
    }

  }

  /**
   * Metodo que captura el evento de seleccionar un menú
   * @param idMenu
   */
  selectMenu(menu: Menu, isMenu: boolean) {    
    if(isMenu) {
      this.desactivarSelectMenu(this.menus);
      var item = document.getElementById(menu.nombreMenu);
      item.classList.add("active");
    } 
    else {
      this.desactivarSelectMenu(this.submenus);
      var item = document.getElementById(menu.nombreMenu);
      item.classList.add("active");
    }  
  }

  /**
   * Metodo que permite pintar si el menu esta seleccionado
   */
  selectedMenu(index: string) {   
    /**
     * Deselecciono todos los menus y submenus
     */
    if (this.isMenu) {
      for (let i = 0; i < this.menus.length; i++) {
        document.getElementById(this.menus[i].nombreMenu).classList.remove("active");
      }
    } else {
      if (this.submenus != null) {
        for (let i = 0; i < this.submenus.length; i++) {
          if (document.getElementById(this.submenus[i].nombreMenu) != null &&
            document.getElementById(this.submenus[i].nombreMenu).classList != undefined) {
            document.getElementById(this.submenus[i].nombreMenu).classList.remove("active");
          }
        }
      }
    }    
    /**
     * Se pinta como seleccionado el menu al que el usuario dio clic
     */
    document.getElementById(index).classList.add("active");
  }
   
    
  /**
   * Metodo que permite detectar la accion de checked/unchecked en los menus
   * @param menu
   */
  onChangeCheckboxMenu(menu: Menu, checked: boolean) {
    menu.checkeado = checked;
    /**
     * Si el menu es padre y esta deseleccionado se procede a deseleccionar todos los submenus y las acciones
     */
    if(menu.menusHijos != null) {
      for (let i = 0; i < menu.menusHijos.length; i++) {
        let menuaux: Menu =  menu.menusHijos[i]; 
        menuaux.checkeado = menu.checkeado;
        if(menuaux.menuFuncion == null) {
           continue;
        }       
       }   
    }   
  }

  /**
   * Metodo que permite detectar la accion de checked/unchecked en las acciones
   * @param menuAccion
   */
  onChangeCheckboxAccion(accion: MenuAccion, checked: boolean) {   
    if(this.accionesByMenu == null || this.accionesByMenu.length == 0) {
       return;
    }

    for(let i=0; i<this.accionesByMenu.length; i++) {
      if(this.accionesByMenu[i].funcionCodigo.funcionCodigo == accion.funcionCodigo.funcionCodigo){
        accion.checkeado = checked;
      }
    }     
  }

  /**
   * Metodo que permite guardar los permisos seleccionados por el usuario
   */
  guardarPermisos() {
    this.spinner.show();
    /**
     * Las acciones registradas se actualizan para menu o submenu
     */   
    for (let i = 0; i < this.menus.length; i++) {
      /**
       * Guardo los permisos para los menu que son raiz
       */
      let menu: Menu = this.menus[i];
      this.obtenerObjetoPermisoAGuardar(menu, "M");
      /**
       * Se guardan los permisos para las acciones que tiene el menu raiz
       */
      if (menu.menuFuncion != null) {
        for (let j = 0; j < menu.menuFuncion.length; j++) {
          this.obtenerObjetoPermisoAGuardar(menu, menu.menuFuncion[j].menuFuncionIdentity.funcionCodigo);
        }
      }

      /**
       * Guardo los permisos para los submenus
       */
      if (menu.menusHijos != null) {
        for (let j = 0; j < menu.menusHijos.length; j++) {
          /**
           * Guardo el permiso para el submenu
           */
          let submenu: Menu = menu.menusHijos[j];
          this.obtenerObjetoPermisoAGuardar(submenu, "M");
           if (submenu != null && submenu.menuFuncion != null) {
             for (let k = 0; k < submenu.menuFuncion.length; k++) {
               let accion : MenuAccion = new MenuAccion();
               accion = submenu.menuFuncion[k]
               let codigo: string = submenu.menuFuncion[k].menuFuncionIdentity.funcionCodigo
               this.obtenerObjetoPermisoAGuardarAccion(accion, codigo);
             }
           }
        }
      }
    }
    this.spinner.hide();
    var instancia = this.router;
    swal("Éxito","Los permisos del perfil " + this.perfilSelected.nombrePerfil + 
    " se han guardado satisfactoriamente.","success")
    .then(
      function (response) {        
        instancia.navigate(['/home', {outlets: {'content': [ 'perfiles' ]}}]); 
      }
    );  
  }

  /**
   * Metodo que construye el objeto permiso para guardarlo
   * @param menu
   * @param funcionCodigo
   */
  obtenerObjetoPermisoAGuardar(menu: Menu, funcionCodigo: string) {    
    let perfilPermisoNuevo: PerfilPermiso = new PerfilPermiso();
    perfilPermisoNuevo.estado = menu.checkeado == true ? 1 : 0;
    if (funcionCodigo != "M") {
      perfilPermisoNuevo.perfilPermisoIdentity = {
        perfilId: this.perfilSelected.id,
        menuFuncionCodigo: funcionCodigo,
        menuCodigo: menu.codigo
      };
    } else {
      perfilPermisoNuevo.perfilPermisoIdentity = {
        perfilId: this.perfilSelected.id,
        menuFuncionCodigo: "M",
        menuCodigo: menu.codigo
      };
    }
    perfilPermisoNuevo.perfilPermisoIdentity.menuCodigo = menu.codigo;
    this.guardarPerfilPermiso(perfilPermisoNuevo);
  }
  
  /**
   * metodo que permite obtener los objetos de permisos para guardar
   * @param accion 
   * @param funcionCodigo 
   */
  obtenerObjetoPermisoAGuardarAccion(accion: MenuAccion, funcionCodigo: string) {    
    let perfilPermisoNuevo: PerfilPermiso = new PerfilPermiso();
    perfilPermisoNuevo.estado = accion.checkeado == true ? 1 : 0;
    perfilPermisoNuevo.perfilPermisoIdentity = {
      perfilId: this.perfilSelected.id,
      menuFuncionCodigo: funcionCodigo,
      menuCodigo: accion.menuFuncionIdentity.menuCodigo
    };    
       
    perfilPermisoNuevo.perfilPermisoIdentity.menuCodigo = accion.menuFuncionIdentity.menuCodigo;      
    this.guardarPerfilPermiso(perfilPermisoNuevo);
  }

  /**
   * Metodo que crea o actualiza el registro de permiso dado por el usuario
   * @param perfilPermiso
   */
  guardarPerfilPermiso(perfilPermiso: PerfilPermiso) {
    this.permisosService.createPermisosPorPerfil(perfilPermiso).subscribe(
      data => {
        //console.log("Se guardo el registro exitosamente");
      },
      error => {
        swal("Error",error.message,"error");
      }
    );
  }
}
