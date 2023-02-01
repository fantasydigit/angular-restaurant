import { Subscription } from 'rxjs';
import {
    Component,
    OnInit,
    ViewChild,
    ElementRef,
    NgZone,
    OnDestroy
} from "@angular/core";
import { CheckoutService } from "./checkout.service";
import { CreateOrderService } from "src/app/home/create-order/create-order.service";
import { RequestUtilService } from "src/app/shared/services/request-util.service";
import { MapsAPILoader } from "@agm/core";
import { FormBuilder, Validators, FormGroup, FormControl } from "@angular/forms";
import { SuccessService } from "./success/success.service";
import { ShopCartService } from "../../../shared/shop-cart/shop-cart.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { AuthService } from "../../../shared/services/auth.service";
import { PaymentVerifyComponent } from "./payment-verify/payment-verify.component";
import { PatchAddressConfirmDialogComponent } from "./patch-address-confirm-dialog/patch-address-confirm-dialog.component";

import * as moment from "moment";
import { MerchantService } from 'src/app/merchant/merchant.service';
declare let google: any;
import { SessionStorageService } from 'ngx-webstorage';
import { environment } from 'src/environments/environment';


@Component({
    selector: "app-checkout",
    templateUrl: "./checkout.component.html",
    styleUrls: ["./checkout.component.scss"],
})
export class CheckoutComponent implements OnInit, OnDestroy{
    @ViewChild("form") form;
    selectedPhonePrefix ="+60"
    checkoutPreference = [];
    cartItems = [];
    orderId;
    grandTotalUntouch;

    //Form Group
    receiverForm: FormGroup;

    // paymentType = "kiplepay";
    paymentType = "payStack";

    shopName;
    merchant;

    //Receiver
    receiverEmail;
    receiverPhone;
    firstname;
    receiverPhoneWithoutPlus; //Payment gateway cannot search with + sign;

    //Distance
    distanceCoverKM;
    merchantLat;
    merchantLng;
    calculatedRadius;

    //Validation
    invalidPhoneFormat = false;

    //Google Maps
    latitude: any;
    longitude: any;
    defaultLatitude: any;
    defaultLongitude: any;
    zoom: number;
    address: any;
    private geoCoder;
    placeOrderDisable: boolean = true;

    disableButton = true;

    merchantSettingAddress;
    deliveryCharge = 0;
    deliveryChargeError: boolean;

    deliveryPartner;

    addressForm: FormGroup;
    @ViewChild("search", {static: false})
    public searchElementRef: ElementRef;

    paymentForm: FormGroup;

    merchantHash;
    merchantId;
    cart;
    foodItem;
    kipleMerchantId;
    username;
    merchantRefPrefix;
    isFreeDelivery = false;
    freeDeliveryCost = 0;
    minItemDelivery = 0;
    quantityItem = 0;
    minPriceCarDelivery = 0;
    isCarDelivery = false;
    todayDate = ""; // for saving in db (payment details)
    merchantAvailability;
    canOrder = true;
    checkOutDisabledReason = "";

    isUserLoggedIn: boolean = false;

    cartId;

    phonePrefix =[{
        prefix: "+60",
        country: "Malaysia"
    }]
    addressDialogRef: MatDialogRef<PatchAddressConfirmDialogComponent>;
    subListen : Subscription;
    returnUrl= "api"

    constructor(
        private service: CheckoutService,
        private createOrderService: CreateOrderService,
        private reqUtil: RequestUtilService,
        private mapsAPILoader: MapsAPILoader,
        private ngZone: NgZone,
        private formBuilder: FormBuilder,
        private successService: SuccessService,
        private merchantService: MerchantService,
        private shopCartService: ShopCartService,
        private route: ActivatedRoute,
        private router: Router,
        private dialog: MatDialog,
        public auth: AuthService,
        private sessionStorageService: SessionStorageService,
    ) {
        if(environment.endpoint == "api"){
            this.returnUrl =`http://localhost:4100/${environment.endpoint}/payment`;
        }
        else{
            this.returnUrl =`${environment.endpoint}/payment`;
        }
        
        if(this.sessionStorageService.retrieve("merchant")){
            this.merchant = this.sessionStorageService.retrieve("merchant");
            this.merchantId =  this.merchant.domain;
        }else{
            this.merchantId =  this.route.snapshot.paramMap.get('merchantCode');
        }
        
        this.createAddressForm();
        this.createReceiverForm();

        this.subListen = this.service.listen().subscribe((res) => {
            this.fetchItemFromCart();
            this.initiatePage();
        });
    }

