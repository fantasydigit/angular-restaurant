import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MerchantService {

  constructor(private httpClient: HttpClient) { 
  }

  private _listners = new Subject<any>();

  private apiEndpoint = environment.endpoint + "/merchant";

  // if different merchant shop selected
  changeMerchantEvent = new Subject<any>()

  getShopname(merchantId): Observable<any> {
    return this.httpClient.get(this.apiEndpoint + "/get-shopname/" + merchantId);
  }

  listen(): Observable<any> {
    return this._listners.asObservable();
  }

  forward() {
   this._listners.next();
  }

  setMessage() {
    this.changeMerchantEvent.next(1);
  }
}
