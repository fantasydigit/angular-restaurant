import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../environments/environment";
@Injectable({
    providedIn: "root",
})
export class SearchService {
    constructor(private httpClient: HttpClient) {}

    private apiEndpoint = environment.endpoint + "/merchant";

    read(): Observable<any> {
        return this.httpClient.get(this.apiEndpoint);
    }

    readTags(): Observable<any> {
        return this.httpClient.get(this.apiEndpoint + "/allTags");
    }

    search(shopName): Observable<any> {
        let params = new HttpParams();
        params = params.append("shopName", shopName);
        return this.httpClient.get(this.apiEndpoint + "/search", {
            params: params,
            responseType: "text"
        });
    }
}
