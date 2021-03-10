import { Component, OnInit, Output, EventEmitter, AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Cuenta } from 'src/app/models/Cuenta'
import { ComunicacionService } from 'src/app/servicios/comunicacion.service'
import { UsuariosService } from 'src/app/servicios/usuarios.service'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { Router, ActivatedRoute } from '@angular/router'
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
import { arFinanciacion } from 'src/app/models/Financiacion'
import { Observable } from 'rxjs';

@Component({
  selector: 'app-ofertas',
  templateUrl: './ofertas.component.html',
  styleUrls: ['./ofertas.component.css']
})
export class OfertasComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator
  @ViewChild(MatSort) sort: MatSort
  @ViewChild(MatTable) table: MatTable<Offers>
  @ViewChild('editOfferModal', { static: false }) private editOfferModal

  dataSource: MatTableDataSource<Offers> = new MatTableDataSource<Offers>()

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns: string[] = ['oferta', 'usuario', 'licitacion', 'descrip', 'cantidad', 'precio', 'incoterm', 'entrega', 'estado', 'actions']

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
  financiaciones = arFinanciacion
  
  filterValues = {}
  filterSelectObj = []

  newOffer: Observable<string>

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
    public dialog: MatDialog,
    private activatedRoute: ActivatedRoute
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
      licitacion_id: [''],
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
      detalle: [''],
      scoreProveedor: [0],
      scorePrecio: [0],
      scoreEntrega: [0],
      scoreCantidad: [0],
      scoring: [0],
      financiacion: [0],
      scoreFinanciacion: [0]
    }, { validators: this.validaCantidad('licitacion', 'cantidad')})

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
    this.activatedRoute.params.subscribe(params => {
      // console.log(params);
      this.newOffer = params['nuevaoferta']
      // console.log(this.newOffer);
    })

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
    // console.log(resp.user)
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
    console.log('Products')
    await this.pedirTenders(user)
    console.log('Tenders')
    await this.pedirOffers(user)
    console.log('Offers')

    this.notDone = false

    if (this.newOffer) {
      // Que vino desde Activas
      await this.openModal(this.editOfferModal, this.offer, 'A')
    }
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
      // console.log(this.dataSource)

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
        licitacion: '',
        licitacion_id: '',
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
        incoterm: 'FOB',
        entrega: '',
        estado: 1,
        detalle: '',
        scoreProveedor: 0,
        scorePrecio: 0,
        scoreEntrega: 0,
        scoreCantidad: 0,
        scoring: 0,
        financiacion: 0,
        scoreFinanciacion: 0
      })
    } else {
      this.f.patchValue({
        id: offer._id,
        oferta: offer.oferta,
        licitacion: offer.licitacion,
        licitacion_id: offer.licitacion_id,
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
        detalle: offer.detalle,
        scoreProveedor: offer.scoreProveedor,
        scorePrecio: offer.scorePrecio,
        scoreEntrega: offer.scoreEntrega,
        scoreCantidad: offer.scoreCantidad,
        scoring: offer.scoring,
        financiacion: offer.financiacion,
        scoreFinanciacion: offer.scoreFinanciacion
      })
    }

    if (strTipoParam === 'B') {
      this.f.disable()
    } else {
      this.f.enable()

      if (this.cuenta.perfil !== 0 && this.cuenta.perfil !== 2) {
        this.f.get('estado').disable({ onlySelf: true })
        this.f.get('producto').disable({ onlySelf: true })
        this.f.get('unidad').disable({ onlySelf: true })
        this.f.get('incoterm').disable({ onlySelf: true })
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
      licitacion_id: this.f.controls.licitacion_id.value,
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
      detalle: this.f.controls.detalle.value,
      scoreProveedor: this.f.controls.scoreProveedor.value,
      scorePrecio: this.f.controls.scorePrecio.value,
      scoreEntrega: this.f.controls.scoreEntrega.value,
      scoreCantidad: this.f.controls.scoreCantidad.value,
      scoring: this.f.controls.scoring.value,
      financiacion: this.f.controls.financiacion.value,
      scoreFinanciacion: this.f.controls.scoreFinanciacion.value
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

    this.newOffer = undefined
    console.log(this.newOffer)
  }

  async agregarOferta() {
    let resp: any = await this.offersService.addOffer(this.offUpt).toPromise()
    if (resp) {
      console.log(resp)
      let updScoring: any = await this.tenderService.updateScoring(this.offUpt.licitacion_id).toPromise()
      await this.alertMsg()
    }
    await this.pedirDatos()
   }

  async borrarOferta() {
    let resp: any = await this.offersService.deleteOffer(this.idIdx).toPromise()
    if (resp) {
      console.log(resp)
      let updScoring: any = await this.tenderService.updateScoring(this.offUpt.licitacion_id).toPromise()
      await this.alertMsg()
    }
    await this.pedirDatos()
  }

  async modificarOferta() {
    let resp: any = await this.offersService.putOffer(this.idIdx, this.offUpt).toPromise()
    if (resp) {
      console.log(resp)
      let updScoring: any = await this.tenderService.updateScoring(this.offUpt.licitacion_id).toPromise()
      await this.alertMsg()
    }
    await this.pedirDatos()
  }

  // async calculaScoring(offer: Offers) {
  //   console.log('Calcula')

  //   let resp: any = this.products.filter( x => x.codigo == offer.producto)
  //   // console.log(resp)

  //   let valorHisto: number = 0
  //   if (resp[0]) {
  //     valorHisto = resp[0].historico
  //   }

  //   offer.scorePrecio = valorHisto

  //   return offer
  // }


  changeTender(ev) {
    // console.log(ev)
    this.f.get('licitacion').setValue(ev.target.value, {
      onlySelf: true
    })
    
    // console.log(ev.target.value)

    let resp: any = this.tenders.filter( x => x.licitacion == ev.target.value)
    // console.log(resp)

    if (resp[0]) {
      // for(const tender of this.tenders){
      // if (tender.licitacion == ev.target.value){
        // console.log(resp[0])
        // result.push(tender)

        this.f.get('licitacion_id').setValue((resp[0]._id), {
          onlySelf: true
        })
    
        this.f.get('producto').setValue((resp[0].producto), {
          onlySelf: true
        })
    
        this.f.get('descrip').setValue((resp[0].descrip), {
          onlySelf: true
        })
    
        this.f.get('costo').setValue((resp[0].costo), {
          onlySelf: true
        })
    
        // this.f.get('cantidad').setValue((resp.cantidad), {
        //   onlySelf: true
        // })
    
        this.f.get('unidad').setValue((resp[0].unidad), {
          onlySelf: true
        })
    
      // }
    }

    // console.log(result)

  }

  alertMsg(): void {
    console.log('Alert')
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
    return uniqChk.sort((a, b) => {
        if (a > b) {
            return 1;
        }
        if (a < b) {
            return -1;
        }
        return 0;
      }) 
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

      // console.log(searchTerms);

      let nameSearch = () => {
        let found = false;
        if (isFilterSet) {
          for (const col in searchTerms) {
            // searchTerms[col].trim().toLowerCase().split(' ').forEach(word => {
            //   if (data[col].toString().toLowerCase().indexOf(word) != -1 && isFilterSet) {
            //     found = true
            //   }
            // });
            if (searchTerms[col].trim().toLowerCase() == data[col].toString().trim().toLowerCase() && isFilterSet) {
                  found = true
            }
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

  validaCantidad(controlLicitacion: string, controlCantidad: string) {
    return (formGroup: FormGroup) => {
        const tender = formGroup.controls[controlLicitacion]
        const offerCantidad = formGroup.controls[controlCantidad]

        // console.log(control.value)
        // console.log(matchingControl.value)

        let resp: any = this.tenders.filter( x => x.licitacion == tender.value)
        // console.log(resp)

        if (resp[0]) {
          // for(const tender of this.tenders){
          // if (tender.licitacion == ev.target.value){
            // console.log(resp[0])
            // result.push(tender)

          let tenderCantidad = resp[0].cantidad

          if (offerCantidad.errors) {
              // return if another validator has already found an error on the Cantidad
              return
          }

          // set error on cantidad if validation fails
          if (tenderCantidad > offerCantidad.value) {
            offerCantidad.setErrors({ Menor: true })
          } else {
            offerCantidad.setErrors(null)
          }

        }
    }
  }

}
