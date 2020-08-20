import { Component, OnInit, Output, EventEmitter } from '@angular/core'
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


@Component({
  selector: 'app-licitaciones',
  templateUrl: './licitaciones.component.html',
  styleUrls: ['./licitaciones.component.css']
})
export class LicitacionesComponent implements OnInit {

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
  
  filterTenders: Tenders[] = []
  
  private _searchTerm: string
  get searchTerm(): string {
    return this._searchTerm
  }
  set searchTerm(value: string) {
    this._searchTerm = value
    this.filterTenders = this.filtroTenders(value)
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
    private tenderService: TendersService,
    private productService: ProductosService,
    private router: Router,
    ) {
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

      this.fs = fbs.group({
        fdescrip: ['']
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

    this.getUserData()
    // console.log(this.cuenta)

    this.pedirTenders()

    this.pedirProducts()

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

  pedirTenders() {

    // console.log('Tenders Pedir Tenders')

    if (this.cuenta) {
      // console.log('Tenders')
      this.tenderService.getTenders()
      .subscribe((resp: any) => {
        // console.log(resp)
        this.tenders = resp.Tenders        
        this.filterTenders = resp.Tenders
        this.notDone = false
      })
    } else {
      // console.log('Actives')
      this.tenderService.getActives()
      .subscribe((resp: any) => {
        // console.log(resp)
        this.tenders = resp.Tenders
        this.filterTenders = resp.Tenders
        this.notDone = false
      })
    }

  }

  pedirProducts() {
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
        licitacion: 0,
        fecha: moment().format().substr(0, 10) ,
        finaliza: moment().format().substr(0, 10),
        producto: 0,
        descrip: '',
        cantidad: 0,
        unidad: '',
        costo: 0,
        ultcompra: '',
        proveedor: 0,
        provenom: '',
        estado: 1
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
        ultcompra: tender.ultcompra.substr(0, 10),
        proveedor: tender.proveedor,
        provenom: tender.provenom,
        estado: tender.estado
      })
      if (strTipoParam === 'B') this.f.disable()
    }
  }

  onSubmit() {
    // console.log(this.strTipo)

    this.modalService.dismissAll()
    // console.log('res:', this.f.getRawValue())

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
      estado: this.f.controls.estado.value
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
        this.siGrabo = true
        this.msgGrabo = this.esp ? 'Licitacion Grabada!' : 'Tender Saved!'
        this.pedirTenders()
      })

    setTimeout(() => this.removeAlert(), 3000)
   }

  borrarTender() {
    this.tenderService.deleteTender(this.idIdx)
     .subscribe((tender: Tenders) => {
      //  console.log('Baja:', tender)
       this.siGrabo = true
       this.msgGrabo = this.esp ? 'Licitacion Borrada!' : 'Tender Deleted'
       this.pedirTenders()
      })

    setTimeout(() => this.removeAlert(), 3000)
  }

  modificarTender() {
    // console.log(this.updtTender)

    this.tenderService.putTender(this.idIdx, this.updtTender)
      .subscribe((tender: Tenders) => {
      // console.log('Modif:', tender)
      this.siGrabo = true
      this.msgGrabo = this.esp ? 'Licitacion Modificada!' : 'Tender Updated!'
      this.pedirTenders()
    })

    setTimeout(() => this.removeAlert(), 3000)
  }

  changeProduct(ev) {
    // console.log(ev)
    this.f.get('producto').setValue(ev.target.value, {
      onlySelf: true
    })
    
    // let result = [] 

    for(const prod of this.products){
      if (prod.codigo == ev.target.value){
        // console.log('Igual')
        // result.push(tender)

        this.f.get('descrip').setValue((prod.descrip), {
          onlySelf: true
        })
    
        this.f.get('unidad').setValue((prod.unidad), {
          onlySelf: true
        })
    
        // this.f.get('costo').setValue((tender.costo), {
        //   onlySelf: true
        // })
    
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

  filtroTenders(searchString: string) {
    // console.log(searchString)
    return this.tenders.filter(tender => 
      (tender.descrip.toLowerCase().indexOf(searchString.toLowerCase()) >- 1))
  }

}

