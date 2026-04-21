import { CommonModule } from '@angular/common';
import { Component, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product } from '../models/product.model';
import { ProductsService } from '../services/products.service';
import { OrdersService } from '../services/orders.service';

interface AdminOrder {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  items: { name: string; brand: string; price: number; quantity: number }[];
  total_price: number;
  created_at: string;
  status: 'pending' | 'processing' | 'delivered';
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly ordersService   = inject(OrdersService);

  readonly selectedProduct = signal<Product | null>(null);
  readonly saving          = signal(false);
  readonly orders          = signal<AdminOrder[]>([]);
  readonly ordersLoading   = signal(true);

  readonly statuses = [
    { value: 'pending',    label: 'Ожидает' },
    { value: 'processing', label: 'В обработке' },
    { value: 'delivered',  label: 'Доставлен' },
  ];

  get products() { return this.productsService.productsList(); }
  get loading()  { return this.productsService.loading(); }

  name        = '';
  brand       = '';
  price       = 0;
  description = '';
  imageUrl    = '';

  ngOnInit() {
    this.ordersService.getAllOrders().subscribe({
      next:  (data) => { this.orders.set(data as AdminOrder[]); this.ordersLoading.set(false); },
      error: ()     => { this.ordersLoading.set(false); },
    });
  }

  edit(product: Product): void {
    this.selectedProduct.set(product);
    this.name        = product.name;
    this.brand       = product.brand;
    this.price       = product.price;
    this.description = product.description;
    this.imageUrl    = product.imageUrl;
  }

  save(): void {
    if (!this.name || !this.brand || !this.description || !this.imageUrl) return;
    this.saving.set(true);
    const changes = { name: this.name, brand: this.brand, price: Number(this.price), description: this.description, imageUrl: this.imageUrl };
    const selected = this.selectedProduct();
    if (selected) {
      this.productsService.update(selected.id, changes).subscribe({
        next:  () => { this.reset(); this.saving.set(false); },
        error: () => { this.saving.set(false); },
      });
    } else {
      const id = this.createId(this.name) || `prod-${Date.now()}`;
      this.productsService.add({ id, ...changes }).subscribe({
        next:  () => { this.reset(); this.saving.set(false); },
        error: () => { this.saving.set(false); },
      });
    }
  }

  delete(id: string): void {
    if (!confirm('Удалить товар навсегда из базы данных?')) return;
    this.productsService.remove(id).subscribe({
      next: () => { if (this.selectedProduct()?.id === id) this.reset(); },
    });
  }

  changeStatus(order: AdminOrder, status: string): void {
    this.ordersService.updateStatus(order.id, status).subscribe({
      next: () => {
        this.orders.update(list =>
          list.map(o => o.id === order.id ? { ...o, status: status as AdminOrder['status'] } : o)
        );
      },
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = { pending: 'Ожидает', processing: 'В обработке', delivered: 'Доставлен' };
    return map[status] ?? status;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  reset(): void {
    this.selectedProduct.set(null);
    this.name = ''; this.brand = ''; this.price = 0; this.description = ''; this.imageUrl = '';
  }

  private createId(name: string): string {
    return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
}
