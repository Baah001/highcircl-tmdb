import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TmdbMoviesApiService } from './tmdb-movies-api.service';
import { tmdbAuthInterceptor } from '../../http/interceptors/tmdb-auth.interceptor';
import { TMDB_CONFIG } from '../../config/tmdb-config.token';

describe('TmdbMoviesApiService', () => {
  let httpTestingController: HttpTestingController;
  let service: TmdbMoviesApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([tmdbAuthInterceptor])),
        provideHttpClientTesting(),
        {
          provide: TMDB_CONFIG,
          useValue: {
            apiKey: 'test-api-key',
            baseUrl: 'https://api.themoviedb.org/3',
            language: 'en-US',
          },
        },
        TmdbMoviesApiService,
      ],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(TmdbMoviesApiService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('calls popular movies endpoint and maps results', () => {
    let receivedTitles: string[] = [];

    service.getPopularMovies(1).subscribe((movies) => {
      receivedTitles = movies.map((movie) => movie.title);
    });

    const request = httpTestingController.expectOne((match) => {
      return match.url === 'https://api.themoviedb.org/3/movie/popular';
    });

    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('api_key')).toBe('test-api-key');
    expect(request.request.params.get('language')).toBe('en-US');
    expect(request.request.params.get('page')).toBe('1');

    request.flush({
      page: 1,
      results: [
        {
          id: 1,
          title: 'Popular Movie',
          release_date: '2020-01-01',
          poster_path: '/poster.jpg',
          vote_average: 7.5,
        },
      ],
      total_pages: 1,
      total_results: 1,
    });

    expect(receivedTitles).toEqual(['Popular Movie']);
  });

  it('calls search endpoint with query and include_adult=false', () => {
    service.searchMovies('batman', 2).subscribe();

    const request = httpTestingController.expectOne((match) => {
      return match.url === 'https://api.themoviedb.org/3/search/movie';
    });

    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('api_key')).toBe('test-api-key');
    expect(request.request.params.get('language')).toBe('en-US');
    expect(request.request.params.get('query')).toBe('batman');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('include_adult')).toBe('false');

    request.flush({
      page: 2,
      results: [],
      total_pages: 1,
      total_results: 0,
    });
  });

  it('calls movie details endpoint and maps the result', () => {
    let receivedTitle = '';

    service.getMovieDetails(123).subscribe((movie) => {
      receivedTitle = movie.title;
    });

    const request = httpTestingController.expectOne((match) => {
      return match.url === 'https://api.themoviedb.org/3/movie/123';
    });

    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('api_key')).toBe('test-api-key');
    expect(request.request.params.get('language')).toBe('en-US');

    request.flush({
      id: 123,
      title: 'Movie Details',
      release_date: '2021-02-02',
      poster_path: '/poster.jpg',
      overview: 'Overview',
      genres: [{ id: 1, name: 'Action' }],
      vote_average: 8.2,
      runtime: 120,
      original_language: 'en',
    });

    expect(receivedTitle).toBe('Movie Details');
  });
});
