import { CommonModule } from '@angular/common';
import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent {
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);

  mode     = signal<'login' | 'register'>('login');
  email    = '';
  password = '';
  name     = '';
  busy     = signal(false);
  error    = signal('');

  toggle() {
    this.mode.set(this.mode() === 'login' ? 'register' : 'login');
    this.error.set('');
  }

  submit() {
    if (!this.email || !this.password) return;
    this.busy.set(true);
    this.error.set('');

    const req = this.mode() === 'login'
      ? this.authService.login(this.email, this.password)
      : this.authService.register(this.email, this.password, this.name);

    req.subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: (err) => {
        this.error.set(err.error?.error ?? 'Ошибка. Попробуйте ещё раз.');
        this.busy.set(false);
      },
    });
  }
}
