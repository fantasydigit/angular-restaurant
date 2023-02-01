import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  Output,
  ChangeDetectorRef,
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import { CreateOrderService } from "./create-order.service";
import { FooditemAddonComponent } from "./fooditem-addon/fooditem-addon.component";
import { MatDialog } from "@angular/material/dialog";
import { RequestUtilService } from "src/app/shared/services/request-util.service";
import { Timestamp } from "rxjs/internal/operators/timestamp";
import { AuthService } from "src/app/shared/services/auth.service";
import { Router, ActivatedRoute } from "@angular/router";
import { CheckoutService } from "src/app/pages/account/checkout/checkout.service";
import { OpeningHoursComponent } from "../opening-hours/opening-hours.component";
import { DeliveryHoursComponent } from "../delivery-hours/delivery-hours.component";
import { LanguageErrorComponent } from "../language-error/language-error.component";
import { ShopCartService } from "src/app/shared/shop-cart/shop-cart.service";
import * as moment from "moment";
import { first, take } from "rxjs/operators";
import { MerchantService } from "src/app/merchant/merchant.service";
// import { ScrollToService, ScrollToConfigOptions } from '@nicky-lenaers/ngx-scroll-to';
import { SessionStorageService } from "ngx-webstorage";

import { TranslateService, LangChangeEvent } from "@ngx-translate/core";
import { Subscription } from "rxjs";

interface itemInterface {
  itemId: number;
  quantity: number;
  totalPrice: number;
  addon: [];
}

@Component({
  selector: "app-create-order",
  templateUrl: "./create-order.component.html",
  styleUrls: ["./create-order.component.scss"],
})
export class CreateOrderComponent implements OnInit, OnDestroy {
  isLinear = false;
  invalidTimeOrDate = false;
  preparationEstimate;
  reachTime;
  preorder = false;
  disabledCheckout = true;
  filterbyCategory = ["apple", "orange"];

  merchant;

  settingDelivery;
  freeDeliveryCost = 0;
  onDemandDelivery = false;
  onDemandPickup = false;
  languangeFlag = true;
  currentLanguage = "en";
  merchantAvailability;
  canOrder = false;
  minDelivery = 0;
  maxDelivery = 0;
  minPickup = 0;
  maxPickup = 0;
  subTotal = 0;
  minItemDelivery = 0;
  minPriceCarDelivery = 0;

  selectedDeliveryOption = '';

  checkOutDisabledReason = "";
  totalCartItems = 0;

  subTranslate: Subscription;
  subListen: Subscription;
  subSettingDelivery: Subscription;
  subFetchFood: Subscription;
  subShopCart: Subscription[] = [];
  subFetchCart: Subscription[] = [];
  subFetchSetting: Subscription;
  subCheckMerchant: Subscription;
  subFetchStoreOpen: Subscription;
  subReadMenu: Subscription;
  subReadCategory: Subscription;
  subReadSettingOpenClose: Subscription;
  subGetCart: Subscription;
  subFetchCartCheckSub: Subscription[] = [];
  subShopCartCheckSub: Subscription[] = [];
  subCheckTotal: Subscription[] = [];
  dayFilter;
  preOrderOnly = false;

  constructor(
    private service: CreateOrderService,
    private addonComponent: FooditemAddonComponent,
    public dialog: MatDialog,
    private reqUtil: RequestUtilService,
    private auth: AuthService,
    private router: Router,
    private checkoutService: CheckoutService,
    private _reqUtil: RequestUtilService,
    private shopCartService: ShopCartService,
    private merchantService: MerchantService,
    private route: ActivatedRoute,
    private _cdr: ChangeDetectorRef,
    private _auth: AuthService,
    private sessionStorageService: SessionStorageService,
    private translateService: TranslateService
  ) {
    this.subListen = this.service
      .listen()
      .subscribe((res) => {
        //Initiate page
        this.merchant = this.sessionStorageService.retrieve("merchant");
        console.log(this.translateService.currentLang);
        if(this.merchant && !this.merchant.deleted){
          this.merchantId = this.merchant.domain;
          this.shopName = this.merchant.shopName;
          this.logo = this.merchant.merchantLogo;
          this.background = this.merchant.merchantBackground;
          this.fetchCategory();
          this.fetchFoodItem();
          this.fetchStoreOpenHour();
          this.fetchSettingOpenClose();
          this.fetchItemFromCart();
          this.fetchSettingDelivery();
          this.readSettingGeneral();
          this.checkSupportLangauge();
          this.checkMerchantAvailability();
          this.checkSubTotal();
          this.notifyChangeMerchant();
        }
      });
      
  }

