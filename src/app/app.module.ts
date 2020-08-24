import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from './modulos/material/material.module'
import { NavbarComponent } from './componentes/navbar/navbar.component'

import { RouterModule } from '@angular/router'

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
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule,
    NavbarComponent,
    RouterModule.forRoot(Rutas.config())
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
