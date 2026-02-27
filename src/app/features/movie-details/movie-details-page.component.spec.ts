import { Component, Input } from '@angular/core';
import { DatePipe, DecimalPipe, UpperCasePipe } from '@angular/common';
import { ActivatedRoute, convertToParamMap, provideRouter, RouterLink } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, NEVER, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MovieDetailsPageComponent } from './movie-details-page.component';
import type { MovieDetailsModel } from '../../core/tmdb/models/movie.models';
import { TmdbMoviesApiService } from '../../core/tmdb/services/tmdb-movies-api.service';
import { LoaderService } from '../../shared/services/loader.service';

@Component({
  selector: 'app-rating',
  standalone: true,
  template: `<span data-testid="rating">{{ rating.toFixed(1) }}</span>`,
})
class RatingStubComponent {
  @Input({ required: true }) rating!: number;
}

@Component({
  selector: 'app-status-panel',
  standalone: true,
  template: `
    <div data-testid="status-panel">
      <h2 data-testid="status-title">{{ title }}</h2>
      <p data-testid="status-message">{{ message }}</p>

      @if (buttonLabel) {
        <button data-testid="status-button">{{ buttonLabel }}</button>
      }
    </div>
  `,
})
class StatusPanelStubComponent {
  @Input({ required: true }) title!: string;
  @Input() message: string = '';
  @Input() buttonLabel: string = '';
}

describe('MovieDetailsPageComponent (template)', () => {
  let tmdbMoviesApiServiceMock: { getMovieDetails: ReturnType<typeof vi.fn> };
  let loaderServiceMock: { show: ReturnType<typeof vi.fn>; hide: ReturnType<typeof vi.fn> };
  let paramMapSubject: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  const mockMovie: MovieDetailsModel = {
    id: 123,
    title: 'Shelter',
    releaseDate: '2026-01-28',
    posterUrl: 'https://image.tmdb.org/t/p/w500/test.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w780/backdrop.jpg',
    overview: 'A movie overview...',
    genres: ['Action', 'Crime'],
    rating: 7.0,
    runtimeMinutes: 107,
    languageCode: 'en',
  };

  beforeEach(async () => {
    tmdbMoviesApiServiceMock = {
      getMovieDetails: vi.fn().mockReturnValue(of(mockMovie)),
    };

    loaderServiceMock = {
      show: vi.fn(),
      hide: vi.fn(),
    };

    paramMapSubject = new BehaviorSubject(convertToParamMap({ movieId: '123' }));

    await TestBed.configureTestingModule({
      imports: [MovieDetailsPageComponent],
      providers: [
        provideRouter([]),
        { provide: TmdbMoviesApiService, useValue: tmdbMoviesApiServiceMock },
        { provide: LoaderService, useValue: loaderServiceMock },
        { provide: ActivatedRoute, useValue: { paramMap: paramMapSubject.asObservable() } },
        DatePipe,
        DecimalPipe,
        UpperCasePipe,
      ],
    })
      .overrideComponent(MovieDetailsPageComponent, {
        set: {
          imports: [StatusPanelStubComponent, RatingStubComponent, RouterLink, DatePipe, DecimalPipe, UpperCasePipe],
        },
      })
      .compileComponents();
  });

  it('renders loading state while request is in-flight', () => {
    tmdbMoviesApiServiceMock.getMovieDetails.mockReturnValueOnce(NEVER);

    const fixture = TestBed.createComponent(MovieDetailsPageComponent);
    fixture.detectChanges();

    expect(tmdbMoviesApiServiceMock.getMovieDetails).toHaveBeenCalledWith(123);

    const element: HTMLElement = fixture.nativeElement;
    const title = element.querySelector('[data-testid="status-title"]')?.textContent ?? '';
    const message = element.querySelector('[data-testid="status-message"]')?.textContent ?? '';

    expect(title).toContain('Loading');
    expect(message).toContain('Fetching movie details');
  });

  it('renders movie details when ready', () => {
    const fixture = TestBed.createComponent(MovieDetailsPageComponent);
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;

    expect(element.textContent).toContain('Shelter');
    expect(element.textContent).toContain('January 28, 2026');
    expect(element.textContent).toContain('A movie overview...');
    expect(element.textContent).toContain('7.0');
    expect(element.textContent).toContain('1h 47m');
    expect(element.textContent).toContain('Action');
    expect(element.textContent).toContain('Crime');

    const img = element.querySelector('img.details__poster-image');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe(mockMovie.posterUrl);
    expect(img?.getAttribute('alt')).toBe(mockMovie.title);
  });

  it('renders language in uppercase human-readable form when possible', () => {
    const fixture = TestBed.createComponent(MovieDetailsPageComponent);
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;

    const text = element.textContent ?? '';
    if (typeof Intl.DisplayNames === 'function') {
      expect(text).toContain('ENGLISH');
    } else {
      expect(text).toContain('EN');
    }
  });

  it('shows error panel when movie id is invalid', async () => {
    paramMapSubject = new BehaviorSubject(convertToParamMap({ movieId: 'abc' }));

    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [MovieDetailsPageComponent],
        providers: [
          provideRouter([]),
          { provide: TmdbMoviesApiService, useValue: tmdbMoviesApiServiceMock },
          { provide: LoaderService, useValue: loaderServiceMock },
          { provide: ActivatedRoute, useValue: { paramMap: paramMapSubject.asObservable() } },
          DatePipe,
          DecimalPipe,
          UpperCasePipe,
        ],
      })
      .overrideComponent(MovieDetailsPageComponent, {
        set: {
          imports: [StatusPanelStubComponent, RatingStubComponent, RouterLink, DatePipe, DecimalPipe, UpperCasePipe],
        },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(MovieDetailsPageComponent);
    fixture.detectChanges();

    expect(tmdbMoviesApiServiceMock.getMovieDetails).not.toHaveBeenCalled();

    const element: HTMLElement = fixture.nativeElement;
    const title = element.querySelector('[data-testid="status-title"]')?.textContent ?? '';
    const message = element.querySelector('[data-testid="status-message"]')?.textContent ?? '';

    expect(title).toContain('Something went wrong');
    expect(message).toContain('Invalid movie id');
  });

  it('shows error panel when service fails', () => {
    tmdbMoviesApiServiceMock.getMovieDetails.mockReturnValueOnce(
      throwError(() => new Error('fail'))
    );

    const fixture = TestBed.createComponent(MovieDetailsPageComponent);
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    const title = element.querySelector('[data-testid="status-title"]')?.textContent ?? '';
    const message = element.querySelector('[data-testid="status-message"]')?.textContent ?? '';

    expect(title).toContain('Something went wrong');
    expect(message).toContain('Could not load movie details');
  });

  it('renders a back link to the home page', () => {
    const fixture = TestBed.createComponent(MovieDetailsPageComponent);
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;

    const backLink = element.querySelector('a.details__back-button') as HTMLAnchorElement | null;
    expect(backLink).not.toBeNull();
    expect(backLink?.textContent ?? '').toContain('Back to Home');
  });
});
