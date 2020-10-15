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
import { ProductosService } from 'src/app/servicios/productos.service'
import { Productos } from 'src/app/models/Products';
import { MatDialog } from '@angular/material/dialog'
import { AlertMessagesComponent } from 'src/app/componentes/alert-messages/alert-messages.component'
import { arEstadosLicitaciones } from 'src/app/models/EstadosLicitaciones'
import { arUnidades } from 'src/app/models/Unidades'

@Component({
  selector: 'app-licitaciones',
  templateUrl: './licitaciones.component.html',
  styleUrls: ['./licitaciones.component.css']
})
export class LicitacionesComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator
  @ViewChild(MatSort) sort: MatSort
  @ViewChild(MatTable) table: MatTable<Tenders>

  dataSource: MatTableDataSource<Tenders> = new MatTableDataSource<Tenders>()

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns: string[] = ['licitacion', 'descrip', 'cantidad', 'fecha', 'finaliza', 'historico', 'estado', 'actions']

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

  products: Productos[] = [] 

  f: FormGroup

  siGrabo: boolean
  msgGrabo: string

  notDone: boolean = true

  estadosLicitaciones = arEstadosLicitaciones
  unidades = arUnidades

  constructor(
    private fb: FormBuilder,
    private comunicacionService: ComunicacionService,
    private modalService: NgbModal,
    private languageService: LanguageService,
    private usuariosService: UsuariosService,
    private tenderService: TendersService,
    private productService: ProductosService,
    private router: Router,
    public dialog: MatDialog
    ) {
      /* Debe dejar acceder a todos a ver las Licitaciones */
      // if (!this.usuariosService.isLogin()) {
      //   this.router.navigateByUrl('/login')
      // }
  
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
        detalle: [''],
        historico: 0
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

    await this.pedirProducts()
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

    }
    // Debe poder dejar acceder a ver las Licitaciones a todos
    // else {
    //   this.router.navigateByUrl('/login')
    // }

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
      this.tenderService.getTenders()
      .subscribe((resp: any) => {
        // console.log(resp)
        this.dataSource.data = resp.Tenders
        this.dataSource.sort = this.sort
        this.dataSource.paginator = this.paginator
        this.table.dataSource = this.dataSource

        // this.tenders = resp.Tenders        
        this.notDone = false
      })
    } else {
      // console.log('Actives')
      this.tenderService.getActives()
      .subscribe((resp: any) => {
        // console.log(resp)
        this.dataSource.data = resp.Tenders
        this.dataSource.sort = this.sort
        this.dataSource.paginator = this.paginator
        this.table.dataSource = this.dataSource

        // this.tenders = resp.Tenders
        this.notDone = false
      })
    }
  }

  async pedirProducts() {
    this.productService.getProductos()
    .subscribe((resp: any) => {
      // console.log(resp)
      this.products = resp.Products
    })
  }

  openModal(targetModal, tender, strTipoParam) {
    this.strTipo = strTipoParam

    this.modalService.open(targetModal, {
     centered: true,
     backdrop: 'static'
    })

    if (strTipoParam === 'A') {
      this.f.patchValue({
        id: '',
        licitacion: '',
        fecha: moment().format().substr(0, 10) ,
        finaliza: moment().format().substr(0, 10),
        producto: 0,
        descrip: '',
        cantidad: '',
        unidad: '',
        costo: 0,
        ultcompra: '',
        proveedor: 0,
        provenom: '',
        estado: 1,
        historico: 0
      })
    } else {
      this.f.patchValue({
        id: tender._id,
        licitacion: tender.licitacion,
        fecha: tender.fecha.substr(0, 10) ,
        finaliza: tender.finaliza.substr(0, 10),
        producto: tender.producto,
        descrip: tender.descrip,
        cantidad: tender.cantidad,
        unidad: tender.unidad,
        costo: tender.costo,
        ultcompra: tender.ultcompra ? tender.ultcompra.substr(0, 10) : '', 
        proveedor: tender.proveedor,
        provenom: tender.provenom,
        estado: tender.estado,
        historico: tender.historico
      })
    }

    if (strTipoParam === 'B') {
      this.f.disable()
    } else {
      this.f.enable()
    }

  }

  onSubmit() {
    // console.log(this.strTipo)

    this.modalService.dismissAll()
    // console.log('res:', this.f.getRawValue())
    // console.log('res:', this.f.controls)

    this.idIdx = this.f.controls.id.value
    this.updtTender = {
      licitacion: this.f.controls.licitacion.value,
      fecha: this.f.controls.fecha.value,
      finaliza: this.f.controls.finaliza.value,
      producto: this.f.controls.producto.value,
      descrip: this.f.controls.descrip.value,
      cantidad: this.f.controls.cantidad.value,
      unidad: this.f.controls.unidad.value,
      costo: this.f.controls.costo.value,
      ultcompra: this.f.controls.ultcompra.value,
      proveedor: this.f.controls.proveedor.value,
      provenom: this.f.controls.provenom.value,
      estado: this.f.controls.estado.value,
      historico: this.f.controls.historico.value
    }

    switch (this.strTipo) {
      case 'A':
        // Alta
        this.agregarTender()
        break
      case 'B':
        // Baja
        this.borrarTender()
        break
      case 'M':
        // Modificar
        this.modificarTender()
        break
    }
  }

  agregarTender() {
    this.tenderService.addTender(this.updtTender)
      .subscribe((tender: Tenders) => {
        // console.log('Alta:', tender)
        if (tender) {
          this.alertMsg()
        }
        this.pedirDatos()
      })

   }

  borrarTender() {
    this.tenderService.deleteTender(this.idIdx)
     .subscribe((tender: Tenders) => {
      //  console.log('Baja:', tender)
      if (tender) {
        this.alertMsg()
      }
      this.pedirDatos()
    })

  }

  modificarTender() {
    // console.log(this.updtTender)

    this.tenderService.putTender(this.idIdx, this.updtTender)
      .subscribe((tender: Tenders) => {
        // console.log('Modif:', tender)
        if (tender) {
          // console.log(this.idIdx)
           this.tenderService.updateScoring(this.idIdx)
           this.alertMsg()
        }
        this.pedirDatos()
      })

  }

  changeProduct(ev) {
    // console.log(ev)
    this.f.get('producto').setValue(ev.target.value, {
      onlySelf: true
    })
    
    let resp: any = this.products.filter( x => x.codigo == ev.target.value)
    // console.log(resp)

    if (resp[0]) {
      // for(const prod of this.products){
      // if (prod.codigo == ev.target.value){
        // console.log('Igual')
        // result.push(tender)

        this.f.get('descrip').setValue((resp[0].descrip), {
          onlySelf: true
        })
    
        this.f.get('unidad').setValue((resp[0].unidad), {
          onlySelf: true
        })
    
        this.f.get('historico').setValue((resp[0].historico), {
          onlySelf: true
        })
    
        // this.f.get('cantidad').setValue((tender.cantidad), {
        //   onlySelf: true
        // })
    
        // this.f.get('unidad').setValue((tender.unidad), {
        //   onlySelf: true
        // })
    
      // }
    }

    // console.log(result)

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
}

