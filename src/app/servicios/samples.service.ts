import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http'
import { UrlproviderService } from './urlprovider.service'
import { Observable } from 'rxjs';
import { Samples } from 'src/app/models/Samples'

@Injectable({
  providedIn: 'root'
})
export class SamplesService {

  constructor(
    private http: HttpClient,
    public url: UrlproviderService) {
      // console.log('Servicio Samples OK')
    }

  getHttpOptions() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type' : 'application/json'
      })
    }
    // console.log('Sample httpOptions', httpOptions)
    return httpOptions
  }

  getSamples() {
    return this.http.get<Samples[]>(this.url.baseApiUrl + 'samples', this.getHttpOptions())
  }

  findMySamples(usuario: string): Observable<Samples[]> {
    return this.http.get<Samples[]>(this.url.baseApiUrl + 'findmysamples/' + usuario, this.getHttpOptions())
  }

  getSample(id: string): Observable<Samples> {
    return this.http.get<Samples>(this.url.baseApiUrl + 'samples/' + id, this.getHttpOptions())
  }

  addSample(sample: Samples): Observable<Samples> {
    return this.http.post<Samples>(this.url.baseApiUrl + 'samples', sample, this.getHttpOptions())
  }

  putSample(id: string, sample: Samples): Observable<Samples> {
    return this.http.put<Samples>(this.url.baseApiUrl + 'samples/' + id, sample, this.getHttpOptions())
  }

  deleteSample(id: string): Observable<Samples> {
    return this.http.delete<Samples>(this.url.baseApiUrl + 'samples/' + id, this.getHttpOptions())
  }
  
}
