import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Order } from 'src/app/shared/classes/order';
import { ProductService } from 'src/app/shared/services/product.service';
import { OrderService } from 'src/app/shared/services/order.service';
import { SuccessService } from './success.service';
import { CookieService } from 'ngx-cookie-service';
import { CheckoutService } from '../checkout.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ShopCartService } from '../../../../shared/shop-cart/shop-cart.service';
import { AuthService } from "../../../../shared/services/auth.service";
import { SessionStorageService } from 'ngx-webstorage';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})
export class SuccessComponent implements OnInit, AfterViewInit, OnDestroy{

  //public orderDetails : Order = {};

  orderId;
  merchantId;
  paymentStatus: string;
  orderRef;
  deliveryCharge;
  kipleMerchantRef;
  orderDetails = [];
  address = [{
    "id":"",
    "merhantId":"",
    "orderId":"",
    "city":"",
    "house":"",
    "postcode":"",
    "state":"",
    "street":"",
    "latitude":"",
    "longitude":"",
  }]
  showRegister;
  currentLanguage = "en";
  
  subTranslate: Subscription;

  constructor(public productService: ProductService,
    private orderService: OrderService,
    private service: SuccessService,
    private cookieService: CookieService,
    private checkoutService: CheckoutService,
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router,
    private sessionStorageService: SessionStorageService,
    private translateService: TranslateService) {
      this.orderRef = this.route.snapshot.paramMap.get('orderNumber');
      this.checkoutService.getKiplepayMercRef().subscribe(res =>{
        this.kipleMerchantRef = res;
      })
      if(!this.auth.authenticated){
        this.showRegister = true;
        
      }
      else{
        this.showRegister = false;
      }
      this.getPaymentDetail()
      this.service.listen().subscribe((res)=>{
      });
    }

  ngOnInit(): void {	
    console.log("UPDATED");
    this.subTranslate = this.translateService.onLangChange.subscribe(
      (event: LangChangeEvent) => {
        this.currentLanguage = this.translateService.currentLang;
      }
    );

    //this.retrieveOrderDetail();
  }

  ngOnDestroy(): void {
    this.subTranslate.unsubscribe();
  }

  getPaymentDetail(){
    this.checkoutService.getPaymentDetails(this.orderRef).subscribe(res => {
      this.paymentStatus = res.returncode;
      this.checkoutService.getMerchantIdByOrderRef(this.orderRef).subscribe(res => {
        this.merchantId = res;
        this.restartPage();
      })
      
    })
  }

  restartPage() {

    // this.orderService.checkoutItems.subscribe(response => {
    //   this.orderDetails = response
    // });
    // if (this.service.orderId) this.orderId = this.service.orderId;

    this.orderId = this.orderRef.replace(this.kipleMerchantRef, '');
    this.checkoutService.getMerchantIdByOrderRef(this.orderRef).subscribe(res =>{
      this.merchantId = res;
      this.retrieveOrderDetail();
    })
    // if (this.cookieService.check('merchant_id')) this.merchantId = this.cookieService.get('merchant_id');
    // this.retrieveOrderDetail();
  }

  ngAfterViewInit() {
    
  }

  retrieveOrderDetail() {
    let merchantId = this.merchantId;
    let orderId = this.orderId;
    let firstname = "anonymous"
    if(!this.auth.authenticated){
      let guestinfo = this.sessionStorageService.retrieve("guestinfo")
      guestinfo.orderId = parseFloat(orderId);
      this.sessionStorageService.store("guestinfo", guestinfo)
      firstname = guestinfo.firstname;

    }
    

      this.service.getOrderDetails(merchantId, orderId, firstname)
      .subscribe((res)=>{
        this.orderDetails = res;
        console.log(this.orderDetails);

        if(!this.orderDetails['pickUp']){
          this.checkoutService.getPaymentDetails(this.kipleMerchantRef+this.orderId).subscribe(res => {
            this.deliveryCharge = res.ord_delcharges;
          });
        }
        if (this.orderDetails['orderDeliveryAddress']) this.address = this.orderDetails['orderDeliveryAddress'];
      },(err)=>{
      }).add(()=>{
  
      })
   
  }

  printComponent(cmpName) {
    let printContents = document.getElementById(cmpName).innerHTML;
    let originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;

    window.print();

    document.body.innerHTML = originalContents;
  }

  goToRegister(){
    this.router.navigate(["/pages/register"], {queryParams: {fromOrder: true}})
  }

}
