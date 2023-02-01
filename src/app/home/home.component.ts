import { Component, OnDestroy, OnInit } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { SessionStorageService } from "ngx-webstorage";
import { Product } from "../shared/classes/product";
import { CollectionSlider, ProductSlider } from "../shared/data/slider";
import { SearchService } from "./search.service";

@Component({
    selector: "app-home",
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit, OnDestroy {
    public themeLogo: string = "assets/images/icon/FA_orderkawkaw_logo-03.png";

    public products: Product[] = [];
    public productCollections: any[] = [];

    public ProductSliderConfig: any = ProductSlider;
    public CollectionSliderConfig: any = CollectionSlider;
    merchants: any;
    searchValue: any;
    filter1: any = "";
    filter2: any = "";

    infoMsg: any;
    placeholderUrl = "https://via.placeholder.com/300";

    allTags = [];
    halalNonHalal = [];
    merchantCategories = [];

    constructor(
        private _sanitizer: DomSanitizer,
        private service: SearchService,
        private router: Router,
        private sessionStorage: SessionStorageService
    ) {
    }


    // Collection
    public categories: any[] = [
    ];

    // collection
    public collections: any[] = [
        {
            image: "assets/images/collection/watch/1.jpg",
            title: "minimum 10% off",
            text: "new watch",
        },
        {
            image: "assets/images/collection/watch/2.jpg",
        },
        {
            image: "assets/images/collection/watch/3.jpg",
            title: "minimum 10% off",
            text: "gold watch`",
        },
    ];

    diffCatsMerchant;
        
    ngOnInit(): void {
        // Change color for this layout
        document.documentElement.style.setProperty(
            "--theme-deafult",
            "#e4604a"
        );
        this.sessionStorage.clear('merchant') // David: To avoid cart display on home page
        this.fetchMerchant();
    }

    ngOnDestroy(): void {
        // Remove Color
        document.documentElement.style.removeProperty("--theme-deafult");
    }

    // Product Tab collection
    getCollectionProducts(collection) {
        return this.products.filter((item) => {
            if (item.collection.find((i) => i === collection)) {
                return item;
            }
        });
    }

    fetchMerchant() {
        this.service.read().subscribe((res) => {
            this.merchants = res;
            this.fetchTags();
        });
    }

    fetchTags() {
        this.service.readTags().subscribe((res) => {
            this.allTags = res;
            this.processHalalTag();
            this.processCategoriesTag();
            this.processMerchants();
        });
    }

    processHalalTag() {
        for(let x = 1; x < 3; x++) {
            let tag = this.allTags[x];
            this.halalNonHalal.push(tag);
        }
    }

    processCategoriesTag() {
        for(let x = 3; x < this.allTags.length; x++) {
            let tag = this.allTags[x];
            this.merchantCategories.push(tag);
        }
    }

    search() {
        let filterCat1;
        let filterCat2;
        let testing = [];
        let tag;
        this.processMerchants();

        this.diffCatsMerchant.forEach(cat => {
            if(cat.tag == this.filter1) {
                filterCat1 = cat;
            }
        });

        this.diffCatsMerchant.forEach(cat => {
            if(cat.tag == this.filter2) {
                filterCat2 = cat;
            }
        });
        this.diffCatsMerchant = [];
        
        if(filterCat1 == null) {
            if(filterCat2 != null) {
                if(this.filter1 == null || this.filter1 == "") {
                    this.diffCatsMerchant.push(filterCat2)
                }
            }
        } else {
            if(filterCat2 == null) {
                if(this.filter2 == null || this.filter2 == ""){
                    this.diffCatsMerchant.push(filterCat1)
                }
                
            } else {
                tag = this.filter1 + ", " + this.filter2;
                filterCat1.categories.forEach(element1 => {
                    filterCat2.categories.forEach(element2 => {
                        if(element1.id == element2.id) {
                            testing.push(element1);
                        }
                    });
                });
                let object = {}
                object['tag'] = tag;
                object['categories'] = testing;
                this.diffCatsMerchant.push(object)
            }
        }
    }

    resetFilter() {
        this.filter1 = "";
        this.filter2 = "";
        this.processMerchants();
        
    }

    processMerchants() {
        let placeholder;
        this.categories = [];
        let array = [];
        for(var x = 0; x < this.allTags.length; x++) {
            let tag = this.allTags[x];
            let object = {};
            
            object['tag'] = tag;
            object['categories'] = [];
            console.log(this.merchants);
            this.merchants.forEach((merchant) => {
                if(merchant['tags'].includes(tag)) {
                    let categoryDetail = {
                        id: merchant.id,
                        title: merchant.shopName,
                        domain: merchant.domain,
                        image: merchant.merchantLogo || this.placeholderUrl,
                        background: merchant.merchantBackground,
                        deleted: merchant.deleted
                    }
                    object['categories'].push(categoryDetail);
                }
            });
            if(object['categories'].length > 0) {
                array.push(object);
            }
        }

        let object = {};
        object['tag'] = "Other";
        object['categories'] = [];
        
        this.merchants.forEach((merchant) => {
            if(merchant['tags'] == "" || merchant['tags'] == null) {
                let categoryDetail = {
                    id: merchant.id,
                    title: merchant.shopName,
                    domain: merchant.domain,
                    image: merchant.merchantLogo || this.placeholderUrl,
                    background: merchant.merchantBackground,
                    deleted: merchant.deleted
                }
                object['categories'].push(categoryDetail);
            }
        });

        if(object['categories'].length > 0) {
            array.push(object);
        }
        this.diffCatsMerchant = array;
    }

    submitSearch() {
        this.service.search(this.searchValue).subscribe(
            (res) => {
                this.router.navigate(["shop", res]);
            },
            (err) => {
                this.infoMsg = "The restaurant is not available. ";
                this.infoMsg = this.infoMsg + "Please try again or ";
                this.infoMsg =
                    this.infoMsg + "pick from our available restaurant below. ";
            }
        );
    }

    toNumber(){
        console.log(this.filter1)
        console.log(this.filter2)
    }
}
