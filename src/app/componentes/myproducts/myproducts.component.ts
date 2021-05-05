import { Component, OnInit, Output, EventEmitter, AfterViewInit, ViewChild } from '@angular/core'
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Cuenta } from 'src/app/models/Cuenta'
import { ComunicacionService } from 'src/app/servicios/comunicacion.service'
import { UsuariosService } from 'src/app/servicios/usuarios.service'
import { MyProductsService } from 'src/app/servicios/myproducts.service'
import { MyProducts } from 'src/app/models/MyProducts'
import { ProductosService } from 'src/app/servicios/productos.service'
import { Productos } from 'src/app/models/Products'
import { FormBuilder, FormGroup } from '@angular/forms'
import { Router } from '@angular/router'
import { Language } from 'src/app/models/Language'
import { LanguageService } from 'src/app/servicios/language.service'
import { MensajesService } from 'src/app/servicios/mensajes.service'
import { MatDialog } from '@angular/material/dialog'
import { AlertMessagesComponent } from 'src/app/componentes/alert-messages/alert-messages.component'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { Observable } from 'rxjs'

@Component({
  selector: 'app-myproducts',
  templateUrl: './myproducts.component.html',
  styleUrls: ['./myproducts.component.css']
})

export class MyProductsComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator
  @ViewChild(MatSort) sort: MatSort
  @ViewChild(MatTable) table: MatTable<MyProducts>

  dataSource: MatTableDataSource<MyProducts> = new MatTableDataSource<MyProducts>()

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns: string[] = ['codigo', 'descrip', 'detalle', 'rubro', 'subrubro', 'actions']

  strTipo: string
  idIdx: number

  public cuenta: Cuenta
  @Output() actualizaCuenta = new EventEmitter()

  esp: boolean
  public lang: Language = {esp: true}
  @Output() actualizaLang = new EventEmitter()

  myproducts: MyProducts[] = []
  producto: Productos[] = []
  
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

        // Actualiza el filtro según el idioma
        if (this.dataSource.data) {
          this.filterSelectObj.filter((o) => {
            o.options = this.getFilterObject(this.dataSource.data, this.esp ? o.columnProp :  o.columnPropEng);
          })
        }
      })

      this.comunicacionService.cuenta$.subscribe((cuenta: Cuenta) => {
        this.cuenta = cuenta
      })

      this.filterSelectObj = [
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
          columnPropEng: 'subrubro',
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

    // console.log('pedirDatos')
    const user = await this.getUserData()
    this.checkCuenta(user)

    await this.pedirMyProducts(user)

    this.notDone = false
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
      this.myproductsService.findMyProducts(this.cuenta.usuario)
      .subscribe((resp: any) => {
        // console.log(resp)
        this.dataSource.data = resp.myProducts
        this.dataSource.sort = this.sort
        this.dataSource.paginator = this.paginator
        this.table.dataSource = this.dataSource

        // this.myproducts = resp.myProducts

        this.filterSelectObj.filter((o) => {
          o.options = this.getFilterObject(this.dataSource.data, this.esp ? o.columnProp :  o.columnPropEng);
        })
      })
    }
  }

  borrarMyProd(myprodId) {
    if (myprodId) {
      this.myproductsService.deleteMyProducts(myprodId)
      .subscribe(resp => {
      })
    }
    // console.log(this.dataSource.data)
    this.pedirDatos() 
    // this.alertMsg()

  }

  checkAllCheckBox(ev) {
    this.dataSource.data.forEach(x=> {
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
		return this.dataSource.data.every(row => row.checked)
  }

  isSomeCheckBoxChecked() {
		return this.dataSource.data.some(row => row.checked)
  }

  applyFilter(filterValue: string): void {
    this.dataSource.data.forEach(x=> x.checked = false)
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }

  alertMsg(): void {
    console.log('Aviso')

    let strConfMsg = this.esp ? 'Insumo Borrado!' : 'Supplie Deleted!' 
    const dialogRef = this.dialog.open(AlertMessagesComponent, {
      width: '300px',
      data: {tipo: 'Aviso', mensaje: strConfMsg}
    })
  
  }

  openModal(targetModal, prod, strTipoParam) {
    this.strTipo = strTipoParam

    this.modalService.open(targetModal, {
     centered: true,
     backdrop: 'static'
    })

    let esteProd: any
    esteProd = this.dataSource.data.filter( x => x.codigo == prod.codigo)
    console.log(esteProd)
    this.producto = esteProd[0]

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
    // console.log(filter)
    this.filterValues[this.esp ? filter.columnProp : filter.columnPropEng] = event.target.value.trim().toLowerCase()
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
            //   if (data[col].toString().toLowerCase().indexOf(word) != -1 && isFilterSet) {
            //     found = true
            //   }
            // });
            if (searchTerms[col].trim().toLowerCase() == data[col].toString().trim().toLowerCase() && isFilterSet) {
                  found = true
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
