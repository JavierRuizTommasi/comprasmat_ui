import { Component, OnInit, Output, EventEmitter } from '@angular/core'
import { Cuenta } from 'src/app/models/Cuenta'
import { ComunicacionService } from 'src/app/servicios/comunicacion.service'
import { UsuariosService } from 'src/app/servicios/usuarios.service'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { ProductosService } from 'src/app/servicios/productos.service'
import { Productos } from 'src/app/models/Products'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { Router } from '@angular/router'
import { Language } from 'src/app/models/Language'
import { LanguageService } from 'src/app/servicios/language.service'
import * as moment from 'moment'

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {

  strTipo: string
  idIdx: string

  public cuenta: Cuenta
  @Output() actualizaCuenta = new EventEmitter()

  esp: boolean
  public lang: Language = {esp: true}
  @Output() actualizaLang = new EventEmitter()

  productos: Productos[] = []
  producto: Productos
  updtProd: Productos

  filterProducts: Productos[] = []
  
  private _searchTerm: string
  get searchTerm(): string {
    return this._searchTerm
  }
  set searchTerm(value: string) {
    this._searchTerm = value
    this.filterProducts = this.filtroProductos(value)
  }
  
  f: FormGroup
  fs: FormGroup

  unumPattern = '^[0-9]{1,10}$'
  udescPattern = '^[A-Z0-9. ]{1,50}$'

  siAlert: boolean
  msgAlert: string
  alertType: string
  
  notDone: boolean = true

  constructor(
    private fb: FormBuilder,
    private fbs: FormBuilder,
    private comunicacionService: ComunicacionService,
    private languageService: LanguageService,
    private productosService: ProductosService,
    private usuariosService: UsuariosService,
    private modalService: NgbModal,
    private router: Router
    ) {

      if (!this.usuariosService.isLogin()) {
        this.router.navigateByUrl('/login')
      }
  
      this.fs = fbs.group({
        fdescrip: ['']
      })
  
      this.f = fb.group({
        id: [''],
        codigo: ['', Validators.compose([
          Validators.required,
          Validators.pattern(this.unumPattern)
        ])],
        descrip: ['', Validators.compose([
          Validators.required,
          Validators.pattern(this.udescPattern)
        ])],
        unidad: ['', Validators.compose([
          Validators.required
        ])],
        rubro: ['', Validators.compose([
          Validators.required
        ])],
        subrubro: [''],
        costo: [0],
        ultcompra: [''],
        proveedor: [0],
        provenom: [''],
        precio: [0],
        activo: true
      })

      // if (this.usuariosService.isLogin()) {
      // }
      // else {
      //   this.router.navigateByUrl('/inicio')
      // }

      this.languageService.esp$.subscribe((lang: Language) => {
        this.esp = lang.esp
      })
}

  ngOnInit(): void {
    this.comunicacionService.cuenta$.subscribe((cuenta: Cuenta) => {
      this.cuenta = cuenta

    })

    this.getUserData()
    // console.log(this.cuenta)

    this.pedirProductos()
  }

  removeAlert(): void {
    this.siAlert = false
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

  pedirProductos() {
    this.productosService.getProductos()
    .subscribe((resp: any) => {
      console.log(resp)
      this.productos = resp.Products
      this.filterProducts = resp.Products
      this.notDone = false
    })
  }

  openModal(targetModal, producto, strTipoParam) {
    this.strTipo = strTipoParam

    this.modalService.open(targetModal, {
     centered: true,
     backdrop: 'static'
    })

    if (strTipoParam === 'A') {
      this.f.patchValue({
        id: '',
        codigo: 0,
        descrip: '',
        unidad: '',
        rubro: '',
        subrubro: '',
        costo: 0,
        ultcompra: '',
        proveedor: 0,
        provenom: '',
        precio: 0,
        activo: true
      })
    } else {
      this.f.patchValue({
        id: producto._id,
        codigo: producto.codigo,
        descrip: producto.descrip,
        unidad: producto.unidad,
        rubro: producto.rubro,
        subrubro: producto.subrubro,
        costo: producto.costo,
        ultcompra: producto.ultcompra,
        proveedor: producto.proveedor,
        provenom: producto.provenom,
        precio: producto.precio,
        activo: producto.activo
      })
    }
  }

  onSubmit() {

    console.log(this.strTipo)

    this.modalService.dismissAll()
    // console.log('res:', this.f.getRawValue())

    this.idIdx = this.f.controls.id.value

    this.updtProd= {
      codigo: this.f.controls.codigo.value,
      descrip: this.f.controls.descrip.value,
      unidad: this.f.controls.unidad.value,
      rubro: this.f.controls.rubro.value,
      subrubro: this.f.controls.subrubro.value,
      costo: this.f.controls.costo.value,
      ultcompra: this.f.controls.ultcompra.value,
      proveedor: this.f.controls.proveedor.value,
      provenom: this.f.controls.provenom.value,
      precio: this.f.controls.precio.value,
      activo: this.f.controls.activo.value,
  }

    switch (this.strTipo) {
      case 'A':
        // Alta
        this.agregarProducto()
        break
      case 'B':
        // Baja
        this.borrarProducto()
        break
      case 'M':
        // Modificar
        this.modificarProducto()
        break
      default:
        // code block
    }

  }

  agregarProducto() {

    this.productosService.addProductos(this.updtProd)
      .subscribe((prod: Productos) => {
        console.log('Alta:', prod)
        this.siAlert = true
        this.msgAlert = this.esp ? 'Producto Grabado!' : 'Product Saved!'
        this.alertType = "success"
      this.pedirProductos()
      })

    setTimeout(() => this.removeAlert(), 3000)
   }

  borrarProducto() {

    this.productosService.deleteProductos(this.idIdx)
     .subscribe((prod: Productos) => {
       console.log('Baja:', prod)
       this.siAlert = true
       this.msgAlert = this.esp ? 'Producto Borrado!' : 'Product Deleted!'
       this.alertType = "success"
      this.pedirProductos()
      })

    setTimeout(() => this.removeAlert(), 3000)
  }

  modificarProducto() {

    this.productosService.putProductos(this.idIdx, this.updtProd)
      .subscribe((prod: Productos) => {
      console.log('Modif:', prod)
      this.siAlert = true
      this.msgAlert = this.esp ? 'Producto Actualizado!' : 'Product Updated!'
      this.alertType = "success"
    this.pedirProductos()
    })

    setTimeout(() => this.removeAlert(), 3000)
  }

  filtroProductos(searchString: string) {
    // console.log(searchString)
    return this.productos.filter(product => 
      (product.descrip.toLowerCase().indexOf(searchString.toLowerCase()) >- 1))
  }

}
