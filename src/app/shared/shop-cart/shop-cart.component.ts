import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Route, Router } from "@angular/router";
import { CookieService } from "ngx-cookie-service";
import { MerchantService } from 'src/app/merchant/merchant.service';
import { CreateOrderService } from "../../home/create-order/create-order.service";
import { FooditemAddonComponent } from "../../home/create-order/fooditem-addon/fooditem-addon.component";
import { SessionStorageService } from 'ngx-webstorage';

import { CheckoutService } from "../../pages/account/checkout/checkout.service";
import { AuthService } from "../services/auth.service";
import { RequestUtilService } from "../services/request-util.service";
import { ShopCartService } from "./shop-cart.service";
import { first } from "rxjs/operators";
import { Subscription } from "rxjs";

interface itemInterface {
    itemId: number;
    quantity: number;
    totalPrice: number;
    addon: [];
}

@Component({
    selector: "app-shop-cart",
    templateUrl: "./shop-cart.component.html",
    styleUrls: ["./shop-cart.component.scss"],
})
export class ShopCartComponent implements OnInit, OnDestroy {
    isLinear = false;
    merchant;

    filterbyCategory = ["apple", "orange"];
    constructor(
        private cookieService: CookieService,
        private service: CreateOrderService,
        private addonComponent: FooditemAddonComponent,
        private shopCartService: ShopCartService,
        public dialog: MatDialog,
        private reqUtil: RequestUtilService,
        private route: ActivatedRoute,
        private checkoutService: CheckoutService,
        private merchantService: MerchantService,
        private _auth: AuthService,
        private sessionStorageService: SessionStorageService,
        private router: Router,
    ) {}

    get cartItemsLength() {
        if (
            this.cartItems && 
            this.cartItems.length
        ) {
            return this.cartItems.length
        }
        
        return 0
    }

    cookieValue: String;

    //Cart Cookies
    cartCookieKey: string;
    cartItems: any[];

    //Parallex Content
    shopName: String;
    logo: String;
    background: String;

    //Food Item Listing
    foodItem = [];
    SettingStoreOpenHours: any;

    //packaging charge
    packagingCharge: number;

    // badge on cart
    hidden = true;
    totalCartItems = 0;

    viewCart = true;
    merchantId;
    cart: any;
    emptyCart: boolean;

    subTotalCartItemObservable: Subscription;

    ngOnInit(): void {
        this.merchantService
            .changeMerchantEvent
            .subscribe(res =>  {
                this.onChangeMerchant()
            })
        
        if(this.sessionStorageService.retrieve('merchant')){
            this.merchant = this.sessionStorageService.retrieve('merchant');
            this.merchantId = this.merchant.domain;
            this.subscribeCartBadge();
        } else {
            this.subscribeCartBadge();
        }
    }

    ngOnDestroy(): void {
        // this.subChangeMerchantEvent.unsubscribe();
        // this.subTotalCartItemObservable.unsubscribe();
    }

    onChangeMerchant() {
        if(this.sessionStorageService.retrieve('merchant')) {
            this.merchant = this.sessionStorageService.retrieve('merchant');
            this.merchantId = this.merchant.domain;
            this.setupCart();
        }
        
    }

    setupCart() {
        if (!this.merchantId && this._auth.authenticated) {
            this.checkoutService
                .getMerchantIdByOrderRef(
                    this.route.snapshot.paramMap.get("orderNumber")
                )
                .subscribe((res) => {
                    this.merchantId = res;
                    this.createCart();
                });
        } else {
            this.createCart();
        }
    }

    subscribeCartBadge() {
        this.subTotalCartItemObservable = this.shopCartService.totalCartItemObservable.subscribe((res) => {
            if(res == "new")
                this.setupCart();
        });
    }

    createCart() {
        if(this.sessionStorageService.retrieve("merchant")) {
            this.merchant = this.sessionStorageService.retrieve("merchant");
            // let merchantDomain = this.merchant.domain;
            // this.fetchMerchant(merchantDomain);

            this.fetchCartItems();
        }
        
        // if (this.cookieValue) {
        //     this.fetchMerchant(this.cookieValue);
        // } else {
            
            // this.merchantService
            //     .getMerchantcode(this.merchantId)
            //     .subscribe((res) => {
            //         this.cookieValue = res.shopName;
            //         this.fetchMerchant(this.merchantId);
            //     });
        // }
    }

    toggleBadgeVisibility() {
        // if (this.cartItemsLength > 0) {
            this.hidden = false;
        // } else {
            // this.hidden = true;
        // }
    }

