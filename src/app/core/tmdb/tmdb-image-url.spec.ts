import { describe, it, expect } from 'vitest';
import { createTmdbImageUrl } from './tmdb-image-url';

describe('createTmdbImageUrl', () => {
  it('creates a w185 image url', () => {
    const result = createTmdbImageUrl('/poster.jpg', 'w185');

    expect(result).toBe(
      'https://image.tmdb.org/t/p/w185/poster.jpg'
    );
  });

  it('creates a w500 image url', () => {
    const result = createTmdbImageUrl('/poster.jpg', 'w500');

    expect(result).toBe(
      'https://image.tmdb.org/t/p/w500/poster.jpg'
    );
  });

  it('creates an original size image url', () => {
    const result = createTmdbImageUrl('/poster.jpg', 'original');

    expect(result).toBe(
      'https://image.tmdb.org/t/p/original/poster.jpg'
    );
  });

  it('works with different poster paths', () => {
    const result = createTmdbImageUrl('/abc123.png', 'w185');

    expect(result).toContain('/w185/abc123.png');
  });
});
