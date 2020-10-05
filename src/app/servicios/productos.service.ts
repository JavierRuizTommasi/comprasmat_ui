import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http'
import { UrlproviderService } from './urlprovider.service'
import { Observable } from 'rxjs';
import { Productos } from 'src/app/models/Products'

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  constructor(
    private http: HttpClient,
    public url: UrlproviderService) {
      // console.log('Servicio Productos OK')
  }

  getHttpOptions() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type' : 'application/json'
      })
    }
    return httpOptions
  }

  getProductos(): Observable<Productos[]> {
    return this.http.get<Productos[]>(this.url.baseApiUrl + 'products', this.getHttpOptions())
  }

  getProducto(id: string): Observable<Productos> {
    return this.http.get<Productos>(this.url.baseApiUrl + 'products/' + id, this.getHttpOptions())
  }

  addProductos(producto: Productos): Observable<Productos> {
    return this.http.post<Productos>(this.url.baseApiUrl + 'products', producto, this.getHttpOptions())
  }

  putProductos(id: string, producto: Productos): Observable<Productos> {
    return this.http.put<Productos>(this.url.baseApiUrl + 'products/' + id, producto, this.getHttpOptions())
  }

  deleteProductos(id: string): Observable<Productos> {
    return this.http.delete<Productos>(this.url.baseApiUrl + 'products/' + id, this.getHttpOptions())
  }

}
