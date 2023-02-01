import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { LoadingBarRouterModule } from '@ngx-loading-bar/router';
import { ToastrModule } from 'ngx-toastr';
import { TranslateLoader, TranslateModule} from '@ngx-translate/core';
import { TranslateHttpLoader} from '@ngx-translate/http-loader';
import { SharedModule } from './shared/shared.module';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { ShopComponent } from './shop/shop.component';
import { PagesComponent } from './pages/pages.component';
import { ElementsComponent } from './elements/elements.component';

import 'hammerjs';
import 'mousetrap';
import { JwtInterceptor } from './jwt.interceptor';

import { GoogleLoginProvider, SocialAuthServiceConfig, FacebookLoginProvider, SocialLoginModule } from 'angularx-social-login'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'

import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { FooditemAddonComponent } from './home/create-order/fooditem-addon/fooditem-addon.component';
import { LanguageErrorComponent } from './home/language-error/language-error.component';
import { CreateOrderComponent } from './home/create-order/create-order.component';
import { OpeningHoursComponent } from './home/opening-hours/opening-hours.component';
import { DeliveryHoursComponent } from './home/delivery-hours/delivery-hours.component';
import { CheckoutComponent } from './pages/account/checkout/checkout.component';
import { PatchAddressConfirmDialogComponent } from './pages/account/checkout/patch-address-confirm-dialog/patch-address-confirm-dialog.component';
import { AgmCoreModule } from '@agm/core';
import { environment } from 'src/environments/environment';
import { SearchComponent } from './search/search.component';
import { SuccessComponent } from './pages/account/checkout/success/success.component';
import { PaymentVerifyComponent } from './pages/account/checkout/payment-verify/payment-verify.component';
import { MerchantComponent } from './merchant/merchant.component';
import { NgxWebstorageModule } from 'ngx-webstorage';
let googleMapApi = environment.googleMapApiKey;

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
   return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

@NgModule({
  declarations: [
    AppComponent,
    ShopComponent,
    PagesComponent,
    ElementsComponent,
    MerchantComponent,
    CreateOrderComponent,
    CheckoutComponent,
    SearchComponent,
    SuccessComponent,
    PaymentVerifyComponent,
    PatchAddressConfirmDialogComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    HttpClientModule,
    NgbModule,
    LoadingBarHttpClientModule,
    LoadingBarRouterModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      progressBar: false,
      enableHtml: true,
    }),
    TranslateModule.forRoot({
        loader: {
            provide: TranslateLoader,
            useFactory: (HttpLoaderFactory),
            deps: [HttpClient]
        }
    }),
    SharedModule,
    AppRoutingModule,
    SocialLoginModule,
    AgmCoreModule.forRoot({
      apiKey: googleMapApi,
      libraries: ['geometry', 'places']
    }),
    NgxWebstorageModule.forRoot({prefix: 'okkorder', separator: '-'}),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },
    {
      provide: MatDialogRef,
      useValue: {}
    },
    {
      provide: MAT_DIALOG_DATA,
      useValue: {}
    },
    FooditemAddonComponent,
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '74119056411-0glqp1kgtaja6pcpkh26kv28g1eefd1l.apps.googleusercontent.com'
            ),
          },
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider('773430536692184'),
          }
        ],
      } as SocialAuthServiceConfig,
    }
  ],
  entryComponents: [FooditemAddonComponent, OpeningHoursComponent, DeliveryHoursComponent, PaymentVerifyComponent, LanguageErrorComponent, PatchAddressConfirmDialogComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
