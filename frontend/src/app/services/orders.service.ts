import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Order } from '../models/order.model';
import { AuthService } from './auth.service';

const API = '/api/orders';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http        = inject(HttpClient);
  private readonly authService = inject(AuthService);

  create(order: Omit<Order, 'status'>, guestEmail?: string): Observable<Order> {
    const headers = new HttpHeaders(this.authService.getAuthHeaders());
    return this.http.post<Order>(
      API,
      {
        id:           order.id,
        customerName: order.name,
        phone:        order.phone,
        address:      order.address,
        items:        order.items,
        totalPrice:   order.total,
        guestEmail:   guestEmail ?? null,
      },
      { headers },
    );
  }

  getMyOrders(): Observable<Order[]> {
    const headers = new HttpHeaders(this.authService.getAuthHeaders());
    return this.http.get<Order[]>(`${API}/my`, { headers });
  }

  getAllOrders(): Observable<any[]> {
    const headers = new HttpHeaders(this.authService.getAuthHeaders());
    return this.http.get<any[]>(API, { headers });
  }

  updateStatus(orderId: string, status: string): Observable<any> {
    const headers = new HttpHeaders(this.authService.getAuthHeaders());
    return this.http.patch(`${API}/${orderId}/status`, { status }, { headers });
  }
}
