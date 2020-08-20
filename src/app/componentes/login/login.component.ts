import { Component, OnInit, Output, EventEmitter  } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router'
import { UsuariosService, IUsuario } from 'src/app/servicios/usuarios.service'
import { ComunicacionService } from 'src/app/servicios/comunicacion.service'
import { Cuenta } from 'src/app/models/Cuenta'
import { Usuarios } from 'src/app/models/Usuarios';
import { Language } from 'src/app/models/Language'
import { LanguageService } from 'src/app/servicios/language.service'
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public cuenta: Cuenta
  @Output() actualizaCuenta = new EventEmitter()

  public esp: boolean
  public lang: Language
  @Output() actualizaLang = new EventEmitter()

  idCuenta: string
  users: object[]

  f: FormGroup
  unumPattern = '^[0-9]{1,10}$'
  udescPattern = '^[a-zA-Z0-9]{1,30}$'

  usuarios: Usuarios[]

  user: IUsuario = {
    id: '',
    usuario: '',
    proveedor: 0,
    nombre: '',
    contacto: '',
    direccion: '',
    ciudad: '',
    pais: '',
    telefono: '',
    email: '',
    perfil: 0,
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

  usuario: IUsuario = {
    id: '',
    usuario: '',
    proveedor: 0,
    nombre: '',
    contacto: '',
    direccion: '',
    ciudad: '',
    pais: '',
    telefono: '',
    email: '',
    perfil: 0,
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

  luser: IUsuario = {
    id: '',
    usuario: '',
    proveedor: 0,
    nombre: '',
    contacto: '',
    direccion: '',
    ciudad: '',
    pais: '',
    telefono: '',
    email: '',
    perfil: 0,
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
  
  siInactivo: boolean

  email: string
  password: string

  notificacion: Observable<string>

  constructor(
    private comunicacionService: ComunicacionService,
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private languageService: LanguageService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {

      this.languageService.esp$.subscribe((lang: Language) => {
        this.esp = lang.esp
      })
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      // console.log(params);
      this.notificacion = params['notification'];
      console.log(this.notificacion);
    })
    
    this.freset()

  }

  freset() {
    this.f = this.fb.group({
      email: ['',
        Validators.compose([
        Validators.required])],
      password: ['',
        Validators.compose([
        Validators.required])]
    })

    if (this.usuariosService.isLogin()) {
          this.router.navigateByUrl('/inicio')
    }
  }
      
  login() {
    // console.log(this.f.value)

    // console.log(this.f.value)
    this.usuariosService.login(this.f.value)
    .subscribe( respuesta => {
      // console.log(respuesta)

      if (respuesta.dataUser) {

        if (respuesta.dataUser.activo) {
            console.log('usuario logueado')

            const accessToken = respuesta.dataUser.accessToken
            this.usuariosService.setToken(accessToken)

            // console.log(respuesta.dataUser)
            this.cuenta = {
                id: respuesta.dataUser.id,
                usuario: respuesta.dataUser.usuario,
                email: respuesta.dataUser.email,
                nombre: respuesta.dataUser.nombre,
                perfil: respuesta.dataUser.perfil,
                createdAt: respuesta.dataUser.createdAt,
                updatedAt: respuesta.dataUser.updatedAt,
                language: respuesta.dataUser.language,
                activo: respuesta.dataUser.activo,
                proveedor: respuesta.dataUser.proveedor
            }

            // console.log('cuenta:', this.cuenta)
            this.comunicacionService.cuenta$.next(this.cuenta)
            this.actualizaCuenta.emit(this.cuenta)

            this.esp = (this.cuenta.language === 'es')

            this.lang = {
              esp: this.esp
            }
            this.languageService.esp$.next(this.lang)
            this.actualizaLang.emit(this.lang)

            // this.router.navigateByUrl('/navbar')
            this.router.navigateByUrl('/inicio')
        } else {
          console.log('Usuario inactivo')
          this.msgAlert = this.esp ? 'Usuario pendiente de Activación' : 'User activation pending'
          this.siAlert = true
          this.alertType = "warning"
          this.siInactivo = true
  
          setTimeout(() => this.removeAlert(), 6000)
          setTimeout(() => this.removeMsage(),30000)

        }
      }
      else {
        console.log('login incorrecto', respuesta)
        switch (respuesta.message) {
          case 'User not found': { this.msgAlert = this.esp ? 'Usuario no encontrado' : 'User not found'; break }
          case 'Invalid Password': { this.msgAlert = this.esp ? 'Clave incorrecta' : 'Invalid password'; break }
          default: {this.msgAlert = this.esp ? 'Error de Login' : 'Login Error'; break}
        }
        this.siAlert = true
        this.alertType = "warning"
        this.siInactivo = false

        setTimeout(() => this.removeAlert(), 6000)
        setTimeout(() => this.removeMsage(),30000)

        this.comunicacionService.cuenta$.next(this.luser)
        this.actualizaCuenta.emit(this.luser)

        this.freset()
      }

    })
  }

  enviarEmail(email: string) {
    console.log(email)
    if (email !== '') {
      this.usuariosService.sendWelcome(email)
      .subscribe( respuesta => {
        console.log(respuesta)

        if (respuesta.newUser) {
            // const accessToken = respuesta.dataUser.accessToken
            // this.usuariosService.setToken(accessToken)
            this.msgAlert = this.esp ? 'Email enviado' : 'Email sent'
                      
            this.siAlert = true
            this.siInactivo = true
            this.alertType = "success"

            console.log('Envio correcto de Email')
          }
          else {
            switch (respuesta.message) {
              case 'User not found': { this.msgAlert = this.esp ? 'Usario no encontrado' : 'User not found'; break }
              default: {this.msgAlert = this.esp ? 'Error de Envío' : 'Send Error'; break}
            }
            
            this.siAlert = true
            this.siInactivo = true
            this.alertType = "warning"

            console.log('Error de envío de Welcome Email', respuesta)
          }
      })
    }
    setTimeout(() => this.removeAlert(), 6000)
    setTimeout(() => this.removeMsage(),30000)
    this.freset()

  }

  buscaCuenta() {
    for (const usuario of this.usuarios) {
      if (usuario.email === this.email)
      {
          return usuario
          break
      }
    }
    return undefined
  }

  removeAlert(): void {
    this.siAlert = false
  }

  removeMsage(): void {
    this.siInactivo = false
  }

  pedirUsuarios() {
    this.usuariosService.getUsuarios()
      .subscribe(users => {
        console.log(users)
        this.usuarios = users
      })
  }

}
