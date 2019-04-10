import { Component, OnInit, Renderer2, ElementRef, Inject } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { Menu } from '../../../_models/administracion/menus/menu';

/**
 * Componente de sweetalert
 */
import swal from "sweetalert2";

/**
 * Directivas
 */
import { Directivas } from "../../../_directives/directiva/directiva.directive";

/**
 * Servicios
 */
import { MenuService } from "../../../_services/administracion/menu/menu.service";
import { AccionMenuService } from "../../../_services/administracion/menu/accionmenu.service";

/**
 * Modelos
 */
import { Estado } from "../../../_models/administracion/menus/estado";
import { first, ignoreElements } from "rxjs/operators";
import { Acciones } from "src/app/_models/administracion/menus/acciones";
import { MenuAccion } from "../../../_models/administracion/menus/menu-accion";
import { AutenticacionService } from "src/app/_services/autenticacion/autenticacion.service";
import { Router } from "@angular/router";
import { PerfilPermiso } from "src/app/_models/administracion/menus/perfil-permiso";
import { PermisosService } from "src/app/_services/administracion/permisos/permisos.service";

@Component({
  selector: "app-menus",
  templateUrl: "./menus.component.html",
  styleUrls: ["./menus.component.css"]
})
export class MenusComponent implements OnInit {
  title: string = "Menús";
  menus: Menu[] = [];
  submenus: Menu[] = [];
  estados: Estado[];
  checkItem: string = "";
  visible: boolean = false;
  menuSelected: Menu = new Menu();
  estadoMenu: boolean = false;
  padreMenu: string = "";
  titleModal: string = "";
  isEdicion: boolean = false;
  classCss: string = "list-group-item d-flex justify-content-between align-items-center";
  iconos: any[];
  iconoSelected: string;
  isMenu: boolean = false;
  mostrarFuncion: boolean = true;

  public menuForm: FormGroup;
  submitted = false;

  edoMenu = new FormControl();
  acciones: Acciones[] = [];
  accionesByMenu: MenuAccion[] = [];
  menuAcciones: MenuAccion[] = [];
  menuAccionesAux: MenuAccion[] = [];
  accionesActivas: boolean = false;

  regexSoloNumeros = /^[0-9]+$/;

  /**
   * Opciones del modal
   */
  titulo: string = "";
  text: string = "";
  type: string = "";
  showCancelButton: boolean = false;
  confirmButtonColor: string = "";
  cancelButtonColor: string = "";
  confirmButtonText: string = "";
  closeOnConfirm: boolean = false;
  static menuService: any;

  /**
   * Variables para validacion de permisos
   */
  permisosXPerfilArray: PerfilPermiso[] = [];
  arrayPermisos: any[] = [];
  permisosCode: Map<string, string>;
  hasPermissionsUpload: boolean = false;  
  hasPermissionsCreate: boolean = false; 
  hasPermissionsDelete: boolean = false; 
  hasPermissionsUpdate: boolean = false; 
  hasPermissionsDownload: boolean = false;
  hasPermissionRead: boolean = false; 

