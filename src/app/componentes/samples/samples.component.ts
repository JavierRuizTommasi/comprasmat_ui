import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Cuenta } from 'src/app/models/Cuenta'
import { ComunicacionService } from 'src/app/servicios/comunicacion.service'
import { UsuariosService } from 'src/app/servicios/usuarios.service'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { Router } from '@angular/router'
import { Language } from 'src/app/models/Language'
import { LanguageService } from 'src/app/servicios/language.service'
import { TendersService } from 'src/app/servicios/tenders.service'
import { Tenders } from 'src/app/models/Tenders';
import { OffersService } from 'src/app/servicios/offers.service'
import { Offers } from 'src/app/models/Offers';
import { SamplesService } from 'src/app/servicios/samples.service'
import { Samples } from 'src/app/models/Samples';
import * as moment from 'moment'
import { Observable } from 'rxjs';

@Component({
  selector: 'app-samples',
  templateUrl: './samples.component.html',
  styleUrls: ['./samples.component.css']
})
export class SamplesComponent implements OnInit {

  strTipo: string
  idIdx: string

  public cuenta: Cuenta
  @Output() actualizaCuenta = new EventEmitter()

  esp: boolean
  public lang: Language = {esp: true}
  @Output() actualizaLang = new EventEmitter()

  samples: Samples[] = []
  sample: Samples
  sampUpt: Samples

  tenders: Tenders[] = [] 
  offers: Offers [] = []

  filterSamples: Samples[] = []
  
  private _searchTerm: string
  private _searchUsu: string
  
  get searchTerm(): string {
    return this._searchTerm
  }
  set searchTerm(value: string) {
    this._searchTerm = value
    this.filterSamples = this.filtroSamples(value, this.searchUsu)
  }