  notifyChangeMerchant() {
    this.merchantService.setMessage();
  }

  ngAfterViewChecked() {
    this._cdr.detectChanges();
  }

  categories = [];
  categoryFilterLang = [];

  pickup = false;
  date = new Date();
  time: string;

  cartItems = [];

  //Parallex Content
  shopName: String;
  logo: String;
  background: String;

  //Food Item Listing
  menus = [];
  foodItem = [];
  nonDuplicateId = [];
  subtotal: number;
  grandTotal;
  settingStoreOpenHours: any;

  //packaging charge
  packagingCharge: number;
  packageChargeCost: number;
  packagingIncremental: boolean;

  ngOnInit(): void {

    if(this.translateService.currentLang) {
      this.currentLanguage = this.translateService.currentLang;
    }
    
      this.subTranslate = this.translateService.onLangChange.subscribe(
        (event: LangChangeEvent) => {
          this.languangeFlag = true;
          this.currentLanguage = this.translateService.currentLang;
          this.checkSupportLangauge();
          this.filterLang(this.categories);
        }
      );
  }

  ngOnDestroy(): void {
    this.subTranslate.unsubscribe();

    if(this.merchant && !this.merchant.deleted) {
      this.subListen.unsubscribe();
      this.subSettingDelivery.unsubscribe();
      if (this.subFetchFood) {
        this.subFetchFood.unsubscribe();
      }
  
      if (this._auth.authenticated) {
        for (let i = 0; i < this.subShopCart.length; i++) {
          this.subShopCart[i].unsubscribe();
        }
      } else {
        for (let i = 0; i < this.subFetchCart.length; i++) {
          this.subFetchCart[i].unsubscribe();
        }
      }
  
      this.subFetchSetting.unsubscribe();
      this.subCheckMerchant.unsubscribe();
      this.subFetchStoreOpen.unsubscribe();
      this.subReadMenu.unsubscribe();
      this.subReadSettingOpenClose.unsubscribe();
      this.subReadCategory.unsubscribe();
  
      for (let i = 0; i < this.subCheckTotal.length; i++) {
        this.subCheckTotal[i].unsubscribe();
      }
      if (this.subGetCart) {
        this.subGetCart.unsubscribe();
      }
    }
    
  }

  openOpeningHours() {
    this.dialog.open(OpeningHoursComponent, {
      width: "500px",
    });
  }

  openDeliveryHours() {
    this.dialog.open(DeliveryHoursComponent, {
      width: "500px",
    });
  }

  checkEmptyCart() {
    if (this.cartItems.length < 1) {
      return true;
    } else {
      return false;
    }
  }

  fetchFoodItemById(shopName) {
    this.subFetchFood = this.service
      .readFoodItemById(shopName, this.nonDuplicateId)
      .subscribe((res) => {
        this.cartItems = res;
      });
  }

  fetchItemFromCart() {
    if (this._auth.authenticated) {
      this.subShopCart.push(
        this.shopCartService.getCartItems(this.merchantId).subscribe((res) => {
          this.cartItems = res;
          this.shopCartService.setTotalCartItem(this.countQuantity());
          this.shopCartService.setTotalCartItemEmit("new");
        })
      );
    } else {
      this.subFetchCart.push(
        this.service
          .fetchCartItemsByCartId(
            this.shopCartService.carts[this.merchantId],
            this.merchantId
          )
          .subscribe((res) => {
            this.cartItems = res;
            this.shopCartService.setTotalCartItem(this.countQuantity());
            this.shopCartService.setTotalCartItemEmit("new");
          })
      );
    }
  }

