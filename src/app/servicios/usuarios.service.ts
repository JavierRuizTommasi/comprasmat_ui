import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http'
import { UrlproviderService } from './urlprovider.service'
import { Usuarios } from 'src/app/models/Usuarios'
import { Cuenta } from 'src/app/models/Cuenta'
import { Observable } from 'rxjs';

export interface IUsuario {
  id: string,
  usuario: string,
  nombre: string,
  email: string,
  pass: string,
  perfil: number,
  proveedor: number,
  contacto: string,
  direccion: string,
  ciudad: string,
  pais: string,
  telefono: string,
  activo: boolean,
  createdAt: string,
  updatedAt: string,
  language: string,
  contacto2: string,
  email2: string,
  contacto3: string,
  email3: string,
  contacto4: string,
  email4: string
}

export interface IUsuUtp {
  usuario: string,
  nombre: string,
  email: string,
  pass: string,
  perfil: number,
  proveedor: number,
  contacto: string,
  direccion: string,
  ciudad: string,
  pais: string,
  telefono: string,
  activo: boolean,
  createdAt: string,
  updatedAt: string,
  language: string,
  contacto2: string,
  email2: string,
  contacto3: string,
  email3: string,
  contacto4: string,
  email4: string
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  constructor(
    private http: HttpClient,
    public url: UrlproviderService) {
    // console.log('Servicio Usuarios OK')
  }

  getHttpOptions() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type' : 'application/json'
      })
    }
    return httpOptions
  }

  login(data: any) {
    return this.http.post<any>(this.url.baseApiUrl + 'login', data, this.getHttpOptions())
  }

  register(user: IUsuUtp) {
    return this.http.post<any>(this.url.baseApiUrl + 'register', user, this.getHttpOptions())
  }

  getUsuarios() {
    return this.http.get<Usuarios[]>(this.url.baseApiUrl + 'users', this.getHttpOptions())
  }

  postUsuarios(user: IUsuUtp) {
    return this.http.post<IUsuUtp>(this.url.baseApiUrl + 'users', user, this.getHttpOptions())
  }

  putUsuarios(id: string, user: IUsuUtp) {
    return this.http.put<IUsuUtp>(this.url.baseApiUrl + 'users/' + id, user, this.getHttpOptions())
  }

  putPass(pass) {
    return this.http.put<any>(this.url.baseApiUrl + 'pass', pass, this.getHttpOptions())
  }

  deleteUsuarios(id: string) {
    return this.http.delete<IUsuUtp>(this.url.baseApiUrl + 'users/' + id, this.getHttpOptions())
  }

  getUsuario(id: string) {
    return this.http.get<any>(this.url.baseApiUrl + 'users/' + id, this.getHttpOptions())
  }

  checkUsuario() {
    return this.http.get<any>(this.url.baseApiUrl + 'check', this.getHttpOptions())
  }

  // checkUsuario() {
  //   return new Promise(resolve => {
  //     const user: any = this.http.get<any>(this.url.baseApiUrl + 'check', this.getHttpOptions())
  //     console.log(user.user)
  //     resolve(user.user)
  //   })
  // }

  checkUsuario2():Promise <Cuenta> {
    return new Promise(resolve => {
      const user = this.http.get<Cuenta>(this.url.baseApiUrl + 'check', this.getHttpOptions())
      // console.log(user)
      // resolve(user)
    })
    
  }

  logout() {
    return this.http.get<any>(this.url.baseApiUrl + 'logout')
  }

  setToken(token) {
    localStorage.setItem('ACCESS_TOKEN', token)
  }

  getToken() {
    return localStorage.getItem('ACCESS_TOKEN')
  }

  removeToken() {
    localStorage.removeItem('ACCESS_TOKEN')
  }

  isLogin() {
    return this.getToken() ? true : false
  }

  sendWelcome(email: string) {
    return this.http.get<any>(this.url.baseApiUrl + 'welcome/' + email, this.getHttpOptions())
  }
}
