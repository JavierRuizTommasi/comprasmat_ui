import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { UsuariosService, IUsuario, IUsuUtp } from 'src/app/servicios/usuarios.service'
import { ComunicacionService } from 'src/app/servicios/comunicacion.service'
import { Cuenta } from 'src/app/models/Cuenta'
import { Language } from 'src/app/models/Language'
import { LanguageService } from 'src/app/servicios/language.service'

@Component({
  selector: 'app-cuenta',
  templateUrl: './cuenta.component.html',
  styleUrls: ['./cuenta.component.css']
})
export class CuentaComponent implements OnInit {

  idIdx: string
  updtUser: IUsuUtp

  public cuenta: Cuenta
  esp: boolean
  public lang: Language = {esp: true}
  @Output() actualizaLang = new EventEmitter()

  f: FormGroup
  unumPattern = '^[0-9]{1,10}$'
  userPattern = '^[A-Z0-9]{1,10}$'
  nombPattern = '^[a-zA-Z0-9 ]{1,30}$'
  emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  passPattern = '((?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{6,20})'

  siGrabo: boolean
  msgGrabo: string

  constructor(private fb: FormBuilder,
              private usuariosService: UsuariosService,
              private comunicacionService: ComunicacionService,
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
        pass: [''],
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
        email4: ['']
      })

      if (this.usuariosService.isLogin()) {
          this.comunicacionService.cuenta$.subscribe((cuenta: Cuenta) => {
          this.cuenta = cuenta
        })
      }
      else{
        this.router.navigateByUrl('/inicio')
      }
 }

  ngOnInit(): void {
        this.pedirCuenta()
  }

  pedirCuenta() {
     this.usuariosService.checkUsuario()
      .subscribe(resp => {
        // console.log('resp', resp.user)

        // console.log('resp usuario', resp.usuario)

        if (resp.user) {
          this.cuenta = resp.user

          this.usuariosService.getUsuario(this.cuenta.id)
          .subscribe(rescta => {
            // console.log('rescta:', rescta.User.usuario)

            this.f.patchValue({
                    id: rescta.User.id,
                    usuario: rescta.User.usuario,
                    nombre: rescta.User.nombre,
                    pass: rescta.User.pass,
                    proveedor: rescta.User.proveedor,
                    contacto: rescta.User.contacto,
                    direccion: rescta.User.direccion,
                    ciudad: rescta.User.ciudad,
                    pais: rescta.User.pais,
                    telefono: rescta.User.telefono,
                    perfil: rescta.User.perfil,
                    email: rescta.User.email,
                    activo: rescta.User.activo,
                    language: (rescta.User.language === 'es') ? 'es' : 'en',
                    contacto2: rescta.User.contacto2,
                    email2: rescta.User.email2,
                    contacto3: rescta.User.contacto3,
                    email3: rescta.User.email3,
                    contacto4: rescta.User.contacto4,
                    email4: rescta.User.email4
                  })

            // console.log(this.f.controls.id.value)

            switch (this.f.controls.language.value) {
              case 'en': { this.esp = false; break }
              case 'es': { this.esp = true; break }
              default: {this.esp = true; break}
            }

            // console.log(this.esp)

            this.lang = {esp: this.esp}
            this.languageService.esp$.next(this.lang)
            this.actualizaLang.emit(this.lang)
          })
        }
        else {
          this.usuariosService.removeToken()
        }
      })
  }

  onSubmit() {
    this.idIdx = this.cuenta.id
    // console.log('idIdx:', this.idIdx)
    // console.log('updtUser:', this.updtUser)

    this.usuariosService.putUsuarios(this.idIdx, this.f.value)
      .subscribe((user: IUsuario) => {
      console.log('Modif:', user)
      this.siGrabo = true
      this.msgGrabo = 'Usuario Grabado!'

      this.pedirCuenta()

    })

    setTimeout(() => this.removeAlert(), 3000)
  }

  onCancel() {
    this.router.navigateByUrl('/inicio')
  }

  removeAlert(): void {
    this.siGrabo = false
  }

}
