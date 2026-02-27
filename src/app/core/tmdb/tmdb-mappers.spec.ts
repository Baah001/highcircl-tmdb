import { describe, expect, it } from 'vitest';

import { mapToMovieDetailsModel, mapToMovieListItemModel } from './tmdb-mappers';

describe('tmdb mappers', () => {
  it('maps list item and builds poster thumbnail url when poster exists', () => {
    const result = mapToMovieListItemModel({
      id: 1,
      title: 'Test Movie',
      release_date: '2020-01-01',
      poster_path: '/poster.jpg',
      vote_average: 7.5,
    });

    expect(result).toEqual({
      id: 1,
      title: 'Test Movie',
      releaseDate: '2020-01-01',
      posterThumbnailUrl: 'https://image.tmdb.org/t/p/w185/poster.jpg',
      rating: 7.5,
    });
  });

  it('maps list item and uses fallback text when release date is missing', () => {
    const result = mapToMovieListItemModel({
      id: 1,
      title: 'Test Movie',
      release_date: null,
      poster_path: null,
      vote_average: 7.5,
    });

    expect(result).toEqual({
      id: 1,
      title: 'Test Movie',
      releaseDate: 'Unknown release date',
      posterThumbnailUrl: undefined,
      rating: 7.5,
    });
  });

  it('maps details and builds poster + backdrop urls when they exist', () => {
    const result = mapToMovieDetailsModel({
      id: 2,
      title: 'Detail Movie',
      release_date: '2021-02-02',
      poster_path: '/poster.jpg',
      backdrop_path: '/backdrop.jpg',
      overview: 'Overview',
      genres: [{ id: 1, name: 'Action' }],
      vote_average: 8.2,
      runtime: 120,
      original_language: 'en',
    });

    expect(result).toEqual({
      id: 2,
      title: 'Detail Movie',
      releaseDate: '2021-02-02',
      posterUrl: 'https://image.tmdb.org/t/p/w500/poster.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/original/backdrop.jpg',
      overview: 'Overview',
      genres: ['Action'],
      rating: 8.2,
      runtimeMinutes: 120,
      languageCode: 'en',
    });
  });

  it('maps details and leaves poster + backdrop undefined when missing', () => {
    const result = mapToMovieDetailsModel({
      id: 2,
      title: 'Detail Movie',
      release_date: null,
      poster_path: null,
      backdrop_path: null,
      overview: 'Overview',
      genres: [],
      vote_average: 8.2,
      runtime: null,
      original_language: 'en',
    });

    expect(result).toEqual({
      id: 2,
      title: 'Detail Movie',
      releaseDate: 'Unknown release date',
      posterUrl: undefined,
      backdropUrl: undefined,
      overview: 'Overview',
      genres: [],
      rating: 8.2,
      runtimeMinutes: undefined,
      languageCode: 'en',
    });
  });
});