  fetchSettingDelivery() {
    this.subSettingDelivery = this.service
      .fetchSettingDelivery(this.merchant.domain)
      .subscribe((res) => {
        this.settingDelivery = res;
        this.freeDeliveryCost = this.settingDelivery.freeDeliveryCost;
        this.minDelivery = this.settingDelivery.minDelivery;
        this.maxDelivery = this.settingDelivery.maxDelivery;
        this.minPickup = this.settingDelivery.minPickup;
        this.maxPickup = this.settingDelivery.maxPickup;
        this.minItemDelivery = this.settingDelivery.minItemDelivery;
        this.minPriceCarDelivery = this.settingDelivery.minPriceCarDelivery;
      });
  }

  checkSupportLangauge() {
    if (this.translateService.currentLang != "en" && this.languangeFlag) {
      if (this.translateService.currentLang === "ch") {
        if (this.merchant.chAvailable === false) {
          this.dialog.open(LanguageErrorComponent);
          this.currentLanguage = "en";
        }
      } else if (this.translateService.currentLang === "bm") {
        if (this.merchant.bmAvailable === false) {
          this.dialog.open(LanguageErrorComponent);
          this.currentLanguage = "en";
        }
      }
    }
    this.languangeFlag = false;
  }

  checkMerchantAvailability(clickCheckout?) {
    let option: String = "";
    let useCurrentTime: Boolean;
    if (this.pickup === true) {
      option = "Pickup";
      this.selectedDeliveryOption = "Pickup";
    } else if (this.pickup === false) {
      option = "delivery";
      this.selectedDeliveryOption = "delivery";
    }
    if (this.preorder === true) {
      useCurrentTime = false;

      if (this.time != null) {
        this.date.setHours(parseInt(this.time.substring(0, 2)));
        this.date.setMinutes(parseInt(this.time.substring(3, 5)));
      }
    } else if (this.preorder === false) {
      useCurrentTime = true;
    }
    let merchantAvailability = {
      option: option,
      useCurrentTime: useCurrentTime,
      selectedDate: this.date,
    };
    
    this.subCheckMerchant = this.service
      .checkMerchantAvailability(this.merchant.domain, merchantAvailability)
      .subscribe(
        (res) => {
          this.merchantAvailability = res;
          this.canOrder = res.canOrder;
          this.checkOutDisabledReason = res.reason;
          if (clickCheckout) {
            this.checkout();
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }

  readSettingGeneral() {
    this.subFetchSetting = this.service
      .fetchSettingDelivery(this.merchant.domain)
      .subscribe((res) => {
        let settingGeneral = res;
        this.onDemandDelivery = settingGeneral.onDemandDelivery;
        this.onDemandPickup = settingGeneral.onDemandPickup;
      });
  }

  countQuantity() {
    let quantity = 0;
    let arr = this.cartItems;
    arr.forEach((element) => {
      quantity = quantity + element.quantity;
    });
    return quantity;
  }

  fetchFoodItem() {
    this.subReadMenu = this.service
      .readMenu(this.merchant.domain)
      .subscribe((res) => {
        this.menus = res;
      });
  }

  fetchStoreOpenHour() {
    this.subFetchStoreOpen = this.service
      .readSettingStoreHour(this.merchant.domain)
      .subscribe((res) => {
        this.settingStoreOpenHours = res;
        this.filterOpenStoreHour();
      });
  }

  filterOpenStoreHour() {
    let dayArr = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    let excludeDay = [];
    if (this.pickup) {
      for (let day of dayArr) {
        if (!this.settingStoreOpenHours[day]) {
          excludeDay.push(dayArr.indexOf(day));
        }
      }
    } else {
      for (let day of dayArr) {
        if (!this.settingStoreOpenHours[day + "Del"]) {
          excludeDay.push(dayArr.indexOf(day));
        }
      }
    }

    this.dayFilter = (d: Date | null): boolean => {
      const day = (d || new Date()).getDay();
      return !excludeDay.includes(day);
    };
  }

  fetchCategory() {
    console.log("fetchCategory");
    this.subReadCategory = this.service
      .readCategory(this.merchant.domain)
      .subscribe((res) => {
        this.categories = res;
        this.filterLang(this.categories);
      });
  }

  filterLang(categories) {
    console.log(this.currentLanguage);
    this.categoryFilterLang = categories.filter(
      (x) => x.lang == this.currentLanguage
    );
    console.log(this.categoryFilterLang);
  }

  merchantId = this.route.snapshot.paramMap.get("merchantId");

  openAddons(menu) {
    //this.service.itemId = itemId;
    console.log(menu);
    this.service.foodSizeList = menu["foodSizeBodyDTOList"];

    this.service.foodItem = menu;
    // let exist = this.checkExistItemInCart(menu);
    // if (exist == false) {
    const dialogRef = this.dialog.open(FooditemAddonComponent,{
      width:"100%"
    }
      );
    dialogRef.afterClosed().subscribe((result) => {
      if (result === "close" || result == undefined) {
        this.service.foodItem = "";
      } else {
        result.id = this.shopCartService.carts[this.merchantId];
        this.service.foodItem = "";
        this.service.addToCart(this.merchantId, result).subscribe((res) => {
          let carts = this.shopCartService.carts;
          carts[this.merchantId] = res.id;
          console.log(carts);
          this.shopCartService.carts = carts;
          this.fetchItemFromCart();
          this.reqUtil.reqSuccess("Item Added To Cart");
        });
        // this.isValid();
        // this.checkValidTime();
      }
      this.checkSubTotal();
    });
    //}
  }

  checkSubTotal() {
    this.subCheckTotal.push(
      this.shopCartService.totalCartItemObservable.subscribe((res) => {
        this.totalCartItems = res;
        if (this._auth.authenticated) {
          this.subGetCart = this.shopCartService
            .getCart(this.merchantId)
            .subscribe((res) => {
              this.subTotal = res.subTotal;
            });
        } else {
          this.subGetCart = this.shopCartService
            .getCartForGuest(
              this.sessionStorageService.retrieve("carts")[this.merchantId],
              this.merchantId
            )
            .subscribe((res) => {
              this.subTotal = res.subTotal;
            });
        }
      })
    );
  }

  checkout() {
    if (!this.canOrder) {
      return this.reqUtil.reqError("Shop Closed", "Shop is Closed");
    }

    let foodItem = this.filterFoodItemBody();
    if (foodItem.length <= 0)
      return this.reqUtil.reqError(
        "EMPTY CART",
        "Please add something in the cart before proceed!"
      );

    if (this.pickup) {
      if (this.subTotal <= this.minPickup && this.minPickup != -1) {
        return this.reqUtil.reqError(
          "MIN PICKUP",
          "Your amount does not reach minimum pickup amount!"
        );
      } else if (this.subTotal >= this.maxPickup && this.maxPickup != -1) {
        return this.reqUtil.reqError(
          "MAX PICKUP",
          "Your amount has exceed maximum pickup amount!"
        );
      }
    } else if (!this.pickup) {
      if (this.subTotal <= this.minDelivery && this.minDelivery != -1) {
        return this.reqUtil.reqError(
          "MIN DELVERY",
          "Your amount does not reach minimum delivery amount!"
        );
      } else if (this.subTotal >= this.maxDelivery && this.maxDelivery != -1) {
        return this.reqUtil.reqError(
          "MAX DELIVERY",
          "Your amount has exceed maximum delivery amount!"
        );
      }
    }

    let body = {
      // "subtotal" : this.subtotal,
      // "grandTotal" : this.grandTotal,
      // "packagingCharge" : this.packageChargeCost,
      paymentType: null,
      pickUp: this.pickup,
      preOrder: this.preorder,
      selectedDate: this.date,
      selectedTime: this.time,
      deliveryCharge: 0,
      // "foodItem" : foodItem,
      receiverEmail: null,
      receiverPhone: null,
      deliveryAddressDTO: null,
      freeDeliveryCost: this.freeDeliveryCost,
      minItemDelivery: this.minItemDelivery,
      minPriceCarDelivery: this.minPriceCarDelivery
    };

    let loginStatus = this.auth.checkSession();
    // if (loginStatus == true) {
      console.log(body);
    this.sessionStorageService.store("checkoutPreference", body);
    this.updateCheckout();
    this.merchantService.forward();
    // } else {
    //     //TODO: Navigate to login
    //     this.service.checkLoginFromCreateOrder = true;
    //     this.sessionStorageService.store('checkoutPreference', body)

    //     this.updateCheckout();
    //     this.router.navigate(["/pages/login"], {queryParams: {fromShop: this.merchant.domain}});
    // }
  }

  filterFoodItemBody() {
    let cartItems = this.cartItems;
    let checkedList = [];
    let sizeIdList = [];
    let body = [];
    let bodyItem = {};
    for (let i = 0; i < cartItems.length; i++) {
      let cartItemLoop = cartItems[i];

      for (let x = 0; x < cartItemLoop["cartAddonDTO"].length; x++) {
        let addon = cartItemLoop["cartAddonDTO"][x];
        if (addon.checked == true) {
          let addonItem = {
            addonId: addon.id,
            quantity: addon.quantity,
            totalPrice: addon.totalPrice,
            addonName: addon.addonName,
          };
          checkedList.push(addonItem);
        }
      }

      bodyItem = {
        itemId: this.cartItems[i]["itemId"],
        itemName: this.cartItems[i]["itemName"],
        quantity: this.cartItems[i]["quantity"],
        totalPrice: this.cartItems[i]["totalPrice"],
        instruction: this.cartItems[i]["instruction"],
        addon: checkedList,
        foodSizeBodyDTO: this.cartItems[i]["foodSizeBodyDTO"],
      };
      checkedList = [];
      body.push(bodyItem);
    }
    return body;
  }

  loopFilter() {}

  // withinOpeningHour: boolean = true;

  // checkWithinOpeningHour(day) {
  //     let selectedDate = new Date();
  //     if (this.preorder && this.time) {
  //         selectedDate.setHours(
  //             parseInt(this.time.substring(0, 2)),
  //             parseInt(this.time.substring(3, 5), 0)
  //         );
  //     }
  //     let dayOfWeek;
  //     let from;
  //     let to;
  //     let afterFrom;
  //     let afterTo;
  //     if (!this.pickup) {
  //         dayOfWeek = day + "Del";
  //         from = day + "FromDel";
  //         to = day + "ToDel";
  //         afterFrom = day + "AfterFromDel";
  //         afterTo = day + "AfterToDel";
  //     } else {
  //         dayOfWeek = day;
  //         from = day + "From";
  //         to = day + "To";
  //         afterFrom = day + "AfterFrom";
  //         afterTo = day + "AfterTo";
  //     }
  //     if (
  //         this.SettingStoreOpenHours &&
  //         this.SettingStoreOpenHours[dayOfWeek]
  //     ) {
  //         let startTimeString = this.SettingStoreOpenHours[from];
  //         let endTimeString = this.SettingStoreOpenHours[to];
  //         let startTime = new Date();
  //         let endTime = new Date();
  //         startTime.setHours(
  //             startTimeString.substring(0, 2),
  //             startTimeString.substring(3, 5),
  //             startTimeString.substring(6, 8)
  //         );
  //         endTime.setHours(
  //             endTimeString.substring(0, 2),
  //             endTimeString.substring(3, 5),
  //             endTimeString.substring(6, 8)
  //         );
  //         if (
  //             this.SettingStoreOpenHours[afterFrom] !== null &&
  //             this.SettingStoreOpenHours[afterTo] !== null
  //         ) {
  //             let startAfterTimeString = this.SettingStoreOpenHours[
  //                 afterFrom
  //             ];
  //             let endAfterTimeString = this.SettingStoreOpenHours[afterTo];
  //             let startAfterTime = new Date();
  //             let endAfterTime = new Date();
  //             startAfterTime.setHours(
  //                 startAfterTimeString.substring(0, 2),
  //                 startAfterTimeString.substring(3, 5),
  //                 startAfterTimeString.substring(6, 8)
  //             );
  //             endAfterTime.setHours(
  //                 endAfterTimeString.substring(0, 2),
  //                 endAfterTimeString.substring(3, 5),
  //                 endAfterTimeString.substring(6, 8)
  //             );
  //             if (
  //                 selectedDate > startAfterTime &&
  //                 selectedDate < endAfterTime
  //             ) {
  //             } else {
  //                 return false;
  //             }
  //         }
  //         if (selectedDate > startTime && selectedDate < endTime) {
  //             return true;
  //         }
  //     } else {
  //         return false;
  //     }
  // }

  // checkValidTime() {
  //     let now = new Date();

  //     // let currentHour = now.getHours();
  //     // let currentMinute = now.getMinutes();
  //     // let currentTime = currentHour + ":" + currentMinute;

  //     // let currentDay = now.getDate();
  //     // let currentMonth = now.getMonth();
  //     // let currentYear = now.getFullYear();
  //     // let currentDate = currentMonth + currentDay + currentYear;

  //     // let selectedDay = this.date.getDate();
  //     // let selectedMonth = this.date.getMonth();
  //     // let selectedYear = this.date.getFullYear();
  //     // let selectedDate = selectedDay + selectedMonth + selectedYear;
  //     if (this.preorder == true) {
  //         this.time;
  //         if (this.time == undefined || this.time == null) {
  //             this.invalidTimeOrDate = true;
  //         } else {
  //             let selectedTime = this.time;
  //             var selectedDate = this.date;

  //             let hr = parseInt(selectedTime.substring(0, 2));
  //             let minute = parseInt(selectedTime.substring(3, 5));

  //             selectedDate.setHours(hr);
  //             selectedDate.setMinutes(minute);

  //             if (this.preparationEstimate === "15min") {
  //                 var momentAfterAdd = moment(now).add(15, "minute");
  //                 var dateAfterAdding = momentAfterAdd["_d"];
  //                 if (dateAfterAdding <= selectedDate) {
  //                     this.invalidTimeOrDate = false;
  //                 } else {
  //                     this.invalidTimeOrDate = true;
  //                 }
  //             } else if (this.preparationEstimate === "30min") {
  //                 var momentAfterAdd = moment(now).add(30, "minutes");
  //                 var dateAfterAdding = momentAfterAdd["_d"];
  //                 if (dateAfterAdding <= selectedDate) {
  //                     this.invalidTimeOrDate = false;
  //                 } else {
  //                     this.invalidTimeOrDate = true;
  //                 }
  //             } else if (this.preparationEstimate === "45min") {
  //                 var momentAfterAdd = moment(now).add(45, "minutes");
  //                 var dateAfterAdding = momentAfterAdd["_d"];
  //                 if (dateAfterAdding <= selectedDate) {
  //                     this.invalidTimeOrDate = false;
  //                 } else {
  //                     this.invalidTimeOrDate = true;
  //                 }
  //             } else if (this.preparationEstimate === "1hr") {
  //                 var momentAfterAdd = moment(now).add(1, "hour");
  //                 var dateAfterAdding = momentAfterAdd["_d"];
  //                 if (dateAfterAdding <= selectedDate) {
  //                     this.invalidTimeOrDate = false;
  //                 } else {
  //                     this.invalidTimeOrDate = true;
  //                 }
  //             } else if (this.preparationEstimate === "2hrs") {
  //                 var momentAfterAdd = moment(now).add(2, "hours");
  //                 var dateAfterAdding = momentAfterAdd["_d"];
  //                 if (dateAfterAdding <= selectedDate) {
  //                     this.invalidTimeOrDate = false;
  //                 } else {
  //                     this.invalidTimeOrDate = true;
  //                 }
  //             } else if (this.preparationEstimate === "4hrs") {
  //                 var momentAfterAdd = moment(now).add(4, "hours");
  //                 var dateAfterAdding = momentAfterAdd["_d"];
  //                 if (dateAfterAdding <= selectedDate) {
  //                     this.invalidTimeOrDate = false;
  //                 } else {
  //                     this.invalidTimeOrDate = true;
  //                 }
  //             } else if (this.preparationEstimate === "8hrs") {
  //                 var momentAfterAdd = moment(now).add(5, "hours");
  //                 var dateAfterAdding = momentAfterAdd["_d"];
  //                 if (dateAfterAdding <= selectedDate) {
  //                     this.invalidTimeOrDate = false;
  //                 } else {
  //                     this.invalidTimeOrDate = true;
  //                 }
  //             } else if (this.preparationEstimate === "1day") {
  //                 var momentAfterAdd = moment(now).add(1, "day");
  //                 var dateAfterAdding = momentAfterAdd["_d"];
  //                 if (dateAfterAdding <= selectedDate) {
  //                     this.invalidTimeOrDate = false;
  //                 } else {
  //                     this.invalidTimeOrDate = true;
  //                 }
  //             } else if (this.preparationEstimate === "2day") {
  //                 var momentAfterAdd = moment(now).add(2, "days");
  //                 var dateAfterAdding = momentAfterAdd["_d"];
  //                 if (dateAfterAdding <= selectedDate) {
  //                     this.invalidTimeOrDate = false;
  //                 } else {
  //                     this.invalidTimeOrDate = true;
  //                 }
  //             } else if (this.preparationEstimate === "immediate") {
  //                 this.invalidTimeOrDate = false;
  //             } else {
  //                 this.invalidTimeOrDate = true;
  //             }
  //         }
  //     } else {
  //         if (this.preparationEstimate === "15min") {
  //             var momentAfterAdd = moment(now).add(15, "minute");
  //             var dateAfterAdding = momentAfterAdd["_d"];
  //             this.date = dateAfterAdding;
  //         } else if (this.preparationEstimate === "30min") {
  //             var momentAfterAdd = moment(now).add(30, "minutes");
  //             var dateAfterAdding = momentAfterAdd["_d"];
  //             this.date = dateAfterAdding;
  //         } else if (this.preparationEstimate === "45min") {
  //             var momentAfterAdd = moment(now).add(45, "minutes");
  //             var dateAfterAdding = momentAfterAdd["_d"];
  //             this.date = dateAfterAdding;
  //         } else if (this.preparationEstimate === "1hr") {
  //             var momentAfterAdd = moment(now).add(1, "hour");
  //             var dateAfterAdding = momentAfterAdd["_d"];
  //             this.date = dateAfterAdding;
  //         } else if (this.preparationEstimate === "2hrs") {
  //             var momentAfterAdd = moment(now).add(2, "hours");
  //             var dateAfterAdding = momentAfterAdd["_d"];
  //             this.date = dateAfterAdding;
  //         } else if (this.preparationEstimate === "4hrs") {
  //             var momentAfterAdd = moment(now).add(4, "hours");
  //             var dateAfterAdding = momentAfterAdd["_d"];
  //             this.date = dateAfterAdding;
  //         } else if (this.preparationEstimate === "8hrs") {
  //             var momentAfterAdd = moment(now).add(5, "hours");
  //             var dateAfterAdding = momentAfterAdd["_d"];
  //             this.date = dateAfterAdding;
  //         } else if (this.preparationEstimate === "1day") {
  //             var momentAfterAdd = moment(now).add(1, "day");
  //             var dateAfterAdding = momentAfterAdd["_d"];
  //             this.date = dateAfterAdding;
  //         } else if (this.preparationEstimate === "2day") {
  //             var momentAfterAdd = moment(now).add(2, "days");
  //             var dateAfterAdding = momentAfterAdd["_d"];
  //             this.date = dateAfterAdding;
  //         } else if (this.preparationEstimate === "immediate") {
  //             this.date = now;
  //         }

  //         this.invalidTimeOrDate = false;
  //         //Direct CheckOut
  //         //Time as immediate
  //     }
  //     var days = [
  //         "sunday",
  //         "monday",
  //         "tuesday",
  //         "wednesday",
  //         "thursday",
  //         "friday",
  //         "saturday",
  //     ];
  //     if (this.date) {
  //         this.withinOpeningHour = this.checkWithinOpeningHour(
  //             days[this.date.getDay()]
  //         );
  //     }
  //     return this.isValid();
  // }

  fetchSettingOpenClose() {
    this.subReadSettingOpenClose = this.service
      .readSettingOpenClose(this.merchant.domain)
      .subscribe(
        (res) => {
          this.preparationEstimate = res.preparationEstimate;

          switch(this.preparationEstimate){
            case 'immediate':
              this.preOrderOnly = false;
              this.reachTime = "30 Mins";
              break;
            case '15min':
              this.preOrderOnly = false;
              this.reachTime = "45 Mins";
              break;
            case '30min':
              this.preOrderOnly = false;
              this.reachTime = "1 Hour";
              break;
            case '45min':
              this.preOrderOnly = false;
              this.reachTime = "1 Hour " + "15 Mins";
              break;
            case '1hr':
              this.preOrderOnly = false;
              this.reachTime = "1 Hour " + "30 Mins";
              break;
            case '1hr30min':
              this.preOrderOnly = false;
              this.reachTime = "2 Hours";
              break;
            case '2hr':
              this.preOrderOnly = false;
              this.reachTime = "2 Hours " + "30 Mins";
              break;
            case '4hr':
              this.preOrderOnly = true;
              this.preorder = true;
              this.reachTime = "4 Hours " + "30 Mins";
              break;
            case '1day':
              this.preOrderOnly = true;
              this.preorder = true;
              this.reachTime = "1 Day " + "30 Mins";
              break;
            case '2day':
              this.preOrderOnly = true;
              this.preorder = true;
              this.reachTime = "2 Days " + "30 Mins";
              break; 
          }
        
          // this.reachTime = parseInt(this.preparationEstimate.slice(0, 2)) + 30 + "min";
        },
        (err) => {
          this._reqUtil.reqError(err);
        }
      );
  }

  identifyFoodCategory(menu, categoryName) {
    let foodCategoryList = menu["foodCategoryBodyDTOList"];
    let status = false;
    
    foodCategoryList.forEach((element) => {
      if (
        element[this.currentLanguage].categoryName === categoryName &&
        menu["general"].status === "PUBLISHED"
      ) {
        status = true;
      } else {
        status = false;
      }
    });

    return status;
  }

  // isValid() {
  //     let timeAndDate = this.invalidTimeOrDate;
  //     let pickUp = this.pickup;
  //     let preOrder = this.preorder;
  //     let cartItemEmpty: boolean = true;
  //     if (this.cartItems.length > 0) {
  //         cartItemEmpty = false;
  //     }
  //     if (!cartItemEmpty) {
  //         if (pickUp && preOrder && !timeAndDate)
  //             return (this.disabledCheckout = false);
  //         if (pickUp && !preOrder) {
  //             this.invalidTimeOrDate = false;
  //             this.disabledCheckout = false;
  //             return;
  //         }
  //         if (!pickUp && preOrder && !timeAndDate)
  //             return (this.disabledCheckout = false);
  //         if (!pickUp && !preOrder) {
  //             this.invalidTimeOrDate = false;
  //             this.disabledCheckout = false;
  //             return;
  //         }
  //         return (this.disabledCheckout = true);
  //     } else {
  //         if (!preOrder) {
  //             this.invalidTimeOrDate = false;
  //         }
  //         this.disabledCheckout = true;
  //     }
  //     return this.disabledCheckout;
  // }

  updateCheckout() {
    // this.shopCartService.setCartItems(result);
    this.checkoutService.filter();
  }
}
