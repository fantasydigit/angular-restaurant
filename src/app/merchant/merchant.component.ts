import { OnDestroy } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { CreateOrderService } from '../home/create-order/create-order.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RequestUtilService } from '../shared/services/request-util.service';
import { CheckoutService } from '../pages/account/checkout/checkout.service';
import { ShopCartService } from '../shared/shop-cart/shop-cart.service';
import { MatStepper } from '@angular/material/stepper';
import { MerchantService } from './merchant.service';
import { SessionStorageService } from 'ngx-webstorage';

@Component({
  selector: 'app-merchant',
  templateUrl: './merchant.component.html',
  styleUrls: ['./merchant.component.scss']
})
export class MerchantComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') private myStepper: MatStepper;
  shopName: String;
  logo: String;
  background: String;
  cookieValue: string;
  cartCookieKey: string; 
  styles;

  merchantCode;
  merchant;
  merchantAddress;
  merchantAddressString = "";
  tags = "";
  constructor(private cookieService: CookieService,
              private service: CreateOrderService,
              private route: ActivatedRoute,
              private merchantService: MerchantService,
              private reqUtil: RequestUtilService,
              private createOrderService: CreateOrderService,
              private checkoutService: CheckoutService,
              private shopCartService: ShopCartService,
              private sessionStorageService: SessionStorageService,
              private _router: Router
    ) {
      this.merchantService.listen().subscribe((res)=>{
        this.goForward();
      });
     }

  ngOnInit(): void {
    this.merchantCode = this.route.snapshot.paramMap.get('merchantCode');
    this.validateAndCheckCookieShopname();      
  }

  ngOnDestroy(): void {

  }

  goBack(){
    this.myStepper.previous();
  }

  goForward(){
      this.myStepper.next();
  }

  getMerchant() {
    this.service.readMerchant(this.merchantCode)
    .subscribe((res)=> {
      this.merchant = res;
      if(this.merchant.deleted) {
        this._router.navigateByUrl('pages/deleted');
      } 
        this.shopName = this.merchant.shopName;

        this.tags = this.merchant.tags;

        this.sessionStorageService.store('merchant', this.merchant);
        if(this.merchant.merchantAddress) {
          this.merchantAddress = this.merchant.merchantAddress;
          this.constructAddress();
        }
  
        this.logo = this.merchant.merchantLogo;
        this.background = this.merchant.merchantBackground;
        if (this.background == null) {
          this.background = 'assets/images/bg.jpg';
        } 
      
    },(err)=> {
      this.reqUtil.reqError(err);
      this._router.navigateByUrl('pages/404');
    }).add(()=> {
      this.createOrderService.filter();
      //this.checkoutService.filter();
    });
  }

  constructAddress() {
    if(this.merchantAddress.lineOne) {
      this.merchantAddressString += this.merchantAddress.lineOne;
    }

    if(this.merchantAddress.lineTwo) {
      if(this.merchantAddressString.length > 0) {
        this.merchantAddressString += ", ";
      }
      this.merchantAddressString += this.merchantAddress.lineTwo;
    }

    if(this.merchantAddress.postCode) {
      if(this.merchantAddressString.length > 0) {
        this.merchantAddressString += ", ";
      }

      this.merchantAddressString += this.merchantAddress.postcode;

      if(this.merchantAddress.city) {
        this.merchantAddressString += " " + this.merchantAddress.postcode;
      }

    } 
    if(this.merchantAddress.state) {
      if(this.merchantAddressString.length > 0) {
        this.merchantAddressString += ", ";
      }
      this.merchantAddressString += this.merchantAddress.state;
    }

    this.merchantAddressString += " Malaysia.";

  }

  validateAndCheckCookieShopname() {
    if (this.sessionStorageService.retrieve("merchant")) {
      this.merchant = this.sessionStorageService.retrieve("merchant");
      if( this.merchant.domain === this.route.snapshot.paramMap.get('merchantCode')){
        this.merchantCode = this.merchant.domain;
        this.shopName = this.merchant.shopName;
        this.logo = this.merchant.merchantLogo;
        this.background = this.merchant.merchantBackground;
        this.tags = this.merchant.tags;
        if(this.merchant.merchantAddress) {
          this.merchantAddress = this.merchant.merchantAddress;
          this.constructAddress();
        }
        this.createOrderService.filter();
        //this.checkoutService.filter();
      }else {
        this.getMerchant();
        // this.createOrderService.filter();
      }
    } else {
      this.getMerchant();
      // this.createOrderService.filter();
    }
    
  }

  getUrl() {
    return "url('"+this.background+"')";
  }

  
}
