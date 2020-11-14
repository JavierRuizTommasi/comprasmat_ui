import { Component, OnInit, Output, EventEmitter, AfterViewInit, ViewChild } from '@angular/core'
import { HttpResponse } from '@angular/common/http'
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
import { UploadsService } from 'src/app/servicios/uploads.service'
import { Uploads } from 'src/app/models/Uploads'

interface HtmlInputEvent extends Event {
  target: HTMLInputElement & EventTarget
} 

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
  displayedColumns: string[] = ['codigo', 'usuario', 'nombre', 'localidad', 'provincia', 'pais', 'desempeno', 'activo', 'actions']

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

  file: File
  myFiles: Uploads[] = []
  uploads: Uploads[] = []

  notDone: boolean = true
  cuitDone: boolean = false
  ganDone: boolean = false

  filterValues = {}
  filterSelectObj = []

  constructor(
    private fb: FormBuilder,
    private comunicacionService: ComunicacionService,
    private languageService: LanguageService,
    private suppliersService: SuppliersService,
    private usuariosService: UsuariosService,
    private modalService: NgbModal,
    private router: Router,
    public dialog: MatDialog,
    public uploadsService: UploadsService
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
        constCUIT: [''],
        constGAN: [''],
        upload: [''],
        activo: true
      })

      this.languageService.esp$.subscribe((lang: Language) => {
        this.esp = lang.esp
      })

      this.filterSelectObj = [
        {
          name: 'USUARIO',
          nameeng: 'USER',
          columnProp: 'usuario',
          options: []
        },
        {
          name: 'NOMBRE',
          nameeng: 'NAME',
          columnProp: 'nombre',
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
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;

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

    console.log('pedirDatos')
    const user = await this.getUserData()
    this.checkCuenta(user)

    await this.pedirSuppliers(user)
    await this.pedirUploads()
    
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

      if (user.perfil == 3) {
        // User Pending
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
  
  async pedirSuppliers(user) {
    let resp: any
    if (user) {
      if (user.perfil >= 4) {
        resp = await this.suppliersService.getMySupplier(user.usuario).toPromise()
        this.dataSource.data = await resp.Supplier
    } else {
        resp = await this.suppliersService.getSuppliers().toPromise()
        this.dataSource.data = await resp.Suppliers
      }

      this.dataSource.sort = await this.sort
      this.dataSource.paginator = await this.paginator
      this.table.dataSource = await this.dataSource

      // this.productos = resp.Products
      // this.filterProducts = resp.Products
      this.notDone = false
      console.log(this.dataSource.data)

      let x: any = await this.filterSelectObj.filter((o) => {
        o.options = this.getFilterObject(this.dataSource.data, o.columnProp);
      })
    }
  }

  async pedirUploads() {
    let resp: any = await this.uploadsService.getUploads().toPromise()
    this.uploads = resp.Uploads
    // console.log(this.uploads)
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }

  openModal(targetModal, supplier, strTipoParam) {
 
    this.getMyFiles(supplier)
 
    this.strTipo = strTipoParam

    this.modalService.open(targetModal, {
     centered: true,
     backdrop: 'static'
    })

    // console.log(supplier)

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
        constCUIT: '',
        constGAN: '',
        upload: [],
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
        upload: supplier.upload,
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

    // console.log(this.f.controls)

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
      upload: this.f.controls.upload.value,
      activo: this.f.controls.activo.value
    } 

    // console.log(this.updtSupp)

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

  async agregarSupplier() {

    let supp: any = await this.suppliersService.addSuppliers(this.updtSupp).toPromise()
    console.log('Alta:', supp)

    if (supp) {
      this.alertMsg()
    }

    await this.pedirDatos()
  }

  async borrarSupplier() {

    let supp: any = await this.suppliersService.deleteSuppliers(this.idIdx).toPromise()
    console.log('Baja:', supp)

    if (supp) {
      this.alertMsg()
    }
    
    await this.pedirDatos()

  }

  async modificarSupplier() {

    let supp: any = await this.suppliersService.putSuppliers(this.idIdx, this.updtSupp).toPromise()
    // console.log('Modif:', supp)

    if (supp) {
      this.alertMsg()
    }

    await this.pedirDatos()

  }

  async onDeleteFile(delfile, wfile: string) {
    // console.log(delfile)
    switch (wfile) {
      case "constCUIT":
        this.cuitDone = true
        break
    
      case "constGAN":
        this.ganDone = true
        break
    
      default:
        break
    }

    let file: any = await this.uploadsService.deleteUploads(delfile._id).toPromise()

    let resp: any = await this.suppliersService.removeUpload(this.f.controls.id.value, delfile).toPromise() 
    // console.log(resp)

    if (file) {
      // console.log(this.f.controls.upload.value)
      // console.log(this.myFiles)

      this.myFiles = this.myFiles.filter( x => x._id !== delfile._id)
      this.f.controls.upload.value.pop(delfile._id)
      // this.f.patchValue({
      //   upload: this.myFiles._id
      // })

      // console.log(this.f.controls.upload.value)

      switch (wfile) {
        case "constCUIT":
          this.cuitDone = false
          break
      
      case "constGAN":
        this.ganDone = false
        break
    
        default:
          break
      }

    } 
  }
 
  async onAddFile(wfile: string) {
    // console.log(this.updtSupp)
    switch (wfile) {
      case "constCUIT":
        this.cuitDone = true
        break
    
      case "constGAN":
        this.ganDone = true
        break
    
      default:
        break
    }

    const fd = new FormData()
    fd.append('file', this.file)
    fd.append('fileType', wfile)
    fd.append('originalName', this.file.name)
    fd.append('usuario', this.f.controls.usuario.value)
    // console.log(fd)

    let file: any = await this.uploadsService.upload(fd).toPromise()
    // console.log('id', this.f.controls.id.value)
    // console.log('file', file.body.Upload)

    let resp: any = await this.suppliersService.assignUpload(this.f.controls.id.value, file.body.Upload).toPromise() 
    // console.log(resp)

    if (file) {
      // console.log(file.body.Upload)
      this.myFiles.push(file.body.Upload)
      // console.log(this.myFiles)

      // console.log(this.f.controls.upload.value)
      this.f.controls.upload.value.push(file.body.Upload._id)
      // console.log(this.f.controls.upload.value)

      switch (wfile) {
        case "constCUIT":
          this.cuitDone = false
          break
      
      case "constGAN":
        this.ganDone = false
        break
    
        default:
          break
      }
    } 

  }

  async onFileSelected(e: HtmlInputEvent, wfile: string) {
    // console.log(e)
    if(e.target.files && e.target.files[0]) {
      this.file = await <File>e.target.files[0]

      await this.onAddFile(wfile)

    }

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

  onPreviewFile(file) {
    if(file) {
      // console.log(file)
  
      this.uploadsService.download(file._id)
        .subscribe(
        (response: HttpResponse<Blob>) => {
          let filename: string = file.originalName
          let binaryData = [];
          binaryData.push(response.body);
          let downloadLink = document.createElement('a');
          downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, { type: 'blob' }));
          downloadLink.setAttribute('download', filename);
          document.body.appendChild(downloadLink);
          downloadLink.click();
        })


      // .subscribe((resp: any) => {
      //   console.log(resp)

      //   if (resp) {

      //     // let blob = new Blob(resp.file, { type: 'application/pdf' });
      //     // var link = document.createElement('a');
            
      //     // // window.open(url, '_blank')

      //     // var newBlob = new Blob('c:\tmp\demo.pdf', {type: "application/pdf"})
      //     // const data = window.URL.createObjectURL(newBlob);
      //     // var link = document.createElement('a');
      //     // link.href = data;
      //     // link.download='c:\tmp\demo.pdf';
      //     // link.click();
      //     // setTimeout(function(){
      //     //   // For Firefox it is necessary to delay revoking the ObjectURL
      //     //   window.URL.revokeObjectURL(data);
      //     // }, 100);

      //     var filePDF = new Blob([resp], {type: 'application/pdf'});
      //     var fileURL = URL.createObjectURL(filePDF);
      //     window.open(fileURL);

      //   }

      // })
    }

  }
  
  getFile(type: string) {
    // console.log(product)
    let sfile: any
    sfile = this.myFiles.filter( x => x.fileType == type)

    // let ret: string = " "
    // if (sfile[0]) {
    //     ret = sfile[0].originalName ? sfile[0].originalName : " "
    // }
    // console.log(sfile)
    return sfile
  }

  getMyFiles(supplier) {
    // console.log(supplier)
    this.myFiles = []
    for (let index = 0; index < supplier.upload.length; index++) {
      const element = supplier.upload[index];
      // console.log(element)
      
      this.uploads.forEach(item => {
        if (item._id == element) this.myFiles.push(item)
      });
      
      // this.myFiles.push(this.uploads.filter( x => {x._id == element}))

    }
    // console.log(this.myFiles)
  }

  getFilterObject(fullObj, key) {
    const uniqChk = []
    fullObj.filter((obj) => {
      if (!uniqChk.includes(obj[key])) {
        uniqChk.push(obj[key])
      }
      return obj
    })
    return uniqChk
  }

  // Called on Filter change
  filterChange(filter, event) {
    //let filterValues = {}
    this.filterValues[filter.columnProp] = event.target.value.trim().toLowerCase()
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

      console.log(searchTerms);

      let nameSearch = () => {
        let found = false;
        if (isFilterSet) {
          for (const col in searchTerms) {
            searchTerms[col].trim().toLowerCase().split(' ').forEach(word => {
              if (data[col].toString().toLowerCase().indexOf(word) != -1 && isFilterSet) {
                found = true
              }
            });
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
