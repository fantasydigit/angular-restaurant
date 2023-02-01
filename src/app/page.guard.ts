import { Injectable } from "@angular/core";
import {
    CanActivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    UrlTree,
    Router,
} from "@angular/router";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { AuthService } from "./shared/services/auth.service";
import { RequestUtilService } from "./shared/services/request-util.service";

@Injectable({
    providedIn: "root",
})
export class PageGuard implements CanActivate {
    constructor(
        private _auth: AuthService,
        private _reqUtil: RequestUtilService,
        private _router: Router
    ) {}

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ):
        | Observable<boolean | UrlTree>
        | Promise<boolean | UrlTree>
        | boolean
        | UrlTree {
        return this._auth.getAuth().pipe(
            map((value, index) => {
                console.log(true)
                return true;
            }),
            catchError((err, caught) => {
                console.log(false)
                return of(false);
            })
        );
    }
}
