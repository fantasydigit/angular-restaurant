import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
import { AuthService } from "src/app/shared/services/auth.service";
import { RequestUtilService } from "src/app/shared/services/request-util.service";
import { NavService } from 'src/app/shared/services/nav.service';
import { CreateOrderService } from 'src/app/home/create-order/create-order.service';
import { FacebookLoginProvider, GoogleLoginProvider, SocialAuthService, SocialUser } from 'angularx-social-login';
import { SessionStorageService } from 'ngx-webstorage';
import { Subscription } from "rxjs";
@Component({
   selector: "app-login",
   templateUrl: "./login.component.html",
   styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit, OnDestroy {
   form: FormGroup;
   errorMsg: string;
   fromShop;
   //Social
   user: SocialUser;
   loggedIn: boolean;

   subscription: Subscription;

   url;

   constructor(
      private formBuilder: FormBuilder,
      private _auth: AuthService,
      private _router: Router,
      private _reqUtil: RequestUtilService,
      private navService: NavService,
      private createOrderService: CreateOrderService,
      private activatedRoute: ActivatedRoute,
      private router: Router,
      private authService: SocialAuthService,
      private sessionStorage: SessionStorageService
   ) {
      this.fromShop = this.activatedRoute.snapshot.queryParamMap.get("fromShop");
      this.buildForm();
      this.router.events.subscribe((event) => {
         if (event instanceof NavigationEnd) {
           this.url = event.url;
         }
   });
   }

   ngOnInit() {
      this.subscription = this.authService.authState.subscribe((user) => {
         this.user = user;
         console.log("asd")
         console.log(user);
         this.loggedIn = (user != null);
         if (user != null) {
            this.authenticateSocial(user);
         } else {
            this.errorMsg = "LOGIN_ERROR";
         }
      },(err) => {
         this.errorMsg = "LOGIN_ERROR";
      });
   }

   ngOnDestroy() {
      // this.subscription.unsubscribe();
   }

   buildForm() {
      this.form = this.formBuilder.group({
         email: ["", [Validators.required, Validators.email]],
         password: ["", [Validators.required, Validators.minLength(8)]],
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
      this.errorMsg = null;
      if (this.form.valid) {
         this.performSubmit();
      }
   }

   performSubmit() {
      this._auth
         .auth(this.form.value.email, this.form.value.password)
         .subscribe(
            (res) => {
               this.sessionStorage.clear("guestinfo");
               if(this.fromShop){

                  this._router.navigate(["/shop", this.fromShop]);
               }
               else{
                  this._router.navigate(["pages/checkout"]);
               }
               // let fromCreateOrder = this.createOrderService.checkLoginFromCreateOrder;
               // if (fromCreateOrder == true) {
                  //TODP: To Payment method
                  
               // } else {
               //    this._router.navigate([""]);
               // }            
            },
            (err) => {
               this.errorMsg = "LOGIN_ERROR";
            }
         )
         .add(() => {
            this._reqUtil.reqComplete();
            console.log("ASD");
            this.updateHeader();
         });
   }

   updateHeader() {
      this.navService.filter();
      // this.navService.MENUITEMS = [{
		// 	path: '/home/search', title: 'home', type: 'link', active: false
		// },
		// {
		// 	path: '/pages/login', title: 'Logout', type: 'link', active: false 
      // }]
   }

   loginWithSocial(provider) {
      if (provider === "facebook") {
         this.authService.signIn(FacebookLoginProvider.PROVIDER_ID)
         
      } else if (provider == "google") {
         this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
         
      } else {
         this.errorMsg = "Invalid Social";
      }
      
   }

   authenticateSocial(user) {
      this._auth.loginFromSocial(user).subscribe((res) => {
         if(this.fromShop){
            this._router.navigate(["/shop", this.fromShop]);
         }
         else{
            this._router.navigate([""]);
         }
      },(err) => {
         this.errorMsg = "LOGIN_ERROR";
      })
      .add(() => {
         this._reqUtil.reqComplete();
         this.updateHeader();
      });
   }

   // loginWithGoogle() {
   //    console.log("LOGING IN WITH GOOGLE");
   //    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
   //    this.authService.authState.subscribe((user) => {
   //       this.user = user;
   //       console.log(user);
   //       this.loggedIn = (user != null);
   //     });
   // }

   signOutFromSocialAccount(): void {
      this.authService.signOut();
    }
}