    closeCartPopup() {
        
        this.viewCart = false;

        setTimeout(() => {
            this.viewCart = true;
        }, 1000);
    }

    onClickCategory(event) {
        console.log(event);
    }

    checkEmptyCart() {
        if (this.cartItems.length < 1) {
            this.emptyCart = true;
        } else {
            this.emptyCart = false;
        }
    }

    // fetchMerchant(shopName) {
    //     this.service.readMerchant(shopName).subscribe((res) => {
    //         this.shopName = res.shopName;
    //         this.fetchCartItems();
    //     });
    // }

    fetchCartItems() {
        if (this._auth.authenticated) {
            this.shopCartService
            .getCartItems(this.merchantId)
            .subscribe((response) => {
                this.cartItems = response;
                this.fetchCart();
                this.checkEmptyCart();
                this.shopCartService.setTotalCartItem(this.countQuantity());
                // this.shopCartService.setTotalCartItemEmit("new");
                this.toggleBadgeVisibility();
            });
        } else {
            if(this.shopCartService.carts[this.merchantId]) {
                this.shopCartService.fetchCartItemsByCartId(
                    this.shopCartService.carts[this.merchantId],
                    this.merchantId
                ).subscribe(
                    response => {
                        this.cartItems = response;
                        console.log(this.cartItems);
                        this.fetchCart();
                        this.checkEmptyCart();
                        this.shopCartService.setTotalCartItem(this.countQuantity());
                        // this.shopCartService.setTotalCartItemEmit("new");
                        
                        this.toggleBadgeVisibility();
                    }
                )
            } 
            else {
                this.cartItems = null;
                // this.fetchCart();
                // this.checkEmptyCart();
                // this.shopCartService.setTotalCartItem(this.countQuantity());
                this.toggleBadgeVisibility();
            }
            
        }
    }

    countQuantity() {
        let quantity = 0;
        let arr = this.cartItems;
        arr.forEach((element) => {
            quantity = quantity + element.quantity;
        });
        return quantity;
    }

    deleteItem(item) {
        this.service.deleteCartItem(item.id).subscribe(() => {
            this.createCart();
        });
        this.service.filterCheckout();
        this.checkoutService.filter();
    }

    openEditItem(item) {
        let list = [];
        list.push(item.itemId);
        this.service
            .readFoodItemById(this.merchantId, list)
            .subscribe((res) => {
                this.service.foodSizeList = res[0]["foodSizeBodyDTOList"];
                this.service.foodItem = res[0];
                const dialogRef = this.dialog.open(FooditemAddonComponent, {
                    data: { cartItem: item },
                    width:"100%"
                });
                dialogRef.afterClosed().subscribe((result) => {
                    if (result === "close" || result == undefined) {
                        this.service.foodItem = "";
                    } else {
                        if (!result.cartId) result.cartId = this.shopCartService.carts[this.merchantId]
                        this.service
                            .editCartItem(this.merchantId, result)
                            .subscribe(() => {
                                this.createCart();
                                this.checkoutService.filter();
                            });
                    }
                });
            });
    }

    updateCheckout() {
        let cartItems = this.cartItems;
        let checkOut = this.cookieService.get(this.cartCookieKey + "_checkout");
        checkOut["foodItem"];
    }

    fetchCart() {
        if (this._auth.authenticated) {
            this.shopCartService.getCart(this.merchantId).subscribe((res) => {
                this.cart = res;
                this.shopCartService.carts = this.cart;
                console.log(this.cart);
            });
        } else {
            this.shopCartService.getCartForGuest(
                this.shopCartService.carts[this.merchantId],
                this.merchantId
            ).subscribe(
                res => {
                    this.cart = res;
                    console.log("shop cart" + this.cart);
                    // this.shopCartService.carts = this.cart;
                }
            )
        }
    }

    get dispCart(): boolean {
        return !this.dispEmptyCart && !this.dispRestaurant // Guests can use cart
        return this._auth.authenticated && (this.merchantId || this.merchantId == 0)
    }

    get dispLogin(): boolean {
        return false // Guests can use cart
        return !this._auth.authenticated
    }

    get dispRestaurant(): boolean {
        return (!this.merchantId && this.merchantId != 0) // Guests can use cart
        return this._auth.authenticated && (!this.merchantId && this.merchantId != 0)
    }

    get dispEmptyCart(): boolean {
        const items = this.cartItems || []
        return items.length == 0 && !this.dispRestaurant
    }

    get dispCartIcon(): boolean {
        if (
            this.router &&
            this.router.url.includes('/shop')
        ) {
            return true
        }
        return false
    }
}
