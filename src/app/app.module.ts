import { CommonModule } from '@angular/common'

import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { RouterModule } from '@angular/router'
import { FlexLayoutModule } from '@angular/flex-layout'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MaterialModule } from './modulos/material.module'
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field'

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
import { CuentaComponent } from './componentes/cuenta/cuenta.component'
import { ChangepassComponent } from './componentes/changepass/changepass.component'
import { OfertasComponent } from './componentes/ofertas/ofertas.component'
import { SeleccionComponent } from './componentes/seleccion/seleccion.component'
import { SamplesComponent } from './componentes/samples/samples.component'
import { ActivasComponent } from './componentes/activas/activas.component'
import { SuppliersComponent } from './componentes/suppliers/suppliers.component'
import { ScoringsComponent } from './componentes/scorings/scorings.component'
import { MailsToSuppliersComponent } from './componentes/mailsToSuppliers/mailsToSuppliers.component'

import { AlertMessagesComponent } from './componentes/alert-messages/alert-messages.component'

// import { MainnavbarComponent } from './componentes/mainnavbar/mainnavbar.component'
// import { MatUsersComponent } from './componentes/mat-users/mat-users.component';

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
import { SuppliersService } from './servicios/suppliers.service'
import { ScoringsService } from './servicios/scorings.service'
import { MailsToSuppliersService } from './servicios/mailsToSuppliers.service'

import Rutas from './routes'

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
    // MainnavbarComponent,
    // MatUsersComponent,
    AlertMessagesComponent,
    ActivasComponent,
    SuppliersComponent,
    ScoringsComponent,
    MailsToSuppliersComponent
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
  entryComponents: [    
    AlertMessagesComponent
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
    SamplesService,
    SuppliersService,
    ScoringsService,
    MailsToSuppliersService,
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'legacy' } }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

