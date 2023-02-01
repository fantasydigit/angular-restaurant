import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { SessionStorageService } from 'ngx-webstorage';
import { TranslateService } from "@ngx-translate/core";
@Injectable({
	providedIn: 'root'
})
export class ShopCartService {

	private endpoint = environment.endpoint + "/merchant";
	private totalCartItemSubject: Subject<any>;
	private totalCartItems;
	totalCartItemObservable: Observable<any>;

	constructor(
		private httpClient: HttpClient,
		private sessionStorage: SessionStorageService,
		private translateService: TranslateService
	) {
		this.totalCartItemSubject = new Subject<any>();
		this.totalCartItemObservable = this.totalCartItemSubject.asObservable();
	}

	get carts() {
		return this.sessionStorage.retrieve('carts') || {}
	}

	set carts(carts) {
		this.sessionStorage.store('carts', carts)
	}

	get cartId() {
		return localStorage.getItem('CART_ID') || null
	}

	set cartId(id) {
		localStorage.setItem('CART_ID', id)
	}

	readFoodSizes(foodItemId): Observable<any> {
		return this.httpClient.get(this.endpoint + "/shop/food-size/" + foodItemId);
	}

	readFoodName(foodItemId): Observable<any> {
		return this.httpClient.get(this.endpoint + "/shop/food-name/" + foodItemId);
	}

	getCartItems(merchantId): Observable<any> {
		return this.httpClient.get(environment.endpoint + "/cart/" + merchantId );
	}

	getCart(merchantId): Observable<any> {
		return this.httpClient.get(environment.endpoint + "/cart/getCart/" + merchantId);
	}

    getCartForGuest(cartId: string, merchantId: any): Observable<any> {
        return this.httpClient.get(
			environment.endpoint + "/cart/getCart/merchant-id/" + merchantId + "/cart-id/" + cartId
		);
    }

	clearCartItem(cartId): Observable<any> {
		return this.httpClient.delete(environment.endpoint + "/cart/clear-cart/" + cartId);
	}

	setTotalCartItem(newValue) {
		this.totalCartItems = newValue;
	}

	setTotalCartItemEmit(newValue) {
		this.totalCartItemSubject.next(newValue);
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
}
