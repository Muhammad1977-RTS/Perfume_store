import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Order } from '../models/order.model';

const API = '/api/orders';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);

  /**
   * POST /api/orders
   * The backend saves the order to PostgreSQL and sends a Telegram notification.
   */
  create(order: Omit<Order, 'status'>): Observable<Order> {
    return this.http.post<Order>(API, {
      id:           order.id,
      customerName: order.name,
      phone:        order.phone,
      address:      order.address,
      items:        order.items,
      totalPrice:   order.total,
    });
  }
}
