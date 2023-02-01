import { Component, OnInit } from "@angular/core";
import { AuthService } from "src/app/shared/services/auth.service";
import { Router, ActivatedRoute } from "@angular/router";
import { RequestUtilService } from "src/app/shared/services/request-util.service";

@Component({
   selector: "app-activate-account-pending",
   templateUrl: "./activate-account-pending.component.html",
   styleUrls: ["./activate-account-pending.component.scss"],
})
export class ActivateAccountPendingComponent implements OnInit {
   statusTitle = "ACTIVATE_EMAIL_TITLE_PENDING";
   statusDesc = "ACTIVATE_EMAIL_DESC_PENDING";

   constructor() {}

   ngOnInit(): void {}
}