    createReceiverForm() {
        this.receiverForm = this.formBuilder.group({
            phonePrefix: ["+60", Validators.required],
            receiverPhone: [
                "",
                [
                    Validators.required,
                    Validators.maxLength(10),
                    Validators.minLength(9),
                ],
            ],
            receiverEmail: ["", [Validators.required, Validators.email]],
        });
        if(!this.auth.authenticated){
            this.receiverForm.addControl("firstname", this.formBuilder.control("",Validators.required))
        }
    }

    createAddressForm() {
        this.addressForm = this.formBuilder.group({
            house: [null, Validators.required],
            street: [{ value: null, disabled: false }, Validators.required],
            city: [{ value: null, disabled: true }, Validators.required],
            state: [{ value: null, disabled: true }, Validators.required],
            postcode: [
                { value: null, disabled: false },
                [
                    Validators.required,
                    Validators.pattern("[0-9]*"),
                    Validators.minLength(5),
                    Validators.maxLength(5),
                ],
            ],
            longitude: [null, [Validators.required]],
            latitude: [null, [Validators.required]],
        });
    }

    loadPaymentInfo() {
        this.service.getKipleMerchantId(this.merchantId).subscribe((res) => {
            console.log(this.kipleMerchantId)
            this.kipleMerchantId = res;
        });
        if(this.auth.authenticated){
            this.auth.getCurrentLogin().subscribe((res) => {
                this.username = res.firstName;
            });
        }
        this.service.getKiplepayMercRef().subscribe(res => {
            this.merchantRefPrefix = res;
        })
    }

    submitPayment() {
        this.paymentForm
            .get("ord_date")
            .setValue(moment().format("DD MMMM YYYY"));
        this.service.payment(this.paymentForm.value).subscribe(
            (res) => {
            },
            (err) => {
            }
        );
    }

    ngOnInit(): void {
        this.merchantId = this.route.snapshot.paramMap.get("merchantId");

        if(this.auth.authenticated){
            this.isUserLoggedIn = true;
            
            this.auth.getCurrentLogin().subscribe((res) => {
                if(res.mobile != "0") {
                    this.receiverForm.patchValue({
                        phonePrefix: res.mobile.substring(0, 3),
                        receiverPhone: res.mobile.substring(3),
                        receiverEmail: res.email,
                    });
                    this.receiverPhone = res.mobile.substring(3);
                } else {
                    this.receiverForm.patchValue({
                        receiverEmail: res.email,
                    });
                }
                
            });
        }
    }

    ngOnDestroy(): void {
        this.subListen.unsubscribe();
    }
    

    initiatePage() {
        this.merchant = this.sessionStorageService.retrieve("merchant");
        this.shopName = this.merchant.shopName;
        this.checkoutPreference = this.sessionStorageService.retrieve("checkoutPreference");
        if(this.checkoutPreference != null){
            this.minItemDelivery = this.checkoutPreference['minItemDelivery'];
            this.minPriceCarDelivery = this.checkoutPreference['minPriceCarDelivery'];
        }
        

        this.getSSTDeliverySetting(this.merchant.domain);
        this.getSettingAddress(this.merchant.domain);
        if(this.auth.authenticated && !this.checkoutPreference["pickUp"]){
            this.service.getUserDeliveryAddress().subscribe(res =>{
                if(res.state != null){
                    var address = res;
                    this.addressDialogRef = this.dialog.open(PatchAddressConfirmDialogComponent, {
                        data:{address: res}
                    })

                    this.addressDialogRef.afterClosed().subscribe(res => {
                        if(res){
                            this.addressForm.patchValue({
                                house: address.house,
                                street:address.street,
                                city: address.city,
                                state: address.state,
                                postcode: address.postcode,
                                longitude: address.longitude,
                                latitude: address.latitude
                            })
                            this.latitude = address.latitude;
                            this.longitude = address.longitude;
                            this.defaultLatitude = address.latitude;
                            this.defaultLongitude = address.longitude;
                            this.updateAddress();
                        }
                        else{
                            this.loadGoogleAPI();
                        }
                    })

                }
                else{
                    this.loadGoogleAPI();
                }
               
            })
        }
        else{
            this.loadGoogleAPI();
        }

        

        
    }
    
