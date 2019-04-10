import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ErrorInterceptor } from './error.interceptor';
import { AutenticacionService } from '../_services/autenticacion/autenticacion.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {    
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {        
        // add authorization header with jwt token if available
        let currentUser;
        if(localStorage.getItem('currentUser') != null) {
            currentUser = localStorage.getItem('currentUser');
        } else {
            currentUser = sessionStorage.getItem('currentUser');
        }
                    
        if (currentUser) {            
            request = request.clone({
                setHeaders: { 
                     Authorization: 'Bearer ' + currentUser
                }                
            });
            localStorage.removeItem('currentUser');
        }  
        return next.handle(request);
    }


}