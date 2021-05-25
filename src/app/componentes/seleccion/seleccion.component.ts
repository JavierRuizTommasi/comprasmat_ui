import { Component, OnInit, Output, EventEmitter, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
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
import { MensajesService } from 'src/app/servicios/mensajes.service'
import { MatDialog } from '@angular/material/dialog'
import { Router } from '@angular/router';
import { AlertMessagesComponent } from 'src/app/componentes/alert-messages/alert-messages.component'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { Observable } from 'rxjs'

@Component({
  selector: 'app-seleccion',
  templateUrl: './seleccion.component.html',
  styleUrls: ['./seleccion.component.css']
})

export class SeleccionComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator
  @ViewChild(MatSort) sort: MatSort
  @ViewChild(MatTable) table: MatTable<MyProducts>

  dataSource: MatTableDataSource<MyProducts> = new MatTableDataSource<MyProducts>()

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns: string[] = ['checked', 'codigo', 'descrip', 'detalle', 'rubro', 'subrubro']

  strTipo: string
  idIdx: number

  public cuenta: Cuenta
  @Output() actualizaCuenta = new EventEmitter()

  esp: boolean
  public lang: Language = {esp: true}
  @Output() actualizaLang = new EventEmitter()

  myproducts: MyProducts[] = []
  products: Productos[] = [] 
  producto: Productos[] = []
  
  siGrabo: boolean
  msgGrabo: string
  siError: boolean
  msgError: string

  public checkAll = false
    
  notDone: boolean = true

  filterValues = {}
  filterSelectObj = []

  constructor(
    private comunicacionService: ComunicacionService,
    private languageService: LanguageService,
    private myproductsService: MyProductsService,
    private productosService: ProductosService,
    private usuariosService: UsuariosService,
    private mensajesService: MensajesService,
    private modalService: NgbModal,
    private router: Router,
    public dialog: MatDialog)
    { 
      if (!this.usuariosService.isLogin()) {
        this.router.navigateByUrl('/login')
      }
  
      this.languageService.esp$.subscribe((lang: Language) => {
        this.esp = lang.esp
        // console.log(this.esp)
        
        // Actualiza el filtro según el idioma
        if (this.dataSource.data) {
          this.resetFilters()
          this.filterSelectObj.filter((o) => {
            if (this.esp) {
              o.options = this.getFilterObject(this.dataSource.data, o.columnProp);
            } else {
              o.options = this.getFilterObject(this.dataSource.data, o.columnPropEng);
            }
          })
        }
      })

      this.filterSelectObj = [
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
        },
        {
          name: 'INSUMO',
          nameeng: 'SUPPLY',
          columnProp: 'descrip',
          columnPropEng: 'detaeng',
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

  ngOnDestroy() {
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
    // pedirProductos() Trae datos del Servicio Productos
    // pedirMyProductos() Trae datos del Servicio MyProductos

    // console.log('pedirDatos')
    const user = await this.getUserData()
    this.checkCuenta(user)

    await this.pedirMyProducts(user)
    await this.pedirProducts(user)
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

      if (user.perfil == 3) {
        // User Laboratorio
        this.router.navigateByUrl('/inicio')
      }

    }
    else {
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
      // console.log(user)
      const resp: any = await this.myproductsService.findMyProducts(user.usuario).toPromise()
      // .subscribe((resp: any) => {
        // console.log(resp)
        this.myproducts = resp.myProducts
      // })
    }
  }

  async pedirProducts(user) {
    if (user) {
      const resp: any = await this.productosService.getProductos().toPromise()  
      // console.log(resp)
      this.dataSource.data = resp.Products
      this.dataSource.sort = this.sort
      this.dataSource.paginator = this.paginator
      this.table.dataSource = this.dataSource
      // this.products = resp.Products
      this.notDone = false
  
      this.filterSelectObj.filter((o) => {
        if (this.esp) {
          o.options = this.getFilterObject(this.dataSource.data, o.columnProp);
        } else {
          o.options = this.getFilterObject(this.dataSource.data, o.columnPropEng);
        }
      })

    }
  }

  async agregarSeleccion() {
    // console.log('Agregar:', this.products)

    // console.log(this.dataSource.filter)
    if (!this.dataSource.filter) {
      await this.alertMsg('Filtro')
      return
    }

    let checkeados = this.dataSource.data.filter(x => x.checked).length
    if (checkeados == 0) {
      await this.alertMsg('SinCheck')
      return
    }

    this.siGrabo = true
    this.msgGrabo = 'Grabando...'
    // setTimeout(() => this.removeAlert(), 3000)

    let result = []

    // console.log(this.dataSource.data)

    for(const product of this.dataSource.data){
      // console.log(product.codigo)
      // console.log(product.checked)
      // if (product.checked
      //   && (product.descrip.trim().toLowerCase().includes(this.dataSource.filter)
      //   || product.rubro.trim().toLowerCase().includes(this.dataSource.filter)
      //   || product.subrubro.trim().toLowerCase().includes(this.dataSource.filter))) {
      if (product.checked) {
        // console.log(product)
        if (!this.myproducts.some(p => p.codigo === product.codigo)) {
          // console.log(product.codigo)
          await result.push({
            usuario: this.cuenta.usuario,
            proveedor: this.cuenta.proveedor,
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
    }

    // console.log('Result', result)
    
    // for(const prod of result){
    //     // console.log(result.codigo)
    //     this.myproductsService.addMyProducts(prod)
    //     .subscribe(prod => {
    //       // console.log('Alta:', prod)
    //     })
    // }

    let res2: any = await this.myproductsService.insertMyProducts(result).toPromise()
    // console.log(res2)
    await this.pedirDatos()
    // console.log('Pedir')
    if (res2) {
      await this.alertMsg('Grabo')
    }

    // setTimeout(() => this.removeAlert(), 3000)
  }

  checkAllCheckBox(ev) {
    // console.log(ev.checked)
    this.dataSource.filteredData.forEach(x=> {
      if (x.checked) {
        x.checked = false
      } else {
        x.checked = true
      }
      // console.log(x)
      // x.checked = ev.target.checked
    })
  }

  isAllCheckBoxChecked() {
		return this.dataSource.filteredData.every(row => row.checked)
  }

  isSomeCheckBoxChecked() {
		return this.dataSource.data.some(row => row.checked)
  }

  applyFilter(filterValue: string): void {
    this.dataSource.data.forEach(x=> x.checked = false)
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }

  alertMsg(msg: string): void {
    // console.log('Aviso')
    if (msg=='Grabo') {
      let strConfMsg = this.esp ? 'Selección Guardada!' : 'Selection Saved!' 
      const dialogRef = this.dialog.open(AlertMessagesComponent, {
        width: '300px',
        data: {tipo: 'Aviso', mensaje: strConfMsg}
      })
    } else if (msg=='Filtro') {
      let strConfMsg = this.esp ? 'Debe filtrar un Rubro!' : 'Must to filter by Category!' 
      const dialogRef = this.dialog.open(AlertMessagesComponent, {
        width: '300px',
        data: {tipo: 'Aviso', mensaje: strConfMsg}
      })
    } else {
      let strConfMsg = this.esp ? 'Nada sellecionado!' : 'None Selected!' 
      const dialogRef = this.dialog.open(AlertMessagesComponent, {
        width: '300px',
        data: {tipo: 'Aviso', mensaje: strConfMsg}
      })
    }
  
  }

  openModal(targetModal, prod, strTipoParam) {
    this.strTipo = strTipoParam

    this.modalService.open(targetModal, {
     centered: true,
     backdrop: 'static'
    })

    let esteProd: any
    esteProd = this.dataSource.data.filter( x => x.codigo == prod.codigo)
    // console.log(esteProd)
    this.producto = esteProd[0]

  }

  getFilterObject(fullObj, key) {
    const uniqChk = []
    // console.log(key)
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
    // console.log(filter)
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
            // console.log(data[col])
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

}
