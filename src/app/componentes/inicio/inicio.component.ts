import { Component, OnInit, Output, EventEmitter, AfterViewInit, ViewChild } from '@angular/core'
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Language } from 'src/app/models/Language'
import { LanguageService } from 'src/app/servicios/language.service'
import { Cuenta } from 'src/app/models/Cuenta'
import { ComunicacionService } from 'src/app/servicios/comunicacion.service'
import { UsuariosService } from 'src/app/servicios/usuarios.service'
import { TendersService } from 'src/app/servicios/tenders.service'
import { Tenders } from 'src/app/models/Tenders';
import { arEstadosLicitaciones } from 'src/app/models/EstadosLicitaciones'
import { Router } from '@angular/router'

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator
  @ViewChild(MatSort) sort: MatSort
  @ViewChild(MatTable) table: MatTable<Tenders>

  dataSource: MatTableDataSource<Tenders> = new MatTableDataSource<Tenders>()

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns: string[] = ['licitacion', 'descrip', 'cantidad', 'unidad', 'fecha', 'finaliza', 'historico', 'estado']

  esp: boolean
  public lang: Language = {esp: true}
  @Output() actualizaLang = new EventEmitter()

  public cuenta: Cuenta
  @Output() actualizaCuenta = new EventEmitter()

  tenders: Tenders[] = []

  notDone: boolean = true

  estadosLicitaciones = arEstadosLicitaciones

  constructor(
    private comunicacionService: ComunicacionService,
    private usuariosService: UsuariosService,
    private languageService: LanguageService,
    private tenderService: TendersService,
    private router: Router
    ) {
      if (!this.usuariosService.isLogin()) {
        this.router.navigateByUrl('/login')
      }

      this.languageService.esp$.subscribe((lang: Language) => {
        // console.log(this.esp)
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

    await this.pedirTenders(user)
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
  
  async pedirTenders(user) {
      let resp: any = await this.tenderService.getActives().toPromise()
      // resp.Tenders = Object.keys(resp.Tenders).map(e=>resp.Tenders[e])

      // console.log(resp.Tenders)
      this.dataSource.data = resp.Tenders
      this.dataSource.sort = this.sort
      this.dataSource.paginator = this.paginator
      this.table.dataSource = this.dataSource

      // this.tenders = resp.Tenders
      this.notDone = false

  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }
}

