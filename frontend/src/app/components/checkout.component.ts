import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Order } from '../models/order.model';
import { CartService } from '../services/cart.service';
import { OrdersService } from '../services/orders.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent {
  name    = '';
  phone   = '';
  address = '';

  readonly submitted = signal(false);
  readonly busy      = signal(false);
  readonly message   = signal('');

  constructor(
    public  readonly cartService:  CartService,
    private readonly ordersService: OrdersService,
  ) {}

  submit(form: NgForm): void {
    if (form.invalid || !this.cartService.itemsWithProduct().length) return;

    this.busy.set(true);

    // Build order with full product details for Telegram & DB history
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

    this.ordersService.create(order).subscribe({
      next: () => {
        this.cartService.clear();
        this.message.set('Заказ успешно отправлен! Уведомление отправлено в Telegram.');
        this.submitted.set(true);
        this.busy.set(false);
        form.resetForm();
      },
      error: () => {
        this.message.set('Ошибка при оформлении заказа. Попробуйте ещё раз.');
        this.busy.set(false);
      },
    });
  }
}
