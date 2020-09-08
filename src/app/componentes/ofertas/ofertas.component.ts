import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Cuenta } from 'src/app/models/Cuenta'
import { ComunicacionService } from 'src/app/servicios/comunicacion.service'
import { UsuariosService } from 'src/app/servicios/usuarios.service'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { Router } from '@angular/router'
import { Language } from 'src/app/models/Language'
import { LanguageService } from 'src/app/servicios/language.service'
import { OffersService } from 'src/app/servicios/offers.service'
import { TendersService } from 'src/app/servicios/tenders.service'
import * as moment from 'moment'
import { Tenders } from 'src/app/models/Tenders';
import { Offers } from 'src/app/models/Offers';

@Component({
  selector: 'app-ofertas',
  templateUrl: './ofertas.component.html',
  styleUrls: ['./ofertas.component.css']
})
export class OfertasComponent implements OnInit {

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

  filterOffers: Offers[] = []
  
  private _searchTerm: string
  get searchTerm(): string {
    return this._searchTerm
  }
  set searchTerm(value: string) {
    this._searchTerm = value
    this.filterOffers = this.filtroOffers(value, this.searchUsu)
  }

  private _searchUsu: string
  get searchUsu(): string {
    return this._searchUsu
  }
  set searchUsu(value: string) {
    this._searchUsu = value
    this.filterOffers = this.filtroOffers(this.searchTerm, value)
  }

  tenders: Tenders[] = [] 

  f: FormGroup
  fs: FormGroup

  siGrabo: boolean
  msgGrabo: string

  notDone: boolean = true

  constructor(
    private fb: FormBuilder,
    private fbs: FormBuilder,
    private comunicacionService: ComunicacionService,
    private modalService: NgbModal,
    private languageService: LanguageService,
    private usuariosService: UsuariosService,
    private offersService: OffersService,
    private tenderService: TendersService,
    private router: Router
  ) {

    if (!this.usuariosService.isLogin()) {
      this.router.navigateByUrl('/login')
    }

    this.f = fb.group({
      id: [''],
      oferta: ['',
        Validators.compose([
        Validators.required
      ])],
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

    this.fs = fbs.group({
      fdescrip: [''],
      fuser: ['']
    })

    this.languageService.esp$.subscribe((lang: Language) => {
      this.esp = lang.esp
    })

    // console.log('Offers Constructor')

   }

  ngOnInit(): void {
    // console.log('Offers OnInit')

    this.comunicacionService.cuenta$.subscribe((cuenta: Cuenta) => {
      this.cuenta = cuenta

    })

    this.getUserData()
    // console.log(this.cuenta)

    this.pedirTenders()
    
    this.pedirOffers()

  }

  removeAlert(): void {
    this.siGrabo = false
  }

  getUserData() {
    this.usuariosService.checkUsuario()
    .subscribe(respuesta => {
      if (respuesta.user) {
        // this.cuenta.nombre = respuesta.user.nombre
        // this.cuenta.perfil = respuesta.user.perfil
        this.cuenta = respuesta.user
        this.esp = (this.cuenta.language === 'es')
        // console.log('respuesta:', respuesta)
        // console.log('cuenta:', this.cuenta)

        if (this.cuenta.perfil == 4) {
          this.fs.patchValue({
            fuser: this.cuenta.usuario
          })  
          this.searchUsu = this.cuenta.usuario
        } else {
          this.searchUsu = ''
        }
        this.searchTerm = ''
        this.filtroOffers(this.searchTerm, this.searchUsu)
      }
      else {
        // console.log(respuesta)
        this.usuariosService.removeToken()
        this.cuenta = undefined

        navigator.language.substr(0, 2)
        // this.router.navigateByUrl('/login')

        switch (navigator.language.substr(0, 2)) {
          case 'en': { this.esp = false; break }
          case 'es': { this.esp = true; break }
          default: {this.esp = true; break}
        }

        this.searchUsu = ''
        this.searchTerm = ''
        this.filtroOffers(this.searchTerm, this.searchUsu)
      }

      // console.log(this.cuenta)
      this.comunicacionService.cuenta$.next(this.cuenta)
      this.actualizaCuenta.emit(this.cuenta)

      // console.log(this.esp)
      this.lang = {esp: this.esp}
      this.languageService.esp$.next(this.lang)
      this.actualizaLang.emit(this.lang)
    })
  }

  pedirOffers() {
    // console.log('Tenders Pedir Tenders')

    if (this.cuenta) {
      // console.log('Offers')
      this.offersService.getOffers()
      .subscribe((resp: any) => {
        // console.log(resp)
        this.offers = resp.Offers
        this.notDone = false

        if (this.cuenta.perfil == 4) {
          this.fs.patchValue({
            fuser: this.cuenta.usuario
          })  
          this.searchUsu = this.cuenta.usuario
        } else {
          this.searchUsu = ''
        }
        this.searchTerm = ''
        this.filtroOffers(this.searchTerm, this.searchUsu)
      })

    } else {
      // console.log('Actives')
      this.offersService.getOffers()
      .subscribe((resp: any) => {
        // console.log(resp)
        this.offers = resp.Offers
        this.notDone = false
      })
      this.searchTerm = ''
      this.searchUsu = ''
      this.filtroOffers(this.searchTerm, this.searchUsu)
    }

}

  pedirTenders() {
      this.tenderService.getTenders()
      .subscribe((resp: any) => {
        // console.log(resp)
        this.tenders = resp.Tenders
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
        cantidad: 0,
        unidad: '',
        costo: 0,
        precio: 0,
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
      if (strTipoParam === 'B') this.f.disable()
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
        this.siGrabo = true
        this.msgGrabo = this.esp ? 'Oferta Grabada!' : 'Offer Saved!'
        this.pedirOffers()
      })

    setTimeout(() => this.removeAlert(), 3000)
   }

  borrarOferta() {
    this.offersService.deleteOffer(this.idIdx)
     .subscribe((offer: Offers) => {
      //  console.log('Baja:', offer)
       this.siGrabo = true
       this.msgGrabo = this.esp ? 'Oferta Borrada!' : 'Offer Deleted'
       this.pedirOffers()
      })

    setTimeout(() => this.removeAlert(), 3000)
  }

  modificarOferta() {
    // console.log(this.offUpt)
    this.offersService.putOffer(this.idIdx, this.offUpt)
      .subscribe((offer: Offers) => {
      // console.log('Modif:', offer)
      this.siGrabo = true
      this.msgGrabo = this.esp ? 'Oferta Modificada!' : 'Offer Updated!'
      this.pedirOffers()
    })

    setTimeout(() => this.removeAlert(), 3000)
  }

  changeTender(ev) {
    // console.log(ev)
    this.f.get('licitacion').setValue(ev.target.value, {
      onlySelf: true
    })
    
    // let result = [] 

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

  filtroOffers(searchProd: string, searchUsu: string) {
    console.log(searchProd + searchUsu)
    if (typeof searchProd === 'undefined' && typeof searchUsu === 'undefined') return this.offers  
    if (typeof searchProd === 'undefined' && typeof searchUsu !== 'undefined') return this.offers.filter(offer => offer.usuario.toLowerCase().indexOf(searchUsu.toLowerCase()) >- 1) 
    if (typeof searchProd !== 'undefined' && typeof searchUsu === 'undefined') return this.offers.filter(offer => offer.descrip.toLowerCase().indexOf(searchProd.toLowerCase()) >- 1) 
    if (typeof searchProd !== 'undefined' && typeof searchUsu !== 'undefined') { 
      return this.offers.filter(offer => ((offer.descrip.toLowerCase().indexOf(searchProd.toLowerCase()) >- 1) && (offer.usuario.toLowerCase().indexOf(searchUsu.toLowerCase()) >- 1))
      )}
  }

}
