import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http'
import { UrlproviderService } from './urlprovider.service'
import { Observable } from 'rxjs';
import { MailsToSuppliers } from 'src/app/models/MailsToSuppliers'

@Injectable({
  providedIn: 'root'
})
export class MailsToSuppliersService {

  constructor(
    private http: HttpClient,
    public url: UrlproviderService) {
      // console.log('Servicio MailsToSuppliers OK')
    }

    getHttpOptions() {
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type' : 'application/json'
        })
      }
      return httpOptions
  }

  getMailsToSuppliers() {
    return this.http.get<MailsToSuppliers[]>(this.url.baseApiUrl + 'mailsToSuppliers', this.getHttpOptions())
  }

  getMailToSupplier(id: string): Observable<MailsToSuppliers> {
    return this.http.get<MailsToSuppliers>(this.url.baseApiUrl + 'mailsToSuppliers/' + id, this.getHttpOptions())
  }

  addMailsToSuppliers(mailsToSuppliers: MailsToSuppliers): Observable<MailsToSuppliers> {
    return this.http.post<MailsToSuppliers>(this.url.baseApiUrl + 'mailsToSuppliers', mailsToSuppliers, this.getHttpOptions())
  }

  putMailsToSuppliers(id: string, mailsToSuppliers: MailsToSuppliers): Observable<MailsToSuppliers> {
    return this.http.put<MailsToSuppliers>(this.url.baseApiUrl + 'mailsToSuppliers/' + id, mailsToSuppliers, this.getHttpOptions())
  }

  deleteMailsToSuppliers(id: string): Observable<MailsToSuppliers> {
    return this.http.delete<MailsToSuppliers>(this.url.baseApiUrl + 'mailsToSuppliers/' + id, this.getHttpOptions())
  }

  sendMailsToSuppliers(mailsToSuppliers: MailsToSuppliers): Observable<MailsToSuppliers> {
    return this.http.put<MailsToSuppliers>(this.url.baseApiUrl + 'sendMailsToSuppliers', mailsToSuppliers, this.getHttpOptions())
  }

}
