import { Injectable } from '@angular/core'
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http'
import { Observable, throwError } from 'rxjs'
import { UsuariosService } from './usuarios.service'
import { catchError, retry, finalize } from 'rxjs/operators'

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private usuariosService: UsuariosService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // console.log('Interceptor ->', request)
    let req = request
    const token = this.usuariosService.getToken()

    // console.log('Token ->', token)
    if (token) {
      req = request.clone({
        setHeaders : {
          'access-token': token
        }
      })
    }

    return next.handle(req)
    .pipe(
      //Retry on failure
      retry(2),

      //Handle errors
      catchError((errorResponse: HttpErrorResponse) => {
        if (errorResponse.error instanceof ErrorEvent) {
          console.log('Client Side Error: ', errorResponse.error.message)
        } else {
          console.log('Server Side Error:',  errorResponse)
        }
        alert(`There is a problem with the service. We are notified & working on it. Please try again later. HTTP Error: ${req.url}`)
        return throwError(errorResponse)
      }),

      //Profiling
      finalize(() => {
        const profilingMsg = `${req.method} "${req.urlWithParams}`
        console.log(profilingMsg)
      })

    )
  }
}
