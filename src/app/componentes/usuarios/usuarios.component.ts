import { Component, OnInit } from '@angular/core';
import { UsuariosService, IUsuario, IUsuUtp } from 'src/app/servicios/usuarios.service'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { Usuarios } from 'src/app/models/Usuarios'
import { Router } from '@angular/router'
import { Language } from 'src/app/models/Language'
import { LanguageService } from 'src/app/servicios/language.service'

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {

  strTipo: string
  idIdx: string

  esp: boolean
  public lang: Language = {esp: true}

  usuarios: Usuarios[] = []

  f: FormGroup
  unumPattern = '^[0-9]{1,10}$'
  userPattern = '^[A-Z0-9]{1,10}$'
  nombPattern = '^[a-zA-Z0-9 ]{1,30}$'
  emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  passPattern = '((?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{6,20})'

  user: IUsuario
  updtUser: IUsuUtp

  siAlert: boolean
  msgAlert: string
  alertType: string
  
  updtPass = {
    id: '',
    pass: '',
    newpass: ''
  }

  notDone: boolean = true

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private modalService: NgbModal,
    private languageService: LanguageService,
    private router: Router) {
      this.f = fb.group({
        id: [''],
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
          // Validators.required,
          Validators.pattern(this.passPattern)
        ])],
        confpass: ['',
          Validators.compose([
          // Validators.required,
          Validators.pattern(this.passPattern)
        ])],
        perfil: [4],
        proveedor: [0],
        contacto: [''],
        direccion: [''],
        ciudad: [''],
        pais: [''],
        telefono: [''],
        activo: [true],
        language: [''],
        contacto2: [''],
        email2: [''],
        contacto3: [''],
        email3: [''],
        contacto4: [''],
        email4: [''],
        conpass: [false]
      }, { validators: this.passMustMatch('pass', 'confpass') })

      if (this.usuariosService.isLogin()) {
      }
      else {
        this.router.navigateByUrl('/inicio')
      }

      this.languageService.esp$.subscribe((lang: Language) => {
        this.esp = lang.esp
      })
  }

  ngOnInit(): void {
    if (this.usuariosService.isLogin()) {
      this.pedirUsuarios()
    }
    else {
      this.router.navigateByUrl('/inicio')
    }
  }

  removeAlert(): void {
    this.siAlert = false
  }

  pedirUsuarios() {
    this.usuariosService.getUsuarios()
    .subscribe((resp: any) => {
      console.log(resp)
      this.usuarios = resp.Users
      this.notDone = false
    })
  }

//   objectKeys(objeto: any) {
//     const keys = Object.keys(objeto)
//     console.log(keys) // echa un vistazo por consola para que veas lo que hace "Object.keys"
//     return keys
//  }

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

