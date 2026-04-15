import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product } from '../models/product.model';
import { ProductsService } from '../services/products.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent {
  readonly selectedProduct = signal<Product | null>(null);
  readonly saving = signal(false);

  get products() { return this.productsService.productsList(); }
  get loading()  { return this.productsService.loading(); }

  name        = '';
  brand       = '';
  price       = 0;
  description = '';
  imageUrl    = '';

  constructor(private readonly productsService: ProductsService) {}

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

    const changes = {
      name:        this.name,
      brand:       this.brand,
      price:       Number(this.price),
      description: this.description,
      imageUrl:    this.imageUrl,
    };

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
      next: () => {
        if (this.selectedProduct()?.id === id) this.reset();
      },
    });
  }

  reset(): void {
    this.selectedProduct.set(null);
    this.name        = '';
    this.brand       = '';
    this.price       = 0;
    this.description = '';
    this.imageUrl    = '';
  }

  private createId(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
