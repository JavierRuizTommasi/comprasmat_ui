import { Component, OnInit, Output, EventEmitter, AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Cuenta } from 'src/app/models/Cuenta'
import { ComunicacionService } from 'src/app/servicios/comunicacion.service'
import { UsuariosService } from 'src/app/servicios/usuarios.service'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { HelpService } from 'src/app/servicios/help.service'
import { Help } from 'src/app/models/Help'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { Router } from '@angular/router'
import { Language } from 'src/app/models/Language'
import { LanguageService } from 'src/app/servicios/language.service'
import { MensajesService } from 'src/app/servicios/mensajes.service'
import { MatDialog } from '@angular/material/dialog'
import { AlertMessagesComponent } from 'src/app/componentes/alert-messages/alert-messages.component'
import { Observable } from 'rxjs'
import { trigger, state, style, animate, transition } from '@angular/animations'

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display: 'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class HelpComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator
  @ViewChild(MatSort) sort: MatSort
  @ViewChild(MatTable) table: MatTable<Help>

  dataSource: MatTableDataSource<Help> = new MatTableDataSource<Help>()

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns: string[]

  strTipo: string
  idIdx: string

  public cuenta: Cuenta
  @Output() actualizaCuenta = new EventEmitter()

  esp: boolean
  public lang: Language = {esp: true}
  @Output() actualizaLang = new EventEmitter()

  helps: Help[] = []
  help: Help
  updtHelp: Help

  f: FormGroup
    
  unumPattern = '^[0-9]{1,10}$'

  notDone: boolean = true

  constructor( 
    private fb: FormBuilder,
    private comunicacionService: ComunicacionService,
    private languageService: LanguageService,
    private helpService: HelpService,
    private usuariosService: UsuariosService,
    private mensajesService: MensajesService,
    private modalService: NgbModal,
    private router: Router,
    public dialog: MatDialog)
    { 
      if (!this.usuariosService.isLogin()) {
        this.router.navigateByUrl('/login')
      }
  
      this.f = fb.group({
        id: [''],
        orden: ['', Validators.compose([
          Validators.required,
          Validators.pattern(this.unumPattern)
        ])],
        grupo: [''],
        pregunta: [''],
        respuesta: [''],
        grupoeng: [''],
        preguntaeng: [''],
        respuestaeng: [''],
        activo: true
      })

      this.languageService.esp$.subscribe((lang: Language) => {
        this.esp = lang.esp
      })

      this.comunicacionService.cuenta$.subscribe((cuenta: Cuenta) => {
        this.cuenta = cuenta

        if (this.cuenta) {
          if (this.cuenta.perfil == 0) {
            this.displayedColumns = ['orden', 'grupo', 'pregunta', 'activo', 'actions']
          } else {
            this.displayedColumns = ['pregunta']
          }
        }
      })

    }

  ngOnInit(): void {
    this.pedirDatos()
  }

    ngAfterViewInit() {
    // console.log(this.dataSource)
    // this.dataSource.sort = this.sort;
    // this.dataSource.paginator = this.paginator;
    // this.table.dataSource = this.dataSource;
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
    // pedirHelp() Trae datos del Servicio Help

    console.log('pedirDatos')
    const user = await this.getUserData()
    this.checkCuenta(user)

    await this.pedirHelp(user)
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
  
  async pedirHelp(user) {
    if (user) {
      this.helpService.getHelps()
      .subscribe((resp: any) => {
        this.dataSource.data = resp.Helps
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

  openModal(targetModal, help, strTipoParam) {
    this.strTipo = strTipoParam

    this.modalService.open(targetModal, {
     centered: true,
     backdrop: 'static'
    })

    if (strTipoParam === 'A') {
      this.f.patchValue({
        id: '',
        orden: 0,
        grupo: '',
        pregunta: '',
        respuesta: '',
        grupoeng: '',
        preguntaeng: '',
        respuestaeng: '',
        activo: true
      })
    } else {
      this.f.patchValue({
        id: help._id,
        orden: help.orden,
        grupo: help.grupo,
        pregunta: help.pregunta,
        respuesta: help.respuesta,
        grupoeng: help.grupoeng,
        preguntaeng: help.preguntaeng,
        respuestaeng: help.respuestaeng,
        activo: help.activo,
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

    this.updtHelp= {
      orden: this.f.controls.orden.value,
      grupo: this.f.controls.grupo.value,
      pregunta: this.f.controls.pregunta.value,
      respuesta: this.f.controls.respuesta.value,
      grupoeng: this.f.controls.grupoeng.value,
      preguntaeng: this.f.controls.preguntaeng.value,
      respuestaeng: this.f.controls.respuestaeng.value,
      activo: this.f.controls.activo.value
  }

    switch (this.strTipo) {
      case 'A':
        // Alta
        this.agregarHelp()
        break
      case 'B':
        // Baja
        this.borrarHelp()
        break
      case 'M':
        // Modificar
        this.modificarHelp()
        break
      default:
        // code block
    }

  }

  agregarHelp() {

    this.helpService.addHelp(this.updtHelp)
      .subscribe((help: Help) => {
        console.log('Alta:', help)
        if (help) {
          this.alertMsg()
        }
        this.pedirDatos()
      })
  }

  borrarHelp() {
    this.helpService.deleteHelp(this.idIdx)
      .subscribe((help: Help) => {
       console.log('Baja:', help)
       if (help) {
        this.alertMsg()
       }
       this.pedirDatos()
    })

  }

  modificarHelp() {
    this.helpService.putHelp(this.idIdx, this.updtHelp)
      .subscribe((help: Help) => {
      console.log('Modif:', help)
      if (help) {
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
        strConfMsg = this.esp ? 'Help Creado!' : 'Help Created!' 
        break
      case 'B':
        // Baja
        strConfMsg = this.esp ? 'Help Borrado!' : 'Help Deleted!' 
        break
      case 'M':
        // Modificar
        strConfMsg = this.esp ? 'Help Modificado!' : 'Help Updated!' 
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
