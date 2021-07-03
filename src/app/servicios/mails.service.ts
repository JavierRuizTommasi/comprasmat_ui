import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http'
import { UrlproviderService } from './urlprovider.service'
import { Observable } from 'rxjs';
import { Mails } from 'src/app/models/Mails'

@Injectable({
  providedIn: 'root'
})
export class MailsService {

  constructor(
    private http: HttpClient,
    public url: UrlproviderService) {
      // console.log('Servicio Mails OK')
    }

    getHttpOptions() {
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type' : 'application/json'
        })
      }
      return httpOptions
  }

  sendMail(mail: Mails): Observable<Mails> {
    return this.http.post<any>(this.url.baseApiUrl + 'sendemail', mail, this.getHttpOptions())
  }

  // sendMailsToSuppliers(mailsToSuppliers: MailsToSuppliers): Observable<MailsToSuppliers> {
  //   return this.http.put<MailsToSuppliers>(this.url.baseApiUrl + 'sendMailsToSuppliers', mailsToSuppliers, this.getHttpOptions())
  // }

}
