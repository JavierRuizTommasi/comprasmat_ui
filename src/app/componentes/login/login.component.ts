import { Component, OnInit, Output, EventEmitter  } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router'
import { UsuariosService } from 'src/app/servicios/usuarios.service'
import { Usuarios } from 'src/app/models/Usuarios';
import { ComunicacionService } from 'src/app/servicios/comunicacion.service'
import { Cuenta } from 'src/app/models/Cuenta'
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
  lcuenta: Cuenta

  public esp: boolean
  public lang: Language = {esp: true}
  @Output() actualizaLang = new EventEmitter()

  idCuenta: string
  users: object[]

  f: FormGroup
  unumPattern = '^[0-9]{1,10}$'
  udescPattern = '^[a-zA-Z0-9]{1,30}$'

  usuarios: Usuarios[]
  user: Usuarios 

  siAlert: boolean
  msgAlert: string
  alertType: string
  
  inactivo: boolean
  olvido: boolean
  nuevaclave: boolean

  email: string
  password: string

  notificacion: string = ''
  token : string = ''
  offer: string = ''

  constructor(
    private comunicacionService: ComunicacionService,
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private languageService: LanguageService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {

      this.languageService.esp$.subscribe((lang: Language) => {
        this.esp = lang.esp
        // console.log(this.esp)
      })
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      // console.log(params);
      this.notificacion = params['notification'];
      this.token = params['token'];
      this.offer = params['tender']+'/'+params['product'];
      // console.log(params);

      switch (this.notificacion) {
        case 'offer':
          if (this.token) {
            this.usuariosService.setToken(this.token)
          }
          break;
      
        default:
          break;
      }

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
      this.pedirDatos()
    }
  }
      
  async getUserData() {
    const resp: any = await this.usuariosService.checkUsuario().toPromise()
    // console.log(resp.user)
    return resp.user
  }

  async pedirDatos() {
    // Esta funcion pide todos los datos previos antes de mostrar en el browser
    // getUserData() Chequea si el usuario esta logeado 
    // checkCuenta() Avisa al Navbar sino 
    // pedirProductos() Trae datos del Servicio Productos

    console.log('pedirDatos')
    const user = await this.getUserData()
    if (user) {
      // console.log(user)
      if (this.offer) {
      console.log(this.offer)
        this.router.navigateByUrl('/ofertas/'+this.offer)
      } else {
        this.router.navigateByUrl('/inicio')
      }

    }
    else {
      this.usuariosService.removeToken()
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
          this.inactivo = true
          this.olvido = false
          this.nuevaclave = false

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
        this.inactivo = false
        this.olvido = true
        this.nuevaclave = false

        setTimeout(() => this.removeAlert(), 6000)
        setTimeout(() => this.removeMsage(),30000)

        this.comunicacionService.cuenta$.next(this.lcuenta)
        this.actualizaCuenta.emit(this.lcuenta)

        // this.freset()
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
            this.inactivo = true
            this.olvido = false
            this.alertType = "success"

            console.log('Envio correcto de Email')
          }
          else {
            switch (respuesta.message) {
              case 'User not found': { this.msgAlert = this.esp ? 'Usario no encontrado' : 'User not found'; break }
              default: {this.msgAlert = this.esp ? 'Error de Envío' : 'Send Error'; break}
            }
            
            this.siAlert = true
            this.inactivo = true
            this.olvido = true
            this.alertType = "warning"

            console.log('Error de envío de Welcome Email', respuesta)
          }
      })
    }
    setTimeout(() => this.removeAlert(), 6000)
    setTimeout(() => this.removeMsage(),30000)
    // this.freset()

  }

  removeAlert(): void {
    this.siAlert = false
  }

  removeMsage(): void {
    this.inactivo = false
  }

  pedirUsuarios() {
    this.usuariosService.getUsuarios()
      .subscribe(users => {
        console.log(users)
        this.usuarios = users
      })
  }

  forgot(email: string) {
    console.log(email)
    if (email !== '') {
      this.olvido = false
      this.nuevaclave = true
    }
    setTimeout(() => this.removeAlert(), 6000)
    setTimeout(() => this.removeMsage(),30000)
  }

}
