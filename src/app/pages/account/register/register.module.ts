import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { GalleryModule } from "@ks89/angular-modal-gallery";
import { SharedModule } from "src/app/shared/shared.module";
import { RegisterComponent } from "./register.component";

@NgModule({
    declarations: [RegisterComponent],
    imports: [CommonModule, SharedModule, GalleryModule.forRoot()],
})
export class RegisterModule {}
