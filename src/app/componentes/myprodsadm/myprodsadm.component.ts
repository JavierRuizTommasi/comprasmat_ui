import { Component, OnInit, Output, EventEmitter, AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Cuenta } from 'src/app/models/Cuenta'
import { ComunicacionService } from 'src/app/servicios/comunicacion.service'
import { UsuariosService } from 'src/app/servicios/usuarios.service'
import { MyProductsService } from 'src/app/servicios/myproducts.service'
import { MyProducts } from 'src/app/models/MyProducts'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { Router } from '@angular/router'
import { Language } from 'src/app/models/Language'
import { LanguageService } from 'src/app/servicios/language.service'
import { ProductosService } from 'src/app/servicios/productos.service'
import { Productos } from 'src/app/models/Products'
import { MatDialog } from '@angular/material/dialog'
import { AlertMessagesComponent } from 'src/app/componentes/alert-messages/alert-messages.component'
import { SuppliersService } from 'src/app/servicios/suppliers.service'
import { Suppliers } from 'src/app/models/Suppliers'

@Component({
  selector: 'app-myprodsadm',
  templateUrl: './myprodsadm.component.html',
  styleUrls: ['./myprodsadm.component.css']
})
export class MyProdsAdmComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator
  @ViewChild(MatSort) sort: MatSort
  @ViewChild(MatTable) table: MatTable<MyProducts>

  dataSource: MatTableDataSource<MyProducts> = new MatTableDataSource<MyProducts>()

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns: string[] = ['usuario', 'codigo', 'descrip', 'rubro', 'subrubro', 'actions']

  strTipo: string
  idIdx: string

  public cuenta: Cuenta
  @Output() actualizaCuenta = new EventEmitter()

  esp: boolean
  public lang: Language = {esp: true}
  @Output() actualizaLang = new EventEmitter()

  myproducts: MyProducts[] = []
  myProdUpdt: MyProducts

  products: Productos[] = []

  f: FormGroup

  unumPattern = '^[0-9]{1,10}$'
  userPattern = '^[A-Z0-9]{1,10}$'
  udescPattern = '^[A-Z0-9. !"#$%&()*+-./\_]{1,50}$'
  urubrPattern = '^[A-Z0-9. !"#$%&()*+-./\_]{1,30}$'

  siGrabo: boolean
  msgGrabo: string

  notDone: boolean = true

  filterValues = {}
  filterSelectObj = []

  newProducts: Productos[] = []
  suppliers: Suppliers[] = []

  constructor(
    private fb: FormBuilder,
    private comunicacionService: ComunicacionService,
    private languageService: LanguageService,
    private modalService: NgbModal,
    private usuariosService: UsuariosService,
    private myproductsService: MyProductsService,
    private productosService: ProductosService,
    private router: Router,
    public dialog: MatDialog,
    private suppliersService: SuppliersService
    ) {

      if (!this.usuariosService.isLogin()) {
        this.router.navigateByUrl('/login')
      }
  
      this.f = fb.group({
        id: [''],
        usuario: ['', Validators.compose([
          Validators.required,
          Validators.pattern(this.userPattern)
        ])],
        proveedor: ['', Validators.compose([
          Validators.required,
          Validators.pattern(this.unumPattern)
        ])],
        codigo: ['', Validators.compose([
          Validators.required,
          Validators.pattern(this.unumPattern)
        ])],
        descrip: ['', Validators.compose([
          Validators.required,
          Validators.pattern(this.udescPattern)
        ])],
        rubro: ['', Validators.compose([
          Validators.required,
          Validators.pattern(this.urubrPattern)
        ])],
        subrubro: ['', Validators.compose([
          Validators.pattern(this.urubrPattern)
        ])],
        detaeng: ['', Validators.compose([
          Validators.pattern(this.udescPattern)
        ])],
        rubroeng: ['', Validators.compose([
          Validators.pattern(this.urubrPattern)
        ])],
        subrubeng: ['', Validators.compose([
          Validators.pattern(this.urubrPattern)
        ])]

      })
  
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
      })

      this.filterSelectObj = [
        {
          name: 'EMPRESA',
          nameeng: 'BRAND',
          columnProp: 'usuario',
          columnPropEng: 'usuario',
          options: []
        },
        {
          name: 'INSUMO',
          nameeng: 'SUPPLY',
          columnProp: 'descrip',
          columnPropEng: 'detaeng',
          options: []
        },
        {
          name: 'RUBRO',
          nameeng: 'CATEGORY',
          columnProp: 'rubro',
          columnPropEng: 'rubroeng',
          options: []
        },
        {
          name: 'SUBRUBRO',
          nameeng: 'SUBCATEGORY',
          columnProp: 'subrubro',
          columnPropEng: 'subrubeng',
          options: []
        }
      ]
    }

  ngOnInit(): void {
    this.comunicacionService.cuenta$.subscribe((cuenta: Cuenta) => {
      this.cuenta = cuenta
     })

    this.pedirDatos()
  }

  ngAfterViewInit() {
  // console.log(this.dataSource)
    // this.dataSource.sort = this.sort;
    // this.dataSource.paginator = this.paginator;
    // this.table.dataSource = this.dataSource;

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

    this.notDone = true

    console.log('pedirDatos')
    const user = await this.getUserData()
    this.checkCuenta(user)

    // await this.pedirTenders(user)
    // await this.pedirOffers(user)
    await this.pedirProducts()
    console.log('Products')
    await this.pedirMyProducts()
    console.log('myProducts')
    await this.pedirSuppliers()
    console.log('Suppliers')

    this.notDone = await false
    console.log('notDone')

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
  
  async pedirMyProducts() {
    let resp: any = await this.myproductsService.getMyProducts().toPromise()
    if (resp) {
      // console.log(resp)
      this.dataSource.data = resp.myProducts
      this.dataSource.sort = this.sort
      this.dataSource.paginator = this.paginator
      this.table.dataSource = this.dataSource

      // this.myproducts = resp.myProducts
      this.filterSelectObj.filter((o) => {
        if (this.esp) {
          o.options = this.getFilterObject(this.dataSource.data, o.columnProp);
        } else {
          o.options = this.getFilterObject(this.dataSource.data, o.columnPropEng);
        }
      })
    }
  }

  async pedirProducts() {
    let resp: any = await this.productosService.getProductos().toPromise()
    this.products = await resp.Products.sort((a, b) => {
      if (a.descrip > b.descrip) {
          return 1;
      }
      if (a.descrip < b.descrip) {
          return -1;
      }
      return 0;
    })
    // console.log(this.products)
  }

  async pedirSuppliers() {
    let resp: any = await this.suppliersService.getSuppliers().toPromise()
    this.suppliers = await resp.Suppliers.sort((a, b) => {
      if (a.usuario > b.usuario) {
          return 1;
      }
      if (a.usuario < b.usuario) {
          return -1;
      }
      return 0;
    })
    // console.log(this.suppliers)
  }

  openModal(targetModal, myprod, strTipoParam) {
    this.strTipo = strTipoParam

    this.modalService.open(targetModal, {
     centered: true,
     backdrop: 'static'
    })

    if (strTipoParam === 'A') {
      this.f.patchValue({
        id: '',
        usuario: '',
        proveedor: 0,
        codigo: 0,
        descrip: '',
        rubro: '',
        subrubro: '',
        detaeng: '',
        rubroeng: '',
        subrubeng: ''

      })
    } else {
      this.f.patchValue({
        id: myprod._id,
        usuario: myprod.usuario,
        proveedor: myprod.proveedor,
        codigo: myprod.codigo,
        descrip: myprod.descrip,
        rubro: myprod.rubro,
        subrubro: myprod.subrubro,
        detaeng: myprod.detaeng,
        rubroeng: myprod.rubroeng,
        subrubeng: myprod.subrubeng
      })
    }

    if (strTipoParam === 'B') {
      this.f.disable()
    } else {
      this.f.enable()
    }

  }

  onSubmit() {
    console.log(this.strTipo)

    this.modalService.dismissAll()
    // console.log('res:', this.f.getRawValue())

    this.idIdx = this.f.controls.id.value
    this.myProdUpdt = {
      usuario: this.f.controls.usuario.value,
      proveedor: this.f.controls.proveedor.value,
      codigo: this.f.controls.codigo.value,
      descrip: this.f.controls.descrip.value,
      rubro: this.f.controls.rubro.value,
      subrubro: this.f.controls.subrubro.value,
      detaeng: this.f.controls.detaeng.value,
      rubroeng: this.f.controls.rubroeng.value,
      subrubeng: this.f.controls.subrubeng.value
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
    this.myproductsService.addMyProducts(this.myProdUpdt)
      .subscribe(myprod => {
        console.log('Alta:', myprod)
        if (myprod) {
          // this.alertMsg()
        }
        this.pedirDatos()
      })
  }

  borrarMuestra() {
    this.myproductsService.deleteMyProducts(this.idIdx)
     .subscribe(myprod => {
       console.log('Baja:', myprod)
       if (myprod) {
        // this.alertMsg()
      }
      this.pedirDatos()
    })
  }

  modificarMuestra() {
    this.myproductsService.putMyProducts(this.idIdx, this.myProdUpdt)
      .subscribe(myprod => {
      console.log('Modif:', myprod)
      if (myprod) {
        this.alertMsg('Insumo')
      }
      this.pedirDatos()
    })
  }

  changeProduct(ev) {
    // console.log(ev)
    this.f.get('codigo').setValue(ev.target.value, {
      onlySelf: true
    })
    
    console.log(ev.target.value)

    for(const product of this.products){
      if (product.codigo == ev.target.value){
        // console.log('Igual')
        // result.push(product)

        // this.f.get('producto').setValue((product.codigo), {
        //   onlySelf: true
        // })
    
        this.f.get('descrip').setValue((product.descrip), {
          onlySelf: true
        })
    
        this.f.get('rubro').setValue((product.rubro), {
          onlySelf: true
        })
    
        this.f.get('subrubro').setValue((product.subrubro), {
          onlySelf: true
        })
    
        this.f.get('detaeng').setValue((product.detaeng), {
          onlySelf: true
        })
    
        this.f.get('rubroeng').setValue((product.rubroeng), {
          onlySelf: true
        })
    
        this.f.get('subrubeng').setValue((product.subrubeng), {
          onlySelf: true
        })
    
        // this.f.get('unidad').setValue((product.unidad), {
        //   onlySelf: true
        // })
    
      }
    }

    // console.log(this.f.controls)

  }

  alertMsg(msg: string): void {
    let strConfMsg = ''

    if (msg=='Insumo') {
      switch (this.strTipo) {
        case 'A':
          // Alta
          strConfMsg = this.esp ? 'Insumo Creado!' : 'Supply Created!' 
          break
        case 'B':
          // Baja
          strConfMsg = this.esp ? 'Insumo Borrado!' : 'Supply Deleted!' 
          break
        case 'M':
          // Modificar
          strConfMsg = this.esp ? 'Insumo Modificado!' : 'Supply Updated!' 
          break
        default:
          break
      }
    } else if (msg=='Guardo') {
        strConfMsg = this.esp ? 'Rubro Guardada!' : 'Category Saved!' 
    } else if (msg=='NoGuardo') {
        strConfMsg = this.esp ? 'Rubro ya guardada!' : 'Category already Saved!' 
    } else if (msg=='Filtro') {
        strConfMsg = this.esp ? 'Debe filtrar un Rubro!' : 'Must filter by Category!' 
    } else if (msg=='Borrado') {
        strConfMsg = this.esp ? 'Rubro Borrada!' : 'Category Deleted!' 
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

      let nameSearch = () => {
        let found = false;
        if (isFilterSet) {
          for (const col in searchTerms) {
            // searchTerms[col].trim().toLowerCase().split(' ').forEach(word => {
            //   // console.log(word)
            //   if (data[col].toString().toLowerCase().indexOf(word) != -1 && isFilterSet) {
            //     found = true
            //   }
            // });

            // console.log(searchTerms[col]);
            // console.log(data[col].toString().toLowerCase())
            if(data[col]) {
              if (searchTerms[col].trim().toLowerCase() == data[col].toString().trim().toLowerCase() && isFilterSet) {
                    found = true
              }
            } else {
              found = false
            }
          }

          // console.log(found)
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

  openModalGrupo(targetModal, strTipoParam) {
    this.strTipo = strTipoParam

    this.modalService.open(targetModal, {
     centered: true,
     backdrop: 'static'
    })

    this.f.patchValue({
      id: '',
      usuario: '',
      proveedor: 0,
      codigo: 0,
      descrip: '',
      rubro: '',
      subrubro: '',
      detaeng: '',
      rubroeng: '',
      subrubeng: ''

    })

    this.f.enable()

  }

  onSubmitGrupo() {
    console.log(this.strTipo)

    this.modalService.dismissAll()
    // console.log('res:', this.f.getRawValue())

    // this.idIdx = this.f.controls.id.value
    this.myProdUpdt = {
      usuario: this.f.controls.usuario.value,
      proveedor: this.f.controls.proveedor.value,
      codigo: this.f.controls.codigo.value,
      descrip: this.f.controls.descrip.value,
      rubro: this.f.controls.rubro.value,
      subrubro: this.f.controls.subrubro.value,
      detaeng: this.f.controls.detaeng.value,
      rubroeng: this.f.controls.rubroeng.value,
      subrubeng: this.f.controls.subrubeng.value
    }

    switch (this.strTipo) {
      case 'AG':
        // Alta
        this.agregarSeleccion()
        break
      case 'BG':
        // Baja
        this.borrarSeleccion()
        break
      default :
        break
    }
  }

  async agregarSeleccion() {
    // console.log('Agregar:', this.products)
    // if (!this.dataSource.filter) {
    //   this.alertMsg('Filtro')
    //   return
    // }

    this.siGrabo = true
    this.msgGrabo = 'Grabando...'
    // console.log(this.myProdUpdt)

    // console.log(this.products)

    this.newProducts = await this.products.filter(o => o.rubro == this.myProdUpdt.rubro.trim())
    // console.log(this.newProducts)

    // let this.myProducts = await this.dataSource.data.filter((o) => {o.usuario = this.myProdUpdt.usuario})
    // console.log(this.myProducts)

    let result = []

    // console.log(this.dataSource.data)

    for(const product of this.newProducts){
      // console.log(product.codigo)
        if (!this.dataSource.data.some(p => p.codigo == product.codigo && p.usuario == this.myProdUpdt.usuario.trim())) {
          // console.log(product.codigo)
          await result.push({
            usuario: this.myProdUpdt.usuario,
            proveedor: this.myProdUpdt.proveedor,
            codigo: product.codigo,
            descrip: product.descrip,
            rubro: product.rubro,
            subrubro: product.subrubro,
            detaeng: product.detaeng,
            rubroeng: product.rubroeng,
            subrubeng: product.subrubeng
          })
      }
    }

    // console.log('Result', result)
    
    // for(const prod of result){
    //     // console.log(result.codigo)
    //     this.myproductsService.addMyProducts(prod)
    //     .subscribe(prod => {
    //       // console.log('Alta:', prod)
    //     })
    // }

    if (result.length > 0) {
      let res2: any = await this.myproductsService.insertMyProducts(result).toPromise()
      console.log(res2)
      await this.pedirDatos()
      // console.log('Pedir')
      if (res2) {
        await this.alertMsg('Guardo')
      }
    } else {
      await this.alertMsg('NoGuardo')
    }   


    // setTimeout(() => this.removeAlert(), 3000)
  }

  async borrarSeleccion() {
    let delQuery = [{
      usuario: this.myProdUpdt.usuario,
      rubro: this.myProdUpdt.rubro
    }]

    console.log(delQuery[0])

    let res: any = await this.myproductsService.deleteMyProductsGroup(delQuery[0]).toPromise()
    console.log(res)
    await this.pedirDatos()
    // console.log('Pedir')
    if (res) {
      await this.alertMsg('Borrado')
    }
  }

changeSupplier(ev) {
    // console.log(ev)
    this.f.get('usuario').setValue(ev.target.value, {
      onlySelf: true
    })
    
    console.log(ev.target.value)

    for(const supplier of this.suppliers){
      if (supplier.usuario == ev.target.value){
        // console.log('Igual')
        // result.push(product)

        // this.f.get('producto').setValue((product.codigo), {
        //   onlySelf: true
        // })
    
        this.f.get('proveedor').setValue((supplier.codigo), {
          onlySelf: true
        })
    
      }
    }

    // console.log(this.f.controls)

  }}
