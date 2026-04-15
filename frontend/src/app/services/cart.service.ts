import { Injectable, computed, signal } from '@angular/core';
import { CartItem, CartProductItem } from '../models/cart.model';
import { ProductsService } from './products.service';

const STORAGE_KEY = 'perfume-store-cart-v1';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly cart = signal<CartItem[]>(this.loadCart());

  /** Raw cart items (including items whose product may not be loaded yet) */
  readonly items = computed(() => this.cart());

  /** Only items whose product exists in the current product list */
  readonly validCartItems = computed(() =>
    this.cart().filter((item) => this.productsService.findById(item.productId) !== null),
  );

  /** Reactive total quantity (safe to use in templates) */
  private readonly _totalQuantity = computed(() =>
    this.validCartItems().reduce((sum, item) => sum + item.quantity, 0),
  );

  /** Reactive total price (safe to use in templates) */
  private readonly _totalPrice = computed(() =>
    this.validCartItems().reduce((sum, item) => {
      const product = this.productsService.findById(item.productId);
      return product ? sum + product.price * item.quantity : sum;
    }, 0),
  );

  constructor(private readonly productsService: ProductsService) {}

  // ── Getters (return a Signal so templates can call them as functions) ────────

  get totalQuantity() { return this._totalQuantity; }
  get totalPrice()    { return this._totalPrice; }

  // ── Cart mutations ───────────────────────────────────────────────────────────

  add(productId: string): void {
    this.cart.update((items) => {
      const index = items.findIndex((i) => i.productId === productId);
      if (index === -1) return [...items, { productId, quantity: 1 }];
      return items.map((i) =>
        i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i,
      );
    });
    this.saveCart();
  }

  updateQuantity(productId: string, quantity: number): void {
    this.cart.update((items) =>
      items
        .map((i) => (i.productId === productId ? { ...i, quantity: Math.max(1, quantity) } : i))
        .filter((i) => i.quantity > 0),
    );
    this.saveCart();
  }

  remove(productId: string): void {
    this.cart.update((items) => items.filter((i) => i.productId !== productId));
    this.saveCart();
  }

  clear(): void {
    this.cart.set([]);
    this.saveCart();
  }

  // ── Derived view ─────────────────────────────────────────────────────────────

  /**
   * Returns cart items enriched with product details.
   * Safe to call in templates — no side-effects, no signal mutations.
   */
  itemsWithProduct(): CartProductItem[] {
    return this.validCartItems()
      .map((item) => ({
        productId: item.productId,
        quantity:  item.quantity,
        product:   this.productsService.findById(item.productId)!,
      }));
  }

  // ── Persistence ──────────────────────────────────────────────────────────────

  private loadCart(): CartItem[] {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved) as CartItem[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private saveCart(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cart()));
  }
}
