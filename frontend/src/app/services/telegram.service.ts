import { Injectable } from '@angular/core';
import { Order } from '../models/order.model';

const STORAGE_KEY = 'perfume-store-telegram-sent-order';

@Injectable({
  providedIn: 'root',
})
export class TelegramService {
  sendOrder(order: Order): Promise<void> {
    const payload = {
      destination: 'owner-telegram-mock',
      sentAt: new Date().toISOString(),
      order,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    console.log('Telegram mock dispatch:', payload);

    return new Promise((resolve) => {
      setTimeout(resolve, 450);
    });
  }
}
