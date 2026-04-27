import { inject, Injectable, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);

  readonly isDark = signal<boolean>(
    localStorage.getItem('theme') !== 'light'
  );

  constructor() {
    this.apply();
  }

  toggle(): void {
    this.isDark.update(v => !v);
    this.apply();
    localStorage.setItem('theme', this.isDark() ? 'dark' : 'light');
  }

  private apply(): void {
    this.doc.documentElement.setAttribute(
      'data-theme',
      this.isDark() ? 'dark' : 'light'
    );
  }
}
