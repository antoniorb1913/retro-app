import { Routes } from '@angular/router';

export const accessoriesRoutes: Routes = [
  { path: '', loadComponent: () => import('./list/list.component').then((m) => m.AccessoryListComponent) },
  { path: 'new', loadComponent: () => import('./form/form.component').then((m) => m.AccessoryFormComponent) },
  { path: ':id', loadComponent: () => import('./detail/detail.component').then((m) => m.AccessoryDetailComponent) },
  { path: ':id/edit', loadComponent: () => import('./form/form.component').then((m) => m.AccessoryFormComponent) },
];
