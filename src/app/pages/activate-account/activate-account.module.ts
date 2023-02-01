import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivateAccountComponent } from './activate-account.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [ActivateAccountComponent],
  imports: [
    CommonModule,
    SharedModule
  ]
})
export class ActivateAccountModule { }
