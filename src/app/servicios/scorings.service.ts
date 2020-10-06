import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http'
import { UrlproviderService } from './urlprovider.service'
import { Observable } from 'rxjs';
import { Scorings } from 'src/app/models/Scorings'

@Injectable({
  providedIn: 'root'
})
export class ScoringsService {

  constructor(
    private http: HttpClient,
    public url: UrlproviderService) {
      // console.log('Servicio Scorings OK')
  }

  getHttpOptions() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type' : 'application/json'
      })
    }
    return httpOptions
  }

  getScorings(): Observable<Scorings[]> {
    return this.http.get<Scorings[]>(this.url.baseApiUrl + 'settingScorings', this.getHttpOptions())
  }

  getScoring(id: string): Observable<Scorings> {
    return this.http.get<Scorings>(this.url.baseApiUrl + 'settingScorings/' + id, this.getHttpOptions())
  }

  addScorings(scoring: Scorings): Observable<Scorings> {
    return this.http.post<Scorings>(this.url.baseApiUrl + 'settingScorings', scoring, this.getHttpOptions())
  }

  putScorings(id: string, scoring: Scorings): Observable<Scorings> {
    return this.http.put<Scorings>(this.url.baseApiUrl + 'settingScorings/' + id, scoring, this.getHttpOptions())
  }

  deleteScorings(id: string): Observable<Scorings> {
    return this.http.delete<Scorings>(this.url.baseApiUrl + 'settingScorings/' + id, this.getHttpOptions())
  }

}
