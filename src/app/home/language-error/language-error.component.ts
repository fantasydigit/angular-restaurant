import { Component, OnInit, Inject } from '@angular/core';
// import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-language-error',
  templateUrl: './language-error.component.html',
  styleUrls: ['./language-error.component.scss']
})
export class LanguageErrorComponent implements OnInit {

	constructor(
		public dialogRef: MatDialogRef<LanguageErrorComponent>,
		@Inject(MAT_DIALOG_DATA) private _data: any,
	) { }

	ngOnInit(): void {
	}

	onClose() {
		this.dialogRef.close();
	}

}
