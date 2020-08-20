import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http'
import { UrlproviderService } from './urlprovider.service'
import { Observable } from 'rxjs';
import { MyProducts } from 'src/app/models/MyProducts'

@Injectable({
  providedIn: 'root'
})
export class MyProductsService {

  constructor(
    private http: HttpClient, 
    public url: UrlproviderService) {
      console.log('Servicio MyProducts OK')
  }

  getHttpOptions() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type' : 'application/json'
      })
    }
    return httpOptions
  }

  getMyProducts(): Observable<MyProducts[]> {
    return this.http.get<MyProducts[]>(this.url.baseApiUrl + 'myproducts', this.getHttpOptions())
  }

  findMyProducts(usuario: string): Observable<MyProducts[]> {
    return this.http.get<MyProducts[]>(this.url.baseApiUrl + 'findmyproducts/' + usuario, this.getHttpOptions())
  }

  postMyProducts(myprod: MyProducts[]) {
    return this.http.post<MyProducts[]>(this.url.baseApiUrl + 'myproducts', myprod, this.getHttpOptions())
  }

  // putMyProducts(id: number, myprod: IMyProdUpt) {
  //   return this.http.put<IMyProdUpt>(this.url.baseApiUrl + 'myproducts/' + id, myprod, this.getHttpOptions())
  // }

  deleteMyProducts(id: string): Observable<MyProducts> {
    return this.http.delete<MyProducts>(this.url.baseApiUrl + 'myproducts/' + id, this.getHttpOptions())
  }
}