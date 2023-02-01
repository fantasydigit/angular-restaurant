import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AuthService } from "src/app/shared/services/auth.service";
import { RequestUtilService } from "src/app/shared/services/request-util.service";
import { Router, ActivatedRoute } from "@angular/router";
import { PasswordMatchValidator } from "src/app/shared/validators/password-match.validator";

@Component({
   selector: "app-forget-password-completing",
   templateUrl: "./forget-password-completing.component.html",
   styleUrls: ["./forget-password-completing.component.scss"],
})
export class ForgetPasswordCompletingComponent implements OnInit {
   form: FormGroup;
   code: string;

   constructor(
      private formBuilder: FormBuilder,
      private _auth: AuthService,
      private _router: Router,
      private _reqUtil: RequestUtilService,
      private _activatedRoute: ActivatedRoute
   ) {
      this.setCode();
      this.buildForm();
   }

   setCode() {
      this._activatedRoute.paramMap.subscribe((map) => {
         this.code = map.get("code");
      });
   }

   ngOnInit() {}

   buildForm() {
      this.form = this.formBuilder.group(
         {
            password: ["", [Validators.required, Validators.minLength(8)]],
            confirmPassword: ["", [Validators.required, Validators.minLength(8)]],
         },
         { PasswordMatchValidator }
      );
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
         .finishResetPassword(this.code, this.form.value.password)
         .subscribe(
            (res) => {
               this._router.navigate(["pages", "forget-password-complete"]);
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
