import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import type { LoginRequest, TokenResponse, RefreshResponse } from '../models/auth.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/api/api`;
  private readonly accessTokenKey = 'access_token';
  private readonly refreshTokenKey = 'refresh_token';

  readonly #authenticated = signal(this.hasStoredToken());
  readonly isAuthenticated = computed(() => this.#authenticated());

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/token/`, credentials).pipe(
      tap((res) => {
        localStorage.setItem(this.accessTokenKey, res.access);
        localStorage.setItem(this.refreshTokenKey, res.refresh);
        this.#authenticated.set(true);
      }),
    );
  }

  refreshToken(): Observable<RefreshResponse> {
    const refresh = localStorage.getItem(this.refreshTokenKey);
    return this.http
      .post<RefreshResponse>(`${this.apiUrl}/token/refresh/`, { refresh })
      .pipe(
        tap((res) => {
          localStorage.setItem(this.accessTokenKey, res.access);
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.#authenticated.set(false);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  private hasStoredToken(): boolean {
    return !!localStorage.getItem(this.accessTokenKey);
  }
}
