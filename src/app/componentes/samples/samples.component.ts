import { Component, OnInit, Output, EventEmitter, AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Cuenta } from 'src/app/models/Cuenta'
import { ComunicacionService } from 'src/app/servicios/comunicacion.service'
import { UsuariosService } from 'src/app/servicios/usuarios.service'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { Router } from '@angular/router'
import { Language } from 'src/app/models/Language'
import { LanguageService } from 'src/app/servicios/language.service'
import { SamplesService } from 'src/app/servicios/samples.service'
import { Samples } from 'src/app/models/Samples';
import { ProductosService } from 'src/app/servicios/productos.service'
import { Productos } from 'src/app/models/Products'
import * as moment from 'moment'
import { MatDialog } from '@angular/material/dialog'
import { AlertMessagesComponent } from 'src/app/componentes/alert-messages/alert-messages.component'
import { arEstadosMuestras } from 'src/app/models/EstadosMuestras'

@Component({
  selector: 'app-samples',
  templateUrl: './samples.component.html',
  styleUrls: ['./samples.component.css']
})
export class SamplesComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator
  @ViewChild(MatSort) sort: MatSort
  @ViewChild(MatTable) table: MatTable<Samples>

  dataSource: MatTableDataSource<Samples> = new MatTableDataSource<Samples>()

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns: string[] = ['muestra', 'usuario', 'descrip', 'fecha', 'estado', 'actions']

  strTipo: string
  idIdx: string

  public cuenta: Cuenta
  @Output() actualizaCuenta = new EventEmitter()

  esp: boolean
  public lang: Language = {esp: true}
  @Output() actualizaLang = new EventEmitter()

  samples: Samples[] = []
  sample: Samples
  sampUpt: Samples

  products: Productos[] = []

  f: FormGroup

  siGrabo: boolean
  msgGrabo: string

  notDone: boolean = true

  estadosMuestras = arEstadosMuestras

  filterValues = {}
  filterSelectObj = []

  constructor(
    private fb: FormBuilder,
    private comunicacionService: ComunicacionService,
    private modalService: NgbModal,
    private languageService: LanguageService,
    private usuariosService: UsuariosService,
    private samplesService: SamplesService,
    private productosService: ProductosService,
    private router: Router,
    public dialog: MatDialog
    ) {

      if (!this.usuariosService.isLogin()) {
        this.router.navigateByUrl('/login')
      }
  
        this.f = fb.group({
        id: [''],
        muestra: [''],
        usuario: [{value: '', disabled: true},
          Validators.compose([
          Validators.required
        ])],
        email: [{value: '', disabled: true},
          Validators.compose([
          Validators.required
        ])],
        proveedor: [{value: '', disabled: true},
          Validators.compose([
          Validators.required
        ])],
        provenom: [{value: '', disabled: true},
          Validators.compose([
          Validators.required
        ])],
        fecha: ['',
          Validators.compose([
          Validators.required
        ])],
        producto: [{value: '', disabled: true},
          Validators.compose([
          Validators.required
        ])],
        descrip: [{value: '', disabled: true},
          Validators.compose([
          Validators.required
        ])],
        cantidad: ['',
          Validators.compose([
          Validators.required
        ])],
        unidad: ['',
          Validators.compose([
          Validators.required
        ])],
        analisis: [''],
        userlab: [''],
        estado: [0,
          Validators.compose([
          Validators.required
        ])],
        resultado: [0],
        detalle: ['']
      })
  
      this.languageService.esp$.subscribe((lang: Language) => {
        this.esp = lang.esp
      })
  
      this.comunicacionService.cuenta$.subscribe((cuenta: Cuenta) => {
        this.cuenta = cuenta
      })

      this.filterSelectObj = [
        {
          name: 'USUARIO',
          nameeng: 'USER',
          columnProp: 'usuario',
          options: []
        },
        {
          name: 'PRODUCTO',
          nameeng: 'PRODUCT',
          columnProp: 'descrip',
          options: []
        }
      ]
    }

  ngOnInit(): void {
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
    console.log(resp.user)
    return resp.user
  }

  async pedirDatos() {
    // Esta funcion pide todos los datos previos antes de mostrar en el browser
    // getUserData() Chequea si el usuario esta logeado 
    // checkCuenta() Avisa al Navbar sino 
    // pedirTenders() Trae datos del Servicio Tenders
    // pedirOffers() Trae datos del Servicio Offers
    // pedirSampres() trae datos del Servicio Samples pero solo en caso que el usuario este logeado  

    console.log('pedirDatos')
    const user = await this.getUserData()
    this.checkCuenta(user)

    // await this.pedirTenders(user)
    // await this.pedirOffers(user)
    await this.pedirProducts(user)
    await this.pedirSamples(user)

    this.notDone = false
  
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
  
  async pedirSamples(user) {
    console.log('Samples')
    // console.log(user)
    let resp: any
    if (user) {
      if (user.perfil === 4) {
        console.log('Proveedor', user.perfil)
        resp = await this.samplesService.findMySamples(user.usuario).toPromise()
      } else {
        console.log('Todos', user.perfil)
        resp = await this.samplesService.getSamples().toPromise()
      }

      this.dataSource.data = resp.Samples
      this.dataSource.sort = this.sort
      this.dataSource.paginator = this.paginator
      this.table.dataSource = this.dataSource

      // this.samples = resp.Samples
      console.log(this.dataSource)

      this.filterSelectObj.filter((o) => {
        o.options = this.getFilterObject(this.dataSource.data, o.columnProp);
      })
    }
  }

  async pedirProducts(user) {
      this.productosService.getProductos()
      .subscribe((resp: any) => {
        // console.log(resp)
        this.products = resp.Products
      })
  }

  openModal(targetModal, sample, strTipoParam) {
    this.strTipo = strTipoParam

    this.modalService.open(targetModal, {
     centered: true,
     backdrop: 'static'
    })

    if (strTipoParam === 'A') {
      this.f.patchValue({
        id: '',
        muestra: 0,
        usuario: this.cuenta.usuario,
        email: this.cuenta.email,
        proveedor: this.cuenta.proveedor,
        provenom: this.cuenta.nombre,
        fecha: moment().format().substr(0, 10) ,
        producto: 0,
        descrip: '',
        cantidad: 0,
        unidad: '',
        analisis: '',
        userlab: '',
        resultado: 0,
        estado: 1,
        detalle: ''
      })
    } else {
      this.f.patchValue({
        id: sample._id,
        muestra: sample.muestra,
        usuario: sample.usuario,
        email: sample.email,
        proveedor: sample.proveedor,
        provenom: sample.provenom,
        fecha: sample.fecha.substr(0,10) ,
        producto: sample.producto,
        descrip: sample.descrip,
        cantidad: sample.cantidad,
        unidad: sample.unidad,
        analisis: sample.analisis ? sample.analisis.substr(0,10) : '',
        userlab: sample.userlab,
        resultado: sample.resultado,
        estado: sample.estado,
        detalle: sample.detalle
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
    this.sampUpt = {
      muestra: this.f.controls.muestra.value,
      usuario: this.f.controls.usuario.value,
      email: this.f.controls.email.value,
      proveedor: this.f.controls.proveedor.value,
      provenom: this.f.controls.provenom.value,
      fecha: this.f.controls.fecha.value,
      producto: this.f.controls.producto.value,
      descrip: this.f.controls.descrip.value,
      cantidad: this.f.controls.cantidad.value,
      unidad: this.f.controls.unidad.value,
      analisis: this.f.controls.analisis.value,
      userlab: this.f.controls.userlab.value,
      resultado: this.f.controls.resultado.value,
      estado: this.f.controls.estado.value,
      detalle: this.f.controls.detalle.value
    }

    switch (this.strTipo) {
      case 'A':
        // Alta
        this.agregarMuestra()
        break
      case 'B':
        // Baja
        this.borrarMuestra()
        break
      case 'M':
        // Modificar
        this.modificarMuestra()
        break
    }
  }

  agregarMuestra() {
    this.samplesService.addSample(this.sampUpt)
      .subscribe((sample: Samples) => {
        console.log('Alta:', sample)
        if (sample) {
          this.alertMsg()
        }
        this.pedirDatos()
      })

   }

  borrarMuestra() {
    this.samplesService.deleteSample(this.idIdx)
     .subscribe((sample: Samples) => {
       console.log('Baja:', sample)
       if (sample) {
        this.alertMsg()
      }
      this.pedirDatos()
    })

  }

  modificarMuestra() {
    console.log(this.sampUpt)
    this.samplesService.putSample(this.idIdx, this.sampUpt)
      .subscribe((sample: Samples) => {
      console.log('Modif:', sample)
      if (sample) {
        this.alertMsg()
      }
      this.pedirDatos()
    })
  
  }

  changeProduct(ev) {
    // console.log(ev)
    this.f.get('producto').setValue(ev.target.value, {
      onlySelf: true
    })
    
    console.log(ev.target.value)

    for(const product of this.products){
      if (product.codigo == ev.target.value){
        // console.log('Igual')
        // result.push(product)

        // this.f.get('producto').setValue((product.codigo), {
        //   onlySelf: true
        // })
    
        this.f.get('descrip').setValue((product.descrip), {
          onlySelf: true
        })
    
        // this.f.get('costo').setValue((product.costo), {
        //   onlySelf: true
        // })
    
        // this.f.get('cantidad').setValue((product.cantidad), {
        //   onlySelf: true
        // })
    
        // this.f.get('unidad').setValue((product.unidad), {
        //   onlySelf: true
        // })
    
      }
    }

    console.log(this.f.controls)

  }
  
  alertMsg(): void {
    let strConfMsg = ''
    switch (this.strTipo) {
      case 'A':
        // Alta
        strConfMsg = this.esp ? 'Muestra Creada!' : 'Sample Created!' 
        break
      case 'B':
        // Baja
        strConfMsg = this.esp ? 'Muestra Borrada!' : 'Sample Deleted!' 
        break
      case 'M':
        // Modificar
        strConfMsg = this.esp ? 'Muestra Modificada!' : 'Sample Updated!' 
        break
      default:
        break
    }
    
    const dialogRef = this.dialog.open(AlertMessagesComponent, {
      width: '300px',
      data: {tipo: 'Aviso', mensaje: strConfMsg}
    })
  
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
