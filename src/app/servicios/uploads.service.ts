import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http'
import { UrlproviderService } from './urlprovider.service'
import { Observable } from 'rxjs';
import { Uploads } from 'src/app/models/Uploads'

@Injectable({
  providedIn: 'root'
})
export class UploadsService {
  SERVER_URL: string = "uploads/"
  constructor(
    private http: HttpClient,
    public url: UrlproviderService) {
      // console.log('Servicio Uploads OK')
  }

  getHttpOptions() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type' : 'application/json'
      })
    }
    return httpOptions
  }

  upload(formData) {
    return this.http.post<any>(this.url.baseApiUrl + 'upload', formData, {
      reportProgress: true,
      observe: 'events'
    })
  }

  download(id: string): any {
    const httpOptions = {
      headers: new HttpHeaders({
        'responseType': 'arraybuffer',
        'Content-Type' : 'application/pdf'
      })
    }
    return this.http.get<Blob>(this.url.baseApiUrl + 'download/' + id, { observe: 'response', responseType: 'blob' as 'json' } )
  }

  getUploads(): Observable<Uploads[]> {
    return this.http.get<Uploads[]>(this.url.baseApiUrl + 'uploads', this.getHttpOptions())
  }

  getUpload(id: string): Observable<Uploads> {
    return this.http.get<Uploads>(this.url.baseApiUrl + 'uploads/' + id, this.getHttpOptions())
  }

  addUploads(upload: Uploads): Observable<Uploads> {
    return this.http.post<Uploads>(this.url.baseApiUrl + 'uploads', upload, this.getHttpOptions())
  }

  putUploads(id: string, upload: Uploads): Observable<Uploads> {
    return this.http.put<Uploads>(this.url.baseApiUrl + 'uploads/' + id, upload, this.getHttpOptions())
  }

  deleteUploads(id: string): Observable<Uploads> {
    return this.http.delete<Uploads>(this.url.baseApiUrl + 'uploads/' + id, this.getHttpOptions())
  }

}
