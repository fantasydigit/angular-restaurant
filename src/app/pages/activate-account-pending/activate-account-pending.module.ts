import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ActivateAccountPendingComponent } from "./activate-account-pending.component";

@NgModule({
  declarations: [ActivateAccountPendingComponent],
  imports: [
    CommonModule,
    SharedModule
  ]
})
export class ActivateAccountPendingModule { }
