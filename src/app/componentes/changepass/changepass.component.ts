import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { UsuariosService, IUsuario, IUsuUtp } from 'src/app/servicios/usuarios.service'
import { ComunicacionService } from 'src/app/servicios/comunicacion.service'
import { Cuenta } from 'src/app/models/Cuenta'
import { Language } from 'src/app/models/Language'
import { LanguageService } from 'src/app/servicios/language.service'

@Component({
  selector: 'app-changepass',
  templateUrl: './changepass.component.html',
  styleUrls: ['./changepass.component.css']
})
export class ChangepassComponent implements OnInit {

  idIdx: string
  updtUser: IUsuUtp

  public cuenta: Cuenta

  esp: boolean
  public lang: Language = {esp: true}

  f: FormGroup
  passPattern = '((?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{6,20})'

  updtPass = {
    id: '',
    pass: '',
    newpass: ''
  }

  siAlert: boolean
  msgAlert: string
  alertType: string
  
  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private comunicacionService: ComunicacionService,
    private languageService: LanguageService,
    private router: Router) {
      this.f = fb.group({
        id: [''],
        oldpass: ['',
          Validators.compose([
          Validators.required,
          Validators.pattern(this.passPattern)
        ])],
        newpass: ['',
          Validators.compose([
          Validators.required,
          Validators.pattern(this.passPattern)
        ])],
        confpass: ['',
          Validators.compose([
          Validators.required,
          Validators.pattern(this.passPattern)
        ])]
      }, { validators: this.passMustMatch('newpass', 'confpass') })

      if (this.usuariosService.isLogin()) {
        this.comunicacionService.cuenta$.subscribe((cuenta: Cuenta) => {
        this.cuenta = cuenta
        })
      }
      else{
        this.router.navigateByUrl('/inicio')
      }

      this.languageService.esp$.subscribe((lang: Language) => {
        this.esp = lang.esp
      })
  }

  ngOnInit(): void {
    // this.pedirUsuario()
  }

  pedirUsuario() {
    this.usuariosService.checkUsuario()
     .subscribe(resp => {
       console.log('resp usuario', resp.usuario)

       if (resp.user) {
         this.cuenta = resp.user

        }
        else {
          this.usuariosService.removeToken()
        }
     })
 }

 onSubmit() {
    this.updtPass = {
      id: this.cuenta.id,
      pass: this.f.controls.oldpass.value,
      newpass: this.f.controls.newpass.value
    }

    console.log(this.updtPass)
    // console.log('updtUser:', this.updtUser)

    this.usuariosService.putPass(this.updtPass)
      .subscribe(resp => {
      console.log('Modif:', resp)
      if (resp.dataUser) {
        this.msgAlert = this.esp ? 'Password Actualizada!' : 'Password Updated!'
        this.alertType = "success"
        this.siAlert = true
      } else {
        this.msgAlert = this.esp ? 'Password No Actualizada!' : 'Password Not Updated!' 
        this.alertType = "warning"
        this.siAlert = true
      }

      setTimeout(() => this.removeAlert(), 3000)

      this.f.reset()
    })

 }

 onCancel() {
   this.router.navigateByUrl('/inicio')
 }

 removeAlert(): void {
   this.siAlert = false
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

}
