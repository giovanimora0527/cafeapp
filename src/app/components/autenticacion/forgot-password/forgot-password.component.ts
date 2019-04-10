import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

/**
 * Componente de sweetalert
 */
import swal from "sweetalert2";
import { ValueTransformer } from '@angular/compiler/src/util';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { AutenticacionService } from '../../../_services/autenticacion/autenticacion.service';
import { Directivas } from 'src/app/_directives/directiva/directiva.directive';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent implements OnInit {
  submitted = false;
  anio : number;

  public rememberForm: FormGroup;
  emailRegex = /([\w\.\-_]+)?\w+@[\w-_]+(\.\w+){1,}/;

  constructor(private formBuilder: FormBuilder, 
    private autenticacionService: AutenticacionService,
    private router: Router,
    private spinner: NgxSpinnerService) {
    this.anio = (new Date).getFullYear(); 
    let value = sessionStorage.getItem("refresh");  
    if(value != null) {        
      sessionStorage.removeItem("refresh");     
      window.location.reload();
      return;
    }    
   }

  ngOnInit() {
    this.inicializarForm();   
  }
  
  /**
   * Metodo que permite inicializar el formulario para recoirdar contraseña
   */
  inicializarForm(){
    /**
     * Validadores del formulario de login
     */
    this.rememberForm = this.formBuilder.group({
      email: new FormControl("", [
        Validators.required, 
        Validators.maxLength(255),
        Validators.pattern(this.emailRegex)
       ]
      ),
      identificacion: new FormControl("", [ Validators.required, Validators.maxLength(50)]),      
    });    
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.rememberForm.controls;
  }
   
  /**
   * Metodo que recibe la informacion del formulario para recuperar la contrasena
   */
  recordarContrasena(){ 
    this.spinner.show(); 
    this.submitted = true;     

    // stop here if form is invalid
    if (this.rememberForm.invalid) { 
      this.spinner.hide();    
      return;
    }
    
    let obj = {
      usuario: this.rememberForm.get('email').value.toLowerCase(),
      identificacion: this.rememberForm.get('identificacion').value
    }
    
    
    this.autenticacionService.rememberPassword(obj)
    .subscribe(
      data => {        
        Directivas.resetFormValidator(this.rememberForm);
        this.submitted = false; 
        this.spinner.hide();
        swal("Éxito","Se ha enviado un correo electrónico con link, por favor verifique","success");
        return;
      },
      error => {
        swal("Error", error.message ,"error");
        this.spinner.hide();
      }
    );

  }

}
