import { CommonModule } from '@angular/common'
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { RouterModule } from '@angular/router'
import { FlexLayoutModule } from '@angular/flex-layout'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './modulos/material.module'

// Componentes
import { AppComponent } from './app.component'
import { ProductosComponent } from './componentes/productos/productos.component'
import { NavbarComponent } from './componentes/navbar/navbar.component'
import { InicioComponent } from './componentes/inicio/inicio.component'
import { LicitacionesComponent } from './componentes/licitaciones/licitaciones.component'
import { MyProductsComponent } from './componentes/myproducts/myproducts.component'
import { LoginComponent } from './componentes/login/login.component'
import { RegisterComponent } from './componentes/register/register.component'
import { UsuariosComponent } from './componentes/usuarios/usuarios.component'
import { LogoutComponent } from './componentes/logout/logout.component'
import { CuentaComponent } from './componentes/cuenta/cuenta.component';
import { ChangepassComponent } from './componentes/changepass/changepass.component'
import { OfertasComponent } from './componentes/ofertas/ofertas.component'
import { SeleccionComponent } from './componentes/seleccion/seleccion.component';
import { SamplesComponent } from './componentes/samples/samples.component';
import { MainnavbarComponent } from './componentes/mainnavbar/mainnavbar.component';

// Servicios
import { AuthInterceptor } from './servicios/auth.interceptor'
import { ErrointerceptorService } from './servicios/errointerceptor.service'
import { ProductosService } from './servicios/productos.service'
import { MyProductsService } from './servicios/myproducts.service'
import { MensajesService } from './servicios/mensajes.service'
import { UsuariosService } from './servicios/usuarios.service'
import { ComunicacionService } from './servicios/comunicacion.service'
import { TendersService } from './servicios/tenders.service'
import { OffersService } from './servicios/offers.service'
import { SamplesService } from './servicios/samples.service'

import Rutas from './routes';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    ProductosComponent,
    InicioComponent,
    LicitacionesComponent,
    MyProductsComponent,
    LoginComponent,
    RegisterComponent,
    UsuariosComponent,
    LogoutComponent,
    CuentaComponent,
    ChangepassComponent,
    OfertasComponent,
    SeleccionComponent,
    SamplesComponent,
    MainnavbarComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    FlexLayoutModule,
    BrowserAnimationsModule,
    MaterialModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(Rutas.config()),
  ],
  providers: [
    ProductosService,
    MyProductsService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    UsuariosService,
    ComunicacionService,
    MensajesService,
    TendersService,
    OffersService,
    SamplesService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
