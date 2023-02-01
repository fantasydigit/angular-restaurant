import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MerchantComponent } from './merchant/merchant.component';
import { PaymentVerifyComponent } from './pages/account/checkout/payment-verify/payment-verify.component';
import { SuccessComponent } from './pages/account/checkout/success/success.component';
import { PagesComponent } from "./pages/pages.component";
import { SearchComponent } from './search/search.component';

const routes: Routes = [
    {
        path: "",
        loadChildren: () =>
            import("./home/home.module").then((m) => m.HomeModule)
    },
    {
        path: "shop/:merchantCode",
        component: MerchantComponent,
    },
    {
        path: "pages",
        component: PagesComponent,
        loadChildren: () =>
            import("./pages/pages.module").then((m) => m.PagesModule),
    },
    {
        path: "payment-verify/:orderNumber",
        component: PaymentVerifyComponent
    },
    {
        path: "success/:orderNumber",
        component: SuccessComponent
    },
    {
        path: "**", // Navigate to Home Page if not found any page
        redirectTo: "",
    },

];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            initialNavigation: "enabled",
            useHash: false,
            anchorScrolling: "enabled",
            scrollPositionRestoration: "enabled",
        }),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule { }
