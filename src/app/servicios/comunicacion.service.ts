import { Injectable } from '@angular/core'
import { ReplaySubject } from 'rxjs'

import { Cuenta } from 'src/app/models/Cuenta'

@Injectable({
  providedIn: 'root'
})
export class ComunicacionService {

  public cuenta$: ReplaySubject<Cuenta> = new ReplaySubject(1)

}
