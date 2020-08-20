import { Injectable } from '@angular/core'
import { Subject } from 'rxjs'
import { debounceTime } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class MensajesService {

  public msgSuccess = new Subject<string>()

  constructor() {
    console.log('funcionando servicio Mensajes')
  }

  mensaje(staticAlertClosed: boolean, successMessage: string): void {
    setTimeout(() => staticAlertClosed = true, 20000)
    console.log(successMessage)
    console.log(staticAlertClosed)

    this.msgSuccess.subscribe((message: string) => successMessage = message)
    this.msgSuccess.pipe(
      debounceTime(5000)
    ).subscribe(() => successMessage = '')
  }

  changeSuccessMessage() {
    this.msgSuccess.next('${new Date()} - Message successfully changed.')
    console.log(this.msgSuccess)
  }

}
