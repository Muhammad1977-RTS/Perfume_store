import { Routes } from '@angular/router';
import { AdminComponent } from './components/admin.component';
import { AuthComponent } from './components/auth.component';
import { CartComponent } from './components/cart.component';
import { CheckoutComponent } from './components/checkout.component';
import { HomeComponent } from './components/home.component';
import { OrdersComponent } from './components/orders.component';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'login', component: AuthComponent },
  { path: 'orders', component: OrdersComponent },
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: '' },
];
