import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from "@angular/common/http";
import { Observable, throwError, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { Router } from '@angular/router';

import { AutenticacionService } from "../_services/autenticacion/autenticacion.service";
/**
 * Componente de sweetalert
 */
import swal from "sweetalert2";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authenticationService: AutenticacionService,
    private router: Router) {        
}

  intercept(request: HttpRequest<any>,  next: HttpHandler): Observable<HttpEvent<any>> {        
    return next.handle(request).pipe(
      catchError(err => {
        this.handleAuthError(err);
        const error = err.error || err.statusText;
        return throwError(error);
      })
    );
  }

  /**
   * manage errors
   * @param err
   * @returns {any}
   */
  private handleAuthError(err: HttpErrorResponse): Observable<any> {
    //handle your auth error or rethrow    
    if (err.status == 400) {     
      // if you've caught / handled the error, you don't want to rethrow it unless you also want downstream consumers to have to handle it as well.
      return of(err.message);
    }
    if (err.status == 403) { 
      var instancia = this.router;
      swal("Error", "La sesión ha caducado.", "error").then(
        function(){
           instancia.navigate(['']);
        }
      );    
      // if you've caught / handled the error, you don't want to rethrow it unless you also want downstream consumers to have to handle it as well.
      return of(err.message);
    }
    if (err.status == 404) {     
      // if you've caught / handled the error, you don't want to rethrow it unless you also want downstream consumers to have to handle it as well.
      return of(err);
    }
    if (err.status == 0) {
      var instancia = this.router;
      swal("Información", "La sesión ha caducado.", "info").then(
        function(){
           instancia.navigate(['']);
        }
      );
     
      // if you've caught / handled the error, you don't want to rethrow it unless you also want downstream consumers to have to handle it as well.
      return of(err.message);
    }

    if (err.status == 500) {     
      // if you've caught / handled the error, you don't want to rethrow it unless you also want downstream consumers to have to handle it as well.
      return of(err.message);
    }
    throw err;
  }
}
