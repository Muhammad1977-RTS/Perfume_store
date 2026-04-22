import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output, signal } from '@angular/core';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() addToCart = new EventEmitter<string>();

  lightboxOpen = false;
  added = signal(false);

  openLightbox() { this.lightboxOpen = true; }
  closeLightbox() { this.lightboxOpen = false; }

  @HostListener('document:keydown.escape')
  onEscape() { this.lightboxOpen = false; }

  handleAdd() {
    this.addToCart.emit(this.product.id);
    this.added.set(true);
    setTimeout(() => this.added.set(false), 1500);
  }
}
