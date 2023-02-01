import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class RequestUtilService {

  constructor(
    private _snack: MatSnackBar,
    private _translate: TranslateService
  ) { }

  reqSuccess(message?) {
    let msg = "SUCCESS"
    if (message) {
      msg = message
    }
    this.openSnack(msg)
  }

  reqError(error, message?) {
    let msg = "ERROR"
    if (message) {
      msg = message
    }
    if (error && error.error && error.error.title) {
      msg = error.error.title
    }
    this.openSnack(msg)
  }

  reqComplete(message?) {
    let msg = "COMPLETE"
    if (message) {
      msg = message
    }
    // this.openSnack(msg)
  }

  private openSnack(message) {
    this._snack.open(
      this._translate.instant(message),
      this._translate.instant("OK"),
      {
        duration: 3000
      }
    )
  }

}
