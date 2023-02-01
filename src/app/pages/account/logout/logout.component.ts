import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { SocialAuthService } from 'angularx-social-login';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {

  url;

  constructor(private auth:AuthService, private router:Router, private authService:SocialAuthService) { }

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.url = event.url;
      }
});
    this.logout();
  }

  logout() {
    this.auth.logout();
    this.authService.signOut();
  }
}