openModal(targetModal, usuario, strTipoParam) {

    this.strTipo = strTipoParam

    this.modalService.open(targetModal, {
     centered: true,
     backdrop: 'static'
    })

    this.f.patchValue({
     id: usuario._id,
     usuario: usuario.usuario,
     nombre: usuario.nombre,
     email: usuario.email,
     pass: '',
     confpass: '',
     proveedor: usuario.proveedor,
     contacto: usuario.contacto,
     direccion: usuario.direccion,
     ciudad: usuario.ciudad,
     pais: usuario.pais,
     telefono: usuario.telefono,
     perfil: usuario.perfil,
     activo: usuario.activo,
     language: usuario.language,
     contacto2: usuario.contacto2,
     email2: usuario.email2,
     contacto3: usuario.contacto3,
     email3: usuario.email3,
     contacto4: usuario.contacto4,
     email4: usuario.email4
    })
  }

  onSubmit() {

    console.log(this.strTipo)

    this.modalService.dismissAll()
    // console.log('res:', this.f.getRawValue())

    this.idIdx = this.f.controls.id.value
    this.updtUser = {
      usuario: this.f.controls.usuario.value,
      nombre: this.f.controls.nombre.value,
      proveedor: this.f.controls.proveedor.value,
      contacto: this.f.controls.contacto.value,
      direccion: this.f.controls.direccion.value,
      ciudad: this.f.controls.ciudad.value,
      pais: this.f.controls.pais.value,
      telefono: this.f.controls.telefono.value,
      perfil: this.f.controls.perfil.value,
      email: this.f.controls.email.value,
      pass: this.f.controls.pass.value,
      activo: this.f.controls.activo.value,
      createdAt: '',
      updatedAt: '',
      language: this.f.controls.language.value,
      contacto2: this.f.controls.contacto2.value,
      email2: this.f.controls.email2.value,
      contacto3: this.f.controls.contacto3.value,
      email3: this.f.controls.email3.value,
      contacto4: this.f.controls.contacto4.value,
      email4: this.f.controls.email4.value
    }

    switch (this.strTipo) {
      case 'A':
        // Alta
        this.agregarUsuario()
        break
      case 'B':
        // Baja
        this.borrarUsuario()
        break
      case 'M':
        // Modificar
        this.modificarUsuario()
        break
      case 'P':
        // Modificar
        this.setearPassword()
        break
        default:
    }

  }

  agregarUsuario() {

    this.usuariosService.register(this.updtUser)
      .subscribe((user: IUsuario) => {
        // console.log('Alta:', user)
        if (user) {
          this.siAlert = true
          this.msgAlert = this.esp ? 'Usuario Grabado!' : 'User Saved!'
          this.alertType = "success"
        } else {
          this.siAlert = true
          this.msgAlert = this.esp ? 'Usuario No Grabado!' : 'User Not Saved!'
          this.alertType = "warning"
        }
        this.pedirUsuarios()
      })

      setTimeout(() => this.removeAlert(), 3000)
    }

  borrarUsuario() {

    this.usuariosService.deleteUsuarios(this.idIdx)
     .subscribe((user: IUsuario) => {
      //  console.log('Baja:', user)
      if (user) {
        this.siAlert = true
        this.msgAlert = this.esp ? 'Usuario Borrado!' : 'User Deleted!'
        this.alertType = "success"
      } else {
        this.siAlert = true
        this.msgAlert = this.esp ? 'Usuario No Borrado!' : 'User Not Deleted!'
        this.alertType = "warning"
      }
      this.pedirUsuarios()
    })

    setTimeout(() => this.removeAlert(), 3000)
  }

  modificarUsuario() {

    this.usuariosService.putUsuarios(this.idIdx, this.updtUser)
      .subscribe((user: IUsuario) => {
      console.log('Modif:', user)
      if (user) {
        this.siAlert = true
        this.msgAlert = this.esp ? 'Usuario Actualizado!' : 'User Updated!'
        this.alertType = "success"
      } else {
        this.siAlert = true
        this.msgAlert = this.esp ? 'Usuario No Actualizado!' : 'User Not Updated!'
        this.alertType = "warning"
      }
      this.pedirUsuarios()
    })

    setTimeout(() => this.removeAlert(), 3000)
  }

  setearPassword() {

    this.updtPass = {
      id: this.f.controls.id.value,
      pass: '',
      newpass: this.f.controls.pass.value
    }
    // console.log(this.updtPass)

    this.usuariosService.putPass(this.updtPass)
      .subscribe(resp => {
      console.log('Pass:', resp)
      if (resp.dataUser) {
        this.msgAlert = this.esp ? 'Password Actualizada!' : 'Password Updated!'
        this.alertType = "success"
        this.siAlert = true
      } else {
        this.msgAlert = this.esp ? 'Password No Actualizada!' : 'Password Not Updated!' 
        this.alertType = "warning"
        this.siAlert = true
      }

      this.pedirUsuarios()
    })

    setTimeout(() => this.removeAlert(), 3000)
  }

}
