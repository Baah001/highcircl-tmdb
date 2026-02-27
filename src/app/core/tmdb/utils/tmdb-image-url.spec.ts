import { describe, it, expect } from 'vitest';
import { createTmdbImageUrl } from './tmdb-image-url';
import { TmdbImageSizes } from '../constants/tmdb-image-sizes';

describe('createTmdbImageUrl', () => {
  it('creates a w185 image url', () => {
    const result = createTmdbImageUrl('/poster.jpg', TmdbImageSizes.w185);

    expect(result).toBe(
      'https://image.tmdb.org/t/p/w185/poster.jpg'
    );
  });

  it('creates a w500 image url', () => {
    const result = createTmdbImageUrl('/poster.jpg', TmdbImageSizes.w500);

    expect(result).toBe(
      'https://image.tmdb.org/t/p/w500/poster.jpg'
    );
  });

  it('creates an original size image url', () => {
    const result = createTmdbImageUrl('/poster.jpg', TmdbImageSizes.original);

    expect(result).toBe(
      'https://image.tmdb.org/t/p/original/poster.jpg'
    );
  });

  it('works with different poster paths', () => {
    const result = createTmdbImageUrl('/abc123.png', TmdbImageSizes.w185);

    expect(result).toContain('/w185/abc123.png');
  });
});
