import { Component, OnInit, Output, EventEmitter } from '@angular/core'
import { Router } from '@angular/router'
import { ComunicacionService } from 'src/app/servicios/comunicacion.service'
import { Cuenta } from 'src/app/models/Cuenta'
import { UsuariosService, IUsuario, IUsuUtp } from 'src/app/servicios/usuarios.service'

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

  public cuenta: Cuenta
  @Output() actualizaCuenta = new EventEmitter()

  constructor(
    private comunicacionService: ComunicacionService,
    private router: Router,
    private usuariosService: UsuariosService) { }

  ngOnInit(): void {
    this.usuariosService.logout()
    .subscribe( data => {
      console.log('usuario deslogueado')

      this.usuariosService.removeToken()
      this.cuenta = undefined
      this.comunicacionService.cuenta$.next(this.cuenta)
      this.actualizaCuenta.emit(this.cuenta)

      this.router.navigateByUrl('/inicio')
      })
  }

}
