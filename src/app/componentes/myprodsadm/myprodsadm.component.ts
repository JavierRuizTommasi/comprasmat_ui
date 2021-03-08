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
  udescPattern = '^[A-Z0-9. !"#$%&()*+-./\_]{1,50}$'
  urubrPattern = '^[A-Z0-9. !"#$%&()*+-./\_]{1,30}$'

  siGrabo: boolean
  msgGrabo: string

  notDone: boolean = true

  filterValues = {}
  filterSelectObj = []

  constructor(
    private fb: FormBuilder,
    private comunicacionService: ComunicacionService,
    private languageService: LanguageService,
    private modalService: NgbModal,
    private usuariosService: UsuariosService,
    private myproductsService: MyProductsService,
    private productosService: ProductosService,
    private router: Router,
    public dialog: MatDialog
    ) {

      if (!this.usuariosService.isLogin()) {
        this.router.navigateByUrl('/login')
      }
  
      this.f = fb.group({
        id: [''],
        usuario: [''],
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
        ])]
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
    await this.pedirProducts(user)
    await this.pedirMyProducts(user)

    // this.notDone = false
  
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
  
  async pedirMyProducts(user) {
    if (user) {
      this.myproductsService.getMyProducts()
      .subscribe((resp: any) => {
        // console.log(resp)
        this.dataSource.data = resp.myProducts
        this.dataSource.sort = this.sort
        this.dataSource.paginator = this.paginator
        this.table.dataSource = this.dataSource

        // this.myproducts = resp.myProducts
        this.filterSelectObj.filter((o) => {
          o.options = this.getFilterObject(this.dataSource.data, o.columnProp);
        })

        this.notDone = false
      })
    }
  }

  async pedirProducts(user) {
      this.productosService.getProductos()
      .subscribe((resp: any) => {
        // console.log(resp)
        this.products = resp.Products.sort((a, b) => a.codigo - b.codigo)
      })
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
        subrubro: ''
      })
    } else {
      this.f.patchValue({
        id: myprod._id,
        usuario: myprod.usuario,
        proveedor: myprod.proveedor,
        codigo: myprod.codigo,
        descrip: myprod.descrip,
        rubro: myprod.rubro,
        subrubro: myprod.subrubro
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
      subrubro: this.f.controls.subrubro.value
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
          this.alertMsg()
        }
        this.pedirDatos()
      })
  }

  borrarMuestra() {
    this.myproductsService.deleteMyProducts(this.idIdx)
     .subscribe(myprod => {
       console.log('Baja:', myprod)
       if (myprod) {
        this.alertMsg()
      }
      this.pedirDatos()
    })
  }

  modificarMuestra() {
    this.myproductsService.putMyProducts(this.idIdx, this.myProdUpdt)
      .subscribe(myprod => {
      console.log('Modif:', myprod)
      if (myprod) {
        this.alertMsg()
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
    
        // this.f.get('unidad').setValue((product.unidad), {
        //   onlySelf: true
        // })
    
      }
    }

    // console.log(this.f.controls)

  }

  alertMsg(): void {
    let strConfMsg = ''
    switch (this.strTipo) {
      case 'A':
        // Alta
        strConfMsg = this.esp ? 'Insumo Creada!' : 'Supply Created!' 
        break
      case 'B':
        // Baja
        strConfMsg = this.esp ? 'Insumo Borrada!' : 'Supply Deleted!' 
        break
      case 'M':
        // Modificar
        strConfMsg = this.esp ? 'Insumo Modificada!' : 'Supply Updated!' 
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
      // console.log(uniqChk.sort((a, b) => a - b))
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
            if (searchTerms[col].trim().toLowerCase() == data[col].toString().trim().toLowerCase() && isFilterSet) {
                  found = true
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

}
