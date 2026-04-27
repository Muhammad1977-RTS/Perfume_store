import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './site-header.component.html',
  styleUrls: ['./site-header.component.scss'],
})
export class SiteHeaderComponent {
  readonly cartService  = inject(CartService);
  readonly authService  = inject(AuthService);
  readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/');
  }
}
