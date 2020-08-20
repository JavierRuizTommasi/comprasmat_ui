import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Cuenta } from 'src/app/models/Cuenta'
import { ComunicacionService } from 'src/app/servicios/comunicacion.service'
import { UsuariosService } from 'src/app/servicios/usuarios.service'
import { MyProductsService } from 'src/app/servicios/myproducts.service'
import { MyProducts } from 'src/app/models/MyProducts'
import { FormBuilder, FormGroup } from '@angular/forms'
import { ProductosService } from 'src/app/servicios/productos.service'
import { Productos } from 'src/app/models/Products'
import { Language } from 'src/app/models/Language'
import { LanguageService } from 'src/app/servicios/language.service'

@Component({
  selector: 'app-seleccion',
  templateUrl: './seleccion.component.html',
  styleUrls: ['./seleccion.component.css']
})

export class SeleccionComponent implements OnInit {

  strTipo: string
  idIdx: number

  public cuenta: Cuenta
  @Output() actualizaCuenta = new EventEmitter()

  esp: boolean
  public lang: Language = {esp: true}
  @Output() actualizaLang = new EventEmitter()

  myproducts: MyProducts[] = []

  f: FormGroup
 
  products: Productos[] = [] 
  filterProducts: Productos[] = []
  
  private _searchTerm: string
  get searchTerm(): string {
    return this._searchTerm
  }
  set searchTerm(value: string) {
    this._searchTerm = value
    this.filterProducts = this.filtroProductos(value)
  }
  
  siGrabo: boolean
  msgGrabo: string
  siError: boolean
  msgError: string

  public checkAll = false
    
  notDone: boolean = true

  constructor(
    private fb: FormBuilder,
    private comunicacionService: ComunicacionService,
    private languageService: LanguageService,
    private myproductsService: MyProductsService,
    private productosService: ProductosService,
    private usuariosService: UsuariosService)
    { 
      this.f = fb.group({
        fdescrip: [''],
        frubro: [''],
        fsubrubro: ['']
        })

      this.languageService.esp$.subscribe((lang: Language) => {
        this.esp = lang.esp
      })
    }

  ngOnInit(): void {
    this.comunicacionService.cuenta$.subscribe((cuenta: Cuenta) => {
      this.cuenta = cuenta
 
      // console.log('Subcribe', this.cuenta)
      if (this.cuenta) {
        this.productosService.getProductos()  
        .subscribe((resp: any) => {
          // console.log(resp)
          this.products = resp.Products
          this.filterProducts = resp.Products

        })

        this.pedirMyProducts()
      }
    })
    
    this.getUserData()
    // console.log(this.cuenta)

  }

  removeAlert(): void {
    this.siGrabo = false
    this.siError = false
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

      // console.log('Get User', this.cuenta)
      this.comunicacionService.cuenta$.next(this.cuenta)
      this.actualizaCuenta.emit(this.cuenta)

      // console.log(this.esp)
      this.lang = {esp: this.esp}
      this.languageService.esp$.next(this.lang)
      this.actualizaLang.emit(this.lang)
    })
  }

  pedirMyProducts() {
    // console.log('usuario', this.cuenta.usuario)
    this.myproductsService.findMyProducts(this.cuenta.usuario)
    .subscribe((resp: any) => {
      // console.log('myProducts', resp.myProducts)
      this.myproducts = resp.myProducts
      this.notDone = false
    })
  }

  agregarSeleccion() {
    // console.log('Agregar:', this.products)

    this.siGrabo = true
    this.msgGrabo = 'Grabando...'
    setTimeout(() => this.removeAlert(), 3000)

    let result = []

    // console.log(this.filterProducts)

    for(const product of this.filterProducts){
      // console.log(product.codigo)
      // console.log(product.checked)
      if (product.checked) {
        // console.log(product.codigo)
        if (!this.myproducts.some(p => p.codigo === product.codigo)) {
          result.push({
            usuario: this.cuenta.usuario,
            proveedor: this.cuenta.proveedor,
            codigo: product.codigo,
            descrip: product.descrip,
            rubro: product.rubro,
            subrubro: product.subrubro
          })
        }
      }
    }

    // console.log('Result', result)

    for(const prod of result){
        // console.log(result.codigo)
        this.myproductsService.postMyProducts(prod)
        .subscribe(prod => {
          // console.log('Alta:', prod)
        })
    }

    this.siGrabo = true
    this.msgGrabo = 'Producto Grabado!'
    this.pedirMyProducts()
    // console.log('myProducts', this.myproducts)

    // this.myproductsService.postMyProducts(this.updtMyProd)
    //   .subscribe((sele: IMyProduct) => {
    //     console.log('Alta:', sele)
    //     this.siGrabo = true
    //     this.msgGrabo = 'Producto Grabado!'
    //     this.pedirMyProducts()
    //   })

    setTimeout(() => this.removeAlert(), 3000)
  }

  checkAllCheckBox(ev) {
    this.filterProducts.forEach(x => x.checked = ev.target.checked)
  }

  isAllCheckBoxChecked() {
		return this.filterProducts.every(product => product.checked);
  }

  isSomeCheckBoxChecked() {
		return this.filterProducts.some(product => product.checked);
  }

  filtroProductos(searchString: string) {
    // console.log(searchString)
    return this.products.filter(product => 
      (product.descrip.toLowerCase().indexOf(searchString.toLowerCase()) >- 1) 
      || (product.rubro.toLowerCase().indexOf(searchString.toLowerCase()) > -1) 
      || (product.subrubro.toLowerCase().indexOf(searchString.toLowerCase()) > -1))
  }

}
