import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService, tokenCaducado } from './auth.service';
import { environment } from '../../environments/environment';
import type { RefreshResponse } from '../models/auth.interface';

/** Construye un JWT de mentira con la fecha de caducidad que se le pida (en segundos). */
function jwtConCaducidad(segundosDeVida: number): string {
  const ahoraEnSegundos = Math.floor(Date.now() / 1000);
  const carga = { token_type: 'access', exp: ahoraEnSegundos + segundosDeVida, user_id: 1 };
  return `cabecera.${btoa(JSON.stringify(carga))}.firma`;
}

/** Construye un JWT cuyo contenido es exactamente el que se le pase. */
function jwtConCarga(carga: Record<string, unknown>): string {
  return `cabecera.${btoa(JSON.stringify(carga))}.firma`;
}

describe('tokenCaducado', () => {
  it('da por bueno un token que aún vive', () => {
    expect(tokenCaducado(jwtConCaducidad(3600))).toBe(false);
  });

  it('da por bueno un token que caduca dentro de un segundo', () => {
    expect(tokenCaducado(jwtConCaducidad(1))).toBe(false);
  });

  it('rechaza un token caducado hace diez minutos', () => {
    expect(tokenCaducado(jwtConCaducidad(-600))).toBe(true);
  });

  it('rechaza un token caducado hace ocho días', () => {
    expect(tokenCaducado(jwtConCaducidad(-8 * 24 * 3600))).toBe(true);
  });

  it('rechaza un token sin fecha de caducidad', () => {
    expect(tokenCaducado(jwtConCarga({ token_type: 'access', user_id: 1 }))).toBe(true);
  });

  it('rechaza un token con la caducidad en un formato que no es una fecha', () => {
    expect(tokenCaducado(jwtConCarga({ exp: 'mañana' }))).toBe(true);
  });

  it('rechaza un texto que no es un JWT', () => {
    expect(tokenCaducado('esto.no.es.un.jwt')).toBe(true);
  });

  it('rechaza la cadena vacía y el valor nulo', () => {
    expect(tokenCaducado('')).toBe(true);
    expect(tokenCaducado(null)).toBe(true);
  });
});

describe('AuthService', () => {
  let servicio: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  describe('saber si hay sesión aprovechable', () => {
    it('no hay sesión si no hay token guardado', () => {
      expect(servicio.isAuthenticated()).toBe(false);
    });

    it('hay sesión con un token que aún vive', () => {
      localStorage.setItem('access_token', jwtConCaducidad(3600));
      servicio.actualizarEstadoSesion();

      expect(servicio.isAuthenticated()).toBe(true);
    });

    it('no hay sesión con un token caducado', () => {
      localStorage.setItem('access_token', jwtConCaducidad(-600));
      servicio.actualizarEstadoSesion();

      expect(servicio.isAuthenticated()).toBe(false);
    });

    it('no hay sesión si lo guardado no es un token', () => {
      localStorage.setItem('access_token', 'basura');
      servicio.actualizarEstadoSesion();

      expect(servicio.isAuthenticated()).toBe(false);
    });

    it('sabe si hay refresh con el que renovar', () => {
      expect(servicio.tieneRefreshToken()).toBe(false);

      localStorage.setItem('refresh_token', 'un-refresh');
      expect(servicio.tieneRefreshToken()).toBe(true);
    });
  });

  describe('renovar el token', () => {
    it('pide la renovación una sola vez aunque se le llame varias veces a la vez', () => {
      localStorage.setItem('refresh_token', 'un-refresh');
      const respuestasRecibidas: RefreshResponse[] = [];

      for (let i = 0; i < 4; i++) {
        servicio.refreshToken().subscribe((res) => respuestasRecibidas.push(res));
      }

      http.expectOne(`${environment.apiUrl}/api/api/token/refresh/`).flush({ access: 'nuevo' });
      http.verify();

      // Lo importante: UNA petición al servidor y las 4 llamadas reciben su respuesta.
      expect(respuestasRecibidas.length).toBe(4);
      expect(respuestasRecibidas.every((res) => res.access === 'nuevo')).toBe(true);
    });

    it('guarda el token nuevo cuando la renovación va bien', () => {
      localStorage.setItem('refresh_token', 'un-refresh');
      servicio.refreshToken().subscribe();

      http.expectOne(`${environment.apiUrl}/api/api/token/refresh/`).flush({ access: 'nuevo' });

      expect(localStorage.getItem('access_token')).toBe('nuevo');
    });

    it('vuelve a pedir una renovación nueva en la siguiente ocasión', () => {
      localStorage.setItem('refresh_token', 'un-refresh');

      servicio.refreshToken().subscribe();
      http.expectOne(`${environment.apiUrl}/api/api/token/refresh/`).flush({ access: 'primero' });

      // Si se reutilizara la respuesta anterior, el token se quedaría viejo para siempre.
      servicio.refreshToken().subscribe();
      http.expectOne(`${environment.apiUrl}/api/api/token/refresh/`).flush({ access: 'segundo' });

      expect(localStorage.getItem('access_token')).toBe('segundo');
    });
  });

  describe('cerrar sesión', () => {
    it('borra los dos tokens y deja de haber sesión', () => {
      localStorage.setItem('access_token', jwtConCaducidad(3600));
      localStorage.setItem('refresh_token', 'un-refresh');
      servicio.actualizarEstadoSesion();
      expect(servicio.isAuthenticated()).toBe(true);

      servicio.logout();

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(servicio.isAuthenticated()).toBe(false);
    });
  });
});
