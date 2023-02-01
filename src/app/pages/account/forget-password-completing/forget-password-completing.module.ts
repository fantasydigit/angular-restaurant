import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "src/app/shared/shared.module";
import { ForgetPasswordCompletingComponent } from "./forget-password-completing.component";

@NgModule({
   declarations: [ForgetPasswordCompletingComponent],
   imports: [CommonModule, SharedModule],
})
export class ForgetPasswordCompletingModule {}
