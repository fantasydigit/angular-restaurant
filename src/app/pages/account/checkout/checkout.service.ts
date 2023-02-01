import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  cartItem;

  body;

  private _listners = new Subject<any>();
  
  //https://maps.googleapis.com/maps/api/geocode/json?latlng=40.714224,-73.961452&key=YOUR_API_KEY

  private endpoint = environment.endpoint + "/merchant";

  constructor(
    private httpClient: HttpClient
  ) { }

  //Latlng convert to address
  reverseGeocoding(latitude, longitude): Observable<any> {
    return this.httpClient.get("https://maps.googleapis.com/maps/api/geocode/json?latlng="+latitude+","+longitude+"&key="+environment.googleMapApiKey);
  }

  readSSTDelivery(merchantCode):Observable<any>{
    return this.httpClient.get(this.endpoint + "/shop/" +merchantCode + "/setting-sst-delivery");
  }

  readSettingAddress(merchantCode):Observable<any>{
    return this.httpClient.get(this.endpoint + "/shop/" +merchantCode + "/setting-address");
  }

  listen(): Observable<any> {
    return this._listners.asObservable();
  }

  getGrabExpressQuote(body): Observable<any> {
    return this.httpClient.post(environment.endpoint + "/delivery/grab-quote", body);
  }

  getMrSpeedyQuote(body): Observable<any> {
    return this.httpClient.post(environment.endpoint + "/delivery/mr-speedy-price", body);
  }

  filter() {
   this._listners.next();
  }



  // payment(payload): Observable<any>{
  //   let body = JSON.stringify(payload);
  //   let header = new HttpHeaders();
  //   header = header.append("Content-Type", "application/json");
  //   return this.httpClient.post("kiple",body, {headers: header});
  // }
  payment(payload): Observable<any>{
    return this.httpClient.post(environment.endpoint+"/payment",payload,{responseType: "text"});
  }
  getMerchantHash(payload):Observable<any>{
    return this.httpClient.post(environment.endpoint+"/payment/merchantHash",payload,{responseType: "text"});
  }
  getPaymentDetails(orderRef:string):Observable<any>{
    let _params = new HttpParams();
    _params = _params.append("orderRef", orderRef);
    return this.httpClient.get(environment.endpoint+"/payment/getDetails",{params: _params});
  }
  getMerchantIdByOrderRef(orderRef:string):Observable<any>{
    let _params = new HttpParams();
    _params = _params.append("orderRef", orderRef);
    return this.httpClient.get(environment.endpoint+"/payment/getMerchantId",{params: _params});
  }

  getKipleMerchantId(merchantId):Observable<any>{
    let _params = new HttpParams();
    _params = _params.append("merchantId", merchantId);
    return this.httpClient.get(environment.endpoint+"/payment/kipleMerchantId",{params: _params});
  }

  getKiplepayMercRef():Observable<any>{
    return this.httpClient.get(environment.endpoint+"/payment/kipleRefPrefix", {responseType: "text"});
  }

  getUserDeliveryAddress():Observable<any>{
    return this.httpClient.get(environment.endpoint+"/order/user-delivery-address");
  }

  calculateGrandTotal(merchantCode, cartId, deliveryFee): Observable<any>{
    let params: HttpParams = new HttpParams();
    params = params.append("deliveryFee", deliveryFee)
    return this.httpClient.get(environment.endpoint+`/cart/calculateGrandTotal/${merchantCode}/${cartId}`, {params:params});
  }
}
