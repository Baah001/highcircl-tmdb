import { TmdbImageSizes } from '../constants/tmdb-image-sizes';

export function createTmdbImageUrl(
  posterPath: string,
  size: TmdbImageSizes
): string {
  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
}
