import { Component, OnInit, Input, HostListener } from '@angular/core';
import { Platform } from '@angular/cdk/platform';

@Component({
  selector: 'app-header-one',
  templateUrl: './header-one.component.html',
  styleUrls: ['./header-one.component.scss']
})
export class HeaderOneComponent implements OnInit {
  
  @Input() class: string;
  @Input() themeLogo: string = 'assets/images/icon/FA_orderkawkaw_logo-03.png'; // Default Logo
  @Input() topbar: boolean = true; // Default True
  @Input() sticky: boolean = false; // Default false
  
  public stick: boolean = false;
  isMobile: boolean;

  constructor(
    private _platform: Platform,
  ) { }

  ngOnInit(): void {
    this.isMobile = false;
    if ( this._platform.ANDROID || this._platform.IOS )
        {
            this.isMobile = true;
        }
        console.log("ISMOBILE  :" + this.isMobile);
  }

  // @HostListener Decorator
  @HostListener("window:scroll", [])
  onWindowScroll() {
    let number = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  	if (number >= 300 && window.innerWidth > 400) { 
  	  this.stick = true;
  	} else {
  	  this.stick = false;
  	}
  }

}
