import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AuthService } from "src/app/shared/services/auth.service";
import { RequestUtilService } from "src/app/shared/services/request-util.service";
import { Router, NavigationEnd } from '@angular/router';

@Component({
   selector: "app-forget-password",
   templateUrl: "./forget-password.component.html",
   styleUrls: ["./forget-password.component.scss"],
})
export class ForgetPasswordComponent implements OnInit {
   form: FormGroup;
   url;
   
   constructor(
      private formBuilder: FormBuilder,
      private _auth: AuthService,
      private _router: Router,
      private _reqUtil: RequestUtilService,
      private router: Router
   ) {
      this.buildForm();
      this.router.events.subscribe((event) => {
         if (event instanceof NavigationEnd) {
           this.url = event.url;
         }
   });
   }

   ngOnInit() {}

   buildForm() {
      this.form = this.formBuilder.group({
         email: ["", [Validators.required, Validators.email]],
      });
   }

   isError(controlKey: string, code: string, isGroup: boolean) {
      let form = this.form;
      let control = form.get(controlKey);
      if (isGroup) {
         if (control.touched && form.hasError(code)) {
            return true;
         }
      } else {
         if (control.touched && control.hasError(code)) {
            return true;
         }
      }
      return false;
   }

   submit() {
      this.form.markAllAsTouched();
      if (this.form.valid) {
         this.performSubmit();
      }
   }

   performSubmit() {
      this._auth
         .resetPassword(this.form.value.email)
         .subscribe(
            (res) => {
               this._router.navigate(["pages", "forget-password-pending"]);
            },
            (err) => {
               this._reqUtil.reqError(err);
            }
         )
         .add(() => {
            this._reqUtil.reqComplete();
         });
   }
}
