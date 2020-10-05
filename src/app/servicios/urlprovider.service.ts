import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root'
})
export class UrlproviderService {

  constructor(public http: HttpClient) {
    // console.log('Urlprovider', environment.baseUrl)
   }

  baseApiUrl = environment.baseUrl

  // baseApiUrl = 'https://5e9b736b10bf9c0016dd1de3.mockapi.io/'
  // baseApiUrl = 'https://pronodeapi.herokuapp.com/api/'
  // baseApiUrl = 'http://localhost:8080/api/'

}
