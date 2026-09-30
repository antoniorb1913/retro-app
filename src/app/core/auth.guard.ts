import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Protege las rutas privadas.
 *
 * Antes solo miraba si **existía** un token en `localStorage`, sin comprobar si seguía siendo
 * válido: con el token caducado te dejaba entrar y luego las peticiones fallaban una a una.
 *
 * Ahora:
 *  1. Si la sesión sirve, entra.
 *  2. Si no sirve pero se puede renovar (hay refresh token), **renueva y entra**. Como el refresh
 *     dura 7 días, en la práctica esto evita que tengas que volver a entrar cada hora.
 *  3. Si no se puede renovar, al login.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  if (!auth.tieneRefreshToken()) {
    return router.parseUrl('/login');
  }

  return auth.refreshToken().pipe(
    map(() => {
      // La renovación ha funcionado pero `isAuthenticated` sigue con el valor viejo: hay que
      // recalcularlo, o la app creería que no hay sesión hasta el próximo recargado.
      auth.actualizarEstadoSesion();
      return true;
    }),
    catchError(() => {
      auth.logout();
      return of(router.parseUrl('/login'));
    }),
  );
};
