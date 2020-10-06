import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http'
import { UrlproviderService } from './urlprovider.service'
import { Observable } from 'rxjs';
import { Suppliers } from 'src/app/models/Suppliers'

@Injectable({
  providedIn: 'root'
})
export class SuppliersService {

  constructor(
    private http: HttpClient,
    public url: UrlproviderService) {
      // console.log('Servicio Suppliers OK')
  }

  getHttpOptions() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type' : 'application/json'
      })
    }
    return httpOptions
  }

  getSuppliers(): Observable<Suppliers[]> {
    return this.http.get<Suppliers[]>(this.url.baseApiUrl + 'suppliers', this.getHttpOptions())
  }

  getSupplier(id: string): Observable<Suppliers> {
    return this.http.get<Suppliers>(this.url.baseApiUrl + 'suppliers/' + id, this.getHttpOptions())
  }

  addSuppliers(supplier: Suppliers): Observable<Suppliers> {
    return this.http.post<Suppliers>(this.url.baseApiUrl + 'suppliers', supplier, this.getHttpOptions())
  }

  putSuppliers(id: string, supplier: Suppliers): Observable<Suppliers> {
    return this.http.put<Suppliers>(this.url.baseApiUrl + 'suppliers/' + id, supplier, this.getHttpOptions())
  }

  deleteSuppliers(id: string): Observable<Suppliers> {
    return this.http.delete<Suppliers>(this.url.baseApiUrl + 'suppliers/' + id, this.getHttpOptions())
  }

}
