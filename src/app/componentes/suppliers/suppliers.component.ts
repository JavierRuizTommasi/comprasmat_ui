import { Component, OnInit, Output, EventEmitter, AfterViewInit, ViewChild } from '@angular/core'
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Cuenta } from 'src/app/models/Cuenta'
import { ComunicacionService } from 'src/app/servicios/comunicacion.service'
import { UsuariosService } from 'src/app/servicios/usuarios.service'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { SuppliersService } from 'src/app/servicios/suppliers.service'
import { Suppliers } from 'src/app/models/Suppliers'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { Router } from '@angular/router'
import { Language } from 'src/app/models/Language'
import { LanguageService } from 'src/app/servicios/language.service'
import * as moment from 'moment'
import { MatDialog } from '@angular/material/dialog'
import { AlertMessagesComponent } from 'src/app/componentes/alert-messages/alert-messages.component'

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.css']
})
export class SuppliersComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator
  @ViewChild(MatSort) sort: MatSort
  @ViewChild(MatTable) table: MatTable<Suppliers>

  dataSource: MatTableDataSource<Suppliers> = new MatTableDataSource<Suppliers>()

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns: string[] = ['codigo', 'nombre', 'usuario', 'localidad', 'provincia', 'pais', 'desempeno', 'activo', 'actions']

  strTipo: string
  idIdx: string

  public cuenta: Cuenta
  @Output() actualizaCuenta = new EventEmitter()

  esp: boolean
  public lang: Language = {esp: true}
  @Output() actualizaLang = new EventEmitter()

  suppliers: Suppliers[] = []
  supplier: Suppliers
  updtSupp: Suppliers

  f: FormGroup

  unumPattern = '^[0-9]{1,10}$'
  userPattern = '^[A-Z0-9]{1,10}$'
  nombPattern = '^[a-zA-Z0-9 .+&]{1,30}$'

  notDone: boolean = true

  constructor(
    private fb: FormBuilder,
    private comunicacionService: ComunicacionService,
    private languageService: LanguageService,
    private suppliersService: SuppliersService,
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
        nombre: ['', Validators.compose([
          Validators.required,
          Validators.pattern(this.nombPattern)
        ])],
        usuario: ['', Validators.compose([
          Validators.required,
          Validators.pattern(this.userPattern)
        ])],
        domicilio: [''],
        c_postal: [''],
        localidad: [''],
        provincia: [''],
        pais: [''],
        desempeno: [0],
        ultcompra: [''],
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

    await this.pedirSuppliers(user)
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
  
  async pedirSuppliers(user) {
    if (user) {
      this.suppliersService.getSuppliers()
      .subscribe((resp: any) => {
        this.dataSource.data = resp.Suppliers
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

  openModal(targetModal, supplier, strTipoParam) {
    this.strTipo = strTipoParam

    this.modalService.open(targetModal, {
     centered: true,
     backdrop: 'static'
    })

    if (strTipoParam === 'A') {
      this.f.patchValue({
        id: '',
        codigo: 0,
        nombre: '',
        usuario: '',
        domicilio: '',
        c_postal: 0,
        localidad: '',
        provincia: '',
        pais: '',
        desempeno: 0,
        ultcompra: moment().format().substr(0, 10),
        activo: true
      })
    } else {
      this.f.patchValue({
        id: supplier._id,
        codigo: supplier.codigo,
        nombre: supplier.nombre,
        usuario: supplier.usuario,
        domicilio: supplier.domicilio,
        c_postal: supplier.c_postal,
        localidad: supplier.localidad,
        provincia: supplier.provincia,
        pais: supplier.pais,
        desempeno: supplier.desempeno,
        ultcompra: supplier.ultcompra?.substr(0,10),
        activo: supplier.activo
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

    this.updtSupp = {
      codigo: this.f.controls.codigo.value,
      nombre: this.f.controls.nombre.value,
      usuario: this.f.controls.usuario.value,
      domicilio: this.f.controls.domicilio.value,
      c_postal: this.f.controls.c_postal.value,
      localidad: this.f.controls.localidad.value,
      provincia: this.f.controls.provincia.value,
      pais: this.f.controls.pais.value,
      desempeno: this.f.controls.desempeno.value,
      ultcompra: this.f.controls.ultcompra.value,
      activo: this.f.controls.activo.value
  }

    switch (this.strTipo) {
      case 'A':
        // Alta
        this.agregarSupplier()
        break
      case 'B':
        // Baja
        this.borrarSupplier()
        break
      case 'M':
        // Modificar
        this.modificarSupplier()
        break
      default:
        // code block
    }

  }

  agregarSupplier() {

    this.suppliersService.addSuppliers(this.updtSupp)
      .subscribe((supp: Suppliers) => {
        console.log('Alta:', supp)
        if (supp) {
          this.alertMsg()
        }
        this.pedirDatos()
      })
  }

  borrarSupplier() {

    this.suppliersService.deleteSuppliers(this.idIdx)
      .subscribe((supp: Suppliers) => {
       console.log('Baja:', supp)
       if (supp) {
        this.alertMsg()
       }
       this.pedirDatos()
    })

  }

  modificarSupplier() {

    this.suppliersService.putSuppliers(this.idIdx, this.updtSupp)
      .subscribe((supp: Suppliers) => {
      console.log('Modif:', supp)
      if (supp) {
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
        strConfMsg = this.esp ? 'Proveedor Creado!' : 'Supplier Created!' 
        break
      case 'B':
        // Baja
        strConfMsg = this.esp ? 'Proveedor Borrado!' : 'Supplier Deleted!' 
        break
      case 'M':
        // Modificar
        strConfMsg = this.esp ? 'Proveedor Modificado!' : 'Supplier Updated!' 
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
