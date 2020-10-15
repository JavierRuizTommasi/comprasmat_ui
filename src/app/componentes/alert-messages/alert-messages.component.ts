import { Component, OnInit, Inject } from '@angular/core';
import { Language } from 'src/app/models/Language'
import { LanguageService } from 'src/app/servicios/language.service'
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog'

export interface DialogData {
  tipo: string;
  mensaje: string;
  mensaje2: string;
  product: string;
  tender: string
}

@Component({
  selector: 'app-alert-messages',
  templateUrl: './alert-messages.component.html',
  styleUrls: ['./alert-messages.component.css']
})
export class AlertMessagesComponent implements OnInit {

  esp: boolean
  public lang: Language = {esp: true}

  constructor(
    private languageService: LanguageService,
    public dialogRef: MatDialogRef<AlertMessagesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {tipo: string, mensaje: string, mensaje2: string, product: string, tender: string}
    ) {     
      // console.log('Constructor')

      this.languageService.esp$.subscribe((lang: Language) => {
        this.esp = lang.esp
      })

  }

  ngOnInit(): void {
    // console.log(tipo)
  }

  onClickNo(): void {
    this.dialogRef.close(false)
  }

  onClickYes(): void {
    this.dialogRef.close(true);
  }

}
