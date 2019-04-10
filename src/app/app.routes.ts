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
import { TipologiasComponent } from './components/administracion/tipologias/tipologias.component';
import { GestionarEpsIpsComponent } from './components/administracion/erps-ips/gestionar-eps-ips/gestionar-eps-ips.component';
import { ServiciosmecanismopagoComponent } from './components/administracion/serviciosmecanismopago/serviciosmecanismopago.component';
import { GlosasComponent } from './components/administracion/glosas/glosas.component';
import { CupsComponent } from './components/administracion/cups/cups.component';
import { CieComponent } from './components/administracion/cie/cie.component';
import { HistoricoComponent } from './components/administracion/cups/historico/historico.component';
import { CumsComponent } from './components/administracion/cums/cums.component';
import { HistoricocumsComponent} from './components/administracion/cums/historicocums/historicocums.component';
import { HistoricocieComponent} from './components/administracion/cie/historicocie/historicocie.component';
import { NotFoundComponent} from './components/shared/not-found/not-found.component';
import { GestionarIpsComponent } from './components/administracion/gestionar-ips/gestionar-ips.component';
import { OperacionesIpsComponent } from './components/administracion/gestionar-ips/operaciones-ips/operaciones-ips.component';

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
         { path: "tipologia", component: TipologiasComponent, outlet: 'content' },
         { path: "gestionar-ips-erps", component: GestionarEpsIpsComponent, outlet: 'content' },
         { path: "glosas", component: GlosasComponent, outlet: 'content' },
         { path: "servicios-mecanismos-pago", component: ServiciosmecanismopagoComponent, outlet: 'content' },
         { path: "gestionar-cups", component: CupsComponent, outlet: 'content' },
         { path: "gestionar-cie", component: CieComponent, outlet: 'content' },
         { path: "gestionar-cums", component: CumsComponent, outlet: 'content' },   
         { path: "historico-cups", component: HistoricoComponent, outlet: 'content' },
         { path: "historico-cums", component: HistoricocumsComponent, outlet: 'content' },
         { path: "historico-cie", component: HistoricocieComponent, outlet: 'content' },
         { path: "gestionar-ent", component: GestionarIpsComponent, outlet: 'content' },
         { path: "operaciones-ent/:idRelacion", component: OperacionesIpsComponent, outlet: 'content' },
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