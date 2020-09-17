import { Component, OnInit, Output, EventEmitter, AfterViewInit, ViewChild } from '@angular/core'
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
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
import { MatDialog } from '@angular/material/dialog'
import { AlertMessagesComponent } from 'src/app/componentes/alert-messages/alert-messages.component'

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
  displayedColumns: string[] = ['checked', 'codigo', 'descrip', 'rubro', 'subrubro']

  strTipo: string
  idIdx: number

  public cuenta: Cuenta
  @Output() actualizaCuenta = new EventEmitter()

  esp: boolean
  public lang: Language = {esp: true}
  @Output() actualizaLang = new EventEmitter()

  myproducts: MyProducts[] = []
 
  public checkAll = false
    
  notDone: boolean = true

  constructor(
    private comunicacionService: ComunicacionService,
    private languageService: LanguageService,
    private myproductsService: MyProductsService,
    private usuariosService: UsuariosService,
    private mensajesService: MensajesService,
    private router: Router,
    public dialog: MatDialog)
    {
      if (!this.usuariosService.isLogin()) {
        this.router.navigateByUrl('/login')
      }
  
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

    // console.log('pedirDatos')
    const user = await this.getUserData()
    this.checkCuenta(user)

    await this.pedirMyProducts(user)
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
        this.notDone = false
      })
    }
  }

  borrarMyProd() {

    // this.msgGrabo = 'Borrando...'

    for(const myprod of this.dataSource.data){
        // console.log(myprod.descrip.includes(this.dataSource.filter))
      
        if (myprod.checked 
          && (myprod.descrip.trim().toLowerCase().includes(this.dataSource.filter)
          || myprod.rubro.trim().toLowerCase().includes(this.dataSource.filter)
          || myprod.subrubro.trim().toLowerCase().includes(this.dataSource.filter))) {
          // console.log(myprod._id)
          this.myproductsService.deleteMyProducts(myprod._id)
          .subscribe(resp => {
            // console.log('Baja:', resp)
            // this.siGrabo = true
            // this.msgGrabo = 'Producto Borrado!'
          })
        }
    }

    // console.log(this.dataSource.data)
    this.pedirDatos() 
    this.alertMsg()

    // setTimeout(() => this.removeAlert(), 3000)
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

    let strConfMsg = this.esp ? 'Selección Borrada!' : 'Selection Deleted!' 
    const dialogRef = this.dialog.open(AlertMessagesComponent, {
      width: '300px',
      data: {tipo: 'Aviso', mensaje: strConfMsg}
    })
  
  }

}
