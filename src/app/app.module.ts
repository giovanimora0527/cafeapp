/*
* Archivo: app.module.ts
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

/**
 * Componentes de Angular
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule } from '@angular/http';
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, Location, LocationStrategy, HashLocationStrategy } from "@angular/common";
import { StorageServiceModule } from 'angular-webstorage-service';
import { ErrorInterceptor } from "./_helpers/error.interceptor";
import { JwtInterceptor } from "./_helpers/jwt.interceptor";
import { NgxSpinnerModule } from 'ngx-spinner';
import { DataTableModule } from "angular-6-datatable";
import { ArchwizardModule } from 'angular-archwizard';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MyDatePickerModule } from 'mydatepicker';
import { NgxTrimDirectiveModule } from 'ngx-trim-directive';
import { NgbModule, NgbPaginationModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';

/**
 * Directivas
 */
import { Directivas} from './_directives/directiva/directiva.directive';

/**
 * Componentes de la aplicación
 */
import { AppComponent } from './app.component';
import { SidebarComponent } from './components/shared/sidebar/sidebar.component';
import { MenusComponent } from './components/administracion/menus/menus.component';
import { PerfilesComponent } from './components/administracion/perfiles/perfiles.component';
import { FooterComponent } from './components/shared/footer/footer.component';
import { ConfiguracionComponent } from './components/shared/configuracion/configuracion.component';
import { LoginComponent } from './components/autenticacion/login/login.component';
import { ForgotPasswordComponent } from './components/autenticacion/forgot-password/forgot-password.component';
import { HeaderComponent } from './components/shared/header/header.component';
import { HomeComponent } from './components/home/home.component';
import { UsuariosComponent } from './components/administracion/usuarios/usuarios.component';
import { PermisosComponent } from './components/administracion/permisos/permisos.component';
import { CambiarContrasenaComponent } from './components/autenticacion/cambiar-contrasena/cambiar-contrasena.component';

import { WelcomeComponent } from './components/shared/welcome/welcome.component';
import { NotFoundComponent } from './components/shared/not-found/not-found.component';


/**
 * Rutas
 */
import { ROUTING } from "./app.routes";

/**
 * Services
 */
import { MenuService } from './_services/administracion/menu/menu.service';
import { UsuarioService } from './_services/administracion/usuario/usuario.service';
import { AccionMenuService } from './_services/administracion/menu/accionmenu.service';
import { PerfilesService } from './_services/administracion/perfiles/perfiles.service';
import { AutenticacionService } from './_services/autenticacion/autenticacion.service';
import { TipoDocumentoService } from './_services/shared/tipo-documento.service';



/**
 * @author Giovanni Mora Jaimes 
 * @summary versión realizada para el proyecto de facturacion electronica
 */
@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    MenusComponent,
    HeaderComponent,
    HomeComponent,
    UsuariosComponent,
    PerfilesComponent,
    FooterComponent,
    ConfiguracionComponent,
    Directivas,
    LoginComponent,
    ForgotPasswordComponent,
    PermisosComponent,
    CambiarContrasenaComponent,    
    WelcomeComponent,    
    NotFoundComponent    
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NoopAnimationsModule,   
    ROUTING,
    HttpClientModule, 
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    StorageServiceModule,
    NgxSpinnerModule,
    DataTableModule,
    ArchwizardModule,
    DragDropModule,
    MyDatePickerModule,
    NgxTrimDirectiveModule,
    NgbModule, NgbPaginationModule, NgbAlertModule
  ],
  exports: [LoginComponent],
  providers: [
    Location, {provide: LocationStrategy, useClass: HashLocationStrategy},
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    MenuService, UsuarioService, Directivas, AccionMenuService, PerfilesService, 
    AutenticacionService, TipoDocumentoService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
