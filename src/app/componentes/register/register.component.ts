import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { UsuariosService, IUsuario, IUsuUtp } from 'src/app/servicios/usuarios.service'
import { Usuarios } from 'src/app/models/Usuarios'
import { Language } from 'src/app/models/Language'
import { LanguageService } from 'src/app/servicios/language.service'
import { lang } from 'moment';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

esp: boolean

strTipo: string
idIdx: string
users: object[]

f: FormGroup
unumPattern = '^[0-9]{1,10}$'
userPattern = '^[A-Z0-9]{1,10}$'
nombPattern = '^[a-zA-Z0-9 ]{1,30}$'
emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
passPattern = '((?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{6,20})'

usuarios: Usuarios[]

user: IUsuario = {
  id: '',
  usuario: '',
  nombre: '',
  proveedor: 0,
  contacto: '',
  direccion: '',
  ciudad: '',
  pais: '',
  telefono: '',
  perfil: 0,
  email: '',
  pass: '',
  activo: false,
  createdAt: '',
  updatedAt: '',
  language: '',
  contacto2: '',
  email2: '',
  contacto3: '',
  email3: '',
  contacto4: '',
  email4: ''
}

siAlert: boolean
msgAlert: string
alertType: string

siRegistro: boolean

email: string
pass: string
confpass: string

constructor(
  private fb: FormBuilder,
  private usuariosService: UsuariosService,
  private languageService: LanguageService,
  private router: Router) {
  
    if (this.usuariosService.isLogin()) {
      this.router.navigateByUrl('/inicio')
    }

    this.languageService.esp$.subscribe((lang: Language) => {
        this.esp = lang.esp
      })
  }

  ngOnInit(): void {
    if (this.usuariosService.isLogin()) {
      this.router.navigateByUrl('/inicio')
    }

    this.freset()
  }

  freset() {
    this.f = this.fb.group({
      usuario: ['',
        Validators.compose([
        Validators.required,
        Validators.pattern(this.userPattern)
      ])],
      nombre: ['',
        Validators.compose([
        Validators.required,
        Validators.pattern(this.nombPattern)
      ])],
      email: ['',
        Validators.compose([
        Validators.required,
        Validators.pattern(this.emailRegex)
      ])],
      pass: ['',
        Validators.compose([
        Validators.required,
        Validators.pattern(this.passPattern)
      ])],
      confpass: ['',
        Validators.compose([
        Validators.required,
        Validators.pattern(this.passPattern)
      ])],
      perfil: [4],
      proveedor: [0],
      contacto: [''],
      direccion: [''],
      ciudad: [''],
      pais: [''],
      telefono: [''],
      activo: [false],
      language: [''],
      contacto2: [''],
      email2: [''],
      contacto3: [''],
      email3: [''],
      contacto4: [''],
      email4: ['']
    }, { validators: this.passMustMatch('pass', 'confpass') })

  }

  register() {
    let lang = ''
    if (this.esp) {
      lang = 'es'
    } else {
      lang = 'en'
    }

    // console.log(lang)

    this.f.patchValue({
      language: lang
    })
    
    // console.log(this.f.value)

    this.usuariosService.register(this.f.value)
    .subscribe( respuesta => {
      // console.log(respuesta)

      if (respuesta.dataUser) {
          // const accessToken = respuesta.dataUser.accessToken
          // this.usuariosService.setToken(accessToken)

          this.msgAlert = this.esp ? 'Usuario registrado' : 'User registered'
          this.siAlert = true
          this.siRegistro = true
          this.alertType = "success"

          console.log('registro correcto', respuesta)

          this.envioEmail(respuesta.dataUser.email)

        }
        else {
          switch (respuesta.message) {
            case 'Email already exists': { this.msgAlert = this.esp ? 'Email ya existente' : 'Email already exists'; break }
            default: {this.msgAlert = this.esp ? 'Error de Registro' : 'Register Error'; break}
          }
          
          this.siAlert = true
          this.siRegistro = true
          this.alertType = "warning"

          console.log('registro incorrecto', respuesta)
        }
    })

    setTimeout(() => this.removeAlert(), 6000)
    setTimeout(() => this.removeMsage(),30000)
    this.freset()
  }

  envioEmail(email: string) {
    console.log(email)
    if (email !== '') {
      this.usuariosService.sendWelcome(email)
      .subscribe( respuesta => {
        console.log(respuesta)

        if (respuesta.dataUser) {
            // const accessToken = respuesta.dataUser.accessToken
            // this.usuariosService.setToken(accessToken)

            console.log('Envio correcto de Email')
          }
          else {
            // switch (respuesta.message) {
            //   case 'Email already exists': { this.msgAlert = this.esp ? 'Email ya existente' : 'Email already exists'; break }
            //   default: {this.msgAlert = this.esp ? 'Error de Envío' : 'Send Error'; break}
            // }
            
            // this.siAlert = true
            // this.siRegistro = false
            // this.alertType = "warning"

            console.log('Error de envío de Welcome Email', respuesta)
          }
      })
    }
    setTimeout(() => this.removeAlert(), 6000)
    this.freset()

  }

  passMustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName]
        const matchingControl = formGroup.controls[matchingControlName]

        // console.log(control.value)
        // console.log(matchingControl.value)

        if (matchingControl.errors && !matchingControl.errors.mustMatch) {
            // return if another validator has already found an error on the matchingControl
            return
        }

        // set error on matchingControl if validation fails
        if (control.value !== matchingControl.value) {
            matchingControl.setErrors({ mustMatch: true })
        } else {
            matchingControl.setErrors(null)
        }
    }
  }

  removeAlert(): void {
    this.siAlert = false

    // if (this.alertType == "success") {
    //   this.router.navigateByUrl('/login')
    // }
  }

  removeMsage(): void {
    this.siRegistro = false
  }

}
