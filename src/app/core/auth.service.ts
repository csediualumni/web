import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    permissions: string[];
    roles: { id: string; name: string }[];
  };
}

export interface AuthUser {
  id: string;
  email: string;
  permissions: string[];
  roles: { id: string; name: string }[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base = `${environment.apiUrl}/auth`;

  readonly currentUser = signal<AuthUser | null>(this.loadUser());

  constructor(private http: HttpClient) {}

  // ──────────────────────────────────────────────
  // Email / Password
  // ──────────────────────────────────────────────

  register(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.base}/register`, { email, password })
      .pipe(tap((res) => this.persistSession(res)));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.base}/login`, { email, password })
      .pipe(tap((res) => this.persistSession(res)));
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/reset-password`, { token, password });
  }

  // ──────────────────────────────────────────────
  // Google OAuth
  // ──────────────────────────────────────────────

  redirectToGoogle(): void {
    window.location.href = `${this.base}/google`;
  }

  /** Called by the callback component after Google redirects back */
  handleGoogleCallback(token: string, userId: string, email: string): void {
    // Decode JWT to extract permissions + roles
    const payload = this.decodeJwt(token);
    const res: AuthResponse = {
      accessToken: token,
      user: {
        id: userId,
        email,
        permissions: payload?.permissions ?? [],
        roles: payload?.roles ?? [],
      },
    };
    this.persistSession(res);
  }

  // ──────────────────────────────────────────────
  // Session helpers
  // ──────────────────────────────────────────────

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('auth_user');
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasPermission(key: string): boolean {
    return this.currentUser()?.permissions.includes(key) ?? false;
  }

  private decodeJwt(token: string): { permissions?: string[]; roles?: { id: string; name: string }[] } | null {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  private persistSession(res: AuthResponse): void {
    localStorage.setItem('access_token', res.accessToken);
    localStorage.setItem('auth_user', JSON.stringify(res.user));
    this.currentUser.set(res.user);
  }

  private loadUser(): AuthUser | null {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  }
}
