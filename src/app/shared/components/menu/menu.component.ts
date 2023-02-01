import { Component, OnInit } from '@angular/core';
import { NavService, Menu } from '../../services/nav.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  public menuItems: Menu[];

  constructor(private router: Router, public navServices: NavService, private auth:AuthService) {
    if (this.auth.checkSession()) {
      this.navServices.itemsSession.subscribe(menuItems => this.menuItems = menuItems );
    } else {
      this.navServices.items.subscribe(menuItems => this.menuItems = menuItems );
    }
    this.router.events.subscribe((event) => {
      this.navServices.mainMenuToggle = false;
    });
    console.log("INI");
  }

  ngOnInit(): void {
  }

  mainMenuToggle(): void {
    this.navServices.mainMenuToggle = !this.navServices.mainMenuToggle;
  }

  // Click Toggle menu (Mobile)
  toggletNavActive(item) {
    item.active = !item.active;
  }

  changeTitle(menuItem){
    console.log(menuItem);
    if(menuItem.title === "logout") {
      console.log("EQUALS")
      this.navServices.filterLogOut();
    }
  }

}
