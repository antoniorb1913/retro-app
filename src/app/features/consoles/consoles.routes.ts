import { Routes } from '@angular/router';

export const consolesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/list.component').then((m) => m.ConsoleListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./form/form.component').then((m) => m.ConsoleFormComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./detail/detail.component').then((m) => m.ConsoleDetailComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./form/form.component').then((m) => m.ConsoleFormComponent),
  },
];
