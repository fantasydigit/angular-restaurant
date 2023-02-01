import { Component, Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { map, delay, withLatestFrom } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  
  // For Progressbar
  loaders = this.loader.progress$.pipe(
    delay(1000),
    withLatestFrom(this.loader.progress$),
    map(v => v[1]),
  );
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object, private service:AppService,
    private loader: LoadingBarService, translate: TranslateService) {
    if (isPlatformBrowser(this.platformId)) {
      translate.setDefaultLang('en');
      translate.addLangs(['en', 'fr','bm','ch']);
    }
  }

  // getCurrentLatLng() {
  //   this.service.getLatLng().subscribe((res)=> {
  //     console.log(res);
  //   });
  // }

}
