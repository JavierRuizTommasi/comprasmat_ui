import { Component, OnInit, Output, EventEmitter } from '@angular/core'
import { Cuenta } from 'src/app/models/Cuenta'
import { ComunicacionService } from 'src/app/servicios/comunicacion.service'
import { UsuariosService } from 'src/app/servicios/usuarios.service'
import { MyProductsService } from 'src/app/servicios/myproducts.service'
import { MyProducts } from 'src/app/models/MyProducts'
import { FormBuilder, FormGroup } from '@angular/forms'
import { Router } from '@angular/router'
import { Language } from 'src/app/models/Language'
import { LanguageService } from 'src/app/servicios/language.service'
import { MensajesService } from 'src/app/servicios/mensajes.service'

@Component({
  selector: 'app-myproducts',
  templateUrl: './myproducts.component.html',
  styleUrls: ['./myproducts.component.css']
})

export class MyProductsComponent implements OnInit {

  strTipo: string
  idIdx: number

  public cuenta: Cuenta
  @Output() actualizaCuenta = new EventEmitter()

  esp: boolean
  public lang: Language = {esp: true}
  @Output() actualizaLang = new EventEmitter()

  myproducts: MyProducts[] = []
  filterProducts: MyProducts[] = []
  
  private _searchTerm: string
  get searchTerm(): string {
    return this._searchTerm
  }
  set searchTerm(value: string) {
    this._searchTerm = value
    this.filterProducts = this.filtroProductos(value)
  }
  
  f: FormGroup

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
    private usuariosService: UsuariosService,
    private mensajesService: MensajesService,
    private router: Router)
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
      this.pedirMyProducts()
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

      // console.log(this.cuenta)
      this.comunicacionService.cuenta$.next(this.cuenta)
      this.actualizaCuenta.emit(this.cuenta)

      // console.log(this.esp)
      this.lang = {esp: this.esp}
      this.languageService.esp$.next(this.lang)
      this.actualizaLang.emit(this.lang)
    })
  }

  pedirMyProducts() {
    if (this.cuenta) {
      this.myproductsService.findMyProducts(this.cuenta.usuario)
      .subscribe((resp: any) => {
        // console.log('myProducts', resp.myProducts)
        this.myproducts = resp.myProducts
        this.filterProducts = resp.myProducts
        // this._searchTerm = ''
        this.notDone = false
      })
    }
  }

  borrarMyProd() {

    this.siGrabo = true
    this.msgGrabo = 'Borrando...'

    // console.log(this.myproducts)

      
    for(const myprod of this.myproducts){
      if (myprod.checked) {
        // console.log(myprod._id)
        this.myproductsService.deleteMyProducts(myprod._id)
        .subscribe(resp => {
          // console.log('Baja:', resp)
          this.siGrabo = true
          this.msgGrabo = 'Producto Borrado!'
        })
      }
    }

    // console.log('Fin')
    this.pedirMyProducts() 

    setTimeout(() => this.removeAlert(), 3000)
  }

  // borrando() {
  //   for(const myprod of this.myproducts){
  //     if (myprod.checked) {
  //       console.log(myprod._id)
  //       this.myproductsService.deleteMyProducts(myprod._id)
  //       .subscribe(resp => {
  //         console.log('Baja:', resp)
  //         this.siGrabo = true
  //         this.msgGrabo = 'Producto Borrado!'
  //       })
  //     }
  //   }
  //   return true
  // }

  checkAllCheckBox(ev) {
    this.filterProducts.forEach(x => x.checked = ev.target.checked)
  }

  isAllCheckBoxChecked() {
		return this.filterProducts.every(producto => producto.checked)
  }

  isSomeCheckBoxChecked() {
		return this.filterProducts.some(producto => producto.checked)
  }

  filtroProductos(searchString: string) {
    // console.log(searchString)
    return this.myproducts.filter(product => 
      (product.descrip.toLowerCase().indexOf(searchString.toLowerCase()) >- 1) 
      || (product.rubro.toLowerCase().indexOf(searchString.toLowerCase()) > -1) 
      || (product.subrubro.toLowerCase().indexOf(searchString.toLowerCase()) > -1))
  }

}
