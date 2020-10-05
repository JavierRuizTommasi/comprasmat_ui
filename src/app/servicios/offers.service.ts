import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http'
import { UrlproviderService } from './urlprovider.service'
import { Observable } from 'rxjs';
import { Offers } from 'src/app/models/Offers'

@Injectable({
  providedIn: 'root'
})
export class OffersService {

  constructor(
    private http: HttpClient,
    public url: UrlproviderService) {
      // console.log('Servicio Offers OK')
    }

  getHttpOptions() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type' : 'application/json'
      })
    }
    return httpOptions
  }

  getOffers() {
    return this.http.get<Offers[]>(this.url.baseApiUrl + 'offers', this.getHttpOptions())
  }

  findMyOffers(usuario: string): Observable<Offers[]> {
    return this.http.get<Offers[]>(this.url.baseApiUrl + 'findmyoffers/' + usuario, this.getHttpOptions())
  }

  getOffer(id: string): Observable<Offers> {
    return this.http.get<Offers>(this.url.baseApiUrl + 'offers/' + id, this.getHttpOptions())
  }

  addOffer(offer: Offers): Observable<Offers> {
    return this.http.post<Offers>(this.url.baseApiUrl + 'offers', offer, this.getHttpOptions())
  }

  putOffer(id: string, offer: Offers): Observable<Offers> {
    return this.http.put<Offers>(this.url.baseApiUrl + 'offers/' + id, offer, this.getHttpOptions())
  }

  deleteOffer(id: string): Observable<Offers> {
    return this.http.delete<Offers>(this.url.baseApiUrl + 'offers/' + id, this.getHttpOptions())
  }

}
