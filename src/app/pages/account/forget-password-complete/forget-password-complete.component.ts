import { Component, OnInit } from "@angular/core";

@Component({
   selector: "app-forget-password-complete",
   templateUrl: "./forget-password-complete.component.html",
   styleUrls: ["./forget-password-complete.component.scss"],
})
export class ForgetPasswordCompleteComponent implements OnInit {
   statusTitle = "FORGOT_PW_TITLE_COMPLETE";
   statusDesc = "FORGOT_PW_DESCR_COMPLETE";

   constructor() {}

   ngOnInit(): void {}
}
