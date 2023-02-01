import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment'
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private httpClient: HttpClient) { }

  private apiEndpoint = environment.endpoint + "/merchant";

  read(): Observable<any> {
    return this.httpClient.get(this.apiEndpoint);
  }
  search(shopName): Observable<any>{
    let params = new HttpParams();
    params = params.append('shopName', shopName);
    return this.httpClient.get(this.apiEndpoint+'/search',{params: params});
  }
}
