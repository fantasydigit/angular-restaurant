import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "src/app/shared/shared.module";
import { ForgetPasswordComponent } from "./forget-password.component";

@NgModule({
   declarations: [ForgetPasswordComponent],
   imports: [CommonModule, SharedModule],
})
export class ForgetPasswordModule {}
