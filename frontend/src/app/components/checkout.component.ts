import { CommonModule } from '@angular/common';
import { Component, signal, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Order } from '../models/order.model';
import { CartService } from '../services/cart.service';
import { OrdersService } from '../services/orders.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent {
  readonly cartService  = inject(CartService);
  private readonly ordersService = inject(OrdersService);
  readonly authService  = inject(AuthService);

  name       = '';
  phone      = '';
  address    = '';
  guestEmail = '';

  readonly submitted        = signal(false);
  readonly busy             = signal(false);
  readonly message          = signal('');
  readonly showRegisterPrompt = signal(false);

  // Registration form (shown after guest order)
  regPassword = '';
  regBusy     = signal(false);
  regMessage  = signal('');
  regDone     = signal(false);

  totalQuantityLabel(): string {
    const n = this.cartService.totalQuantity();
    const mod10 = n % 10, mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return `${n} товар`;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} товара`;
    return `${n} товаров`;
  }

  submit(form: NgForm): void {
    if (form.invalid || !this.cartService.itemsWithProduct().length) return;

    this.busy.set(true);

    const items = this.cartService.itemsWithProduct().map((item) => ({
      productId: item.productId,
      name:      item.product.name,
      brand:     item.product.brand,
      price:     item.product.price,
      quantity:  item.quantity,
    }));

    const order: Omit<Order, 'status'> = {
      id:        `order-${Date.now()}`,
      name:      this.name,
      phone:     this.phone,
      address:   this.address,
      items,
      total:     this.cartService.totalPrice(),
      createdAt: new Date().toISOString(),
    };

    const guestEmail = !this.authService.isLoggedIn() ? this.guestEmail : undefined;

    this.ordersService.create(order, guestEmail).subscribe({
      next: () => {
        this.cartService.clear();
        this.message.set('Заказ успешно оформлен! Мы скоро свяжемся с вами.');
        this.submitted.set(true);
        this.busy.set(false);
        if (!this.authService.isLoggedIn()) {
          this.showRegisterPrompt.set(true);
        }
        form.resetForm();
      },
      error: () => {
        this.message.set('Ошибка при оформлении заказа. Попробуйте ещё раз.');
        this.busy.set(false);
      },
    });
  }

  registerAfterOrder(): void {
    if (!this.guestEmail || !this.regPassword) return;
    this.regBusy.set(true);
    this.authService.register(this.guestEmail, this.regPassword, this.name).subscribe({
      next: () => {
        this.regMessage.set('Аккаунт создан! Теперь вы можете отслеживать заказы.');
        this.regDone.set(true);
        this.regBusy.set(false);
        this.showRegisterPrompt.set(false);
      },
      error: (err) => {
        const msg = err.error?.error ?? 'Ошибка регистрации';
        this.regMessage.set(msg);
        this.regBusy.set(false);
      },
    });
  }

  dismissRegisterPrompt(): void {
    this.showRegisterPrompt.set(false);
  }
}
