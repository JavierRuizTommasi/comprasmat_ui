import { Component, OnInit, Output, EventEmitter, AfterViewInit, ViewChild } from '@angular/core'
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
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
import { MatDialog } from '@angular/material/dialog'
import { AlertMessagesComponent } from 'src/app/componentes/alert-messages/alert-messages.component'

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator
  @ViewChild(MatSort) sort: MatSort
  @ViewChild(MatTable) table: MatTable<Productos>

  dataSource: MatTableDataSource<Productos> = new MatTableDataSource<Productos>()

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns: string[] = ['codigo', 'descrip', 'unidad', 'rubro', 'subrubro', 'activo', 'actions']

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

  f: FormGroup

  unumPattern = '^[0-9]{1,10}$'
  udescPattern = '^[A-Z0-9. ]{1,50}$'

  notDone: boolean = true

  constructor(
    private fb: FormBuilder,
    private comunicacionService: ComunicacionService,
    private languageService: LanguageService,
    private productosService: ProductosService,
    private usuariosService: UsuariosService,
    private modalService: NgbModal,
    private router: Router,
    public dialog: MatDialog
    ) {
      if (!this.usuariosService.isLogin()) {
        this.router.navigateByUrl('/login')
      }
  
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

      this.languageService.esp$.subscribe((lang: Language) => {
        this.esp = lang.esp
      })
    }

  ngOnInit(): void {
    this.comunicacionService.cuenta$.subscribe((cuenta: Cuenta) => {
      this.cuenta = cuenta
    })

    this.pedirDatos()
  }

  ngAfterViewInit() {
    console.log(this.dataSource)
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }

  async getUserData() {
    const resp: any = await this.usuariosService.checkUsuario().toPromise()
    console.log(resp.user)
    return resp.user
  }

  async pedirDatos() {
    // Esta funcion pide todos los datos previos antes de mostrar en el browser
    // getUserData() Chequea si el usuario esta logeado 
    // checkCuenta() Avisa al Navbar sino 
    // pedirProductos() Trae datos del Servicio Productos

    console.log('pedirDatos')
    const user = await this.getUserData()
    this.checkCuenta(user)

    await this.pedirProductos(user)
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
  
  async pedirProductos(user) {
    if (user) {
      this.productosService.getProductos()
      .subscribe((resp: any) => {
        this.dataSource.data = resp.Products
        this.dataSource.sort = this.sort
        this.dataSource.paginator = this.paginator
        this.table.dataSource = this.dataSource

        // this.productos = resp.Products
        // this.filterProducts = resp.Products
        this.notDone = false
        console.log(this.table.dataSource)
      })
    }
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase()
      
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
        if (prod) {
          this.alertMsg()
        }
        this.pedirDatos()
      })
  }

  borrarProducto() {

    this.productosService.deleteProductos(this.idIdx)
      .subscribe((prod: Productos) => {
       console.log('Baja:', prod)
       if (prod) {
        this.alertMsg()
       }
       this.pedirDatos()
    })

  }

  modificarProducto() {

    this.productosService.putProductos(this.idIdx, this.updtProd)
      .subscribe((prod: Productos) => {
      console.log('Modif:', prod)
      if (prod) {
        this.alertMsg()
      }
      this.pedirDatos()
    })

  }

  alertMsg(): void {

    let strConfMsg = ''
    switch (this.strTipo) {
      case 'A':
        // Alta
        strConfMsg = this.esp ? 'Producto Creado!' : 'Product Created!' 
        break
      case 'B':
        // Baja
        strConfMsg = this.esp ? 'Producto Borrado!' : 'Product Deleted!' 
        break
      case 'M':
        // Modificar
        strConfMsg = this.esp ? 'Producto Modificado!' : 'Product Updated!' 
        break
      default:
        break
    }
    
    const dialogRef = this.dialog.open(AlertMessagesComponent, {
      width: '300px',
      data: {tipo: 'Aviso', mensaje: strConfMsg}
    })
  
  }

}
