import { Component, OnInit, Output, EventEmitter, AfterViewInit, ViewChild } from '@angular/core'
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Cuenta } from 'src/app/models/Cuenta'
import { ComunicacionService } from 'src/app/servicios/comunicacion.service'
import { UsuariosService } from 'src/app/servicios/usuarios.service'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { Router } from '@angular/router'
import { Language } from 'src/app/models/Language'
import { LanguageService } from 'src/app/servicios/language.service'
import { TendersService } from 'src/app/servicios/tenders.service'
import { Tenders } from 'src/app/models/Tenders'
import * as moment from 'moment'
import { OffersService } from 'src/app/servicios/offers.service'
import { Offers } from 'src/app/models/Offers';
import { MatDialog } from '@angular/material/dialog'
import { AlertMessagesComponent } from 'src/app/componentes/alert-messages/alert-messages.component'
import { arEstadosLicitaciones } from 'src/app/models/EstadosLicitaciones'
import { arUnidades } from 'src/app/models/Unidades'
import { trigger, state, style, animate, transition } from '@angular/animations'

@Component({
  selector: 'app-activas',
  templateUrl: './activas.component.html',
  styleUrls: ['./activas.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display: 'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

export class ActivasComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator
  @ViewChild(MatSort) sort: MatSort
  @ViewChild(MatTable) table: MatTable<Tenders>

  dataSource: MatTableDataSource<Tenders> = new MatTableDataSource<Tenders>()

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns: string[] = ['licitacion', 'descrip', 'cantidad', 'fecha', 'finaliza', 'estado', 'acciones']
  
  strTipo: string
  idIdx: string

  public cuenta: Cuenta
  @Output() actualizaCuenta = new EventEmitter()

  esp: boolean
  public lang: Language = {esp: true}
  @Output() actualizaLang = new EventEmitter()

  tenders: Tenders[] = []
  tender: Tenders
  updtTender: Tenders

  offers: Offers[] = [] 

  f: FormGroup

  siGrabo: boolean
  msgGrabo: string

  notDone: boolean = true

  estadosLicitaciones = arEstadosLicitaciones
  unidades = arUnidades

  canOffer = false

  constructor(
    private fb: FormBuilder,
    private comunicacionService: ComunicacionService,
    private modalService: NgbModal,
    private languageService: LanguageService,
    private usuariosService: UsuariosService,
    private tenderService: TendersService,
    private offerService: OffersService,
    private router: Router,
    public dialog: MatDialog
    ) {
      if (!this.usuariosService.isLogin()) {
        this.router.navigateByUrl('/login')
      }
  
      this.f = fb.group({
        id: [''],
        licitacion: ['',
          Validators.compose([
          Validators.required
        ])],
        fecha: ['',
          Validators.compose([
          Validators.required
        ])],
        finaliza: ['',
          Validators.compose([
          Validators.required
        ])],
        producto: ['',
          Validators.compose([
          Validators.required
        ])],
        descrip: ['',
          Validators.compose([
          Validators.required
        ])],
        cantidad: ['',
          Validators.compose([
          Validators.required
        ])],
        unidad: ['',
          Validators.compose([
          Validators.required
        ])],
        costo: [''],
        ultcompra: [''],
        proveedor: [''],
        provenom: [''],
        estado: ['',
          Validators.compose([
          Validators.required
        ])],
        detalle: ['']
      })

        this.languageService.esp$.subscribe((lang: Language) => {
        this.esp = lang.esp
      })

      // console.log('Tenders Constructor')
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

    await this.pedirOffers()
    await this.pedirTenders(user)
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
      this.canOffer = (this.cuenta.perfil===0 || this.cuenta.perfil===2 || this.cuenta.perfil===4)
      // console.log(this.canOffer)
    }
    else {
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
  
  async pedirTenders(user) {
    if (user) {
      // console.log('Tenders')
      let resp: any = await this.tenderService.getTenders().toPromise()
      // .subscribe((resp: Tenders) => {
        // console.log(resp.Tenders)
        this.dataSource.data = resp.Tenders
        this.dataSource.sort = this.sort
        this.dataSource.paginator = this.paginator
        this.table.dataSource = this.dataSource

        // this.tenders = resp.Tenders        
        this.notDone = false
      // })
    } else {
      // console.log('Actives')
      let resp: any = await this.tenderService.getActives().toPromise()
      // resp.Tenders = Object.keys(resp.Tenders).map(e=>resp.Tenders[e])

      // .subscribe((resp: Tenders) => {
        // console.log(resp.Tenders)
        this.dataSource.data = resp.Tenders
        this.dataSource.sort = this.sort
        this.dataSource.paginator = this.paginator
        this.table.dataSource = this.dataSource

        // this.tenders = resp.Tenders
        this.notDone = false
      // })
    }
  }

  async pedirOffers() {
    let resp: any = await this.offerService.getOffers().toPromise()
    // .subscribe((resp: Offers) => {
      // console.log(resp)
      this.offers = resp.Offers
    // })
  }
  
  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }

  alertMsg(): void {

    let strConfMsg = ''
    switch (this.strTipo) {
      case 'A':
        // Alta
        strConfMsg = this.esp ? 'Licitación Creada!' : 'Tender Created!' 
        break
      case 'B':
        // Baja
        strConfMsg = this.esp ? 'Licitación Borrada!' : 'Tender Deleted!' 
        break
      case 'M':
        // Modificar
        strConfMsg = this.esp ? 'Licitación Modificada!' : 'Tender Updated!' 
        break
      default:
        break
    }
    
    const dialogRef = this.dialog.open(AlertMessagesComponent, {
      width: '300px',
      data: {tipo: 'Aviso', mensaje: strConfMsg}
    })
  
  }

  getFilterByTender(tender: string) {
    let newOff: Offers[] = []
    newOff = this.offers.filter( x => x.licitacion_id == tender)

    newOff.sort((a, b) => {
      if(a.scoring < b.scoring) {
        return 1
      } 
      if (a.scoring > b.scoring) {
        return -1
      }
      return 0
    })
    
    // console.log(newOff)

    // return this.offers.filter( x => x.licitacion_id == tender)
    return newOff
  }

  makeAnOffer() {
    this.router.navigateByUrl('/ofertas/:nuevaoferta')
  }

}