  constructor(
    private formBuilder: FormBuilder,
    private menuService: MenuService,
    private accionMenuService: AccionMenuService,
    private spinner: NgxSpinnerService, 
    private autentication: AutenticacionService,
    private permisosService: PermisosService,
    private router: Router   
  ) {
    this.validarPermisos();
    let url: string = this.router.routerState.root.children[0].firstChild.routeConfig.path;
    this.validarAcciones(url);
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
   * Metodo el cual valida las acciones que tiene permiso el perfil
   */
  validarAcciones(url: string){
    this.permisosService.getPermisosPerfiles()
    .pipe(first())
    .subscribe(
      data => { 
        this.permisosXPerfilArray = data;         
        if(this.permisosXPerfilArray != null && this.permisosXPerfilArray.length > 0) {
          let menu: string = "";
          for(let i=0; i<this.permisosXPerfilArray.length; i++) {
            let element = this.permisosXPerfilArray[i];
            menu = element["menuCodigo"]["rutaMenu"];
            if (menu == url && this.autentication.getPerfilId() == element["perfilId"]["id"]  && element["estado"] == 1) {                          
                this.arrayPermisos.push(element.perfilPermisoIdentity.menuFuncionCodigo);
              } 
          }  
        }
        this.leerPermisos();       
      });
  }
  
  /**
   * Metodo que lee los permisos asociados y los implementa en la vista
   */
  async leerPermisos(){    
    if(this.arrayPermisos != null && this.arrayPermisos.length > 0) {     
      for(let i=0; i < this.arrayPermisos.length; i++) {
        if(this.arrayPermisos[i] == Directivas.TIPO_PERMISO_UPL) {
          this.hasPermissionsUpload = true;
        }
        if(this.arrayPermisos[i] == Directivas.TIPO_PERMISO_DWL) {
          this.hasPermissionsDownload = true;
        }
        if(this.arrayPermisos[i] == Directivas.TIPO_PERMISO_ADD) {
          this.hasPermissionsCreate = true;
        }
        if(this.arrayPermisos[i] == Directivas.TIPO_PERMISO_UPD) {
          this.hasPermissionsUpdate = true;
        }
        if(this.arrayPermisos[i] == Directivas.TIPO_PERMISO_DEL) {
          this.hasPermissionsDelete = true;
        }
        if(this.arrayPermisos[i] == Directivas.TIPO_PERMISO_LECT) {
          this.hasPermissionRead = true;
        }
      }
    }
      
    
  }

  ngOnInit() {
    this.cargarMenus();
    this.inicializarFormsMenu();
    this.cargarIconosMenus();
    this.getAccionesMenu();
  }

  /**
   * Metodo que obtiene todas las acciones del menu
   */
  getAccionesMenu() {
    this.acciones = [];
    this.menuService.getAccionesMenu()
    .subscribe(
      data => {
         this.acciones = data;         
         if(this.acciones != null) {
           Directivas.orderAsc(this.acciones, "detalleMenuFuncion");
           for(let i=0; i<this.acciones.length; i++) {
            this.acciones[i].checkeado = 0;
           }
         }        
    });
  }

  /**
   * Metodo que obtiene los estados del menu
   */
  cargarEstadosMenu() {
    this.estados = Directivas.cargarEdosMenu();    
  }

  /**
   * Metodo que permite inicializar el formulario
   */
  inicializarFormsMenu() {
    /**
     * Validadores del formulario de creacion de menus
     */
    this.menuForm = this.formBuilder.group({
      estado: new FormControl("", Validators.compose([Validators.required])),
      padre: new FormControl("", Validators.required),
      orden: new FormControl("", [
        Validators.required,
        Validators.pattern(this.regexSoloNumeros)
      ]),
      codigo: new FormControl("", [
        Validators.required,
        Validators.maxLength(5)
      ]),
      ruta: new FormControl("", [
        Validators.required,
        Validators.maxLength(500)
      ]),
      icono: new FormControl("", Validators.required),
      nombre: new FormControl("", Validators.required),
      descripcion: new FormControl("", Validators.required)
    });
    Directivas.resetFormValidator(this.menuForm);
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.menuForm.controls;
  }

  /**
   * Metodo que permite cargar los menus y submenus del sistema
   */
  public cargarMenus() {
    this.menus = [];    
    this.menuService.getMenus()
    .pipe(first())
    .subscribe(data => {     
      this.menus = Directivas.orderAsc(data[0].menusHijos, 'nombreMenu');
      this.submenus = [];
      this.accionesByMenu = [];
    });
  }

  /**
   * Metodo que permite cargar los submenus cuando el usuario da clic en el menu raiz
   * @param idMenu
   */
  public cargarSubmenus(menu: Menu) {
    this.selectMenu(menu, this.esMenu(menu));
    this.checkearMenusModoEdicion(menu);
    if (menu != null) {
      this.menuSelected = menu;
      this.submenus = Directivas.orderAsc(menu.menusHijos, "nombreMenu");
      if (!this.isEdicion) {
        this.cargarAccionesMenu(menu);
      }
    } else {
      this.submenus = [];
    }
  }

  /**
   * Metodo que permite cargar el formulario de nuevo menu y sus diferentes opciones
   */
  abrirNewMenu() {    
    this.inicializarFormsMenu();
    this.cargarEstadosMenu();
    document.getElementById("codigo_menu").removeAttribute("disabled");
    this.menuSelected = new Menu();
    this.getAccionesMenu();
    this.titleModal = "Datos del Menú";
    this.isEdicion = false;
  }
  
  /**
   * Metodo que inicializa la lista de css del modal en la seccion acciones
   */
  removerElementosCSSActive() {    
      for (let i = 0; i < this.acciones.length; i++){
        let codigo =  this.acciones[i].funcionCodigo;
        var item = document.getElementById(codigo);
        item.classList.remove("active");
      }
  }

  /**
   * Metodo que permite pintar si el item esta chequeado
   * Este metodo es usado por el evento que selecciona las funciones permitidas
   */
  checkearItem(codigo: string) {
    if (!this.isEdicion) {
      this.checkearItemCrear(codigo);
      return;
    }

    if (this.acciones.length == 0) {
      return;
    }

    var item = document.getElementById(codigo);
    item.classList.add("active");

    for (let i = 0; i < this.acciones.length; i++) {
      if (this.acciones[i].funcionCodigo == codigo) {
        if (this.acciones[i].checkeado == 1) {
          var instancia = this.acciones[i];
          swal({
            text:
              "Al quitar esta función del menú, se eliminará de todos los perfiles que tengan asociada esta función.",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            cancelButtonText: "Cancelar",
            confirmButtonText: "Aceptar"
          }).then(function(response) {
            if (response.value) {
              instancia.checkeado = 0;
              item.classList.remove("active");
            }
            if (response.dismiss) {
              instancia.checkeado = 1;
              item.classList.add("active");
            }
          });
        } else {
          this.acciones[i].checkeado = 1;
        }
      }
    }
  }

  /**
   * Metodo que permite pintar si el item esta chequeado
   * Este metodo es usado por el evento que selecciona las funciones permitidas en la ventana crear
   */
  checkearItemCrear(codigo: string) {
    if (this.acciones.length == 0) {
      return;
    }

    var item = document.getElementById(codigo);
    if (item.classList.contains("active")) {
      item.classList.remove("active");
    } else {
      item.classList.add("active");
    }

    for (let i = 0; i < this.acciones.length; i++) {
      if (this.acciones[i].funcionCodigo == codigo) {
        if (this.acciones[i].checkeado == 1) {
          this.acciones[i].checkeado = 0;
          item.classList.remove("active");
        } else {
          this.acciones[i].checkeado = 1;
          item.classList.add("active");
        }
      }
    }
  }

  /**
   * Metodo que permite cargar la lista de iconos para utilizar en la creacion del menu
   */
  cargarIconosMenus() {
    this.iconos = Directivas.getIconosMenu();
  }

  /**
   * Metodo que cierra y limpia el modal
   * @param menu
   */
  cancelButtonAction(menu: FormGroup) {
    var instancia = this.submitted;
    var instancia2 = this;
    swal({
      text: "¿Desea salir sin guardar cambios?",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Aceptar"
    }).then(function(response) {
      if (response.value) {
        document.getElementById("close-btn-modal").click();
        Directivas.resetFormValidator(menu);
        instancia = false;
        instancia2.getAccionesMenu();        
      }
    });
  }

  /**
   * Metodo que permite cargar los datos para editar del menu
   * @param id
   */
  editMenu(menu: Menu) {
    this.isEdicion = true;
    this.cargarEstadosMenu();   
    this.titleModal = "Editar datos del menú: " + menu.nombreMenu;    
    this.menuForm.get("estado").setValue(menu.estado, { onlySelf: true });
    this.menuForm.get("padre").setValue(menu.padreMenu, { onlySelf: true });
    this.menuForm.get("orden").setValue(menu.ordenMenu);
    this.menuForm.get("codigo").setValue(menu.codigo);
    this.menuForm.get("ruta").setValue(menu.rutaMenu);
    this.menuForm.get("nombre").setValue(menu.nombreMenu);
    this.menuForm.get("descripcion").setValue(menu.descripcionMenu);
    this.menuForm.get("icono").setValue(menu.iconoMenu != "" ? menu.iconoMenu : null);
    this.estadoMenu = menu.estado == 0 ? false : true;
    this.padreMenu = menu.padreMenu == "" ? "" : menu.padreMenu;
    this.menuSelected = menu;
    document.getElementById("codigo_menu").setAttribute("disabled", "disabled");
    this.removerElementosCSSActive();
    this.checkearMenusModoEdicion(menu);
  }
  

  /**
   * Metodo que permite recorrer las funciones y checkear la que cada Menu tiene activa
   * al momento de editar un menu
   */
  checkearMenusModoEdicion(menu: Menu) {   
    this.cargarAccionesMenu(menu);    
    for (let j = 0; j < this.acciones.length; j++) {
      this.acciones[j].checkeado = 0;
    }
    
      for (let i = 0; i < this.acciones.length; i++) {
        for (let j = 0; j < this.accionesByMenu.length; j++) {
          if (this.acciones[i].funcionCodigo == this.accionesByMenu[j].funcionCodigo.funcionCodigo) {
            this.acciones[i].checkeado = this.accionesByMenu[j].estado;
            let codigo = this.accionesByMenu[j].funcionCodigo.funcionCodigo;
            var item = document.getElementById(codigo);
            if(this.acciones[i].checkeado == 1) {
              item.classList.add("active");
            } else {
              item.classList.remove("active");
            }
          }
        }
      }    
  }


  /**
   * Metodo que permite eliminar un menú seleccionado
   * @param id
   */
  removeMenu(menu: Menu) {
    var _mService = this.menuService;
    let onConfirm = this.createAlert(menu);
    var instancia = this;

    onConfirm.then(function(response) {
      if (response.value) {
        _mService.eliminarMenu(menu).subscribe(
          data => {
            swal(
              "Éxito",
              "El Menú " + menu.nombreMenu + " se eliminó satisfactoriamente",
              "success"
            );
            instancia.cargarMenus();
            return;
          },
          error => {
            swal("Error", error.message, "error");
            return;
          }
        );
      }
    });
  }

  /**
   * Metodo que permite cargar las acciones validas para un menu o submenu
   * y pinta en la vista en la columna de acciones
   * @param menuId
   */
  cargarAccionesMenu(menu: Menu) {
    this.selectMenu(menu, this.esMenu(menu));
    let codigo : string = menu.codigo;       
    this.accionMenuService
      .getMenuAccionesByMenu(codigo)
      .pipe(first())
      .subscribe(
        data => {
          this.accionesByMenu = data;
          this.validarIfAccionesActivas();
        },
        error => {
          this.accionesByMenu = [];
          this.validarIfAccionesActivas();
        }
      );
  }

  /**
   * Metodo que permite validar si el menu tiene acciones activas
   */
  validarIfAccionesActivas() {
    if (this.accionesByMenu.length > 0) {
      for (let i = 0; i < this.accionesByMenu.length; i++) {
        if (this.accionesByMenu[i].estado == 1) {
          this.accionesActivas = true;
          return;
        } else {
          this.accionesActivas = false;
        }
      }
    }
  }

  /**
   * Metodo que permite validar 
   * @param nombre 
   */
  validarNombreMenu(nombre: string, padre: string){   
    let menuPadre: Menu = this.menus.find(m => m.codigo.toLowerCase() == padre.toLowerCase());    
    if(menuPadre != null && menuPadre.menusHijos != null && menuPadre.menusHijos.find(x=> x.nombreMenu.toLowerCase() ==
    nombre.toLowerCase()) ) {
      return true;
    }
    return false;
  }
  
  /**
   * Metodo que valida si el menu dado es un menú raíz
   * @param nombreMenu 
   */
  validarMenusRaiz(nombreMenu: string) {   
    let menuPadre: Menu = this.menus.find(m => m.nombreMenu.toLowerCase() == nombreMenu.toLowerCase());
    return menuPadre == undefined? false : true;
  }

  /**
   * Metodo que permite guardar un nuevo menú
   * @param estado
   * @param padre
   * @param orden
   * @param codigo
   * @param ruta
   * @param icono
   * @param nombre
   * @param descripcion
   */
  guardarMenuNuevo() {
    this.spinner.show();
    this.submitted = true;
    // stop here if form is invalid
    if (this.menuForm.invalid) {
      this.spinner.hide();
      return;
    }    

    var menuForm: FormGroup;
    menuForm = this.menuForm;    

    if (!this.isEdicion) {
      if (
        Directivas.validaCodigoMenu(
          this.menuForm.get("codigo").value,
          this.menus
        )
      ) {
        swal(
          "Error",
          "El código ya existe, por favor verifique e intente de nuevo",
          "error"
        );
        this.spinner.hide();
        return;
      }
    }

    /**
     * Creo el objeto menu
     */
    let menu: Menu = new Menu();
    menu = this.getMenuGuardar(); 
    /**
     * Creo o modifico el objeto de acciones para el menú
     */
    this.getAccionesSeleccionadas(menu.codigo);
    if (this.isEdicion) { 
      let banderaComparator: number =  Directivas.validarIsMenuEquals(menu, this.menus); 
     
      switch(banderaComparator) {
         case 1: {
          swal(
            "Error",
            "El nombre del menú ya existe.",
            "error"
          );
          this.spinner.hide();  
          break;
         }
         case 2: {
          swal(
            "Error",
            "El nombre del menú ya existe como menú raíz.",
            "error"
          );
          this.spinner.hide();  
          break;
         }         
      }

      if(banderaComparator != -1) {
        return;
      }
     
      this.menuService
        .updateMenú(menu)
        .pipe(first())
        .subscribe(
          data => {           
            if(menu.estado == 1) {
              if (this.menuAcciones != null || this.menuAcciones.length > 0) {
                for (let i = 0; i < this.menuAcciones.length; i++) {
                  this.accionMenuService
                    .createMenuAccion(this.menuAcciones[i])
                    .pipe(first())
                    .subscribe(
                      data => {
                        console.log("Se guardo la acción");
                      },
                      error => {
                        swal(
                          "Error",
                          error.message,
                          "error"
                        );
                        this.spinner.hide();
                        return;
                      }
                    );
                 }
              } 
            }
              
            this.cargarMenus();
            this.getAccionesMenu(); 
            swal("Éxito", "El menú " + menu.nombreMenu + " se ha modificado satisfactoriamente.","success");
            document.getElementById("close-btn-modal").click();
            this.isEdicion = false;
            this.submitted = false;
            this.menuForm.reset();
            this.spinner.hide();
            return; 
          },
          error => {
            swal(
              "Error",
              error.message,
              "error"
            );
            this.spinner.hide();
            return;
          }
        );
    } else {
          if(this.validarNombreMenu(menu.nombreMenu, menu.padreMenu)){
            swal(
              "Error",
              "El nombre del menú ya existe dentro del menú seleccionado.",
              "error"
            );
            this.spinner.hide();
            return;
          }
      
          if(this.validarMenusRaiz(menu.nombreMenu)) {
            swal(
              "Error",
              "El nombre del menú ya existe como menú raíz.",
              "error"
            );
            this.spinner.hide();
            return;
          }
      this.menuService
        .createMenu(menu)
        .pipe(first())
        .subscribe(
          data => {          
            if(menu.estado == 1) {
              if (this.menuAcciones != null || this.menuAcciones.length > 0) {
                for (let i = 0; i < this.menuAcciones.length; i++) {
                  if (this.menuAcciones[i].funcionCodigo.chekeado) {
                    this.accionMenuService
                      .createMenuAccion(this.menuAcciones[i])                  
                      .subscribe(
                        data => {                        
                          console.log("Se guardo la acción");
                        },
                        error => {
                          swal(
                            "Error",
                           error.message,
                            "error"
                          );
                          this.spinner.hide();                       
                        }
                      );
                   } 
                }    
              }
            }
            this.spinner.hide();                   
            this.cargarMenus();         
            this.getAccionesMenu();           
            swal("Éxito","El menú " + menu.nombreMenu + " se ha creado satisfactoriamente.", "success");
            document.getElementById("close-btn-modal").click();
            this.isEdicion = false;
            this.submitted = false;
            this.menuForm.reset();  
            return;
          },
          error => {
            swal(
              "Error",
              error.message,
              "error"
            );
            this.spinner.hide();
            return;
          }
        );
    }
  }

  /**
   * Metodo que obtiene las acciones seleccionadas por el usuario para el menu que se va a guardar y/o editar
   * @param codigoMenu
   */
  getAccionesSeleccionadas(codigoMenu: string) {
    this.menuAcciones = [];
    if (this.acciones != null || this.acciones.length > 0) {
      for (let i = 0; i < this.acciones.length; i++) {
        var accionMenu = new MenuAccion();
        accionMenu.menuFuncionIdentity = {
          funcionCodigo: this.acciones[i].funcionCodigo,
          menuCodigo: codigoMenu
        };
        accionMenu.creadoPor = 1;
        accionMenu.funcionCodigo = {
          funcionCodigo: this.acciones[i].funcionCodigo,
          detalleMenuFuncion: this.acciones[i].detalleMenuFuncion,
          estado: this.acciones[i].checkeado,
          creadoPor: 1,
          fechaCreacion: Date.now().toString(),
          modificadoPor: 1,
          fechaModificacion: Date.now().toString(),
          chekeado: this.acciones[i].checkeado
        };
        accionMenu.estado = this.acciones[i].checkeado;
        this.menuAcciones.push(accionMenu);
      }
    }
  }

  /**
   * Metodo que retorna el objeto menu a guardar
   */
  getMenuGuardar(): Menu {
    /**
     * Creo el objeto menu
     */
    let menu: Menu = new Menu();
    menu.codigo = this.menuForm.get("codigo").value;
    if (this.menuForm.get("padre").value != "") {
      menu.padreMenu = this.menuForm.get("padre").value;
    } else {
      menu.padreMenu = "---";
    }
    menu.ordenMenu = this.menuForm.get("orden").value;
    menu.rutaMenu = this.menuForm.get("ruta").value;
    menu.iconoMenu = this.menuForm.get("icono").value;
    menu.nombreMenu = this.menuForm.get("nombre").value;
    menu.descripcionMenu = this.menuForm.get("descripcion").value;
    menu.estado = this.menuForm.get("estado").value == 1 ? 1 : 0;
    return menu;
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
      var item = document.getElementById(menus[i].nombreMenu);
      item.classList.remove("active");
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

  async createAlert(menu: Menu) {
    try {
      let result = await swal({
        text:
          "¿Desea eliminar el menú '" + menu.nombreMenu.toLowerCase() + "' ? ",
        type: "warning",
        showCancelButton: true,
        confirmButtonText: "Aceptar",
        cancelButtonText: "Cancelar",
        cancelButtonColor: "#d33",
        reverseButtons: false,
        allowOutsideClick: false
      });
      // SUCCESS
      return result;
    } catch (e) {
      // Fail!
      console.error(e);
    }
  }

  /**
   * Metodo que permite conocer cual icono selecciono el usuario
   * @param icono
   */
  selectIcono(icono: string) {
    this.iconoSelected = icono;
  }

  /**
   * Metodo que inicializa el formulario despues de cerrar el modal
   */
  closeModal() {
    Directivas.resetFormValidator(this.menuForm);
    this.submitted = false;
    this.getAccionesMenu();
  }

  
}