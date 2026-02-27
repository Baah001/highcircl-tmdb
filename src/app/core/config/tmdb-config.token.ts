import { InjectionToken } from '@angular/core';

export interface TmdbConfig {
  apiKey: string;
  baseUrl: string;
  language: string;
}

export const TMDB_CONFIG = new InjectionToken<TmdbConfig>('TMDB_CONFIG');
