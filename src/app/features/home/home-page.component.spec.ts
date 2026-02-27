import { Component, Input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';

import { HomePageComponent } from './home-page.component';
import type { MovieListItemModel } from '../../core/tmdb/models/movie.models';
import { TmdbMoviesApiService } from '../../core/tmdb/services/tmdb-movies-api.service';

@Component({
  selector: 'app-movie-list-item',
  standalone: true,
  template: '',
})
class MovieListItemStubComponent {
  @Input({ required: true }) movie!: MovieListItemModel;
}

@Component({
  selector: 'app-status-panel',
  standalone: true,
  template: '',
})
class StatusPanelStubComponent {
  @Input({ required: true }) title!: string;
  @Input() message: string = '';
  @Input() buttonLabel: string = '';
}

describe('HomePageComponent', () => {
  let mockService: {
    getPopularMovies: ReturnType<typeof vi.fn>;
    searchMovies: ReturnType<typeof vi.fn>;
  };

  const mockMovies: MovieListItemModel[] = [
    {
      id: 1,
      title: 'Test Movie',
      releaseDate: '2020-01-01',
      posterThumbnailUrl: '/poster.jpg',
      rating: 7.5,
    },
  ];

  beforeEach(() => {
    vi.useFakeTimers();

    mockService = {
      getPopularMovies: vi.fn().mockReturnValue(of(mockMovies)),
      searchMovies: vi.fn().mockReturnValue(of(mockMovies)),
    };

    TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [{ provide: TmdbMoviesApiService, useValue: mockService }],
    })
      .overrideComponent(HomePageComponent, {
        set: {
          imports: [MovieListItemStubComponent, StatusPanelStubComponent],
        },
      })
      .compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls getPopularMovies on init', () => {
    const fixture = TestBed.createComponent(HomePageComponent);
    fixture.detectChanges();

    expect(mockService.getPopularMovies).toHaveBeenCalledTimes(1);

    const state = fixture.componentInstance.viewState();
    expect(state.status).toBe('ready');
  });

  it('debounces and calls searchMovies when searchQuery changes', () => {
    const fixture = TestBed.createComponent(HomePageComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    component.searchQuery.set('batman');

    // Debounce is 300ms
    vi.advanceTimersByTime(300);

    expect(mockService.searchMovies).toHaveBeenCalledTimes(1);
    expect(mockService.searchMovies).toHaveBeenCalledWith('batman');
  });

  it('retries using current query', async () => {
    const fixture = TestBed.createComponent(HomePageComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    component.searchQuery.set('dune');
    vi.advanceTimersByTime(300);

    expect(mockService.searchMovies).toHaveBeenCalledWith('dune');

    mockService.searchMovies.mockClear();

    component.onRetry();

    // Flushing the signal
    await vi.runOnlyPendingTimersAsync();

    expect(mockService.searchMovies).toHaveBeenCalledTimes(1);
    expect(mockService.searchMovies).toHaveBeenCalledWith('dune');
  });

  it('sets error state when service fails', () => {
    mockService.getPopularMovies.mockReturnValueOnce(
      throwError(() => new Error('fail'))
    );

    const fixture = TestBed.createComponent(HomePageComponent);
    fixture.detectChanges();

    const state = fixture.componentInstance.viewState();
    expect(state.status).toBe('error');
  });
});
