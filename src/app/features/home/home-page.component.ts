import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal, } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, map, merge, of, skip, switchMap, tap, } from 'rxjs';
import type { MovieListItemModel } from '../../core/tmdb/models/movie.models';
import { MovieListItemComponent } from '../../shared/components/movie-list-item/movie-list-item.component';
import { StatusPanelComponent } from '../../shared/components/status-panel/status-panel.component';
import { TmdbMoviesApiService } from '../../core/tmdb/services/tmdb-movies-api.service';

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

  // Raw input value from the search field
  readonly searchQuery = signal<string>('');

  // Increment this to re-trigger a fetch without changing the query (retry)
  readonly refreshToken = signal<number>(0);

  // Single source of truth for rendering
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

    // Initial load should be instant (no debounce).
    const initialQuery$ = of(this.searchQuery());

    // Typing should be debounced to reduce API calls.
    const debouncedTypingQuery$ = searchQuery$.pipe(
      skip(1),
      debounceTime(300),
      distinctUntilChanged()
    );

    // Retry should be instant and should not be blocked by distinctUntilChanged.
    const refreshQuery$ = refreshToken$.pipe(
      skip(1),
      map(() => this.searchQuery())
    );

    merge(initialQuery$, debouncedTypingQuery$, refreshQuery$)
      .pipe(
        tap(() => this.viewState.set({ status: 'loading' })),

        // Cancel previous request when a new trigger comes in
        switchMap((query) => {
          const trimmedQuery = query.trim();

          if (trimmedQuery.length === 0) {
            return this.tmdbMoviesApiService.getPopularMovies().pipe(
              tap((movies) => {
                this.viewState.set({
                  status: 'ready',
                  movies,
                  mode: 'popular',
                  query: '',
                });
              })
            );
          }

          return this.tmdbMoviesApiService.searchMovies(trimmedQuery).pipe(
            tap((movies) => {
              this.viewState.set({
                status: 'ready',
                movies,
                mode: 'search',
                query: trimmedQuery,
              });
            })
          );
        }),

        catchError(() => {
          this.viewState.set({
            status: 'error',
            message: 'Could not load movies. Please try again.',
          });
          return of([]);
        }),

        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  trackByMovieId(index: number, movie: MovieListItemModel): number {
    return movie.id;
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
