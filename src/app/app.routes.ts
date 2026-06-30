import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { LayoutComponent } from './core/layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'consoles',
        loadChildren: () =>
          import('./features/consoles/consoles.routes').then((m) => m.consolesRoutes),
      },
      {
        path: 'games',
        loadChildren: () =>
          import('./features/games/games.routes').then((m) => m.gamesRoutes),
      },
      {
        path: 'accessories',
        loadChildren: () =>
          import('./features/accessories/accessories.routes').then(
            (m) => m.accessoriesRoutes,
          ),
      },
      { path: '**', redirectTo: '' },
    ],
  },
];
