import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";

@Injectable({
   providedIn: "root",
})
export class AuthService {
   private endpoint = environment.endpoint;
   jwtTokenKey = "KEY_JWT_TOKEN";
   userDetailsKey = "KEY_USER_DETAILS";
   emailKey = "KEY_LOGGED_EMAIL";

   constructor(private _httpClient: HttpClient, private _router: Router) {}

   auth(email, password): Observable<any> {
      return this._httpClient
         .post(this.endpoint + "/authenticate", {
            username: email,
            password,
         })
         .pipe(
            map((res: any) => {
               localStorage.setItem(this.jwtTokenKey, res.id_token);
            })
         );
   }

   getAuth(): Observable<any> {
      return this._httpClient.get(this.endpoint + "/authenticate").pipe(
         map((res: any) => {
            if (res) {
               localStorage.setItem(this.emailKey, res.auth_email);
            } else {
               localStorage.removeItem(this.jwtTokenKey);
               localStorage.removeItem(this.userDetailsKey);
               localStorage.removeItem(this.emailKey);
            }
            return res;
         })
      );
   }

   register(body): Observable<any> {
      return this._httpClient.post(this.endpoint + "/register", body);
   }

   resetPassword(email): Observable<any> {
      let params = new HttpParams();
      params = params.append("mail", email);
      return this._httpClient.post(this.endpoint + "/account/reset-password/init", null, {
         params,
      });
   }

   finishResetPassword(key, newPassword): Observable<any> {
      return this._httpClient.post(this.endpoint + "/account/reset-password/finish", {
         key,
         newPassword,
      });
   }

   finishActivateAccount(key): Observable<any> {
      let params = new HttpParams();
      params = params.append("key", key);
      return this._httpClient.get(this.endpoint + "/activate", {
         params,
      });
   }

   checkSession() {
      if (localStorage.getItem(this.jwtTokenKey) == null) {
         return false;
      } else {
         return true;
      }
   }

   logout() {
      localStorage.removeItem(this.jwtTokenKey);
      localStorage.removeItem(this.userDetailsKey);
      localStorage.removeItem(this.emailKey);
      //this._router.navigate(["auth", "login"]);
   }

   loginFromSocial(body):Observable<any> {
      return this._httpClient
         .post(this.endpoint + "/social-authentication", body)
         .pipe(
            map((res: any) => {
               localStorage.setItem(this.jwtTokenKey, res.id_token);
            })
         );
   }

   getCurrentLogin(): Observable<any>{
      return this._httpClient.get(this.endpoint + "/account");
   }

   get authenticated() {
      return localStorage.getItem(this.jwtTokenKey) || sessionStorage.getItem(this.jwtTokenKey)
   }
   
}
