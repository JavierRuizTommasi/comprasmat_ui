import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Cuenta } from 'src/app/models/Cuenta'
import { ComunicacionService } from 'src/app/servicios/comunicacion.service'
import { Language } from 'src/app/models/Language'
import { LanguageService } from 'src/app/servicios/language.service'
import { Router } from '@angular/router'
import { UsuariosService } from 'src/app/servicios/usuarios.service'
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  @Input() deviceXs: boolean

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
  .pipe(
    map(result => result.matches),
    shareReplay()
  );

  public prod = false
  public cuenta: Cuenta

  public esp: boolean
  public lang: Language = {esp: true}
  @Output() actualizaLang = new EventEmitter()

  constructor(
    private breakpointObserver: BreakpointObserver,
    private comunicacionService: ComunicacionService,
    private languageService: LanguageService,
    private usuariosService: UsuariosService,
    private router: Router,
  ) {
    this.prod = environment.production
  }

  ngOnInit(): void {
    this.comunicacionService.cuenta$.subscribe((cuenta: Cuenta) => {
      this.cuenta = cuenta
      // console.log(this.cuenta)

      // this.getUserData()

      if (this.cuenta) {
        if (this.cuenta.language === 'es') {
          this.esp = true
        } else {
          this.esp = false
        }
      } else {
        navigator.language.substr(0, 2)

        switch (navigator.language.substr(0, 2)) {
          case 'en': { this.esp = false; break }
          case 'es': { this.esp = true; break }
          default: {this.esp = true; break}
        }
      }
      this.lang = {esp: this.esp}
      this.languageService.esp$.next(this.lang)
      this.actualizaLang.emit(this.lang)
    })
    // console.log(this.cuenta)

    console.log(environment.production)
  }

  async changeLang() {
    // console.log('Change')
    // Hago el change y después actualizo el user 
    if (this.esp) {
        this.esp = false
    }
    else {
      this.esp = true
    }

    // console.log(this.esp)
    this.lang = {esp: this.esp}
    this.languageService.esp$.next(this.lang)
    this.actualizaLang.emit(this.lang)

    // console.log(this.cuenta)

    let resp: any = await this.usuariosService.checkUsuario().toPromise()
    // console.log(resp)
    if (!resp) {
      this.router.navigateByUrl('/login')
    } else {
      resp.user.language = this.esp ? 'es' : 'en'
      let respLang: any = await this.usuariosService.language(resp.user.id, resp.user).toPromise()
      console.log(respLang)
    }
  }
}