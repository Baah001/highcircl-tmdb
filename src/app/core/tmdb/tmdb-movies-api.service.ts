import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TMDB_CONFIG } from '../config/tmdb-config.token';
import type {
  TmdbMovieDetailsDto,
  TmdbMovieListResponseDto,
} from './models/tmdb-movie.dto';
import type { MovieDetailsModel, MovieListItemModel } from './models/movie.models';
import { mapToMovieDetailsModel, mapToMovieListItemModel } from './tmdb-mappers';

@Injectable({ providedIn: 'root' })
export class TmdbMoviesApiService {
  private readonly httpClient = inject(HttpClient);
  private readonly tmdbConfig = inject(TMDB_CONFIG);

  getPopularMovies(pageNumber: number = 1): Observable<MovieListItemModel[]> {
    const params = new HttpParams().set('page', pageNumber.toString());

    return this.httpClient
      .get<TmdbMovieListResponseDto>(`${this.tmdbConfig.baseUrl}/movie/popular`, {
        params,
      })
      .pipe(map((response) => response.results.map(mapToMovieListItemModel)));
  }

  searchMovies(
    searchQuery: string,
    pageNumber: number = 1
  ): Observable<MovieListItemModel[]> {
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery.length === 0) {
      return this.getPopularMovies(pageNumber);
    }

    const params = new HttpParams()
      .set('query', trimmedQuery)
      .set('page', pageNumber.toString())
      .set('include_adult', 'false');

    return this.httpClient
      .get<TmdbMovieListResponseDto>(`${this.tmdbConfig.baseUrl}/search/movie`, {
        params,
      })
      .pipe(map((response) => response.results.map(mapToMovieListItemModel)));
  }

  getMovieDetails(movieId: number): Observable<MovieDetailsModel> {
    return this.httpClient
      .get<TmdbMovieDetailsDto>(`${this.tmdbConfig.baseUrl}/movie/${movieId}`)
      .pipe(map(mapToMovieDetailsModel));
  }
}
