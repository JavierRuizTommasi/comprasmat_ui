import { Component, OnInit, Output, EventEmitter, AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Cuenta } from 'src/app/models/Cuenta'
import { ComunicacionService } from 'src/app/servicios/comunicacion.service'
import { UsuariosService, IUsuario, IUsuUtp } from 'src/app/servicios/usuarios.service'
import { Usuarios } from 'src/app/models/Usuarios'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { Router } from '@angular/router'
import { Language } from 'src/app/models/Language'
import { LanguageService } from 'src/app/servicios/language.service'
import { arPerfiles } from 'src/app/models/Perfiles'
// import Swal from 'sweetalert2'
import { MatDialog } from '@angular/material/dialog'
import { AlertMessagesComponent } from 'src/app/componentes/alert-messages/alert-messages.component'

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator
  @ViewChild(MatSort) sort: MatSort
  @ViewChild(MatTable) table: MatTable<Usuarios>

  dataSource: MatTableDataSource<Usuarios> = new MatTableDataSource<Usuarios>()

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns: string[] = ['usuario', 'nombre', 'email', 'perfil', 'activo', 'actions']

  strTipo: string
  idIdx: string

  public cuenta: Cuenta
  @Output() actualizaCuenta = new EventEmitter()

  esp: boolean
  public lang: Language = {esp: true}
  @Output() actualizaLang = new EventEmitter()

  usuarios: Usuarios[] = []

  f: FormGroup
  unumPattern = '^[0-9]{1,10}$'
  userPattern = '^[A-Z0-9]{1,10}$'
  nombPattern = '^[a-zA-Z0-9 .+&]{1,30}$'
  emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  passPattern = '((?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{6,20})'

  user: IUsuario
  updtUser: IUsuUtp

  updtPass = {
    id: '',
    pass: '',
    newpass: ''
  }

  notDone: boolean = true

  perfiles = arPerfiles

  constructor(
    private fb: FormBuilder,
    private comunicacionService: ComunicacionService,
    private usuariosService: UsuariosService,
    private modalService: NgbModal,
    private languageService: LanguageService,
    private router: Router,
    public dialog: MatDialog) {
      if (!this.usuariosService.isLogin()) {
        this.router.navigateByUrl('/inicio')
      }

      this.f = fb.group({
        id: [''],
        usuario: ['',
          Validators.compose([
          Validators.required,
          Validators.pattern(this.userPattern)
        ])],
        nombre: ['',
        Validators.compose([
        Validators.required,
        Validators.pattern(this.nombPattern)
        ])],
        email: ['',
          Validators.compose([
          Validators.required,
          Validators.pattern(this.emailRegex)
        ])],
        pass: ['',
          Validators.compose([
          // Validators.required,
          Validators.pattern(this.passPattern)
        ])],
        confpass: ['',
          Validators.compose([
          // Validators.required,
          Validators.pattern(this.passPattern)
        ])],
        perfil: [4],
        proveedor: [0],
        contacto: [''],
        direccion: [''],
        ciudad: [''],
        pais: [''],
        telefono: [''],
        activo: [true],
        language: [''],
        contacto2: [''],
        email2: [''],
        contacto3: [''],
        email3: [''],
        contacto4: [''],
        email4: [''],
        conpass: [false]
      }, { validators: this.passMustMatch('pass', 'confpass') })

      this.languageService.esp$.subscribe((lang: Language) => {
        this.esp = lang.esp
      })

      this.comunicacionService.cuenta$.subscribe((cuenta: Cuenta) => {
        this.cuenta = cuenta
      })
  
    }

  ngOnInit() {
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

    await this.pedirUsuarios(user)
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
  
  async pedirUsuarios(user) {
    if (user) {
      this.usuariosService.getUsuarios()
      .subscribe((resp: any) => {
        this.dataSource.data = resp.Users
        this.dataSource.sort = this.sort
        this.dataSource.paginator = this.paginator
        this.table.dataSource = this.dataSource

        // this.usuarios = resp.Users
        this.notDone = false
        // console.log(this.table.dataSource)
      })

    }
  }

  passMustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName]
        const matchingControl = formGroup.controls[matchingControlName]
  
        // console.log(control.value)
        // console.log(matchingControl.value)
  
        if (matchingControl.errors && !matchingControl.errors.mustMatch) {
            // return if another validator has already found an error on the matchingControl
            return
        }
  
        // set error on matchingControl if validation fails
        if (control.value !== matchingControl.value) {
            matchingControl.setErrors({ mustMatch: true })
        } else {
            matchingControl.setErrors(null)
        }
    }

  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase()
      
  }

  openModal(targetModal, usuario, strTipoParam): void {

    this.strTipo = strTipoParam

    this.modalService.open(targetModal, {
     centered: true,
     backdrop: 'static'
    })

    // this.modalService.open(targetModal, { 
    //   windowClass : "my-modal",
    //   centered: true,
    //   backdrop: 'static'
    // })

    this.f.patchValue({
     id: usuario._id,
     usuario: usuario.usuario,
     nombre: usuario.nombre,
     email: usuario.email,
     pass: '',
     confpass: '',
     proveedor: usuario.proveedor,
     contacto: usuario.contacto,
     direccion: usuario.direccion,
     ciudad: usuario.ciudad,
     pais: usuario.pais,
     telefono: usuario.telefono,
     perfil: usuario.perfil,
     activo: usuario.activo,
     language: usuario.language,
     contacto2: usuario.contacto2,
     email2: usuario.email2,
     contacto3: usuario.contacto3,
     email3: usuario.email3,
     contacto4: usuario.contacto4,
     email4: usuario.email4
    })

    if (strTipoParam === 'B') {
      this.f.disable()
    } else {
      this.f.enable()
    }

  }

  onSubmit(): void {

    console.log(this.strTipo)

    this.modalService.dismissAll()

    // let strConfMsg = ''
    // switch (this.strTipo) {
    //   case 'A': 
    //     strConfMsg = this.esp ? 'Confirma Alta?' : 'Confirm Add?' 
    //     break
    //   case 'B':
    //     strConfMsg = this.esp ? 'Confirma Baja?' : 'Confirm Delete?' 
    //     break
    //   case 'M' || 'P':
    //     strConfMsg = this.esp ? 'Confirma Modificación?' : 'Confirm Update?' 
    //     break
    //   default:
    //     break
    // }

    // const dialogRef = this.dialog.open(AlertMessagesComponent, {
    //   width: '300px',
    //   data: {tipo: 'Confirma', mensaje: strConfMsg}
    // })

    // dialogRef.afterClosed().subscribe(res => {
    //   if (res) {
    //     this.confirmUsuario()
    //   }
    // })
  
    this.saveUsuario()

  }

  saveUsuario(): void {

    // console.log('res:', this.f.getRawValue())

    this.idIdx = this.f.controls.id.value
    this.updtUser = {
      usuario: this.f.controls.usuario.value,
      nombre: this.f.controls.nombre.value,
      proveedor: this.f.controls.proveedor.value,
      contacto: this.f.controls.contacto.value,
      direccion: this.f.controls.direccion.value,
      ciudad: this.f.controls.ciudad.value,
      pais: this.f.controls.pais.value,
      telefono: this.f.controls.telefono.value,
      perfil: this.f.controls.perfil.value,
      email: this.f.controls.email.value,
      pass: this.f.controls.pass.value,
      activo: this.f.controls.activo.value,
      createdAt: '',
      updatedAt: '',
      language: this.f.controls.language.value,
      contacto2: this.f.controls.contacto2.value,
      email2: this.f.controls.email2.value,
      contacto3: this.f.controls.contacto3.value,
      email3: this.f.controls.email3.value,
      contacto4: this.f.controls.contacto4.value,
      email4: this.f.controls.email4.value
    }

    switch (this.strTipo) {
      case 'A':
        // Alta
        this.agregarUsuario()
        break
      case 'B':
        // Baja
        this.borrarUsuario()
        break
      case 'M':
        // Modificar
        this.modificarUsuario()
        break
      case 'P':
        // Modificar
        this.setearPassword()
        break
        default:
    }

  }

  agregarUsuario() {

    this.usuariosService.register(this.updtUser)
      .subscribe((user: IUsuario) => {
        // console.log('Alta:', user)
        if (user) {
          this.alertMsg()
        }
        this.pedirDatos()
      })

    }

  borrarUsuario() {

    this.usuariosService.deleteUsuarios(this.idIdx)
     .subscribe((user: IUsuario) => {
      //  console.log('Baja:', user)
      if (user) {
        this.alertMsg()
      }
      this.pedirDatos()
    })

  }

  modificarUsuario() {

    this.usuariosService.putUsuarios(this.idIdx, this.updtUser)
      .subscribe((user: IUsuario) => {
      // console.log('Modif:', user)
      if (user) {
        this.alertMsg()
      }
      this.pedirDatos()
    })

  }

  setearPassword() {

    this.updtPass = {
      id: this.f.controls.id.value,
      pass: '',
      newpass: this.f.controls.pass.value
    }
    // console.log(this.updtPass)

    this.usuariosService.putPass(this.updtPass)
      .subscribe(resp => {
      // console.log('Pass:', resp)
      if (resp.dataUser) {
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
        strConfMsg = this.esp ? 'Usuario Creado!' : 'User Created!' 
        break
      case 'B':
        // Baja
        strConfMsg = this.esp ? 'Usuario Borrado!' : 'User Deleted!' 
        break
      case 'M':
        // Modificar
        strConfMsg = this.esp ? 'Usuario Modificado!' : 'User Updated!' 
        break
      case 'P':
        // Modificar
        strConfMsg = this.esp ? 'Password Modificada!' : 'Password Updated!' 
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
