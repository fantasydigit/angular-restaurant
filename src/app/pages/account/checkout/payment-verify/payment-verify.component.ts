import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA} from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { MerchantService } from 'src/app/merchant/merchant.service';
import { CheckoutService } from '../checkout.service';
import { AuthService } from "../../../../shared/services/auth.service";
import { ShopCartService } from 'src/app/shared/shop-cart/shop-cart.service';
import { SessionStorageService } from 'ngx-webstorage';

@Component({
  selector: 'app-payment-verify',
  templateUrl: './payment-verify.component.html',
  styleUrls: ['./payment-verify.component.scss']
})
export class PaymentVerifyComponent implements OnInit {
  //@Inject(MAT_DIALOG_DATA) private _data: any,
  orderId;
  paymentStatus;
  orderStatus= ""; // for checking delivery status
  merchantId;
  showRegister;

  merchantCode;

  constructor(private route: ActivatedRoute,
    private checkoutService: CheckoutService,
    private router: Router,
    private merchantService: MerchantService,
    private shopCartService: ShopCartService,
    private authService: AuthService,
    private sessionStorageService: SessionStorageService) {

   }
  
  ngOnInit(): void {
    this.merchantCode = this.sessionStorageService.retrieve("merchant").domain;
    this.shopCartService.clearCartItem(this.sessionStorageService.retrieve("carts")[this.merchantCode]).subscribe();

    
    this.orderId = this.route.snapshot.paramMap.get('orderNumber');
    this.checkoutService.getPaymentDetails(this.orderId).subscribe(res => {
      this.paymentStatus = res.returncode;
      this.orderStatus = res.orderStatus;
      if(this.paymentStatus == "100" && !this.authService.authenticated) this.showRegister = true;
      else this.showRegister = false;
      this.checkoutService.getMerchantIdByOrderRef(this.orderId).subscribe(res => {
        this.merchantId = res;
      })
    })
  }

  goBackOrder(){
    this.router.navigate(['/shop',this.merchantCode])
  }

  showReceipt(){
    this.router.navigate(['/success',this.orderId])
  }

  goToRegister(){
    this.router.navigate(["/pages/register"], {queryParams: {fromOrder: true}})
  }

}