  get searchUsu(): string {
    return this._searchUsu
  }
  set searchUsu(value: string) {
    this._searchUsu = value
    this.filterSamples = this.filtroSamples(this.searchTerm, value)
  }

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
    private samplesService: SamplesService,
    private router: Router) {

      this.f = fb.group({
        id: [''],
        muestra: ['',
          Validators.compose([
          Validators.required
        ])],
        oferta: ['',
          Validators.compose([
          Validators.required
        ])],
        licitacion: [{value: '', disabled: true},
          Validators.compose([
          Validators.required
        ])],
        usuario: [{value: '', disabled: true},
          Validators.compose([
          Validators.required
        ])],
        email: [{value: '', disabled: true},
          Validators.compose([
          Validators.required
        ])],
        proveedor: [{value: '', disabled: true},
          Validators.compose([
          Validators.required
        ])],
        provenom: [{value: '', disabled: true},
          Validators.compose([
          Validators.required
        ])],
        fecha: ['',
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
        analisis: [''],
        userlab: [''],
        estado: [0,
          Validators.compose([
          Validators.required
        ])],
        resultado: [0],
        detalle: ['']
      })
  
      this.fs = fbs.group({
        fdescrip: [''],
        fuser: ['']
      })
  
      this.languageService.esp$.subscribe((lang: Language) => {
        this.esp = lang.esp
      })
  
  }

  ngOnInit(): void {
    // this.comunicacionService.cuenta$.subscribe((cuenta: Cuenta) => {
    //   this.cuenta = cuenta
    // })

    console.log('isLogin', this.usuariosService.isLogin())
    this.pedirDatos()

  }

  // getUserData() {
  //   return new Promise (resolve => {
  //   const user: any = this.usuariosService.checkUsuario()
  //   console.log(user.user)
  //   resolve(user)
  //     // .subscribe(resp => {
  //     //   console.log(resp)
  //     //   return resp
  //   })
  // }

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

    await this.pedirTenders(user)
    await this.pedirOffers(user)
    await this.pedirSamples(user)

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

    }
    else {
      console.log('no logueado')
      this.usuariosService.removeToken()
      this.cuenta = undefined
      this.esp = this.languageService.checkLang()
    }

    this.comunicacionService.cuenta$.next(this.cuenta)
    this.actualizaCuenta.emit(this.cuenta)
    // console.log(user)
  
    this.lang = {esp: this.esp}
    this.languageService.esp$.next(this.lang)
    this.actualizaLang.emit(this.lang)
    // console.log(this.esp)

  }
  
  async pedirSamples(user) {
    console.log('Samples')
    // console.log(user)
    if (user) {
      if (user.perfil === 4) {
        console.log('Proveedor', user.perfil)
        const resp: any = await this.samplesService.findMySamples(user.usuario).toPromise()
        this.samples = resp.Samples
      } else {
        console.log('Todos', user.perfil)
        const resp: any = await this.samplesService.getSamples().toPromise()
        this.samples = resp.Samples
      }
      // .subscribe((resp: any) => {
      console.log(this.samples)
      //   this.samples = resp.Samples

      // console.log(user)
      this.searchUsu = undefined
      if(user) {
        if (user.perfil === 4) {
          this.fs.patchValue({
            fuser: user.usuario
          })  
          this.searchUsu = user.usuario
        } 
      }
      console.log('filtro')
      this.searchTerm = undefined
      this.filtroSamples(this.searchTerm, this.searchUsu)

    }
  }

  async pedirOffers(user) {
    console.log('Offers')
    if (user) {
      if (user.perfil === 4) {
        const resp: any = await this.offersService.findMyOffers(user.usuario).toPromise()
        this.offers = resp.Offers
      } else {
        const resp: any = await this.offersService.getOffers().toPromise()
        this.offers = resp.Offers
      }

      // .subscribe((resp: any) => {
      console.log(this.offers)
      //   this.offers = resp.Offers
      // })
    }

  }
      
  async pedirTenders(user) {
    console.log('Tenders')
    if (user) {
      const resp: any = await this.tenderService.getTenders().toPromise()
      this.tenders = resp.Tenders
      //   .subscribe((resp: any) => {
      console.log(this.tenders)
      //     this.tenders = resp.Tenders
      //   })
    }

  }

  removeAlert(): void {
    this.siGrabo = false
  }

  openModal(targetModal, sample, strTipoParam) {
    this.strTipo = strTipoParam

    this.modalService.open(targetModal, {
     centered: true,
     backdrop: 'static'
    })

    if (strTipoParam === 'A') {
      this.f.patchValue({
        id: '',
        muestra: 0,
        oferta: 0,
        licitacion: 0,
        usuario: this.cuenta.usuario,
        email: this.cuenta.email,
        proveedor: this.cuenta.proveedor,
        provenom: this.cuenta.nombre,
        fecha: moment().format().substr(0, 10) ,
        producto: 0,
        descrip: '',
        cantidad: 0,
        unidad: '',
        analisis: '',
        userlab: '',
        resultado: 0,
        estado: 1,
        detalle: ''
      })
    } else {
      this.f.patchValue({
        id: sample._id,
        muestra: sample.muestra,
        oferta: sample.oferta,
        licitacion: sample.licitacion,
        usuario: sample.usuario,
        email: sample.email,
        proveedor: sample.proveedor,
        provenom: sample.provenom,
        fecha: sample.fecha.substr(0,10) ,
        producto: sample.producto,
        descrip: sample.descrip,
        cantidad: sample.cantidad,
        unidad: sample.unidad,
        analisis: sample.analisis ? sample.analisis.substr(0,10) : '',
        userlab: sample.userlab,
        resultado: sample.resultado,
        estado: sample.estado,
        detalle: sample.detalle
      })
      if (strTipoParam === 'B') this.f.disable()
    }
  }

  onSubmit() {
    console.log(this.strTipo)

    this.modalService.dismissAll()
    // console.log('res:', this.f.getRawValue())

    this.idIdx = this.f.controls.id.value
    this.sampUpt = {
      muestra: this.f.controls.muestra.value,
      oferta: this.f.controls.oferta.value,
      licitacion: this.f.controls.licitacion.value,
      usuario: this.f.controls.usuario.value,
      email: this.f.controls.email.value,
      proveedor: this.f.controls.proveedor.value,
      provenom: this.f.controls.provenom.value,
      fecha: this.f.controls.fecha.value,
      producto: this.f.controls.producto.value,
      descrip: this.f.controls.descrip.value,
      cantidad: this.f.controls.cantidad.value,
      unidad: this.f.controls.unidad.value,
      analisis: this.f.controls.analisis.value,
      userlab: this.f.controls.userlab.value,
      resultado: this.f.controls.resultado.value,
      estado: this.f.controls.estado.value,
      detalle: this.f.controls.detalle.value
    }

    switch (this.strTipo) {
      case 'A':
        // Alta
        this.agregarMuestra()
        break
      case 'B':
        // Baja
        this.borrarMuestra()
        break
      case 'M':
        // Modificar
        this.modificarMuestra()
        break
    }
  }

  agregarMuestra() {
    this.samplesService.addSample(this.sampUpt)
      .subscribe((sample: Samples) => {
        console.log('Alta:', sample)
        this.siGrabo = true
        this.msgGrabo = this.esp ? 'Muestra Grabada!' : 'Sample Saved!'
        this.pedirDatos()
      })

   }

  borrarMuestra() {
    this.samplesService.deleteSample(this.idIdx)
     .subscribe((sample: Samples) => {
       console.log('Baja:', sample)
       this.siGrabo = true
       this.msgGrabo = this.esp ? 'Muestra Borrada!' : 'Sample Deleted'
       this.pedirDatos()
      })

    setTimeout(() => this.removeAlert(), 3000)
  }

  modificarMuestra() {
    console.log(this.sampUpt)
    this.samplesService.putSample(this.idIdx, this.sampUpt)
      .subscribe((sample: Samples) => {
      console.log('Modif:', sample)
      this.siGrabo = true
      this.msgGrabo = this.esp ? 'Muestra Modificada!' : 'Sample Updated!'
      this.pedirDatos()
    })
  
    setTimeout(() => this.removeAlert(), 3000)
  }

  changeOferta(ev) {
    // console.log(ev)
    this.f.get('oferta').setValue(ev.target.value, {
      onlySelf: true
    })
   
    for(const offer of this.offers){
      if (offer.oferta == ev.target.value){
        console.log('Igual', offer.oferta)
        // result.push(offer)

        this.f.get('proveedor').setValue((offer.proveedor), {
          onlySelf: true
        })
    
        this.f.get('provenom').setValue((offer.provenom), {
          onlySelf: true
        })
    
        this.f.get('licitacion').setValue((offer.licitacion), {
          onlySelf: true
        })
    
        this.f.get('producto').setValue((offer.producto), {
          onlySelf: true
        })
    
        this.f.get('descrip').setValue((offer.descrip), {
          onlySelf: true
        })
    
        // this.f.get('cantidad').setValue((offer.cantidad), {
        //   onlySelf: true
        // })
    
        // this.f.get('unidad').setValue((offer.unidad), {
        //   onlySelf: true
        // })
    
      }
    }

    // console.log(result)

  }

  filtroSamples(searchProd: string, searchUsu: string) {
    // console.log(searchProd)
    // console.log(searchUsu)
    if (typeof searchProd === 'undefined' && typeof searchUsu === 'undefined') return this.samples  
    if (typeof searchProd === 'undefined' && typeof searchUsu !== 'undefined') return this.samples.filter(sample => sample.usuario.toLowerCase().indexOf(searchUsu.toLowerCase()) >- 1) 
    if (typeof searchProd !== 'undefined' && typeof searchUsu === 'undefined') return this.samples.filter(sample => sample.descrip.toLowerCase().indexOf(searchProd.toLowerCase()) >- 1) 
    if (typeof searchProd !== 'undefined' && typeof searchUsu !== 'undefined') { 
      return this.samples.filter(sample => ((sample.descrip.toLowerCase().indexOf(searchProd.toLowerCase()) >- 1) && (sample.usuario.toLowerCase().indexOf(searchUsu.toLowerCase()) >- 1))
      )}
  }

}
