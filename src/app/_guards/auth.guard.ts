import { Injectable } from "@angular/core";
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from "@angular/router";

import { Menu } from "../_models/administracion/menus/menu";
import { PermisosService } from "../_services/administracion/permisos/permisos.service";
import { Directivas } from "../_directives/directiva/directiva.directive";

@Injectable({ providedIn: "root" })
export class AuthGuard implements CanActivate {
   
  menus: Menu[] = [];
  arrayPermisos: any[] = [];

  constructor(
    private router: Router,
    private permisosService: PermisosService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot 
    ){
      let url: string = route.firstChild.routeConfig.path;     
    if (sessionStorage.getItem("currentUser")) { 
      return true; 
    }

    // not logged in so redirect to login page with the return url
    this.router.navigate([""], { queryParams: { returnUrl: state.url } });
    return false;
  }

}
