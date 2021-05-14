import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http'
import { UrlproviderService } from './urlprovider.service'
import { Observable } from 'rxjs';
import { Help } from 'src/app/models/Help'

@Injectable({
  providedIn: 'root'
})
export class HelpService {

  constructor(
    private http: HttpClient,
    public url: UrlproviderService) {
      // console.log('Servicio Help OK')
  }

  getHttpOptions() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type' : 'application/json'
      })
    }
    return httpOptions
  }

  getHelps(): Observable<Help[]> {
    return this.http.get<Help[]>(this.url.baseApiUrl + 'help', this.getHttpOptions())
  }

  getHelp(id: string): Observable<Help> {
    return this.http.get<Help>(this.url.baseApiUrl + 'help/' + id, this.getHttpOptions())
  }

  addHelp(help: Help): Observable<Help> {
    return this.http.post<Help>(this.url.baseApiUrl + 'help', help, this.getHttpOptions())
  }

  putHelp(id: string, help: Help): Observable<Help> {
    return this.http.put<Help>(this.url.baseApiUrl + 'help/' + id, help, this.getHttpOptions())
  }

  deleteHelp(id: string): Observable<Help> {
    return this.http.delete<Help>(this.url.baseApiUrl + 'help/' + id, this.getHttpOptions())
  }

}
