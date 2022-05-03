import { Component, OnInit, OnDestroy } from '@angular/core'
import { MediaObserver, MediaChange } from '@angular/flex-layout'
import { Subscription } from 'rxjs'
import { map, filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'comprasmat';
  private mediaSub: Subscription
  private activeMediaQuery: string = '';
  public deviceXs: boolean

  constructor(public mediaObserver: MediaObserver) {}
  ngOnInit(): void {
    this.mediaSub = this.mediaObserver
    .asObservable()
    .pipe(
      filter((changes: MediaChange[]) => changes.length > 0),
      map((changes: MediaChange[]) => changes[0])
    )      
    .subscribe((change: MediaChange) => {
        // this.activeMediaQuery = change ? `'${change.mqAlias}' = (${change.mediaQuery})` : '';
        // console.log('activeMediaQuery', this.activeMediaQuery);
  
        this.deviceXs = change.mqAlias === 'sm' || change.mqAlias === 'xs' ? true : false
        console.log(change.mqAlias, this.deviceXs);

        // this.loadMobileContent();
    });

    // .subscribe((result: MediaChange)=>{
    // console.log(result.mqAlias)
    // // this.deviceXs = result.mqAlias === 'md' || result.mqAlias === 'sm' || result.mqAlias === 'xs' ? true : false
    // this.deviceXs = result.mqAlias === 'sm' || result.mqAlias === 'xs' ? true : false
    // })

  }

  loadMobileContent() {
    console.log('load mobile content');
    
      // Do something special since the viewport is currently
      // using mobile display sizes.
  }

  ngOnDestroy() {
      this.mediaSub.unsubscribe()
  }
}
