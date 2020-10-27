import { Component, OnInit, Output, EventEmitter, AfterViewInit, ViewChild } from '@angular/core'
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Cuenta } from 'src/app/models/Cuenta'
import { ComunicacionService } from 'src/app/servicios/comunicacion.service'
import { UsuariosService } from 'src/app/servicios/usuarios.service'
import { Router } from '@angular/router'
import { Language } from 'src/app/models/Language'
import { LanguageService } from 'src/app/servicios/language.service'
import { TendersService } from 'src/app/servicios/tenders.service'
import { Tenders } from 'src/app/models/Tenders'
import { MailsToSuppliersService } from 'src/app/servicios/mailsToSuppliers.service'
import { MailsToSuppliers } from 'src/app/models/MailsToSuppliers'
import * as moment from 'moment'
import { MatDialog } from '@angular/material/dialog'
import { AlertMessagesComponent } from 'src/app/componentes/alert-messages/alert-messages.component'
import { arEstadosLicitaciones } from 'src/app/models/EstadosLicitaciones'
import { arUnidades } from 'src/app/models/Unidades'

@Component({
  selector: 'app-mailsToSuppliers',
  templateUrl: './mailsToSuppliers.component.html',
  styleUrls: ['./mailsToSuppliers.component.css']
})
export class MailsToSuppliersComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator
  @ViewChild(MatSort) sort: MatSort
  @ViewChild(MatTable) table: MatTable<MailsToSuppliers>

  dataSource: MatTableDataSource<MailsToSuppliers> = new MatTableDataSource<MailsToSuppliers>()

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns: string[] = ['licitacion', 'producto', 'fecha', 'usuario', 'proveedor', 'email']

  strTipo: string
  idIdx: string

  public cuenta: Cuenta
  @Output() actualizaCuenta = new EventEmitter()

  esp: boolean
  public lang: Language = {esp: true}
  @Output() actualizaLang = new EventEmitter()

  tenders: Tenders[] = []
  tender: Tenders

  mailsToSuppliers: MailsToSuppliers[] = []
  mailsToSupplier: MailsToSuppliers

  notDone: boolean = true

  estadosLicitaciones = arEstadosLicitaciones
  unidades = arUnidades

  constructor(
    private comunicacionService: ComunicacionService,
    private languageService: LanguageService,
    private usuariosService: UsuariosService,
    private mailsToSuppliersService: MailsToSuppliersService,
    private tenderService: TendersService,
    private router: Router,
    public dialog: MatDialog
    ) {
      /* Debe dejar acceder a todos a ver las Licitaciones */
      if (!this.usuariosService.isLogin()) {
        this.router.navigateByUrl('/login')
      }

      this.languageService.esp$.subscribe((lang: Language) => {
        this.esp = lang.esp
      })

      this.comunicacionService.cuenta$.subscribe((cuenta: Cuenta) => {
        this.cuenta = cuenta
      })

  }

  ngOnInit(): void {
    // console.log('Tenders OnInit')
    this.comunicacionService.cuenta$.subscribe((cuenta: Cuenta) => {
      this.cuenta = cuenta
    })

    this.pedirDatos()
  }

  ngAfterViewInit() {
    // console.log(this.dataSource)
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;

    // Overrride default filter behaviour of Material Datatable
    // this.dataSource.filterPredicate = this.createFilter()

  }

  async getUserData() {
    const resp: any = await this.usuariosService.checkUsuario().toPromise()
    // console.log(resp.user)
    return resp.user
  }

  async pedirDatos() {
    // Esta funcion pide todos los datos previos antes de mostrar en el browser
    // getUserData() Chequea si el usuario esta logeado 
    // checkCuenta() Avisa al Navbar sino 
    // pedirProductos() Trae datos del Servicio Productos

    // console.log('pedirDatos')
    const user = await this.getUserData()
    this.checkCuenta(user)

    await this.pedirMailsToSuppliers(user)
    await this.pedirTenders()
  }
    
  checkCuenta(user) {
    // esta funcion verifica si el usuario esta logeado y asigna 
    // los datos del user a un objeto cuenta[] y tambien la variable esp
    // si no lo encuentra deberia devolver cuenta como undefined
    // console.log('checkUser')
    // console.log(user)
    if (user) {
      // console.log(user)
      this.cuenta = user
      this.esp = (this.cuenta.language === 'es')

    } else {
    // Debe poder dejar acceder a ver las Licitaciones a todos
      this.router.navigateByUrl('/login')
    }

    this.comunicacionService.cuenta$.next(this.cuenta)
    this.actualizaCuenta.emit(this.cuenta)
    // console.log(user)
  
    this.lang = {esp: this.esp}
    this.languageService.esp$.next(this.lang)
    this.actualizaLang.emit(this.lang)
    // console.log(this.esp)

  }
  
  async pedirMailsToSuppliers(user) {
    if (user) {
      // console.log('MailsToSuppliers')
      this.mailsToSuppliersService.getMailsToSuppliers()
      .subscribe((resp: any) => {
        // console.log(resp)
        this.dataSource.data = resp.MailsToSuppliers
        this.dataSource.sort = this.sort
        this.dataSource.paginator = this.paginator
        this.table.dataSource = this.dataSource

        this.mailsToSuppliers = resp.MailsToSuppliers
        // this.MailsToSuppliers = resp.MailsToSuppliers        
        this.notDone = false
      })
    }
  }

  async pedirTenders() {
    this.tenderService.getTenders()
    .subscribe((resp: any) => {
      // console.log(resp)
      this.tenders = resp.Tenders
    })
  }

  applyFilter(ev): void {
    // this.dataSource.filter = filterValue.trim().toLowerCase()
    // console.log(ev.target.value)
    // console.log(this.mailsToSuppliers)

    let newMails: any = this.mailsToSuppliers.filter( x => x.licitacion == ev.target.value)

    // console.log(newMails)
    this.dataSource = newMails
    this.table.dataSource = this.dataSource
  }

  alertMsg(strTipo) {
    let strConfMsg: string = ''
    switch (strTipo) {
      case 'A':
        // Confirma
        strConfMsg = this.esp ? 'Mails Enviados!' : 'Emails Sent!' 
        break
      case 'B':
        // Baja
        strConfMsg = this.esp ? 'Oferta Borrada!' : 'Offer Deleted!' 
        break
      case 'M':
        // Modificar
        strConfMsg = this.esp ? 'Oferta Modificada!' : 'Offer Updated!' 
        break
      default:
        break
    }
    
    const dialogRef = this.dialog.open(AlertMessagesComponent, {
      width: '300px',
      data: {tipo: 'Aviso', mensaje: strConfMsg}
    })

  }

  async sendEmails(tender) {
    if (tender) {
      console.log(tender)

      let resp: any = this.tenders.filter( x => x.licitacion == tender)

      let strConfMsg = this.esp ? 'El sistema comenzará a enviar los mails a los proveedores que ofrezcan el producto '+ resp[0].descrip + '. Confirma el Envío de mails para la Licitación ' + resp[0].licitacion + '?' : 'The system will start sending the emails to the suppliers which are offering the product '+ resp[0].descrip + '. Confirm of sending the emails for the tender ' + resp[0].licitacion + '?' 
      
      this.dialog
      .open(AlertMessagesComponent, {
        width: '400px',
        data: {
          tipo: 'Confirma Mails', 
          mensaje: this.esp ? 'El sistema comenzará a enviar los mails a los proveedores que ofrezcan el producto ' : 'The system will start sending the emails to the suppliers which are offering the product ',
          mensaje2: this.esp ? '. Confirma el Envío de mails para la Licitación ' : '. Confirm of sending the emails for the tender ',
          product: resp[0].descrip,
          tender: resp[0].licitacion
          }})
      .afterClosed()
      .subscribe((conf: Boolean) => {

        if (conf) {
          if (resp[0]) {
            // console.log(resp[0])

            this.mailsToSuppliersService.sendMailsToSuppliers(resp[0])
            .subscribe((resp: any) => {
              console.log(resp)
              this.pedirDatos()
              this.alertMsg('A')
           })
          }
        }

      })

    }
  }

}