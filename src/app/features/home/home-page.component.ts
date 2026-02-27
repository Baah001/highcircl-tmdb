import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  finalize,
  map,
  merge,
  of,
  skip,
  switchMap,
  tap
} from 'rxjs';

import type { MovieListItemModel } from '../../core/tmdb/models/movie.models';
import { TmdbMoviesApiService } from '../../core/tmdb/services/tmdb-movies-api.service';
import { MovieListItemComponent } from '../../shared/components/movie-list-item/movie-list-item.component';
import { StatusPanelComponent } from '../../shared/components/status-panel/status-panel.component';
import { LoaderService } from '../../shared/services/loader.service';

type ReadyState = Extract<HomeViewState, { status: 'ready' }>;

type HomeViewState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
  status: 'ready';
  movies: MovieListItemModel[];
  mode: 'popular' | 'search';
  query: string;
};

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [MovieListItemComponent, StatusPanelComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  private readonly tmdbMoviesApiService = inject(TmdbMoviesApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loaderService = inject(LoaderService);

  readonly searchQuery = signal<string>('');
  readonly refreshToken = signal<number>(0);

  readonly viewState = signal<HomeViewState>({ status: 'loading' });

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
    const searchQuery$ = toObservable(this.searchQuery);
    const refreshToken$ = toObservable(this.refreshToken);

    const initialQuery$ = of(this.searchQuery());

    const debouncedTypingQuery$ = searchQuery$.pipe(
      skip(1),
      debounceTime(300),
      distinctUntilChanged()
    );

    const refreshQuery$ = refreshToken$.pipe(
      skip(1),
      map(() => this.searchQuery())
    );

    merge(initialQuery$, debouncedTypingQuery$, refreshQuery$)
      .pipe(
        tap(() => {
          this.viewState.set({ status: 'loading' });
          this.loaderService.show();
        }),
        switchMap((query) => {
          const trimmedQuery = query.trim();

          const request$ =
            (trimmedQuery.length === 0
              ? this.tmdbMoviesApiService.getPopularMovies().pipe(
                map((movies) => ({
                  status: 'ready' as const,
                  movies,
                  mode: 'popular' as const,
                  query: '',
                }))
              )
              : this.tmdbMoviesApiService.searchMovies(trimmedQuery).pipe(
                map((movies) => ({
                  status: 'ready' as const,
                  movies,
                  mode: 'search' as const,
                  query: trimmedQuery,
                }))
              )) as unknown as import('rxjs').Observable<ReadyState>;

          return request$.pipe(
            tap((nextState) => {
              this.viewState.set(nextState);
            }),
            finalize(() => {
              this.loaderService.hide();
            }),
            catchError(() => {
              this.viewState.set({
                status: 'error',
                message: 'Could not load movies. Please try again.',
              });
              return EMPTY;
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  onRetry(): void {
    this.refreshToken.update((value) => value + 1);
  }

  onSearchInput(event: Event): void {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    this.searchQuery.set(target.value);
  }
}