    fetchCheckoutPreference(){
        
    }

    loadGoogleAPI(){
        // Load Google API Places Autocomplete
        this.mapsAPILoader.load().then(() => {
            this.setCurrentLocation();
            this.geoCoder = new google.maps.Geocoder();
            setTimeout(() => {
                let autocomplete = new google.maps.places.Autocomplete(
                    this.searchElementRef.nativeElement
                );
                autocomplete.addListener("place_changed", () => {
                    this.ngZone.run(() => {
                        //get the place result
                        let place: google.maps.places.PlaceResult = autocomplete.getPlace();

                        //verify result
                        if (
                            place.geometry === undefined ||
                            place.geometry === null
                        ) {
                            return;
                        }

                        //set latitude, longitude and zoom
                        this.latitude = place.geometry.location.lat();
                        this.longitude = place.geometry.location.lng();
                        this.defaultLatitude = place.geometry.location.lat();
                        this.defaultLongitude = place.geometry.location.lng();
                        this.calculateRadius();
                        this.zoom = 12;
                    });
                });
            }, 4000);
        });
    }

    fetchItemFromCart() {
        this.isFreeDelivery = false;
        if(this.sessionStorageService.retrieve("merchant")){
            this.merchant = this.sessionStorageService.retrieve("merchant");
            this.merchantId =  this.merchant.domain;
        }else{
            this.merchantId =  this.route.snapshot.paramMap.get('merchantCode');
        }


        if (!this.auth.authenticated){
            this.cartId = this.sessionStorageService.retrieve("carts")[this.merchantId];
            this.shopCartService.fetchCartItemsByCartId(this.cartId, this.merchantId).subscribe(res => {
                this.cartItems = res;
                this.foodItem = this.filterFoodItemBody();
                this.shopCartService.getCartForGuest(this.cartId, this.merchantId).subscribe((res) => {
                    this.cart = res;
                    this.grandTotalUntouch = this.cart["grandTotal"];
                    if(this.checkoutPreference != null) {
                        this.freeDeliveryCost = this.checkoutPreference['freeDeliveryCost'];
                        if((this.cart['grandTotal'] > this.freeDeliveryCost) &&
                            (this.freeDeliveryCost != -1) ) {
                            this.isFreeDelivery = true;
                        }
                    }

                    this.countQuantity();
                    this.calculateGrandTotal();
                });
            })

        }
        else{
            this.shopCartService.getCartItems(this.merchantId).subscribe((res) => {
                this.cartItems = res;
                this.foodItem = this.filterFoodItemBody();
                this.shopCartService.getCart(this.merchantId).subscribe((res) => {
                    this.cart = res;
                    this.grandTotalUntouch = this.cart["grandTotal"];
                    if(this.checkoutPreference != null) {
                        this.freeDeliveryCost = this.checkoutPreference['freeDeliveryCost'];
                        if((this.cart['grandTotal'] > this.freeDeliveryCost) &&
                            (this.freeDeliveryCost != -1) ) {
                            this.isFreeDelivery = true;
                        }
                    }
                    
                    this.countQuantity();
                    this.calculateGrandTotal();
                });
            });
        }
        
        
    }

    checkForm() {
        console.log("validate");
        console.log(this.receiverForm.controls["receiverEmail"].errors);
    }

    validateEntry() {
        let phoneValid;
        let phone: number;
        if(this.receiverPhone) {
            phone = this.receiverPhone;
        } else {
            phone = this.receiverForm.controls["receiverPhone"].value;
        }
        

        if (phone) {
            if (phone.toString().length > 12 || phone.toString().length < 8) {
                this.invalidPhoneFormat = true;
                phoneValid = false;
            } else {
                phoneValid = true;
            }
        } else {
            this.invalidPhoneFormat = true;
            phoneValid = false;
        }

        return phoneValid;
    }

