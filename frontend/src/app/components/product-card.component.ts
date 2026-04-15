import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
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

  openLightbox() { this.lightboxOpen = true; }
  closeLightbox() { this.lightboxOpen = false; }

  handleAdd() {
    this.addToCart.emit(this.product.id);
  }
}
