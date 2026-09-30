import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Añade el token a las peticiones y, si el servidor responde 401, intenta renovarlo.
 *
 * Dos cosas que se arreglaron aquí:
 *
 *  1. **Una sola renovación a la vez.** `auth.refreshToken()` comparte la petición, así que si
 *     llegan varios 401 juntos (una pantalla que pide consolas, juegos y accesorios en paralelo)
 *     se lanza **un** refresco y todas las peticiones esperan a él. Antes se lanzaba uno por cada
 *     401, lo que además choca con el límite de intentos de la API y podía expulsar al usuario.
 *  2. **Si no se puede renovar, se va al login.** Antes solo se borraban los tokens: la sesión
 *     desaparecía en silencio y te quedabas en una pantalla que fallaba sin saber por qué.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Entrar y renovar no llevan token ni se reintentan: los gestiona el propio AuthService.
  if (req.url.includes('/api/api/token/')) {
    return next(req);
  }

  const token = auth.getAccessToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req).pipe(
    catchError((error) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }

      return auth.refreshToken().pipe(
        switchMap((res) => {
          const conTokenNuevo = req.clone({
            setHeaders: { Authorization: `Bearer ${res.access}` },
          });
          return next(conTokenNuevo);
        }),
        catchError((errorRenovacion) => {
          // No se pudo renovar: la sesión ha terminado de verdad.
          auth.logout();
          router.navigate(['/login']);
          return throwError(() => errorRenovacion);
        }),
      );
    }),
  );
};
