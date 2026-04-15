import { Routes } from '@angular/router';
import { AdminComponent } from './components/admin.component';
import { CartComponent } from './components/cart.component';
import { CheckoutComponent } from './components/checkout.component';
import { HomeComponent } from './components/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo: '' },
];
