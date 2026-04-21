import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CartService } from '../services/cart.service';
import { ProductsService } from '../services/products.service';
import { ProductCardComponent } from './product-card.component';

const PAGE_SIZE = 8;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  readonly selectedBrand = signal<string | null>(null);
  readonly currentPage   = signal(1);

  readonly filteredProducts = computed(() => {
    const brand = this.selectedBrand();
    return brand ? this.productsService.byBrand(brand) : this.productsService.productsList();
  });

  readonly totalPages = computed(() =>
    Math.ceil(this.filteredProducts().length / PAGE_SIZE),
  );

  readonly pagedProducts = computed(() => {
    const page  = this.currentPage();
    const start = (page - 1) * PAGE_SIZE;
    return this.filteredProducts().slice(start, start + PAGE_SIZE);
  });

  readonly pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1),
  );

  get brands()  { return this.productsService.brandsList(); }
  get loading() { return this.productsService.loading; }

  constructor(
    private productsService: ProductsService,
    private cartService: CartService,
  ) {}

  selectBrand(brand: string | null) {
    this.selectedBrand.set(this.selectedBrand() === brand ? null : brand);
    this.currentPage.set(1);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  addToCart(productId: string) {
    this.cartService.add(productId);
  }
}
