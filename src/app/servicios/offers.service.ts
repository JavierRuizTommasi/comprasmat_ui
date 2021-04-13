import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http'
import { UrlproviderService } from './urlprovider.service'
import { Observable } from 'rxjs';
import { Offers } from 'src/app/models/Offers'
import { Uploads } from 'src/app/models/Uploads'

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

  getOffers(): Observable<Offers[]>{
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

  updateOfferStates(id: string): Observable<Offers> {
    return this.http.put<Offers>(this.url.baseApiUrl + 'updateOfferStates/' + id, this.getHttpOptions())
  }

  removeUpload(id: string, upload: Uploads): Observable<Uploads> {
    return this.http.put<Uploads>(this.url.baseApiUrl + 'offersRemoveUpload/' + id, upload, this.getHttpOptions())
  }

}
