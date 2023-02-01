import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationComponent } from '../components/confirmation/confirmation.component';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationService {
  constructor(private _dialog: MatDialog) {}

  open(title?, message?) {
    return this._dialog
      .open(ConfirmationComponent, {
        minWidth: '30vw',
        maxWidth: '90vw',
        maxHeight: '90vh',
        data: { title, message },
      })
      .afterClosed();
  }
}
