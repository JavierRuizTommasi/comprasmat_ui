import { Component, OnInit, Output, EventEmitter, AfterViewInit, ViewChild } from '@angular/core';
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
import { OffersService } from 'src/app/servicios/offers.service'
import { Offers } from 'src/app/models/Offers';
import { TendersService } from 'src/app/servicios/tenders.service'
import { Tenders } from 'src/app/models/Tenders';
import { ProductosService } from 'src/app/servicios/productos.service'
import { Productos } from 'src/app/models/Products';
import * as moment from 'moment'
import { MatDialog } from '@angular/material/dialog'
import { AlertMessagesComponent } from 'src/app/componentes/alert-messages/alert-messages.component'
import { arEstadosOfertas } from 'src/app/models/EstadosOfertas'
import { arIncoterms } from 'src/app/models/Incoterms'
import { arUnidades } from 'src/app/models/Unidades'

@Component({
  selector: 'app-ofertas',
  templateUrl: './ofertas.component.html',
  styleUrls: ['./ofertas.component.css']
})
export class OfertasComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator
  @ViewChild(MatSort) sort: MatSort
  @ViewChild(MatTable) table: MatTable<Offers>

  dataSource: MatTableDataSource<Offers> = new MatTableDataSource<Offers>()

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns: string[] = ['oferta', 'usuario', 'licitacion', 'descrip', 'cantidad', 'unidad', 'precio', 'incoterm', 'entrega', 'estado', 'actions']

  strTipo: string
  idIdx: string

  public cuenta: Cuenta
  @Output() actualizaCuenta = new EventEmitter()

  esp: boolean
  public lang: Language = {esp: true}
  @Output() actualizaLang = new EventEmitter()

  offers: Offers [] = []
  offer: Offers
  offUpt: Offers

  tenders: Tenders[] = [] 

  products: Productos[] = [] 

  f: FormGroup

  siGrabo: boolean
  msgGrabo: string

  notDone: boolean = true

  estadosOfertas = arEstadosOfertas
  incoterms = arIncoterms
  unidades = arUnidades

  filterValues = {}
  filterSelectObj = []

  constructor(
    private fb: FormBuilder,
    private comunicacionService: ComunicacionService,
    private modalService: NgbModal,
    private languageService: LanguageService,
    private usuariosService: UsuariosService,
    private offersService: OffersService,
    private tenderService: TendersService,
    private productService: ProductosService,
    private router: Router,
    public dialog: MatDialog
  ) {

    if (!this.usuariosService.isLogin()) {
      this.router.navigateByUrl('/login')
    }

    this.f = fb.group({
      id: [''],
      oferta: [''],
      licitacion: ['',
        Validators.compose([
        Validators.required
      ])],
      usuario: ['',
        Validators.compose([
        Validators.required
      ])],
      email: ['',
        Validators.compose([
        Validators.required
      ])],
      proveedor: ['',
        Validators.compose([
        Validators.required
      ])],
      provenom: ['',
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
      producto: [{value: '', disabled: true},
        Validators.compose([
        Validators.required
      ])],
      descrip: [{value: '', disabled: true},
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
      costo: ['',
        Validators.compose([
        Validators.required
      ])],
      precio: ['',
        Validators.compose([
        Validators.required
      ])],
      incoterm: ['',
        Validators.compose([
        Validators.required
      ])],
      entrega: ['',
        Validators.compose([
        Validators.required
      ])],
      estado: ['',
        Validators.compose([
        Validators.required
      ])],
      detalle: ['']
    })

    this.languageService.esp$.subscribe((lang: Language) => {
      this.esp = lang.esp
    })

    this.comunicacionService.cuenta$.subscribe((cuenta: Cuenta) => {
      this.cuenta = cuenta
    })

    this.filterSelectObj = [
      {
        name: 'USUARIO',
        nameeng: 'USER',
        columnProp: 'usuario',
        options: []
      },
      {
        name: 'PRODUCTO',
        nameeng: 'PRODUCT',
        columnProp: 'descrip',
        options: []
      }
    ]
  }

  ngOnInit(): void {
    this.pedirDatos()
  }

  ngAfterViewInit() {
    // console.log(this.dataSource)
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;

    // Overrride default filter behaviour of Material Datatable
    this.dataSource.filterPredicate = this.createFilter()
  }
  
  async getUserData() {
    const resp: any = await this.usuariosService.checkUsuario().toPromise()
    console.log(resp.user)
    return resp.user
  }

  async pedirDatos() {
    // Esta funcion pide todos los datos previos antes de mostrar en el browser
    // getUserData() Chequea si el usuario esta logeado 
    // checkCuenta() Avisa al Navbar sino 
    // pedirTenders() Trae datos del Servicio Tenders
    // pedirOffers() Trae datos del Servicio Offers
    // pedirSampres() trae datos del Servicio Samples pero solo en caso que el usuario este logeado  

    console.log('pedirDatos')
    const user = await this.getUserData()
    this.checkCuenta(user)

    // await this.pedirTenders(user)
    // await this.pedirOffers(user)
    await this.pedirProducts()
    await this.pedirTenders(user)
    await this.pedirOffers(user)

    this.notDone = false
  
  }

  checkCuenta(user) {
    // esta funcion verifica si el usuario esta logeado y asigna 
    // los datos del user a un objeto cuenta[] y tambien la variable esp
    // si no lo encuentra deberia devolver cuenta como undefined
    console.log('checkUser')
    // console.log(user)
    if (user) {
      // console.log(user)
      this.cuenta = user
      this.esp = (this.cuenta.language === 'es')

      if (user.perfil == 5) {
        // User Pending
        this.router.navigateByUrl('/inicio')
      }
    }
    else {
      console.log('no logueado')
      this.usuariosService.removeToken()
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
  
  async pedirOffers(user) {
    let resp: any
    if (user) {
      // console.log('Offers')
      if (user.perfil == 4) {
        // console.log('Proveedor', user.perfil)
        resp = await this.offersService.findMyOffers(user.usuario).toPromise()
      } else {
        // console.log('Actives')
        resp = await this.offersService.getOffers().toPromise()
        // console.log(resp)
      }

      this.dataSource.data = resp.Offers
      this.dataSource.sort = this.sort
      this.dataSource.paginator = this.paginator
      this.table.dataSource = this.dataSource

      // this.offers = resp.Offers
      this.notDone = false
      console.log(this.dataSource)

      this.filterSelectObj.filter((o) => {
        o.options = this.getFilterObject(this.dataSource.data, o.columnProp);
      })
    }

  }

  async pedirTenders(user) {
      this.tenderService.getTenders()
      .subscribe((resp: any) => {
        // console.log(resp)
        this.tenders = resp.Tenders
      })
  }

  async pedirProducts() {
    this.productService.getProductos()
    .subscribe((resp: any) => {
      // console.log(resp)
      this.products = resp.Products
    })
  }

  openModal(targetModal, offer, strTipoParam) {
    this.strTipo = strTipoParam

    this.modalService.open(targetModal, {
     centered: true,
     backdrop: 'static'
    })

    if (strTipoParam === 'A') {
      this.f.patchValue({
        id: '',
        oferta: 0,
        licitacion: 0,
        usuario: this.cuenta.usuario,
        email: this.cuenta.email,
        proveedor: this.cuenta.proveedor,
        provenom: this.cuenta.nombre,
        fecha: moment().format().substr(0, 10) ,
        finaliza: moment().format().substr(0, 10),
        producto: 0,
        descrip: '',
        cantidad: '',
        unidad: '',
        costo: '',
        precio: '',
        incoterm: '',
        entrega: '',
        estado: 1,
        detalle: ''
      })
    } else {
      this.f.patchValue({
        id: offer._id,
        oferta: offer.oferta,
        licitacion: offer.licitacion,
        usuario: offer.usuario,
        email: offer.email,
        proveedor: offer.proveedor,
        provenom: offer.provenom,
        fecha: offer.fecha.substr(0,10) ,
        finaliza: offer.finaliza.substr(0,10),
        producto: offer.producto,
        descrip: offer.descrip,
        cantidad: offer.cantidad,
        unidad: offer.unidad,
        costo: offer.costo,
        precio: offer.precio,
        incoterm: offer.incoterm,
        entrega: offer.entrega.substr(0,10),
        estado: offer.estado,
        detalle: offer.detalle
      })
    }

    if (strTipoParam === 'B') {
      this.f.disable()
    } else {
      this.f.enable()

      if (this.cuenta.perfil !== 0 && this.cuenta.perfil !== 2) {
        this.f.get('estado').disable({ onlySelf: true })
        this.f.get('producto').disable({ onlySelf: true })
      }

    }

  }

  onSubmit() {
    console.log(this.strTipo)

    this.modalService.dismissAll()
    // console.log('res:', this.f.getRawValue())

    this.idIdx = this.f.controls.id.value
    this.offUpt = {
      oferta: this.f.controls.oferta.value,
      licitacion: this.f.controls.licitacion.value,
      usuario: this.f.controls.usuario.value,
      email: this.f.controls.email.value,
      proveedor: this.f.controls.proveedor.value,
      provenom: this.f.controls.provenom.value,
      fecha: this.f.controls.fecha.value,
      finaliza: this.f.controls.finaliza.value,
      producto: this.f.controls.producto.value,
      descrip: this.f.controls.descrip.value,
      cantidad: this.f.controls.cantidad.value,
      unidad: this.f.controls.unidad.value,
      costo: this.f.controls.costo.value,
      precio: this.f.controls.precio.value,
      incoterm: this.f.controls.incoterm.value,
      entrega: this.f.controls.entrega.value,
      estado: this.f.controls.estado.value,
      detalle: this.f.controls.detalle.value
    }

    switch (this.strTipo) {
      case 'A':
        // Alta
        this.agregarOferta()
        break
      case 'B':
        // Baja
        this.borrarOferta()
        break
      case 'M':
        // Modificar
        this.modificarOferta()
        break
    }
  }

  agregarOferta() {
    this.offersService.addOffer(this.offUpt)
      .subscribe((offer: Offers) => {
        // console.log('Alta:', offer)
        if (offer) {
          this.alertMsg()
        }
        this.pedirDatos()
      })
   }

  borrarOferta() {
    this.offersService.deleteOffer(this.idIdx)
     .subscribe((offer: Offers) => {
      //  console.log('Baja:', offer)
      if (offer) {
        this.alertMsg()
      }
      this.pedirDatos()
    })
  }

  modificarOferta() {
    // console.log(this.offUpt)
    this.offersService.putOffer(this.idIdx, this.offUpt)
      .subscribe((offer: Offers) => {
      // console.log('Modif:', offer)
      if (offer) {
        this.alertMsg()
      }
      this.pedirDatos()
    })
  }

  changeTender(ev) {
    // console.log(ev)
    this.f.get('licitacion').setValue(ev.target.value, {
      onlySelf: true
    })
    
    console.log(ev.target.value)

    for(const tender of this.tenders){
      if (tender.licitacion == ev.target.value){
        // console.log('Igual')
        // result.push(tender)

        this.f.get('producto').setValue((tender.producto), {
          onlySelf: true
        })
    
        this.f.get('descrip').setValue((tender.descrip), {
          onlySelf: true
        })
    
        this.f.get('costo').setValue((tender.costo), {
          onlySelf: true
        })
    
        // this.f.get('cantidad').setValue((tender.cantidad), {
        //   onlySelf: true
        // })
    
        // this.f.get('unidad').setValue((tender.unidad), {
        //   onlySelf: true
        // })
    
      }
    }

    // console.log(result)

  }

  alertMsg(): void {
    let strConfMsg = ''
    switch (this.strTipo) {
      case 'A':
        // Alta
        strConfMsg = this.esp ? 'Oferta Creada!' : 'Offer Created!' 
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

  getFilterObject(fullObj, key) {
    const uniqChk = []
    fullObj.filter((obj) => {
      if (!uniqChk.includes(obj[key])) {
        uniqChk.push(obj[key])
      }
      return obj
    })
    return uniqChk
  }

  // Called on Filter change
  filterChange(filter, event) {
    //let filterValues = {}
    this.filterValues[filter.columnProp] = event.target.value.trim().toLowerCase()
    this.dataSource.filter = JSON.stringify(this.filterValues)
  }

  // Custom filter method fot Angular Material Datatable
  createFilter() {
    let filterFunction = function (data: any, filter: string): boolean {
      let searchTerms = JSON.parse(filter);
      let isFilterSet = false;
      for (const col in searchTerms) {
        if (searchTerms[col].toString() !== '') {
          isFilterSet = true;
        } else {
          delete searchTerms[col];
        }
      }

      console.log(searchTerms);

      let nameSearch = () => {
        let found = false;
        if (isFilterSet) {
          for (const col in searchTerms) {
            searchTerms[col].trim().toLowerCase().split(' ').forEach(word => {
              if (data[col].toString().toLowerCase().indexOf(word) != -1 && isFilterSet) {
                found = true
              }
            });
          }
          return found
        } else {
          return true;
        }
      }
      return nameSearch()
    }
    return filterFunction
  }

  // Reset table filters
  resetFilters() {
    this.filterValues = {}
    this.filterSelectObj.forEach((value, key) => {
      value.modelValue = undefined;
    })
    this.dataSource.filter = "";
  }

}
