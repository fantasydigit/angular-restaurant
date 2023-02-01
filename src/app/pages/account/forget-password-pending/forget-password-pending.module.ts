import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SharedModule } from "src/app/shared/shared.module";
import { ForgetPasswordPendingComponent } from './forget-password-pending.component';

@NgModule({
   declarations: [ForgetPasswordPendingComponent],
   imports: [CommonModule, SharedModule],
})
export class ForgetPasswordPendingModule {}
