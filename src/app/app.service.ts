import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  //https://www.googleapis.com/geolocation/v1/geolocate?key=YOUR_API_KEY

  constructor(private httpClient: HttpClient) { }

  private googleMapApiPath = "https://www.googleapis.com/geolocation/v1/geolocate?key=";

  private googleMapApiKey = environment.googleMapApiKey;

  getLatLng(): Observable<any> {
    return this.httpClient.post(this.googleMapApiPath + this.googleMapApiKey, null);
  }
}
