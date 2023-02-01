import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SuccessService {

  private endpoint = environment.endpoint + "/order";

  orderId;

  private _listners = new Subject<any>();

  constructor(
    private httpClient: HttpClient
  ) { }


  getOrderDetails(merchantId, orderId, firstname?):Observable<any>{
    let params:HttpParams = new HttpParams();
    if(firstname){
      params = params.append("firstname", firstname);
    }
    return this.httpClient.get(this.endpoint + "/" +merchantId + "/"+orderId, {params: params});
  }

  listen(): Observable<any> {
		return this._listners.asObservable();
	}
	
	filter() {
	  this._listners.next();
	}
}
