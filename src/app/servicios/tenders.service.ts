import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http'
import { UrlproviderService } from './urlprovider.service'
import { Observable } from 'rxjs';
import { Tenders } from 'src/app/models/Tenders'

@Injectable({
  providedIn: 'root'
})
export class TendersService {

  constructor(
    private http: HttpClient,
    public url: UrlproviderService) {
      console.log('Servicio Tenders OK')
    }

    getHttpOptions() {
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type' : 'application/json'
        })
      }
      return httpOptions
  }

  getTenders() {
    return this.http.get<Tenders[]>(this.url.baseApiUrl + 'tenders', this.getHttpOptions())
  }

  getActives(): Observable<Tenders[]> {
    // console.log('getActives')
    return this.http.get<Tenders[]>(this.url.baseApiUrl + 'tendersactives', this.getHttpOptions())
  }

  getTender(id: string): Observable<Tenders> {
    return this.http.get<Tenders>(this.url.baseApiUrl + 'tenders/' + id, this.getHttpOptions())
  }

  addTender(tender: Tenders): Observable<Tenders> {
    return this.http.post<Tenders>(this.url.baseApiUrl + 'tenders', tender, this.getHttpOptions())
  }

  putTender(id: string, tender: Tenders): Observable<Tenders> {
    return this.http.put<Tenders>(this.url.baseApiUrl + 'tenders/' + id, tender, this.getHttpOptions())
  }

  deleteTender(id: string): Observable<Tenders> {
    return this.http.delete<Tenders>(this.url.baseApiUrl + 'tenders/' + id, this.getHttpOptions())
  }

}
