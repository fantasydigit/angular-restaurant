import { Component, OnInit } from '@angular/core';
import { FormGroupName, FormGroup, FormControlName, FormControl } from '@angular/forms';
import { SearchService } from './search.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router'

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  public grid: string = 'col-xl-3 col-md-6';
  public layoutView: string = 'grid-view';
  searchValue: any;
  cookieValue: any;

  merchants = [
    // shopName: 'OctoFest',
    // merchantLogo: 'https://orderkawkawtest.s3.ap-southeast-1.amazonaws.com/logo/kfc/KFC.png'
    ];
  // merchantListing = new FormGroup({
  //   name : new FormControl(),
  // });
  constructor(private service: SearchService,
    private cookieService: CookieService,
    private router: Router,
    ) { }

  ngOnInit(): void {
    this.fetchMerchant();
  }

  fetchMerchant() {
    this.service.read().subscribe((res) => {
      this.merchants = res;
    })
  }

  submitSearch() {
    // this.cookieService.set('shopName', this.searchValue);
    this.service.search(this.searchValue).subscribe((res)=>{
      this.router.navigateByUrl('/shop/'+res)
    }, err =>{

    })
    
    // this.cookieValue = this.cookieService.get('shopName');
    // console.log(this.cookieValue)
  }
}
