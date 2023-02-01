import { Component, OnInit } from "@angular/core";

@Component({
   selector: "app-forget-password-pending",
   templateUrl: "./forget-password-pending.component.html",
   styleUrls: ["./forget-password-pending.component.scss"],
})
export class ForgetPasswordPendingComponent implements OnInit {
   statusTitle = "FORGOT_PW_TITLE_PENDING";
   statusDesc = "FORGOT_PW_DESCR_PENDING";

   constructor() {}

   ngOnInit(): void {}
}
