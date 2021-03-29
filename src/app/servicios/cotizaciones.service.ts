import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http'
import { UrlproviderService } from './urlprovider.service'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CotizacionesService {

  constructor(
    private http: HttpClient,
    public url: UrlproviderService) {
   }

  getHttpOptions() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type' : 'application/json'
      })
    }
    return httpOptions
  }

  getCotizacionBNA(): Observable<any> {
    return this.http.get<any>(this.url.baseApiUrl + 'dolar', this.getHttpOptions())
  }

}
