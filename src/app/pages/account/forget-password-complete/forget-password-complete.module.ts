import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SharedModule } from "src/app/shared/shared.module";
import { ForgetPasswordCompleteComponent } from './forget-password-complete.component';

@NgModule({
   declarations: [ForgetPasswordCompleteComponent],
   imports: [CommonModule, SharedModule],
})
export class ForgetPasswordCompleteModule {}
