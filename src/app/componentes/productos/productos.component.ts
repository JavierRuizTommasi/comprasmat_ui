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
import { arUnidades } from 'src/app/models/Unidades'

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
  displayedColumns: string[] = ['codigo', 'descrip', 'unidad', 'rubro', 'subrubro', 'historico', 'activo', 'actions']

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
  udescPattern = '^[A-Z0-9. !"#$%&()*+-./\_]{1,50}$'
  urubrPattern = '^[A-Z0-9. !"#$%&()*+-./\_]{1,30}$'
  
  notDone: boolean = true

  unidades = arUnidades

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
        rubro: ['', Validators.compose([
          Validators.required,
          Validators.pattern(this.urubrPattern)
        ])],
        subrubro: ['', Validators.compose([
          Validators.required,
          Validators.pattern(this.urubrPattern)
        ])],
        unidad: ['', Validators.compose([
          Validators.required
        ])],
        costo: [0],
        ultcompra: [''],
        proveedor: [0],
        provenom: [''],
        precio: [0],
        activo: true,
        historico: [0],
        detaeng: ['', Validators.compose([
          Validators.required,
          Validators.pattern(this.udescPattern)
        ])],
        rubroeng: ['', Validators.compose([
          Validators.required,
          Validators.pattern(this.urubrPattern)
        ])],
        subrueng: ['', Validators.compose([
          Validators.required,
          Validators.pattern(this.urubrPattern)
        ])],
        caracteris: [''],
        caracteriseng: ['']
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
    // console.log(this.dataSource)
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
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
        // console.log(this.table.dataSource)
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
        activo: true,
        historico: 0,
        detaeng: '',
        rubroeng: '',
        subrueng: '',
        caracteris: '',
        caracteriseng: ''
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
        activo: producto.activo,
        historico: producto.historico,
        detaeng: producto.detaeng,
        rubroeng: producto.rubroeng,
        subrueng: producto.subrueng,
        caracteris: producto.caracteris,
        caracteriseng: producto.caracteriseng
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
      historico: this.f.controls.historico.value,
      detaeng: this.f.controls.detaeng.value,
      rubroeng: this.f.controls.rubroeng.value,
      subrueng: this.f.controls.subrueng.value,
      caracteris: this.f.controls.caracteris.value,
      caracteriseng: this.f.controls.caracteriseng.value
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

  logKeyValuePairs(group: FormGroup): void {

    Object.keys(group.controls).forEach((key: string) => {

      // Get a reference to the control using the FormGroup.get() method
      const abstractControl = group.get(key);

      // If the control is an instance of FormGroup i.e a nested FormGroup
      // then recursively call this same method (logKeyValuePairs) passing it
      // the FormGroup so we can get to the form controls in it

      if (abstractControl instanceof FormGroup) {
        this.logKeyValuePairs(abstractControl);
        // If the control is not a FormGroup then we know it's a FormControl
      }
      else {
        console.log('Key = ' + key + ' && Value = ' + abstractControl.value);
        console.log('Error = ' + key + ' && Value = ' + abstractControl.errors);
      }

    });
  }
}
