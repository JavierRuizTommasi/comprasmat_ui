import { Injectable } from '@angular/core'
import { ReplaySubject } from 'rxjs'

import { Language } from 'src/app/models/Language'

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  public esp$: ReplaySubject<Language> = new ReplaySubject(1)

  checkLang() {
    navigator.language.substr(0, 2)

    let resp = false
    switch (navigator.language.substr(0, 2)) {
      case 'en': { resp = false; break }
      case 'es': { resp = true; break }
      default: {resp = false; break}
    }

    return resp

  }
}