    validateFirstName(){
        if(!this.firstname){
            return false;
        }
        else{
            return true
        }
    }
    validateEmail(){
        if(!this.receiverEmail){
            return false;
        }
        else{
            return true
        }
    }

    invalidEmailPhone() {
        //Delivery, must have deliveryAddressDTO, receiverForm
        let invalidEmail = this.receiverForm.controls["receiverEmail"].invalid;
        let invalidPhone = this.receiverForm.controls["receiverPhone"].invalid;
        if (invalidEmail && invalidPhone) return true;
        return false;
    }

    invalidAddressForm() {
        if (this.addressForm.hasError("required", "house")) return true;
    }

    placeOrder() {
        //if (!this.auth.authenticated) return
    
        this.loadPaymentInfo()
        
        let monthOp = { month: 'long' };
        let yearOp = { year: 'numeric'};
        let dateOp = { day: 'numeric'};

        const date = new Date();  // 2009-11-10
        const month = date.toLocaleString('default', monthOp);
        const dateNum = date.toLocaleString('default', dateOp);
        const year = date.toLocaleString('default', yearOp);

        this.todayDate = dateNum + " " + month + " " + year;

        // Check if address change after update address
        if (this.checkoutPreference["pickUp"]) {
            if(!this.auth.authenticated) this.username = this.receiverForm.controls["firstname"].value;
            this.checkoutPreference["receiverPhone"] = this.receiverForm.controls["phonePrefix"].value + this.receiverForm.controls[
                "receiverPhone"
            ].value;
            this.checkoutPreference["receiverEmail"] = this.receiverForm.controls[
                "receiverEmail"
            ].value;
            let phone: String = this.checkoutPreference["receiverPhone"];
            
            this.receiverPhoneWithoutPlus = phone.replace('+','');
            console.log(this.receiverPhoneWithoutPlus);
        }
        else{
            //TODO : is phone and user not required if user login?
            if(!this.auth.authenticated) this.username = this.receiverForm.controls["firstname"].value;
            this.checkoutPreference["receiverEmail"] = this.receiverForm.controls[
                "receiverEmail"
            ].value;
            this.checkoutPreference["receiverPhone"] = this.receiverForm.controls["phonePrefix"].value + this.receiverForm.controls[
                "receiverPhone"
            ].value;

            let phone: String = this.checkoutPreference["receiverPhone"];
            this.receiverPhoneWithoutPlus = phone.replace('+','');
        }

        // if (!this.checkoutPreference["preOrder"]) {
        //     let currentDate = new Date();
        //     this.checkoutPreference["deliveryDate"] = currentDate;
        // }

        if (!this.checkoutPreference["pickUp"] && this.invalidEmailPhone())
            return this.receiverForm.markAllAsTouched(); //invalid rceiverPhone and email / delivery
        if (!this.checkoutPreference["pickUp"] && this.invalidAddressForm())
            return this.addressForm.markAllAsTouched();
        if (this.checkoutPreference["pickUp"] && !this.validateEntry()) return; //invalid phone / pickup
        this.invalidPhoneFormat = false;

        this.checkoutPreference["paymentType"] = this.paymentType;

        let body = {
            subtotal: this.cart["subTotal"],
            grandTotal: this.cart["grandTotal"],
            packagingCharge: this.cart["packagingCost"],
            paymentType: this.checkoutPreference["paymentType"],
            pickUp: this.checkoutPreference["pickUp"],
            preOrder: this.checkoutPreference["preOrder"],
            selectedDate: this.checkoutPreference["selectedDate"],
            selectedTime: this.checkoutPreference["selectedTime"],
            deliveryCharge: this.deliveryCharge,
            foodItem: this.foodItem,
            receiverEmail: this.checkoutPreference["receiverEmail"],
            receiverPhone: this.checkoutPreference["receiverPhone"],
            receiverName: this.username,
            deliveryAddressDTO: this.checkoutPreference["deliveryAddressDTO"],
            // deliveryDate: this.checkoutPreference["deliveryDate"],
            deliveryPartner: this.deliveryPartner
        };

        let option;
        if(this.checkoutPreference["pickUp"]) {
            option = "Pickup";
        } else {
            option = "delivery";
        }

        let merchantAvailability = {
            option: option,
            useCurrentTime: !this.checkoutPreference["preOrder"],
            selectedDate: this.checkoutPreference["selectedDate"]
        }
        this.createOrderService.checkMerchantAvailability(this.merchantId, merchantAvailability).subscribe (
            (res) => {
            this.merchantAvailability = res;
            this.canOrder = res.canOrder;
            this.checkOutDisabledReason = res.reason;
            if(this.checkOutDisabledReason) {
                this.reqUtil.reqError("", this.checkOutDisabledReason);
            }

            if(this.canOrder) {
                
                 //store into storage for further registration use
                if(!this.auth.authenticated){
                    this.sessionStorageService.store("guestinfo", {
                        firstname: this.username,
                        receiverPhone: body.receiverPhone,
                        receiverEmail: body.receiverEmail,
                        address: this.checkoutPreference["deliveryAddressDTO"],
                    })
                }


                let distanceWarning =
                    "Your Current Address Is Out of Range, Only " +
                    this.distanceCoverKM +
                    "KM Is Allowed For This Merchant.";
                if (
                    !this.checkoutPreference["pickUp"] &&
                    this.distanceCoverKM < this.calculatedRadius
                )
                    return this.reqUtil.reqError(null, distanceWarning);
                
                this.sessionStorageService.clear("checkoutPreference");
                this.createOrderService
                    .createOrder(body, this.shopName)
                    .subscribe(
                        (res) => {
                            this.orderId = this.merchantRefPrefix + res.id;
                            console.log(this.merchantRefPrefix)
                            let hashBody = {
                                ord_mercref: this.orderId,
                                ord_totalamt: this.cart["grandTotal"],
                                // ord_totalamt: 1.00
                            };
                            this.service.getMerchantHash(hashBody).subscribe((res) => {
                                this.merchantHash = res;
                                setTimeout(() =>{
                                    this.form.nativeElement.submit();
                                },1000)
                            });
                            // this.service.clearCartItem(this.cart.id).subscribe(() => {
                            //   this.successService.orderId = res.id;
                            //   this.successService.filter();
                            //   this.matStepService.forward();
                            // });
                        },
                        (err) => {
                            this.reqUtil.reqError(err);
                        }
                    )
                    .add(() => {
                        this.reqUtil.reqSuccess();
                        // this.mapToAddonItem();
                        // this.ngOnInit();
                    });

            } else {

            }
            },
            (err) => {
                console.log(err);
            }
        );


        console.log(body);

       
    }

