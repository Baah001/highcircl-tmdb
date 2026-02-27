import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TMDB_CONFIG } from './core/config/tmdb-config.token';
import { environment } from '../environments/environment';
import { tmdbAuthInterceptor } from './core/http/interceptors/tmdb-auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([tmdbAuthInterceptor])),
    {
      provide: TMDB_CONFIG,
      useValue: environment.tmdb,
    },
  ]
};
