import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

const API       = '/api/auth';
const TOKEN_KEY = 'auth_token';
const USER_KEY  = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private readonly _user  = signal<AuthUser | null>(
    JSON.parse(localStorage.getItem(USER_KEY) ?? 'null'),
  );

  readonly isLoggedIn = computed(() => !!this._token());
  readonly user       = computed(() => this._user());
  readonly token      = computed(() => this._token());

  register(email: string, password: string, name: string) {
    return this.http.post<AuthResponse>(`${API}/register`, { email, password, name }).pipe(
      tap((res) => this.saveSession(res)),
    );
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${API}/login`, { email, password }).pipe(
      tap((res) => this.saveSession(res)),
    );
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._user.set(null);
  }

  getAuthHeaders(): Record<string, string> {
    const token = this._token();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private saveSession(res: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this._token.set(res.token);
    this._user.set(res.user);
  }
}