    getDeliveryCharge() { }

    calculateGrandTotal() {
        if(this.isFreeDelivery){
            this.service.calculateGrandTotal(this.merchantId, this.cart["id"], 0).subscribe(res => {
                this.cart = res;
            })
            // this.cart["grandTotal"] = this.grandTotalUntouch
        }else{
             this.service.calculateGrandTotal(this.merchantId, this.cart["id"], this.deliveryCharge).subscribe(res => {
                this.cart = res;
            })
            // this.cart["grandTotal"] = this.grandTotalUntouch + this.deliveryCharge;
        }
        
    }

    // changeDeliveryPartner(deliveryPartner) {
    //   this.checkoutPreference['deliveryPartner'] = deliveryPartner;
    // }

    onAddressMapCenterChange(e) {
        // this.addressForm.get('latitude').setValue(e.lat);
        // this.addressForm.get('longitude').setValue(e.lng);
        console.log(e);
        this.latitude = e.lat;
        this.longitude = e.lng;
        this.getAddress(this.latitude, this.longitude);
    }

    getAddress(lat: number, lng: number) {
        this.calculateRadius();
        if (navigator.geolocation) {
            let geocoder = new google.maps.Geocoder();
            let latlng = new google.maps.LatLng(lat, lng);
            let request = { latLng: latlng };
            geocoder.geocode(request, (results, status) => {
                if (status === google.maps.GeocoderStatus.OK) {
                    let result = results[0];
                    let rsltAdrComponent = result.address_components;
                    let resultLength = rsltAdrComponent.length;
                    if (result != null) {
                        this.address = rsltAdrComponent;
                        this.patchAddress();
                    } else {
                        alert("No address available!");
                    }
                }
            });
        }
    }

