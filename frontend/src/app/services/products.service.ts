import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Product } from '../models/product.model';
import { AuthService } from './auth.service';

const API = '/api/products';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly http        = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private get adminHeaders() {
    return { headers: new HttpHeaders(this.authService.getAuthHeaders()) };
  }

  private readonly _products = signal<Product[]>([]);
  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);

  readonly productsList = computed(() => this._products());
  readonly brandsList   = computed(() =>
    [...new Set(this._products().map((p) => p.brand))].sort(),
  );

  constructor() {
    this.loadAll();
  }

  // ── Public read API ─────────────────────────────────────────────────────────

  get list()   { return this.productsList(); }
  get brands() { return this.brandsList(); }

  findById(id: string): Product | null {
    return this._products().find((p) => p.id === id) ?? null;
  }

  byBrand(brand: string): Product[] {
    return this._products().filter((p) => p.brand === brand);
  }

  // ── Load ────────────────────────────────────────────────────────────────────

  loadAll(): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<Product[]>(API).subscribe({
      next:  (products) => { this._products.set(products); this.loading.set(false); },
      error: (err)      => { this.error.set(err.message);  this.loading.set(false); },
    });
  }

  // ── CRUD ────────────────────────────────────────────────────────────────────

  add(product: Omit<Product, 'id'> & { id?: string }): Observable<Product> {
    return this.http.post<Product>(API, product, this.adminHeaders).pipe(tap(() => this.loadAll()));
  }

  update(id: string, changes: Partial<Product>): Observable<Product> {
    const current = this.findById(id)!;
    return this.http
      .put<Product>(`${API}/${id}`, { ...current, ...changes }, this.adminHeaders)
      .pipe(tap(() => this.loadAll()));
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/${id}`, this.adminHeaders).pipe(tap(() => this.loadAll()));
  }
}
