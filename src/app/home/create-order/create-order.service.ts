import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment'
import { Observable, Subject } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ThrowStmt } from '@angular/compiler';
import { map } from 'rxjs/operators';
import { TranslateService } from "@ngx-translate/core";

@Injectable({
  providedIn: 'root'
})
export class CreateOrderService {

  itemId: number;
  foodItem: any;
  foodItemEdit: any;
  foodSizeList: any;

  checkLoginFromCreateOrder: boolean = false;

  private _listners = new Subject<any>();

  private cartListener = new Subject<any>();

  constructor(private httpClient: HttpClient, private translateService: TranslateService) { }

  private endpoint = environment.endpoint + "/merchant";

  readMenu(merchantDomain): Observable<any> {
    return this.httpClient.get(this.endpoint + "/shop/" + merchantDomain + "/menu");
  }

  readCategory(merchantDomain): Observable<any> {
    return this.httpClient.get(this.endpoint + "/shop/" + merchantDomain + "/category");
  }

  readAddOnCategory(merchantDomain,defaultLangIdCatList): Observable<any> {
    let params = new HttpParams();
    params = params.append('defaultLangIdCatList', defaultLangIdCatList)
    
    return this.httpClient.get(this.endpoint + "/shop/" + merchantDomain + "/add-on/category", {params: params});
  }

  readMerchant(merchantCode): Observable<any> {
    return this.httpClient.get(this.endpoint + "/shop/" + merchantCode);
  }

  readSettingGeneral(merchantDomain): Observable<any> {
    return this.httpClient.get(this.endpoint + "/shop/" + merchantDomain + "/setting-general");
  }

  readFoodItemById(shopName, idList): Observable<any> {
    return this.httpClient.post(this.endpoint + "/shop/" + shopName + "/item-list", idList);
  }

  readSettingPackageCharge(shopName): Observable<any> {
    return this.httpClient.get(this.endpoint + "/shop/" + shopName + "/packaging-charge");
  }

  readSettingStoreHour(merchantDomain): Observable<any> {
    return this.httpClient.get(this.endpoint + "/shop/" + merchantDomain + "/setting-store-hour");
  }

  checkMerchantAvailability(merchantDomain, merchantAvailability): Observable<any> {
    return this.httpClient.post(this.endpoint + "/shop/availability/" + merchantDomain, merchantAvailability);
  }

  createOrder(body, shopName): Observable<any> {
    return this.httpClient.post(environment.endpoint + "/order/" + shopName, body);
  }
  
  /*
  * min, max delivery and pickup
  * free delivery cost
  */
 fetchSettingDelivery(merchantDomain): Observable<any> {
    return this.httpClient.get(this.endpoint + "/shop/" + merchantDomain + "/setting-delivery");
  }

  /*
  * preparation estimate
  */
  readSettingOpenClose(merchantDomain): Observable<any> {
    return this.httpClient.get(this.endpoint + "/shop/" + merchantDomain + "/setting-open-close");
  }

  /*
  * delivery distance cover
  */
  readSettingSSTDelivery(shopName): Observable<any> {
    return this.httpClient.get(this.endpoint + "/shop/" + shopName + "/setting-sst-delivery");
  }

  getTimeSelection(shopName): Observable<any> {
    return this.httpClient.get(this.endpoint + "/shop/" + shopName + "/timelist");
  }

  listen(): Observable<any> {
    return this._listners.asObservable();
  }

  filter() {
    this._listners.next();
  }

  listenCookieCart(): Observable<any> {
    return this.cartListener.asObservable();
  }

  filterCheckout() {
    this.cartListener.next();
  }

  /*
  * add to cart
  */
  addToCart(merchantId, cartItem: any): Observable<any> {
    return this.httpClient.post(
      environment.endpoint + "/cart/" + merchantId, 
      cartItem
    )
  }

  fetchCartItemsByCartId(cartId, merchantId): Observable<any> {
    console.log(this.translateService.currentLang);
		console.log("fetch cart")
		let language = "en";
		if(this.translateService.currentLang){
			language = this.translateService.currentLang;
		}

    return this.httpClient.get(
      environment.endpoint + "/cart/merchant-id/" + merchantId + "/cart-id/" + cartId + "/"+ language
    )
  }

  fetchCartItems(merchantId): Observable<any> {
    return this.httpClient.get(environment.endpoint + "/cart/" + merchantId);
  }

  deleteCartItem(cartItemId): Observable<any> {
    return this.httpClient.delete(environment.endpoint + "/cart/" + cartItemId);
  }

  editCartItem(merchantId, cartItem: any): Observable<any> {
    return this.httpClient.put(environment.endpoint + "/cart/" + merchantId, cartItem);
  }
}
