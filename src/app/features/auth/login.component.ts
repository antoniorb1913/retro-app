import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  protected email = '';
  protected password = '';
  protected loading = signal(false);
  protected error = signal('');

  protected login(): void {
    if (!this.email || !this.password) {
      this.error.set('Email y contraseña son requeridos');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/']),
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(this.mensajeDeError(error));
      },
    });
  }

  /**
   * Traduce el error del login a un mensaje útil.
   *
   * El 429 (demasiados intentos) es importante distinguirlo: desde la tarea E6 la API limita los
   * intentos de login, y en ese caso la contraseña **puede ser correcta**. Decir "Credenciales
   * inválidas" sería engañoso y haría pensar que el problema es la contraseña.
   */
  private mensajeDeError(error: HttpErrorResponse): string {
    if (error.status === 429) {
      return 'Demasiados intentos. Espera un minuto e inténtalo de nuevo.';
    }
    return 'Credenciales inválidas';
  }
}
