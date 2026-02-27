import type {
  MovieDetailsModel,
  MovieListItemModel,
} from './models/movie.models';
import type {
  TmdbMovieDetailsDto,
  TmdbMovieListItemDto,
} from './models/tmdb-movie.dto';
import { TmdbImageSizes } from './constants/tmdb-image-sizes';
import { createTmdbImageUrl } from './utils/tmdb-image-url';

const unknownReleaseDateText = 'Unknown release date';

export function mapToMovieListItemModel(
  dto: TmdbMovieListItemDto
): MovieListItemModel {
  return {
    id: dto.id,
    title: dto.title,
    releaseDate: dto.release_date ?? unknownReleaseDateText,
    posterThumbnailUrl: dto.poster_path
      ? createTmdbImageUrl(dto.poster_path, TmdbImageSizes.w185)
      : undefined,
    rating: dto.vote_average,
  };
}

export function mapToMovieDetailsModel(
  dto: TmdbMovieDetailsDto
): MovieDetailsModel {
  return {
    id: dto.id,
    title: dto.title,
    releaseDate: dto.release_date ?? unknownReleaseDateText,
    posterUrl: dto.poster_path
      ? createTmdbImageUrl(dto.poster_path, TmdbImageSizes.w500)
      : undefined,
    backdropUrl: dto.backdrop_path ? createTmdbImageUrl(dto.backdrop_path, TmdbImageSizes.original) : undefined,
    overview: dto.overview,
    genres: dto.genres.map((genre) => genre.name),
    rating: dto.vote_average,
    runtimeMinutes: dto.runtime ?? undefined,
    languageCode: dto.original_language,
  };
}
