import { CommonModule } from '@angular/common';
import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { OrdersService } from '../services/orders.service';
import { AuthService } from '../services/auth.service';

interface BackendOrder {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  items: { name: string; brand: string; price: number; quantity: number }[];
  total_price: number;
  created_at: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent implements OnInit {
  private readonly ordersService = inject(OrdersService);
  readonly authService = inject(AuthService);

  readonly orders  = signal<BackendOrder[]>([]);
  readonly loading = signal(true);
  readonly error   = signal('');

  ngOnInit() {
    this.ordersService.getMyOrders().subscribe({
      next: (data) => {
        this.orders.set(data as unknown as BackendOrder[]);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Не удалось загрузить заказы.');
        this.loading.set(false);
      },
    });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('ru-RU', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  itemTotal(item: { price: number; quantity: number }): number {
    return item.price * item.quantity;
  }
}
