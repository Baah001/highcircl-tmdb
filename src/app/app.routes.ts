import { Routes } from '@angular/router';
import { AppShellComponent } from './core/layout/app-shell.component';


export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      {
        path: 'home',
        loadComponent: () =>
          import('./features/home/home-page.component').then((m) => m.HomePageComponent),
      },
      // {
      //   path: 'movie/:movieId',
      //   loadComponent: () =>
      //     import('./features/movie-details/movie-details-page.component').then(
      //       (m) => m.MovieDetailsPageComponent
      //     ),
      // },
      { path: '**', redirectTo: 'home' },
    ],
  },
];