    patchAddress() {
        let address: any = this.address;
        
        for(let addr of address){
            if(addr.types.includes("locality")){
                this.addressForm.patchValue({
                    city: addr.long_name
                })
            }
            else if( addr.types.includes("postal_code")){
                this.addressForm.patchValue({
                    postcode: addr.short_name
                })
            }
            else if( addr.types.includes("administrative_area_level_1")){
                this.addressForm.patchValue({
                    state: addr.short_name
                })
            }
            else if( addr.types.includes("route")){
                this.addressForm.patchValue({
                    street: addr.short_name
                })
            }
        }
        // this.addressForm.patchValue({
        //     house: "",
        //     street: address[0].short_name,
        //     city: "",
        //     state: address[1].short_name,
        //     postcode: address[3].short_name,
        // });
    }

    // Get Current Location Coordinates
    private setCurrentLocation() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                this.latitude = position.coords.latitude;
                this.longitude = position.coords.longitude;
                this.defaultLatitude = position.coords.latitude;
                this.defaultLongitude = position.coords.longitude;
                this.zoom = 8;
                this.getAddress(this.latitude, this.longitude);
            });
        }
    }

    private reverseGeocoding(lat, lng) {
        this.service.reverseGeocoding(lat, lng).subscribe((res) => { });
    }

    getSSTDeliverySetting(merchantCode) {
        this.service.readSSTDelivery(merchantCode).subscribe((res) => {
            this.distanceCoverKM = res.deliveryDistanceCover;
        });
    }

    getSettingAddress(merchantCode) {
        this.service
            .readSettingAddress(merchantCode)
            .subscribe((res) => {
                this.merchantSettingAddress = res;
                this.merchantLat = res.latitude;
                this.merchantLng = res.longitude;
            })
            .add(() => {
                this.calculateRadius();
            });
    }

    calculateRadius() {
        var lat1 = this.latitude;
        var lon1 = this.longitude;
        var lat2 = this.merchantLat;
        var lon2 = this.merchantLng;

        var p = 0.017453292519943295; // Math.PI / 180
        var c = Math.cos;
        var a =
            0.5 -
            c((lat2 - lat1) * p) / 2 +
            (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;

        this.calculatedRadius = 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
        // console.log("TOTAL DISTANCE (KM)");
        // console.log(distance);
    }

    countQuantity() {
        let quantity = 0;
        let arr = this.foodItem;
        arr.forEach((element) => {
            quantity = quantity + element.quantity;
        });
        this.quantityItem = quantity;
        if(this.quantityItem >= this.minItemDelivery && this.minItemDelivery != -1) {
            this.isCarDelivery = true;
        } else if(this.quantityItem >= this.minPriceCarDelivery && this.minPriceCarDelivery != -1.00) { 
            this.isCarDelivery = true;
        } else if (this.minItemDelivery == -1 && this.minPriceCarDelivery == -1.00) {
            this.isCarDelivery = false;
        }  

        return quantity;
    }

    updateAddress() {
        if (this.invalidAddressForm())
            return this.addressForm.markAllAsTouched();
        this.addressForm.controls["latitude"].setValue(this.latitude);
        this.addressForm.controls["longitude"].setValue(this.longitude);
        let addressObject = this.addressForm.getRawValue();

        let total = this.cart["subTotal"] + this.cart["packagingCost"];
        
        let quantity = this.countQuantity();

        let body = {
            merchantId: this.merchant.merchantId,
            shopName: this.merchant.shopName,
            merchantCode: this.merchantId,
            total: total,
            quantity: quantity,
            house: addressObject.house,
            street: addressObject.street,
            city: addressObject.city,
            postcode: addressObject.postcode,
            state: addressObject.state,
            latitude: addressObject.latitude,
            longitude: addressObject.longitude,
            minItemDelivery: this.minItemDelivery,
            minPriceCarDelivery: this.minPriceCarDelivery
        };

        
        this.checkoutPreference["deliveryAddressDTO"] = body;
        //car delivery, mr speedy
        if(quantity >= this.minItemDelivery && this.minItemDelivery != -1) {
            this.service.getMrSpeedyQuote(body).subscribe(
                (res) => {
                    if (JSON.parse(res.body)["order"].payment_amount) {
                        this.placeOrderDisable = false;
                        this.deliveryChargeError = false;
                        this.deliveryCharge = parseFloat(JSON.parse(res.body)[
                            "order"
                        ].payment_amount);
                        this.deliveryPartner = "mrspeedy";
                        this.calculateGrandTotal();

                        console.log(JSON.parse(res.body));
                    }
                },
                (err) => {
                    this.deliveryChargeError = true;
                    this.placeOrderDisable = true;
                    this.reqUtil.reqError(err);
                }
            );
        } else if(quantity >= this.minPriceCarDelivery && this.minPriceCarDelivery != -1.00) {
                this.service.getMrSpeedyQuote(body).subscribe(
                    (res) => {
                        if (JSON.parse(res.body)["order"].payment_amount) {
                            this.placeOrderDisable = false;
                            this.deliveryChargeError = false;
                            this.deliveryCharge = parseFloat(JSON.parse(res.body)[
                                "order"
                            ].payment_amount);

                            console.log(JSON.parse(res.body));

                            this.deliveryPartner = "mrspeedy";
                            this.calculateGrandTotal();
                        }
                    },
                    (err) => {
                        this.deliveryChargeError = true;
                        this.placeOrderDisable = true;
                        this.reqUtil.reqError(err);
                    }
                );
        }else {
            //motor delivery
            this.service.getGrabExpressQuote(body).subscribe(
                (res) => {
                    if (JSON.parse(res.body)["quotes"][0].amount) {
                        this.placeOrderDisable = false;
                        this.deliveryCharge = JSON.parse(res.body)[
                            "quotes"
                        ][0].amount;
                        this.deliveryPartner = "grabexpress";
                    }
                    console.log(JSON.parse(res.body));
                    this.calculateGrandTotal();
                },
                (err) => {
                    this.deliveryChargeError = true;
                    this.placeOrderDisable = true;
                    this.reqUtil.reqError(err);
                }
                // (err) => {
                //     this.service.getMrSpeedyQuote(body).subscribe(
                //         (res) => {
                //             if (JSON.parse(res.body)["order"].payment_amount) {
                //                 this.placeOrderDisable = false;
                //                 this.deliveryChargeError = false;
                //                 this.deliveryCharge = parseFloat(JSON.parse(res.body)[
                //                     "order"
                //                 ].payment_amount);
                //                 this.deliveryPartner = "mrspeedy";
                //                 this.calculateGrandTotal();
                //             }

                //         },
                //         (err) => {
                //             this.deliveryChargeError = true;
                //             this.placeOrderDisable = true;
                //         }
                //     );
                // }
            );
        }
        
    }
    

    filterFoodItemBody() {
        let cartItems = this.cartItems;
        
        let sizeIdList = [];
        let body = [];
        let bodyItem = {};
        for (let i = 0; i < cartItems.length; i++) {
            let cartItemLoop = cartItems[i];
            let checkedList = [];
            for (let x = 0; x < cartItemLoop["cartAddonDTO"].length; x++) {
                let addon = cartItemLoop["cartAddonDTO"][x];
                let addonItem = {
                    addonId: addon.addonId,
                    quantity: addon.quantity,
                    totalPrice: addon.totalPrice,
                    addonName: addon.addonName,
                };
                checkedList.push(addonItem);
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

    dispError(
        groupName,
        controlName,
        errorCode
    ) {
        if (
            !this[groupName] ||
            !this[groupName].controls[controlName]
        ) {
            return false
        }

        let group = this[groupName] as FormGroup
        let control = group.controls[controlName] as FormControl

        if (
            control.touched &&
            control.hasError(errorCode)
        ) {
            return true
        }

        return false
    }

    dispErrorHolder(
        groupName,
        controlName
    ) {
        if (
            !this[groupName] ||
            !this[groupName].controls[controlName]
        ) {
            return true
        }

        let group = this[groupName] as FormGroup
        let control = group.controls[controlName] as FormControl

        if (
            control.touched &&
            control.invalid
        ) {
            return false
        }

        return true
    }

}
