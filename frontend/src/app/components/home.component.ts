import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CartService } from '../services/cart.service';
import { ProductsService } from '../services/products.service';
import { ProductCardComponent } from './product-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  readonly selectedBrand = signal<string | null>(null);

  readonly filteredProducts = computed(() => {
    const brand = this.selectedBrand();
    return brand ? this.productsService.byBrand(brand) : this.productsService.productsList();
  });

  get brands() {
    return this.productsService.brandsList();
  }

  get loading() { return this.productsService.loading; }

  constructor(
    private productsService: ProductsService,
    private cartService: CartService,
  ) {}

  selectBrand(brand: string | null) {
    this.selectedBrand.set(this.selectedBrand() === brand ? null : brand);
  }

  addToCart(productId: string) {
    this.cartService.add(productId);
  }
}
