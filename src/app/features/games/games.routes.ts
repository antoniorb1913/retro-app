import { Routes } from '@angular/router';

export const gamesRoutes: Routes = [
  { path: '', loadComponent: () => import('./list/list.component').then((m) => m.GameListComponent) },
  { path: 'new', loadComponent: () => import('./form/form.component').then((m) => m.GameFormComponent) },
  { path: ':id', loadComponent: () => import('./detail/detail.component').then((m) => m.GameDetailComponent) },
  { path: ':id/edit', loadComponent: () => import('./form/form.component').then((m) => m.GameFormComponent) },
];
