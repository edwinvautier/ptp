import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shell/shell').then((m) => m.Shell),
    children: [
      {
        path: '',
        loadComponent: () => import('./discover/discover').then((m) => m.Discover),
      },
      {
        path: 'collection',
        loadComponent: () => import('./library/library').then((m) => m.Library),
      },
    ],
  },
];
