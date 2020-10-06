import { Component, OnInit, Output, EventEmitter, AfterViewInit, ViewChild } from '@angular/core'
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Cuenta } from 'src/app/models/Cuenta'
import { ComunicacionService } from 'src/app/servicios/comunicacion.service'
import { UsuariosService } from 'src/app/servicios/usuarios.service'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { ScoringsService } from 'src/app/servicios/scorings.service'
import { Scorings } from 'src/app/models/Scorings'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { Router } from '@angular/router'
import { Language } from 'src/app/models/Language'
import { LanguageService } from 'src/app/servicios/language.service'
import * as moment from 'moment'
import { MatDialog } from '@angular/material/dialog'
import { AlertMessagesComponent } from 'src/app/componentes/alert-messages/alert-messages.component'

@Component({
  selector: 'app-scorings',
  templateUrl: './scorings.component.html',
  styleUrls: ['./scorings.component.css']
})
export class ScoringsComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator
  @ViewChild(MatSort) sort: MatSort
  @ViewChild(MatTable) table: MatTable<Scorings>

  dataSource: MatTableDataSource<Scorings> = new MatTableDataSource<Scorings>()

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns: string[] = ['codigo', 'nombre', 'peso', 'variable', 'activo', 'actions']

  strTipo: string
  idIdx: string

  public cuenta: Cuenta
  @Output() actualizaCuenta = new EventEmitter()

  esp: boolean
  public lang: Language = {esp: true}
  @Output() actualizaLang = new EventEmitter()

  scorings: Scorings[] = []
  scoring: Scorings
  updtScor: Scorings

  f: FormGroup

  unumPattern = '^[0-9]{1,10}$'
  userPattern = '^[A-Z0-9]{1,10}$'
  nombPattern = '^[a-zA-Z0-9 ]{1,30}$'

  notDone: boolean = true

  constructor(
    private fb: FormBuilder,
    private comunicacionService: ComunicacionService,
    private languageService: LanguageService,
    private scoringsService: ScoringsService,
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
          Validators.required])],
        peso: [0],
        variable: [''],
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

    await this.pedirScorings(user)
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
  
  async pedirScorings(user) {
    if (user) {
      this.scoringsService.getScorings()
      .subscribe((resp: any) => {
        this.dataSource.data = resp.SettingScorings
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

  openModal(targetModal, scoring, strTipoParam) {
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
        peso: 0,
        variable: '',
        activo: true
      })
    } else {
      this.f.patchValue({
        id: scoring._id,
        codigo: scoring.codigo,
        nombre: scoring.nombre,
        peso: scoring.peso,
        variable: scoring.variable,
        activo: scoring.activo
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

    this.updtScor = {
      codigo: this.f.controls.codigo.value,
      nombre: this.f.controls.nombre.value,
      peso: this.f.controls.peso.value,
      variable: this.f.controls.variable.value,
      activo: this.f.controls.activo.value
  }

    switch (this.strTipo) {
      case 'A':
        // Alta
        this.agregarScoring()
        break
      case 'B':
        // Baja
        this.borrarScoring()
        break
      case 'M':
        // Modificar
        this.modificarScoring()
        break
      default:
        // code block
    }

  }

  agregarScoring() {

    this.scoringsService.addScorings(this.updtScor)
      .subscribe((scor: Scorings) => {
        console.log('Alta:', scor)
        if (scor) {
          this.alertMsg()
        }
        this.pedirDatos()
      })
  }

  borrarScoring() {

    this.scoringsService.deleteScorings(this.idIdx)
      .subscribe((scor: Scorings) => {
       console.log('Baja:', scor)
       if (scor) {
        this.alertMsg()
       }
       this.pedirDatos()
    })

  }

  modificarScoring() {
    console.log(this.updtScor)

    this.scoringsService.putScorings(this.idIdx, this.updtScor)
      .subscribe((scor: Scorings) => {
      console.log('Modif:', scor)
      if (scor) {
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
        strConfMsg = this.esp ? 'Scoring Creado!' : 'Scoring Created!' 
        break
      case 'B':
        // Baja
        strConfMsg = this.esp ? 'Scoring Borrado!' : 'Scoring Deleted!' 
        break
      case 'M':
        // Modificar
        strConfMsg = this.esp ? 'Scoring Modificado!' : 'Scoring Updated!' 
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
