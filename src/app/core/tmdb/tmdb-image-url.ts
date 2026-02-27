export type TmdbImageSize = 'w185' | 'w500' | 'original';

export function createTmdbImageUrl(
  posterPath: string,
  size: TmdbImageSize
): string {
  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
}
