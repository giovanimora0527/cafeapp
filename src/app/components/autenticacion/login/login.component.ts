import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl} from "@angular/forms";

/**
 * Componente de sweetalert
 */
import swal from "sweetalert2";

/**
 * Servicios de autenticación
 */
import { AutenticacionService } from '../../../_services/autenticacion/autenticacion.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Session } from '../../../_models/autenticacion/session';

import { NgxSpinnerService } from "ngx-spinner";
import { EntidadService } from 'src/app/_services/administracion/entidad/entidad.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'] 
})
export class LoginComponent implements OnInit {
  submitted = false;
  anio : number;
  return: string = '';
  isHidden: boolean = true;
  emailRegex = /([\w\.\-_]+)?\w+@[\w-_]+(\.\w+){1,}/;

  public loginForm: FormGroup;

  constructor(private autenticacionService: AutenticacionService,
    private router: Router, private route: ActivatedRoute,
    private formBuilder: FormBuilder, private spinner: NgxSpinnerService) {     
      this.spinner.show();      
      this.anio = (new Date).getFullYear(); 
      let value = sessionStorage.getItem("refresh");
      if(value == undefined || value == null) {        
        sessionStorage.setItem("refresh","0");
        window.location.reload();
      } else {
        this.autenticacionService.logout();
        // Get the query params
        this.route.queryParams.subscribe(params => this.return = params['return'] || '/'); 
      }
  }

  ngOnInit() {
    this.spinner.hide();
    this.inicializarFormLogin();   
    this.autenticacionService.logout();
    this.isHidden = false;
  }

  inicializarFormLogin(){
    /**
     * Validadores del formulario de login
     */
    this.loginForm = this.formBuilder.group({
      usuario: new FormControl("", [ Validators.required, 
        Validators.maxLength(255), 
        Validators.pattern(this.emailRegex) ] 
      ),
      contrasena: new FormControl("", [ Validators.required, Validators.maxLength(255)]),      
    }); 
     
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }
  

  /**
   * Metodo que permite loguearse en el sistema
   */
  login(){  
    this.submitted = true;    
   
    // stop here if form is invalid
    if (this.loginForm.invalid) {     
      return;
    }

    /**
     * Logueandose en el sistema
     */   
    let credentials: Object = {
      "usuario": this.loginForm.get('usuario').value.toLowerCase(),
      "clave": this.loginForm.get('contrasena').value
    };
    
    this.autenticacionService.createSession(credentials)
      .subscribe(
        data => {         
          let token: string = data["token"]; 
          this.autenticacionService.setToken(data["status"], token, data["menu"]);
          let session: Session = new Session(data["token"], data["status"]);          
          this.autenticacionService.setCurrentSession(session); 
          sessionStorage.setItem("refresh", "0");                      
          this.router.navigate(['home']);
        }, 
        error => {         
          swal("Error", error.message, "error");
        }
    ); 
    
  }  

  cerrarSesion() {
    this.autenticacionService.logout();
  }
  

}
