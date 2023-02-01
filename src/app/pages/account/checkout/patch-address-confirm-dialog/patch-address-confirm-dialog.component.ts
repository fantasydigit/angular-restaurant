import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-patch-address-confirm-dialog',
  templateUrl: './patch-address-confirm-dialog.component.html',
  styleUrls: ['./patch-address-confirm-dialog.component.scss']
})
export class PatchAddressConfirmDialogComponent implements OnInit {
  addressObj;
  constructor(private matDialogRef:MatDialogRef<PatchAddressConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data ) {
      this.addressObj = this.data.address;
     }

  ngOnInit(): void {
  }

  closeDialog(useAddress:Boolean){
    this.matDialogRef.close(useAddress);
  }

}
