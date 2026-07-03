import { Component, inject, signal } from '@angular/core';
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

  protected username = '';
  protected password = '';
  protected loading = signal(false);
  protected error = signal('');

  protected login(): void {
    if (!this.username || !this.password) {
      this.error.set('Email y contraseña son requeridos');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.auth.login({ username: this.username, password: this.password }).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.loading.set(false);
        this.error.set('Credenciales inválidas');
      },
    });
  }
}
