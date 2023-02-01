import { Component, OnInit } from "@angular/core";
import { AuthService } from "src/app/shared/services/auth.service";
import { Router, ActivatedRoute } from "@angular/router";
import { RequestUtilService } from "src/app/shared/services/request-util.service";

@Component({
   selector: "app-activate-account",
   templateUrl: "./activate-account.component.html",
   styleUrls: ["./activate-account.component.scss"],
})
export class ActivateAccountComponent implements OnInit {
   reqDone;
   code;
   statusTitle = "ACTIVATE_EMAIL_TITLE_LOADING";
   statusDesc = "ACTIVATE_EMAIL_DESC_LOADING";

   constructor(
      private _auth: AuthService,
      private _activatedRoute: ActivatedRoute,
      private _reqUtil: RequestUtilService
   ) {
      this.setCode();
   }

   setCode() {
      this._activatedRoute.paramMap.subscribe((map) => {
         this.code = map.get("code");
      });
   }

   ngOnInit(): void {
      this.activate();
   }

   activate() {
      this._auth
         .finishActivateAccount(this.code)
         .subscribe(
            (res) => {
               this.statusTitle = "ACTIVATE_EMAIL_TITLE_SUCCESS";
               this.statusDesc = "ACTIVATE_EMAIL_DESC_SUCCESS";
            },
            (err) => {
               this.statusTitle = "ACTIVATE_EMAIL_TITLE_FAILED";
               this.statusDesc = "ACTIVATE_EMAIL_DESC_FAILED";
            }
         )
         .add(() => {
            this._reqUtil.reqComplete();
            this.reqDone = true;
         });
   }
}
