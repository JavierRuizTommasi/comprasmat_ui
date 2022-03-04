import { Component, OnInit, Output, EventEmitter, AfterViewInit, ViewChild } from '@angular/core';
import { HttpResponse } from '@angular/common/http'
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
import { CotizacionesService } from 'src/app/servicios/cotizaciones.service'
import { Productos } from 'src/app/models/Products';
import * as moment from 'moment'
import { MatDialog } from '@angular/material/dialog'
import { AlertMessagesComponent } from 'src/app/componentes/alert-messages/alert-messages.component'
import { arEstadosOfertas } from 'src/app/models/EstadosOfertas'
import { arIncoterms } from 'src/app/models/Incoterms'
import { arUnidades } from 'src/app/models/Unidades'
import { arFinanciacion } from 'src/app/models/Financiacion'
import { arDiasEntrega } from 'src/app/models/DiasEntrega'
import { Observable } from 'rxjs';
import { SuppliersService } from 'src/app/servicios/suppliers.service'
import { Suppliers } from 'src/app/models/Suppliers'
import { UploadsService } from 'src/app/servicios/uploads.service'
import { Uploads } from 'src/app/models/Uploads'
import { arLugaresEntrega } from 'src/app/models/LugaresEntrega'

interface HtmlInputEvent extends Event {
  target: HTMLInputElement & EventTarget
} 

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
  displayedColumns: string[]

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
  exTender: Tenders
  
  products: Productos[] = [] 
  producto: Productos

  f: FormGroup

  siGrabo: boolean
  msgGrabo: string

  notDone: boolean = true

  estadosOfertas = arEstadosOfertas
  incoterms = arIncoterms
  unidades = arUnidades
  financiaciones = arFinanciacion
  diasEntrega = arDiasEntrega
  lugaresEntrega = arLugaresEntrega
  
  filterValues = {}
  filterSelectObj = []

  tenderToOffer: string = ''

  cotiza: number = 0

  suppliers: Suppliers[] = []

  file: File
  myFiles: Uploads[] = []
  uploads: Uploads[] = []

  docOfferDone: boolean = false

  params: {}

  nacional: boolean = true

  constructor(
    private fb: FormBuilder,
    private comunicacionService: ComunicacionService,
    private modalService: NgbModal,
    private languageService: LanguageService,
    private usuariosService: UsuariosService,
    private offersService: OffersService,
    private tenderService: TendersService,
    private productService: ProductosService,
    private cotizacionesService: CotizacionesService,
    private router: Router,
    public dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private suppliersService: SuppliersService,
    public uploadsService: UploadsService
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
      costo: [0],
      precio: [0],
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
      scoreFinanciacion: [0],
      scoreRanking: [0],
      precioPesos: [0],
      cotizacion: [0],
      desempeno: [0],
      upload: [],
      sugerida: 0,
      observacion: [''],
      lugarEntrega: ['']
    })

    // }, { validators: this.validaCantidad('licitacion', 'cantidad')})

    this.languageService.esp$.subscribe((lang: Language) => {
      this.esp = lang.esp

      // Actualiza el filtro según el idioma
      if (this.dataSource.data) {
        this.filterSelectObj.filter((o) => {
          this.resetFilters()

          if (this.esp) {
            o.options = this.getFilterObject(this.dataSource.data, o.columnProp);
          } else {
            o.options = this.getFilterObject(this.dataSource.data, o.columnPropEng);
          }
        })
      }
    })

    this.comunicacionService.cuenta$.subscribe((cuenta: Cuenta) => {
      this.cuenta = cuenta
      // console.log(this.cuenta)
      if (this.cuenta) {
        if (this.cuenta.perfil < 4) {
          // Si no es Proveedor o Pendiente agrega filtro de USUARIO
          this.filterSelectObj = [
            {
              name: 'EMPRESA',
              nameeng: 'BRAND',
              columnProp: 'usuario',
              columnPropEng: 'usuario',
              options: []
            },
            {
              name: 'SOLICITUD',
              nameeng: 'REQUEST',
              columnProp: 'licitacion',
              columnPropEng: 'licitacion',
              options: []
            },
            {
              name: 'INSUMO',
              nameeng: 'SUPPLY',
              columnProp: 'descrip',
              columnPropEng: 'detaeng',
              options: []
            }
          ]

          this.displayedColumns = ['usuario', 'licitacion', 'descrip', 'detalle', 'cantidad', 'sugerida', 'historico', 'rankcontrib', 'precio', 'total', 'entrega', 'financiacion', 'incoterm', 'lugarEntrega', 'desempeno', 'scoring', 'scoreRanking', 'dueDays', 'estado', 'actions']
        
        } else {
          this.filterSelectObj = [
            {
              name: 'SOLICITUD',
              nameeng: 'REQUEST',
              columnProp: 'licitacion',
              columnPropEng: 'licitacion',
              options: []
            },
            {
              name: 'INSUMO',
              nameeng: 'SUPPLY',
              columnProp: 'descrip',
              columnPropEng: 'detaeng',
              options: []
            }
          ]
        
          this.displayedColumns = ['usuario', 'licitacion', 'descrip', 'detalle', 'cantidad', 'historico', 'precio', 'total', 'entrega', 'financiacion', 'incoterm', 'lugarEntrega', 'scoring', 'scoreRanking', 'dueDays', 'estado', 'actions']

        }
      }
    })

  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      if (params.tender) {
        console.log(params);
        this.tenderToOffer = params.tender+'/'+params.product
      } else {
        this.tenderToOffer = ''
      }
      // this.tenderToOffer = '246/1'
      console.log(this.tenderToOffer);
      this.params = params
    })

    console.log(this.params);

    this.pedirDatos()

  }

  ngAfterViewInit() {
    // console.log(this.dataSource)
    // this.dataSource.sort = this.sort;
    // this.dataSource.paginator = this.paginator;
    // this.table.dataSource = this.dataSource;

    // // Overrride default filter behaviour of Material Datatable
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
    // pedirProductos() trae datos del Servicio Productos  
    // pedirTenders() Trae datos del Servicio Tenders
    // pedirOffers() Trae datos del Servicio Offers
    // getTender() Trae los datos del Tender si vino desde Cotizar 

    console.log('pedirDatos')
    const user = await this.getUserData()
    this.checkCuenta(user)

    await this.pedirSuppliers()
    // console.log('Suppliers')
    await this.pedirProducts()
    // console.log('Products')
    await this.pedirTenders(user)
    // console.log('Tenders')
    await this.pedirOffers(user)
    // console.log('Offers')
    await this.pedirUploads()
    // console.log('Uploads')

    await this.pedirCotizDolar()

    this.notDone = false

    if (this.tenderToOffer !== '') {
      // Que vino desde Activas
      await this.getTender()
      // console.log(this.exTender)

    } else {

      // console.log(this.exTender)
    }

  }

  async getTender() {
    // console.log(this.tenderToOffer)
    // console.log(this.cuenta.usuario)
    const offExist: any = await this.dataSource.data.filter( x => x.licitacion == this.tenderToOffer && x.usuario == this.cuenta.usuario)
    // console.log('offExist', offExist.length)

    if (offExist.length > 0) {
      let strConfMsg = this.esp ? 'Oferta ya Existente!' : 'Offer already Exist!' 
      let strConfMsg2 = this.esp ? 'Modifiquela para mejorar su Ranking!' : 'Update it in order to inprove your Ranking!' 
      // console.log(strConfMsg)
      const dialogRef = await this.dialog.open(AlertMessagesComponent, {
        width: '300px',
        data: {tipo: 'Alerta', mensaje: strConfMsg, mensaje2: strConfMsg2}
      })

      await this.tenderToOffer == ''
      this.exTender == undefined

    } else {
      // Trae la tender elegida para Cotizar
      const estaTend: any = await this.tenders.filter( x => x.licitacion == this.tenderToOffer)
      // console.log('estaTend', estaTend[0])
      this.exTender = estaTend[0]
      // console.log('exTender', this.exTender)
      this.exTender.id = estaTend[0]._id

      // console.log(this.tenderToOffer)
      await this.openModal(this.editOfferModal, this.offer, 'A')
    }
    
    return 
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

      // if (user.perfil == 5) {
      //   // User Pending
      //   this.router.navigateByUrl('/inicio')
      // }
    } else {
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
      if (user.perfil >= 4) {
        // console.log('Proveedor', user.perfil)
        resp = await this.offersService.findMyOffers(user.usuario).toPromise()
        // console.log('MyOffers')
        let resp2: any = await this.offersService.getOffers().toPromise()
        // console.log('Offers')
        this.offers = resp2.Offers
      } else {
        // console.log('Offers')
        resp = await this.offersService.getOffers().toPromise()
        // console.log('Offers')
        this.offers = resp.Offers
        // console.log(resp)
      }

      this.dataSource.data = resp.Offers
      this.dataSource.sortingDataAccessor = (item, property) => {
        switch (property) {
            case 'historico':
                return this.traerProduct(item.producto, 'historico')
            case 'rankcontrib':
                return this.traerProduct(item.producto, 'rankcontrib')
            case 'sugerida':
                return this.traerSugerida(item.licitacion)
            case 'precio':
                return this.traerPrecio(item.precioPesos,item.precio)
            case 'total':
                return this.calcTotal(item.precio, item.precioPesos, item.cantidad)
            case 'dueDays':
                return this.calcDueDays(item.licitacion)
            default:
                return item[property]
        }
      }

      this.dataSource.sort = this.sort
      this.dataSource.paginator = this.paginator
      this.table.dataSource = this.dataSource

      // this.offers = resp.Offers
      // console.log(this.dataSource)

      this.filterSelectObj.filter((o) => {
        if (this.esp) {
          o.options = this.getFilterObject(this.dataSource.data, o.columnProp);
        } else {
          o.options = this.getFilterObject(this.dataSource.data, o.columnPropEng);
        }
      })
    }
  }

  async pedirTenders(user) {
      let resp: any
      resp = await this.tenderService.getTenders().toPromise()
      this.tenders = resp.Tenders
  }

  async pedirProducts() {
    let resp: any
    resp = await this.productService.getProductos().toPromise()
    this.products = resp.Products
  }

  async pedirSuppliers() {
    let resp: any
    resp = await this.suppliersService.getSuppliers().toPromise()
    this.suppliers = resp.Suppliers
  }

  async pedirUploads() {
    let resp: any = await this.uploadsService.getUploads().toPromise()
    this.uploads = resp.Uploads
    // console.log(this.uploads)
  }

  openModal(targetModal, offer, strTipoParam) {
    this.strTipo = strTipoParam

    this.getMyFiles(offer)
 
    this.modalService.open(targetModal, {
     centered: true,
     backdrop: 'static'
    })

    // console.log(offer.incoterm)
    // console.log(this.incoterms)

    // console.log(offer.lugarEntrega)
    // console.log(this.lugaresEntrega)

    if (strTipoParam === 'A') {
      this.f.patchValue({
        id: '',
        oferta: 0,
        licitacion: this.exTender ? this.exTender.licitacion : '',
        licitacion_id: this.exTender ? this.exTender.id : '',
        usuario: this.cuenta.usuario,
        email: this.cuenta.email,
        proveedor: this.cuenta.proveedor,
        provenom: this.cuenta.nombre,
        fecha: 0,
        finaliza: 0,
        producto: this.exTender ? this.exTender.producto : 1,
        descrip: this.exTender ? this.exTender.descrip: '',
        cantidad: this.exTender ? this.exTender.cantidad : 0,
        unidad: this.exTender ? this.exTender.unidad : '',
        costo: 0,
        precio: 0,
        incoterm: 'CIF ROSARIO',
        entrega: 7,
        estado: 0,
        detalle: '',
        scoreProveedor: 0,
        scorePrecio: 0,
        scoreEntrega: 0,
        scoreCantidad: 0,
        scoring: 0,
        financiacion: 0,
        scoreFinanciacion: 0,
        scoreRanking: 0,
        precioPesos: 0,
        cotizacion: this.cotiza,
        desempeno: 0,
        upload: [],
        sugerida: this.traerSugerida(this.exTender ? this.exTender.licitacion : ''),
        observacion: '',
        lugarEntrega: 'DEPOSITO PROAGRO'
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
        entrega: offer.entrega,
        estado: offer.estado,
        detalle: offer.detalle,
        scoreProveedor: offer.scoreProveedor,
        scorePrecio: offer.scorePrecio,
        scoreEntrega: offer.scoreEntrega,
        scoreCantidad: offer.scoreCantidad,
        scoring: offer.scoring,
        financiacion: offer.financiacion,
        scoreFinanciacion: offer.scoreFinanciacion,
        scoreRanking: offer.scoreRanking,
        precioPesos: offer.precioPesos,
        cotizacion: this.cotiza, 
        desempeno: offer.desempeno,
        upload: offer.upload,
        sugerida: this.traerSugerida(offer.licitacion),
        observacion: offer.observacion,
        lugarEntrega: offer.lugarEntrega
        // total: this.calcTotal(offer.precio,offer.precioPesos,offer.cantidad)
      })
    }

    // Busco el Precio Historico del Insumo
    let esteProd: any
    esteProd = this.products.filter( x => x.codigo == this.f.controls.producto.value)
    this.producto = esteProd[0]
    // console.log(this.producto)

    if (this.producto.historico) {
      this.f.get('costo').setValue(this.producto.historico, {onlySelf: true})
    }
 
    // Busco el Pais del Proveedor
    let esteProv: any
    esteProv = this.suppliers.filter( x => x.usuario == this.cuenta.usuario)
    // console.log(esteProv)
    if (esteProv.length > 0) {
      this.nacional = esteProv[0].pais == 'ARGENTINA' ? true : false
      // console.log(esteProv)
      // console.log(esteProv[0].pais)
    } else {
      this.nacional = false
    }
    console.log(this.nacional)

    // console.log(this.f)
    
    if (strTipoParam === 'B') {
      this.f.disable()
    } else {

      if (this.cuenta.perfil === 2) {
        this.f.disable()
        if (offer.estado == 0) {
          // solo cuando está en estado 0 Evaluación
          this.f.get('estado').enable({ onlySelf: true })
          this.f.get('detalle').enable({ onlySelf: true })
        }
      } else {
        this.f.enable()
      }

      if (this.cuenta.perfil !== 0 && this.cuenta.perfil !== 2) {
        this.f.get('estado').disable({ onlySelf: true })
        this.f.get('producto').disable({ onlySelf: true })
        this.f.get('unidad').disable({ onlySelf: true })
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
      scoreFinanciacion: this.f.controls.scoreFinanciacion.value,
      scoreRanking: this.f.controls.scoreRanking.value,
      precioPesos: this.f.controls.precioPesos.value,
      cotizacion: this.f.controls.cotizacion.value,
      desempeno: this.f.controls.desempeno.value,
      upload: this.f.controls.upload.value,
      observacion: this.f.controls.observacion.value,
      lugarEntrega: this.f.controls.lugarEntrega.value
    }

    switch (this.strTipo) {
      case 'A':
        // Alta
        this.agregarOferta()
        break
      case 'B':
        // Baja
        console.log('Baja')
        this.borrarOferta()
        break
      case 'M':
        // Modificar
        this.modificarOferta()
        break
      default:
        console.log('Default')
        break
    }

  }

  onDismiss() {
    this.modalService.dismissAll()
    console.log('Dismiss')
    this.router.navigateByUrl('/ofertas')
  }

  async agregarOferta() {
    let resp: any = await this.offersService.addOffer(this.offUpt).toPromise()
    console.log(resp)

    if (resp) {
      let updScoring: any = await this.tenderService.updateScoring(this.offUpt.licitacion_id).toPromise()
      // console.log(updScoring)
      await this.alertMsg()
    }

    // console.log('Agregó')

    if(this.tenderToOffer !== '') {
      this.tenderToOffer = ''
      await this.onDismiss()
      this.router.navigateByUrl('/ofertas')
    } else {
      await this.pedirDatos()
    }
   }

  async borrarOferta() {
    console.log(this.offUpt.upload)
    if (this.offUpt.upload) {
      for (let index = 0; index < Object.keys(this.offUpt.upload).length; index++) {
        const element = this.offUpt.upload[index]
        console.log(element)
        let file: any = await this.uploadsService.deleteUploads(element).toPromise()
        console.log(file)
      }
    }

    let resp: any = await this.offersService.deleteOffer(this.idIdx).toPromise()
    // .subscribe((resp: any) => {
      if (resp) {
          let respUpdt: any = await this.tenderService.updateScoring(this.offUpt.licitacion_id).toPromise()
          // .subscribe((respUpdt: any) => {
              if (respUpdt) {
                // console.log(respUpdt)
                this.alertMsg()
                this.tenderToOffer == ''
              }
              this.pedirDatos()
          // })
      }
      console.log('Borro')
    // })
  }

  async modificarOferta() {
    let resp: any = await this.offersService.putOffer(this.idIdx, this.offUpt).toPromise()
    if (resp) {
      console.log(resp)
      // console.log(this.offUpt.licitacion_id)
      let updScoring: any = await this.tenderService.updateScoring(this.offUpt.licitacion_id).toPromise()
    }

    // console.log(this.offUpt.estado)
    if (this.offUpt.estado == 1) {
      // console.log(this.idIdx)
      let resp: any = await this.offersService.updateOfferStates(this.idIdx).toPromise()
      console.log(resp)
    }

    await this.alertMsg()
    await this.tenderToOffer == ''
    await this.pedirDatos()
  }

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
    
        this.f.get('cantidad').setValue((resp[0].cantidad), {
          onlySelf: true
        })
    
        this.f.get('unidad').setValue((resp[0].unidad), {
          onlySelf: true
        })
    
        this.f.get('sugerida').setValue((resp[0].sugerida), {
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
        if (this.f.controls.estado.value == 1) {
          strConfMsg = this.esp ? 'Oferta Aceptada!' : 'Offer Acepted!' 
        } else
        {
          strConfMsg = this.esp ? 'Oferta Modificada!' : 'Offer Updated!' 
        }
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
    if (this.esp) {
      this.filterValues[filter.columnProp] = event.target.value.trim().toLowerCase()
    } else {
      this.filterValues[filter.columnPropEng] = event.target.value.trim().toLowerCase()
    }
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
            if(data[col]) {
              if (searchTerms[col].trim().toLowerCase() == data[col].toString().trim().toLowerCase() && isFilterSet) {
                    found = true
              }
            } else {
              found = false
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

  // calcTotalValidator() {
  //   return (formGroup: FormGroup) => {
  //     let pre: number = formGroup.controls[precio]
  //     let pes: number = formGroup.controls[precioPesos]
  //     let can: number = formGroup.controls[cantidad]
  //     if (pes != 0) {
  //       if (this.cotiza != 0) {
  //         pre = this.round(pes / this.cotiza, 2)
  //         this.f.get('precio').setValue(pre, {onlySelf: true})
  //           // console.log('pre', this.f.controls.precio.value)
  //       }
  //     }
      
  //     let total: number = this.round(pre * can, 2)
  //     // console.log(total)

  //     this.f.get('total').setValue(total, {onlySelf: true})
  //     // console.log('precio', this.f.controls.precio.value)
      
  //     return true
  //   }
  // }

  traerPrecio(pes, dol) {
    let ret = 0
    let pre = 0

    if (!pes) pes = 0
    if (!dol) dol = 0

    if (pes !== 0) {
      if (this.cotiza != 0) {
        // console.log(pre)
        pre = this.round(pes / this.cotiza, 2)
      }
    } else {
      pre = dol
    } 

    ret = this.round(pre, 2)
    // console.log(ret)

    return ret
  }

  calcTotal(pre, pes, can) {
    let ret = 0
    // console.log('Pes', pes)
    // console.log('Pre', pre)
    // console.log('Can', can)
    // console.log(this.f.value)
    if (!pes) pes = 0
    if (pes !== 0) {
      if (this.cotiza !== 0) {
        // console.log(pre)
        // if (this.f.controls.precio) {
          pre = this.round(pes / this.cotiza, 2)
          // console.log('Pes', pes)
          // console.log('Pre', pre)
          // this.f.get('precio').setValue(pre, {onlySelf: true})
          // this.f.patchValue({precio: pre})
          // console.log('precio', this.f.controls.precio.value)
        // }
      } else {
        pre = 0
        // console.log(pre)
      }
    } 

    ret = this.round(pre * can, 2)
    // console.log(ret)

    // if (this.f.controls.total) {
      // this.f.get('total').setValue(ret, {onlySelf: true})
      // console.log('precio', this.f.controls.precio.value)
    // }

    return ret
  }

  round(value, digits) {
    if(!digits){
        digits = 2;
    }
    value = value * Math.pow(10, digits);
    value = Math.round(value);
    value = value / Math.pow(10, digits);
    return value;
  }

  calcDueDays(offerTender: string) {
    // console.log(offerTender)
    if (!offerTender) return 0

    let resp: any = this.tenders.filter( x => x.licitacion == offerTender) 
    // console.log(resp)

    if (resp.length > 0) {
      var startDate = moment(resp[0].finaliza);
      // console.log('startDate',startDate)
      var currentDate = moment(new Date());
      // console.log('currentDate',currentDate)
      var result = startDate.diff(currentDate, 'days')
      // console.log('result',result)
    } else {
      result = 0
    }
    return result
  }

  traerDesempeno(user: string) {
    if (!user) return 0

    let resp: any = this.suppliers.filter( x => x.usuario == user )

    if (resp.length > 0) {
      return resp[0].desempeno
    } else {
      return 0
    }
  }

  traerSugerida(tender: string) {
    let ret = 0

    if (!tender) return 0

    let resp: any = this.tenders.filter( x => x.licitacion == tender )

    // console.log('Resp', resp[0].sugerida)
    if (resp.length > 0) {
      if (resp[0].sugerida) {
        ret = resp[0].sugerida
      }
    }

    // console.log('ret', ret)
    return ret
  }

  async pedirCotizDolar() {
    let resp: any
    resp = await this.cotizacionesService.getCotizacionBNA().toPromise()
    // .subscribe((resp: any) => {
      console.log(resp)
      this.cotiza = resp.venta
    // })
    // this.cotizacionesService.getCotizacionBNA()
    // .subscribe((resp: any) => {
    //   console.log(resp)
    //   this.cotiza = resp.compra
    // })
  }

  onPreviewFile(file) {
    if(file) {
      // console.log(file)
  
      this.uploadsService.download(file._id)
        .subscribe(
        (response: HttpResponse<Blob>) => {
          let filename: string = file.originalName
          let binaryData = [];
          binaryData.push(response.body);
          let downloadLink = document.createElement('a');
          downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, { type: 'blob' }));
          downloadLink.setAttribute('download', filename);
          document.body.appendChild(downloadLink);
          downloadLink.click();
        })
    }
  }
  
  getFile(type: string) {
    // console.log(product)
    let sfile: any
    sfile = this.myFiles.filter( x => x.fileType == type)

    // let ret: string = " "
    // if (sfile[0]) {
    //     ret = sfile[0].originalName ? sfile[0].originalName : " "
    // }
    // console.log(sfile)
    return sfile
  }

  getMyFiles(oferta) {
    this.myFiles = []
    if(!oferta) return
    // console.log(oferta)
    for (let index = 0; index < oferta.upload.length; index++) {
      const element = oferta.upload[index];
      // console.log(element)
      
      this.uploads.forEach(item => {
        if (item._id == element) this.myFiles.push(item)
      });
      
      // this.myFiles.push(this.uploads.filter( x => {x._id == element}))

    }
    // console.log(this.myFiles)
  }

  async onFileSelected(e: HtmlInputEvent, wfile: string) {
    // console.log(e)
    if(e.target.files && e.target.files[0]) {
      this.file = await <File>e.target.files[0]

      await this.onAddFile(wfile)
    }
  }

  async onAddFile(wfile: string) {
    // console.log(this.updtSupp)
    switch (wfile) {
      case "docOffer":
        this.docOfferDone = true
        break
    
      default:
        break
    }

    const fd = new FormData()
    fd.append('file', this.file)
    fd.append('fileType', wfile)
    fd.append('originalName', this.file.name)
    fd.append('usuario', this.f.controls.usuario.value)
    fd.append('offer', this.f.controls.oferta.value)
    // console.log(fd)

    let file: any = await this.uploadsService.upload(fd).toPromise()
    // console.log('id', this.f.controls.id.value)
    // console.log('file', file.body.Upload)

    // let resp: any = await this.suppliersService.assignUpload(this.f.controls.id.value, file.body.Upload).toPromise() 
    // console.log(resp)

    if (file) {
      // console.log(file.body.Upload)
      this.myFiles.push(file.body.Upload)
      // console.log(this.myFiles)

      // console.log(this.f.controls.upload.value)
      this.f.controls.upload.value.push(file.body.Upload._id)
      // console.log(this.f.controls.upload.value)

      switch (wfile) {
        case "docOffer":
          this.docOfferDone = false
          break
      
        default:
          break
      }
    } 
  }

  async onDeleteFile(delfile, wfile: string) {
    // console.log(delfile)
    switch (wfile) {
      case "docOffer":
        this.docOfferDone = true
        break
    
      default:
        break
    }

    let file: any = await this.uploadsService.deleteUploads(delfile._id).toPromise()
    console.log(file)

    console.log(this.f.controls.id.value)
    if (this.f.controls.id.value !== '') {
      let resp: any = await this.offersService.removeUpload(this.f.controls.id.value, delfile).toPromise() 
      console.log(resp)
    }

    if (file) {
      // console.log(this.f.controls.upload.value)
      // console.log(this.myFiles)

      this.myFiles = this.myFiles.filter( x => x._id !== delfile._id)
      this.f.controls.upload.value.pop(delfile._id)
      // this.f.patchValue({
      //   upload: this.myFiles._id
      // })

      // console.log(this.f.controls.upload.value)

      switch (wfile) {
        case "docOffer":
          this.docOfferDone = false
          break
      
      default:
          break
      }
    } 
  }

  getFilterByTender(tender: string) {
    // console.log(tender)

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
    
    newOff.forEach(off => {
      if (off.precio == 0 && off.cotizacion !== 0) {
        off.precio = this.round((off.precioPesos/off.cotizacion),5)
      }
    })
    // console.log(newOff)

    // return this.offers.filter( x => x.licitacion_id == tender)
    return newOff
  }

  total(pre, can) {
    return this.round(pre * can, 2)
  }

  traerProduct(prod: number, dato: string) {
    if (!prod) return 0

    let resp: any = this.products.filter( x => x.codigo == prod )

    if (resp.length > 0) {
      if (dato=='historico') {
        return resp[0].historico ? resp[0].historico : 0
      } else if (dato=='rankcontrib') {
        return resp[0].rankcontrib ? resp[0].rankcontrib : 0
      } else {
        return 0
      }
    } else {
      return 0
    }
  }

}
