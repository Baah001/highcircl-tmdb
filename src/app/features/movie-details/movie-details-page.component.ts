import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal, } from '@angular/core';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, finalize, map, switchMap, tap } from 'rxjs';

import type { MovieDetailsModel } from '../../core/tmdb/models/movie.models';
import { StatusPanelComponent } from '../../shared/components/status-panel/status-panel.component';
import { TmdbMoviesApiService } from '../../core/tmdb/services/tmdb-movies-api.service';
import { RatingComponent } from '../../shared/components/rating/rating.component';
import { LoaderService } from '../../shared/services/loader.service';

type MovieDetailsViewState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; movie: MovieDetailsModel };

@Component({
  selector: 'app-movie-details-page',
  standalone: true,
  imports: [StatusPanelComponent, UpperCasePipe, RouterLink, RatingComponent, DatePipe],
  templateUrl: './movie-details-page.component.html',
  styleUrl: './movie-details-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieDetailsPageComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly tmdbMoviesApiService = inject(TmdbMoviesApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loaderService = inject(LoaderService);

  readonly viewState = signal<MovieDetailsViewState>({ status: 'loading' });

  readonly isLoading = computed(() => this.viewState().status === 'loading');

  readonly errorMessage = computed(() => {
    const state = this.viewState();
    return state.status === 'error' ? state.message : '';
  });

  readonly readyState = computed(() => {
    const state = this.viewState();
    return state.status === 'ready' ? state : null;
  });

  constructor() {
    const movieId$ = this.activatedRoute.paramMap.pipe(
      map((params) => Number(params.get('movieId'))),
      map((movieId) => (Number.isFinite(movieId) ? movieId : null))
    );

    movieId$
      .pipe(
        tap(() => {
          this.viewState.set({ status: 'loading' });
          this.loaderService.show();
        }),

        switchMap((movieId) => {
          if (movieId === null) {
            this.viewState.set({
              status: 'error',
              message: 'Invalid movie id.',
            });
            this.loaderService.hide();
            return EMPTY;
          }

          return this.tmdbMoviesApiService.getMovieDetails(movieId).pipe(
            tap((movie) => {
              this.viewState.set({ status: 'ready', movie });
            }),
            catchError(() => {
              this.viewState.set({
                status: 'error',
                message: 'Could not load movie details.',
              });
              return EMPTY;
            }),
            finalize(() => {
              this.loaderService.hide();
            })
          );
        }),

        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  formatRuntime(runtimeMinutes: number | undefined): string {
    if (!runtimeMinutes) {
      return '—';
    }

    const hours = Math.floor(runtimeMinutes / 60);
    const minutes = runtimeMinutes % 60;

    if (hours === 0) {
      return `${minutes}m`;
    }

    if (minutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${minutes}m`;
  }

  formatLanguage(code: string): string {
    if (!code) return 'Unknown';

    return (
      this.languageDisplayNames.of(code) ??
      code.toUpperCase()
    );
  }

  private readonly languageDisplayNames = new Intl.DisplayNames(
    ['en'],
    { type: 'language' }
  );
}
