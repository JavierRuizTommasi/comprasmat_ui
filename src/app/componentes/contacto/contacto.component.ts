import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { UsuariosService, IUsuario, IUsuUtp } from 'src/app/servicios/usuarios.service'
import { ComunicacionService } from 'src/app/servicios/comunicacion.service'
import { Cuenta } from 'src/app/models/Cuenta'
import { Language } from 'src/app/models/Language'
import { LanguageService } from 'src/app/servicios/language.service'
import { MatDialog } from '@angular/material/dialog'
import { AlertMessagesComponent } from 'src/app/componentes/alert-messages/alert-messages.component'
import { MailsService } from 'src/app/servicios/mails.service'
import { Mails } from 'src/app/models/Mails'

@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.css']
})
export class ContactoComponent implements OnInit {

  idIdx: string
  updtUser: IUsuUtp

  public cuenta: Cuenta
  @Output() actualizaCuenta = new EventEmitter()

  esp: boolean
  public lang: Language = {esp: true}
  @Output() actualizaLang = new EventEmitter()

  f: FormGroup
  unumPattern = '^[0-9]{1,10}$'
  userPattern = '^[A-Z0-9]{1,10}$'
  nombPattern = '^[A-Z0-9 ]{1,30}$'
  emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  passPattern = '((?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{6,20})'

  mail: Mails
  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private comunicacionService: ComunicacionService,
    private languageService: LanguageService,
    private router: Router,
    public dialog: MatDialog,
    private mailsService: MailsService) {
      if (this.usuariosService.isLogin()) {
          this.comunicacionService.cuenta$.subscribe((cuenta: Cuenta) => {
          this.cuenta = cuenta
        })
      } else{
        this.router.navigateByUrl('/inicio')
      }

      this.f = fb.group({
        id: [''],
        usuario: ['',
          Validators.compose([
          Validators.required
        ])],
        nombre: ['',
          Validators.compose([
          Validators.required
        ])],
        email: ['',
          Validators.compose([
          Validators.required
        ])],
        language: [''],
        titulo: ['',
          Validators.compose([
          Validators.required
        ])],
        mensaje: ['',
          Validators.compose([
          Validators.required
        ])]
      })

      this.languageService.esp$.subscribe((lang: Language) => {
        this.esp = lang.esp
      })

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
            // console.log('rescta:', rescta.User)

            this.f.patchValue({
                    id: rescta.User._id,
                    usuario: rescta.User.usuario,
                    nombre: rescta.User.nombre,
                    email: rescta.User.email,
                    language: rescta.User.language,
                    titulo: '',
                    mensaje: ''
                  })

            // console.log(this.f.controls.id.value)

            switch (rescta.User.language) {
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
          this.router.navigateByUrl('/login')
        }
      })
  }

  onSubmit() {
    this.mail = this.f.value

    // console.log(this.mail)
    // console.log('updtUser:', this.updtUser)

    this.mailsService.sendMail(this.mail)
      .subscribe((resp: any) => {
      if (resp) {
          this.alertMsg()
      }

      this.onCancel()

    })

  }

  onCancel() {
    this.router.navigateByUrl('/inicio')
  }

  alertMsg(): void {

    let strConfMsg = this.esp ? 'Mail Enviado!' : 'Email Sent!'
    
    const dialogRef = this.dialog.open(AlertMessagesComponent, {
      width: '300px',
      data: {tipo: 'Aviso', mensaje: strConfMsg}
    })
  
  }

}
