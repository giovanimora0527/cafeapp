/*
* Archivo: app.routes.ts
* Fecha: 01/01/2019
* Todos los derechos de propiedad intelectual e industrial sobre esta
* aplicacion son de propiedad exclusiva del GRUPO ASESORIA EN
* SISTEMATIZACION DE DATOS SOCIEDAD POR ACCIONES SIMPLIFICADA GRUPO ASD
  S.A.S.
* Su uso, alteracion, reproduccion o modificacion sin la debida
* consentimiento por escrito de GRUPO ASD S.A.S.
* autorizacion por parte de su autor quedan totalmente prohibidos.
*
* Este programa se encuentra protegido por las disposiciones de la
* Ley 23 de 1982 y demas normas concordantes sobre derechos de autor y
* propiedad intelectual. Su uso no autorizado dara lugar a las sanciones
* previstas en la Ley.
*/
import { Routes, RouterModule} from "@angular/router";
import { ModuleWithProviders } from "@angular/core";

import { MenusComponent } from './components/administracion/menus/menus.component';
import { HomeComponent } from './components/home/home.component';
import { WelcomeComponent } from './components/shared/welcome/welcome.component';
import { UsuariosComponent } from './components/administracion/usuarios/usuarios.component';
import { PerfilesComponent } from './components/administracion/perfiles/perfiles.component';
import { ConfiguracionComponent } from './components/shared/configuracion/configuracion.component';
import { LoginComponent } from './components/autenticacion/login/login.component';
import { ForgotPasswordComponent } from './components/autenticacion/forgot-password/forgot-password.component';
import { PermisosComponent } from './components/administracion/permisos/permisos.component';
import { CambiarContrasenaComponent } from './components/autenticacion/cambiar-contrasena/cambiar-contrasena.component';
import { TipoDocumentosComponent } from './components/administracion/tipo-documentos/tipo-documentos.component';
import { NotFoundComponent} from './components/shared/not-found/not-found.component';


import { AuthGuard } from "./_guards/auth.guard";
//data: { preload: true }


/**
 * @author Giovanni Mora Jaimes 
 * @summary versión realizada para el proyecto de facturacion electronica
 * para enrutamiento de la aplicación
 */

const appRoutes: Routes = [ 
    { path: "", component: LoginComponent, runGuardsAndResolvers: 'always'},
    { path: "recordar", component: ForgotPasswordComponent },    
    { path: "restaurar/validar",  component: CambiarContrasenaComponent }, 
    { path: "home", component: HomeComponent, canActivate: [AuthGuard], 
      runGuardsAndResolvers: 'always', 
      children: [
         { path: '', component: WelcomeComponent, outlet: 'content' },
         { path: "menus", component: MenusComponent, outlet: 'content' },
         { path: "usuarios", component: UsuariosComponent, outlet: 'content' },         
         { path: "configuracion", component: ConfiguracionComponent, outlet: 'content' },         
         { path: "perfiles", component: PerfilesComponent, outlet: 'content' },
         { path: "permisos/:idPerfil", component: PermisosComponent, outlet: 'content' },
         { path: "tipodoc", component: TipoDocumentosComponent, outlet: 'content' },
         { path: "not-found", component: NotFoundComponent, outlet: 'content' } 
      ]      
    },    
    // otherwise redirect to home   
    { path: "**", pathMatch: "full", redirectTo: "" }
  ]; 

  export const ROUTING: ModuleWithProviders = RouterModule.forRoot(appRoutes, {
    useHash: true, enableTracing: false,
    onSameUrlNavigation: 'reload'
  });