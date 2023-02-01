import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "src/app/shared/services/auth.service";
import { PasswordMatchValidator } from "src/app/shared/validators/password-match.validator";
import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
import { RequestUtilService } from "src/app/shared/services/request-util.service";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { TranslateService } from "@ngx-translate/core";
import { ShopCartService } from 'src/app/shared/shop-cart/shop-cart.service';
import { SessionStorageService } from 'ngx-webstorage';
@Component({
   selector: "app-register",
   templateUrl: "./register.component.html",
   styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit {
   form: FormGroup;
   errorMsg: string;
   mobileNumbers = [];
   url;
   fromOrder;
   constructor(
      private formBuilder: FormBuilder,
      private _auth: AuthService,
      private _router: Router,
      private _reqUtil: RequestUtilService,
      private _httpClient: HttpClient,
      private shopCart: ShopCartService,
      private activatedRoute: ActivatedRoute,
      private sessionStorage: SessionStorageService
   ) {
      this.fromOrder = this.activatedRoute.snapshot.queryParamMap.get("fromOrder");
      this.buildForm();
      this._router.events.subscribe((event) => {
         if (event instanceof NavigationEnd) {
           this.url = event.url;
         }
   });
   }

   buildForm() {
      let prefix ="+60";
      let phone = "";
      let email ="";
      let firstname ="";
      let guestinfo = this.sessionStorage.retrieve("guestinfo")
      if(guestinfo ){
         if(guestinfo.receiverPhone){
            prefix = this.sessionStorage.retrieve("guestinfo").receiverPhone.substring(0,3)
            phone = this.sessionStorage.retrieve("guestinfo").receiverPhone.substring(3)
         }
         if(guestinfo.receiverEmail){
            email = guestinfo.receiverEmail
         }
         if(guestinfo.firstname){
            firstname = guestinfo.firstname
         }
      }
      
      this.form = this.formBuilder.group(
         {
            firstName: [firstname, [Validators.required, Validators.pattern("^[a-zA-Z ]*$")]],
            lastName: ["", [Validators.required, Validators.pattern("^[a-zA-Z ]*$")]],
            email: [email, [Validators.required, Validators.email]],
            phonePrefix: [prefix, [Validators.required]],
            phoneNumber: [phone, [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(8)]],
            password: ["", [Validators.required, Validators.minLength(8)]],
            confirmPassword: ["", [Validators.required, Validators.minLength(8)]],
         },
         { validators: [PasswordMatchValidator] }
      );
   }

   ngOnInit(): void {
      this.setMobileNumbers();
   }

   setMobileNumbers() {
      this._httpClient
         .get("assets/data/phone-prefix.json")
         .pipe(map((data) => data))
         .subscribe((next: any) => {
            for (const item of next) {
               this.mobileNumbers.push.apply(this.mobileNumbers, item.items);
            }
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

   isErrors(controlKeys: Array<string>, code: string, isGroup: boolean): boolean {
      let form = this.form;
      let returnValue = false;
      for (const controlKey of controlKeys) {
         let control = form.get(controlKey);
         if (isGroup) {
            if (control.touched && form.hasError(code)) {
               returnValue = true;
            }
         } else {
            if (control.touched && control.hasError(code)) {
               returnValue = true;
            }
         }
      }
      console.groupEnd();
      return returnValue;
   }

   submit() {
      this.form.markAllAsTouched();
      this.errorMsg = null;
      if (this.form.valid) {
         this.performSubmit();
      }
   }

   performSubmit() {
      this._auth
         .register(this.getBodyParameters())
         .subscribe(
            (res) => {
               this._router.navigate(["/pages/activate-account-pending"]);
            },
            (err) => {
               this._reqUtil.reqError(err);
               this.errorMsg = "Wrong email or password";
            }
         )
         .add(() => {
            this._reqUtil.reqComplete();
         });
   }

   getBodyParameters() {
      let guestinfo = this.sessionStorage.retrieve("guestinfo");
      let values = this.form.value;
      values["mobile"] = values.phonePrefix + values.phoneNumber;
      values['carts'] = this.getCarts()
      if(guestinfo){
         if(guestinfo.address != null){
            let address = this.sessionStorage.retrieve("guestinfo").address;
            values.city = address.city;
            values.house = address.house;
            values.street = address.street;
            values.state = address.state;
            values.longitude = address.longitude;
            values.latitude = address.latitude;
            values.postcode = address.postcode;
         }
         if(guestinfo.orderId){
            values.orderId = guestinfo.orderId
         }
      }

      return values;
   }

   getCarts() {
      let carts = []
      for (const merchant in this.shopCart.carts) {
         const cart = this.shopCart.carts[merchant]
         carts.push(cart)
      }
      return carts
   }
}
