import { Component, OnInit, Output, EventEmitter } from '@angular/core'
import { Language } from 'src/app/models/Language'
import { LanguageService } from 'src/app/servicios/language.service'
import { Cuenta } from 'src/app/models/Cuenta'
import { ComunicacionService } from 'src/app/servicios/comunicacion.service'
import { UsuariosService } from 'src/app/servicios/usuarios.service'
import { TendersService } from 'src/app/servicios/tenders.service'
import { Tenders } from 'src/app/models/Tenders';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

  esp: boolean
  public lang: Language = {esp: true}
  @Output() actualizaLang = new EventEmitter()

  public cuenta: Cuenta
  @Output() actualizaCuenta = new EventEmitter()

  tenders: Tenders[] = []

  notDone: boolean = true

  constructor(
    private comunicacionService: ComunicacionService,
    private usuariosService: UsuariosService,
    private languageService: LanguageService,
    private tenderService: TendersService) {
      this.languageService.esp$.subscribe((lang: Language) => {
        // console.log(this.esp)
        this.esp = lang.esp
      })
    }

  ngOnInit(): void {
    this.comunicacionService.cuenta$.subscribe((cuenta: Cuenta) => {
      this.cuenta = cuenta

    })

    this.getUserData()
    // console.log(this.cuenta)
    this.pedirTenders()

  }

  getUserData() {
    this.usuariosService.checkUsuario()
    .subscribe(respuesta => {
      if (respuesta.user) {
        // this.cuenta.nombre = respuesta.user.nombre
        // this.cuenta.perfil = respuesta.user.perfil
        this.cuenta = respuesta.user
        this.esp = (this.cuenta.language === 'es')
        // console.log('respuesta:', respuesta)
        // console.log('cuenta:', this.cuenta)
      }
      else {
        // console.log(respuesta)
        this.usuariosService.removeToken()
        this.cuenta = undefined

        navigator.language.substr(0, 2)
        // this.router.navigateByUrl('/login')

        switch (navigator.language.substr(0, 2)) {
          case 'en': { this.esp = false; break }
          case 'es': { this.esp = true; break }
          default: {this.esp = true; break}
        }
      }

      // console.log(this.cuenta)
      this.comunicacionService.cuenta$.next(this.cuenta)
      this.actualizaCuenta.emit(this.cuenta)

      // console.log(this.esp)
      this.lang = {esp: this.esp}
      this.languageService.esp$.next(this.lang)
      this.actualizaLang.emit(this.lang)
    })
  }

  pedirTenders() {
    this.tenderService.getActives()
    .subscribe((resp: any) => {
      // console.log(resp)
      this.tenders = resp.Tenders
      this.notDone = false
    })

  }

}

