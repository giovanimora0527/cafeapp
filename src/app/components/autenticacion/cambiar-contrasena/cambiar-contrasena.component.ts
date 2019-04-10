import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { first } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';

/**
 * Componente de sweetalert
 */
import swal from "sweetalert2";
import { AutenticacionService } from '../../../_services/autenticacion/autenticacion.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Directivas } from 'src/app/_directives/directiva/directiva.directive';

@Component({
  selector: 'app-cambiar-contrasena',
  templateUrl: './cambiar-contrasena.component.html'
})
export class CambiarContrasenaComponent implements OnInit {
  token: string;  
  ifValido = false;
  errorMessage : string ="";
  regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!-\~])[a-zA-Z\d!-\~]{8,}$/g; 
  emailRegex = /([\w\.\-_]+)?\w+@[\w-_]+(\.\w+){1,}/;
  public passForm: FormGroup; 
  submitted = false;

  
  constructor(private route: ActivatedRoute, private router: Router,
    private formBuilder: FormBuilder,
    private autenticacionService: AutenticacionService,
    private spinner: NgxSpinnerService) { 
      localStorage.removeItem("refresh");       
    }

  ngOnInit() {
    this.route.queryParams.subscribe((params=> {      
      this.token =  params['key'];     
      this.validarToken();
    })
    );
    this.inicializarForm();   
  }
   
  /**
   * Metodo que inicializa el formulario de cambiar la contraseña
   */
  inicializarForm(){
    /**
     * Validadores del formulario de creacion de menus
     */
    this.passForm = this.formBuilder.group({         
      passNew: new FormControl("", [
        Validators.required,        
        Validators.maxLength(255)
      ]),
      passConf: new FormControl("", [
        Validators.required,        
        Validators.maxLength(255)         
      ])
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.passForm.controls;
  }
  
  /**
   * Metodo que permite validar el token al momento de ingresar a la pagina
   */
  validarToken(){
    this.autenticacionService.validarToken(this.token)
    .pipe(first())
    .subscribe(
      (data) => {        
        if(data["status"] == 200) {
          this.ifValido = true;
          return;
        }             
      },
      (error) => {
        swal("Error", error.message, "error");
        this.errorMessage = error.message;
        this.ifValido = false;
        return;
      }
    );
  }

  /**
   * Metodo que permite cambiar la contraseña del usuario
   */
  cambiarContrasena() {
    this.submitted = true;
    
    if (this.passForm.invalid) {     
      return;
    }
   
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

    let obj = {
      "key": this.token,      
      "clave": this.passForm.get('passNew').value
    } 
   
    this.spinner.show(); 
    this.autenticacionService.cambiarContraseña(obj)
    .subscribe(
      data => {        
        Directivas.resetFormValidator(this.passForm);
        this.submitted = false;
        this.spinner.hide();
        var instancia = this.router;
        swal("Éxito","La contraseña se ha cambiado satisfactoriamente", "success")
        .then(
          function(response){
            instancia.navigate(['']);
          }
        );
      },
      error => {       
        this.spinner.hide();
        swal("Error", error.message, "error");
        return;
      }
    );
  }

}
