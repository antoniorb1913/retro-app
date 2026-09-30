import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import type { LoginRequest, TokenResponse, RefreshResponse } from '../models/auth.interface';

/**
 * Lee la fecha de caducidad (`exp`) del propio token JWT.
 *
 * No se verifica la firma **a propósito**: el token ya viene firmado por el servidor, y aquí solo
 * se usa para saber si merece la pena lanzar una petición. Comprobar la firma en el navegador no
 * aporta seguridad (el cliente no es de fiar) y obligaría a añadir una librería.
 *
 * Devuelve `true` (caducado) cuando el token no se puede leer: ante la duda, se trata como
 * caducado y se renueva. Es más seguro que dar por bueno algo ilegible.
 */
export function tokenCaducado(token: string | null): boolean {
  if (!token) return true;

  try {
    const payload = token.split('.')[1];
    if (!payload) return true;

    const datos = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    const expira = datos?.exp;

    if (typeof expira !== 'number') return true;

    return expira * 1000 <= Date.now();
  } catch {
    return true;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/api/api`;
  private readonly accessTokenKey = 'access_token';
  private readonly refreshTokenKey = 'refresh_token';

  private readonly http = inject(HttpClient);

  readonly #authenticated = signal(this.haySesionUtilizable());

  /**
   * ¿Hay sesión aprovechable? Es decir: el access token existe **y** no ha caducado.
   *
   * Antes esto solo miraba si existía algo en `localStorage`, así que un token caducado o incluso
   * un texto inventado contaban como sesión válida.
   */
  readonly isAuthenticated = computed(() => this.#authenticated());

  /**
   * Renovación de token **compartida**.
   *
   * Si varias peticiones reciben un 401 a la vez (algo habitual: una pantalla pide consolas,
   * juegos y accesorios en paralelo), todas esperan a **la misma** petición de refresco en vez de
   * lanzar una cada una. Antes se lanzaban tantas como respuestas 401 llegaran, lo que además
   * choca con el límite de intentos de la API (10 por minuto) y podía expulsar al usuario.
   *
   * `shareReplay({ bufferSize: 1, refCount: true })` hace dos cosas: comparte la respuesta entre
   * los que están esperando y, al terminar, olvida el resultado para que la próxima vez se pida
   * uno nuevo (si no, se reutilizaría un token ya viejo).
   */
  #renovacion$: Observable<RefreshResponse> | null = null;

  login(credentials: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/token/`, credentials).pipe(
      tap((res) => {
        localStorage.setItem(this.accessTokenKey, res.access);
        localStorage.setItem(this.refreshTokenKey, res.refresh);
        this.#authenticated.set(true);
      }),
    );
  }

  /**
   * Renueva el access token. Varias llamadas a la vez comparten una sola petición.
   */
  refreshToken(): Observable<RefreshResponse> {
    if (this.#renovacion$) return this.#renovacion$;

    const refresh = localStorage.getItem(this.refreshTokenKey);

    this.#renovacion$ = this.http
      .post<RefreshResponse>(`${this.apiUrl}/token/refresh/`, { refresh })
      .pipe(
        tap((res) => localStorage.setItem(this.accessTokenKey, res.access)),
        // Al terminar (bien o mal) se olvida, para que la próxima renovación sea una petición nueva.
        tap({
          finalize: () => {
            this.#renovacion$ = null;
          },
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
      );

    return this.#renovacion$;
  }

  logout(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.#authenticated.set(false);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  /** ¿Hay un refresh token guardado con el que se pueda intentar renovar? */
  tieneRefreshToken(): boolean {
    return !!localStorage.getItem(this.refreshTokenKey);
  }

  /** Vuelve a calcular si la sesión sirve (por ejemplo, después de entrar o salir). */
  actualizarEstadoSesion(): void {
    this.#authenticated.set(this.haySesionUtilizable());
  }

  private haySesionUtilizable(): boolean {
    return !tokenCaducado(localStorage.getItem(this.accessTokenKey));
  }
}
