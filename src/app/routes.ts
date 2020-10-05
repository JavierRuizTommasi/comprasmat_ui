import { Routes, RouterModule } from '@angular/router'

import { InicioComponent } from './componentes/inicio/inicio.component'
import { RegisterComponent } from './componentes/register/register.component'
import { LoginComponent } from './componentes/login/login.component'
import { ProductosComponent } from './componentes/productos/productos.component'
import { LicitacionesComponent } from './componentes/licitaciones/licitaciones.component'
import { MyProductsComponent } from './componentes/myproducts/myproducts.component'
import { UsuariosComponent } from './componentes/usuarios/usuarios.component'
import { LogoutComponent } from './componentes/logout/logout.component'
import { CuentaComponent } from './componentes/cuenta/cuenta.component'
import { ChangepassComponent } from './componentes/changepass/changepass.component'
import { OfertasComponent } from './componentes/ofertas/ofertas.component'
import { SeleccionComponent } from './componentes/seleccion/seleccion.component'
import { SamplesComponent } from './componentes/samples/samples.component'
import { ActivasComponent } from './componentes/activas/activas.component'

class Rutas {
  private routes: Routes = [
    { path: 'inicio', component: InicioComponent},
    { path: 'register', component: RegisterComponent},
    { path: 'login', component: LoginComponent},
    { path: 'login/:notification', component: LoginComponent},
    { path: 'productos', component: ProductosComponent},
    { path: 'licitaciones', component: LicitacionesComponent},
    { path: 'seleccion', component: SeleccionComponent},
    { path: 'myproducts', component: MyProductsComponent},
    { path: 'usuarios', component: UsuariosComponent},
    // { path: 'usuarios', component: MatUsersComponent},
    { path: 'logout', component: LogoutComponent},
    { path: 'cuenta', component: CuentaComponent},
    { path: 'changepass', component: ChangepassComponent},
    { path: 'ofertas', component: OfertasComponent},
    { path: 'ofertas/:nuevaoferta', component: OfertasComponent},
    { path: 'muestras', component: SamplesComponent},
    { path: 'activas', component: ActivasComponent},
    { path: '**', component: InicioComponent}
  ]

  constructor() {
    // console.log('Rutas OK!')
  }

  config() {
    return this.routes
  }

}

export default new Rutas()
