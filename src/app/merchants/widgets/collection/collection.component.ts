import { Component, OnInit, Input } from "@angular/core";
import { Router } from "@angular/router";
import { CollectionSlider } from "../../../shared/data/slider";
import { SearchService } from "../../watch/search.service";

@Component({
    selector: "app-collection",
    templateUrl: "./collection.component.html",
    styleUrls: ["./collection.component.scss"],
})
export class CollectionComponent implements OnInit {
    @Input() categories: any[];
    @Input() category: string;
    @Input() class: string;

    constructor(
        private service: SearchService,
        private router: Router
    ) {}

    ngOnInit(): void {}

    public CollectionSliderConfig: any = CollectionSlider;

    onClickOrderNow(domain) {
        this.router.navigate(['shop', domain]);
        // this.service.search(
        //     domain
        // ).subscribe((res) => {
            
        // });
    }

}
