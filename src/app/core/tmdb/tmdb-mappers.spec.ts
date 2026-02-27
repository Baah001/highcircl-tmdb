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

    expect(result.posterThumbnailUrl).toContain('image.tmdb.org/t/p/w185');
    expect(result.title).toBe('Test Movie');
  });

  it('maps list item and leaves poster undefined when poster is missing', () => {
    const result = mapToMovieListItemModel({
      id: 1,
      title: 'Test Movie',
      release_date: null,
      poster_path: null,
      vote_average: 7.5,
    });

    expect(result.posterThumbnailUrl).toBeUndefined();
    expect(result.releaseDate).toBe('Unknown release date');
  });

  it('maps details and maps genres to names', () => {
    const result = mapToMovieDetailsModel({
      id: 2,
      title: 'Detail Movie',
      release_date: '2021-02-02',
      poster_path: '/poster.jpg',
      overview: 'Overview',
      genres: [{ id: 1, name: 'Action' }],
      vote_average: 8.2,
      runtime: 120,
      original_language: 'en',
    });

    expect(result.genres).toEqual(['Action']);
    expect(result.runtimeMinutes).toBe(120);
  });
});
