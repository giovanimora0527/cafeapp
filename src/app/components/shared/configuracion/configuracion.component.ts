import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';

/**
 * Componente de sweetalert
 */
import swal from "sweetalert2";
import { AutenticacionService } from 'src/app/_services/autenticacion/autenticacion.service';
import { pipe } from 'rxjs';
import { first } from 'rxjs/operators';
import { Directivas } from 'src/app/_directives/directiva/directiva.directive';
import { Router } from '@angular/router';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.component.html'
})
export class ConfiguracionComponent implements OnInit {

  regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!-\~])[a-zA-Z\d!-\~]{8,}$/g;
  public passForm: FormGroup; 
  submitted = false;

  constructor(private formBuilder: FormBuilder, private router: Router,
    private autenticacionService: AutenticacionService,
    private spinner: NgxSpinnerService) { }

  ngOnInit() {
    this. inicializarForm();
  }

  inicializarForm(){
    /**
     * Validadores del formulario de creacion de menus
     */
    this.passForm = this.formBuilder.group({     
      passAnt: new FormControl("", [
        Validators.required,        
        Validators.maxLength(255),
        Validators.minLength(8)        
      ]),
      passNew: new FormControl("", [
        Validators.required, 
        Validators.minLength(8),
        Validators.maxLength(255)       
      ]),
      passConf: new FormControl("", [
        Validators.required, 
        Validators.minLength(8),
        Validators.maxLength(255)       
      ])
    });
  }

   // convenience getter for easy access to form fields
  get f() {
    return this.passForm.controls;
  }

  /**
   * Metodo que permite cambiar la contrasena
   */
   cambiarContrasena(){
    this.submitted = true;     
    if (this.passForm.invalid) {     
      return;
    }
    
    let passAnt: string = this.passForm.get('passAnt').value;
    let passNew: string = this.passForm.get('passNew').value;
    let passConf: string = this.passForm.get('passConf').value;    

    if(passNew.length < 8) {
      swal("Error","Por favor ingrese al menos 8 caracteres", "error");
      return;
    }
    
    if(!passNew.match(this.regex)) {
      swal("Error","Debe contener al menos un número, una letra minúscula, una mayúscula y un simbolo", "error");
      return;
    }

    if(passConf !== passNew) {
      swal("Error","Las contraseñas no coinciden, por favor verifique e intente de nuevo", "error");
      return;
    }  
    
    if(passAnt == passNew) {
      swal("Error","La contraseña no debe ser igual a la contraseña anterior.", "error");
      return;
    }  

    let obj = {
      "claveActual": passAnt,
      "claveNueva": passNew
    }
 
    this.autenticacionService.cambiarPassword(obj)
    .pipe(first())
    .subscribe(
      data => {
        Directivas.resetFormValidator(this.passForm); 
        this.submitted = false;
        var instancia = this.router; 
        swal("Éxito","La contraseña se ha cambiado satisfactoriamente", "success") 
        .then(
          function(response){
            instancia.navigate(['']);
          }
        );;
        return;
      },
      error => {
        swal("Error","Algo ocurrió, Error:  " + error.message, "error");
        return;
      }
    );
   } 
  
}
