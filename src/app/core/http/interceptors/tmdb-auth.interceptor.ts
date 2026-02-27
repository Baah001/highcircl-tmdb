import type { HttpInterceptorFn } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { TMDB_CONFIG } from '../../config/tmdb-config.token';


export const tmdbAuthInterceptor: HttpInterceptorFn = (request, next) => {
  const tmdbConfig = inject(TMDB_CONFIG);

  const requestUrl = request.url;

  const isTmdbRequest = requestUrl.startsWith(tmdbConfig.baseUrl);

  if (!isTmdbRequest) {
    return next(request);
  }

  const currentParams = request.params ?? new HttpParams();

  const paramsWithApiKey = currentParams.has('api_key')
    ? currentParams
    : currentParams.set('api_key', tmdbConfig.apiKey);

  const paramsWithLanguage = paramsWithApiKey.has('language')
    ? paramsWithApiKey
    : paramsWithApiKey.set('language', tmdbConfig.language);

  const authRequest = request.clone({ params: paramsWithLanguage });

  return next(authRequest);
};
