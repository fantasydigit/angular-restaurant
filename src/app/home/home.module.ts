import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { HomeRoutingModule } from './home-routing.module';

// Widgest Components
import { SliderComponent } from './widgets/slider/slider.component';
import { BlogComponent } from './widgets/blog/blog.component';
import { LogoComponent } from './widgets/logo/logo.component';
import { InstagramComponent } from './widgets/instagram/instagram.component';
import { ServicesComponent } from './widgets/services/services.component';
import { CollectionComponent } from './widgets/collection/collection.component';
import { CookieService } from 'ngx-cookie-service';

import { FooditemAddonComponent } from './create-order/fooditem-addon/fooditem-addon.component';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { OpeningHoursComponent } from './opening-hours/opening-hours.component';
import { DeliveryHoursComponent } from './delivery-hours/delivery-hours.component';
import { HomeComponent } from './home.component';
import { LanguageErrorComponent } from './language-error/language-error.component';
// import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';

//Servies

@NgModule({
  declarations: [
    HomeComponent,
    
    // Widgest Components
    SliderComponent,
    BlogComponent,
    LogoComponent,
    InstagramComponent,
    ServicesComponent,
    CollectionComponent,
    FooditemAddonComponent,
    OpeningHoursComponent,
    DeliveryHoursComponent,
    LanguageErrorComponent,
  ],
  providers: [
    CookieService,
    FooditemAddonComponent,
    {
      provide: MatDialogRef, 
      useValue: {}
    },
    {
      provide: MAT_DIALOG_DATA, 
      useValue: {}
    },
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule,
    MatDialogModule,

    // ScrollToModule.forRoot()
  ],
  entryComponents: [FooditemAddonComponent]
})
export class HomeModule { }
