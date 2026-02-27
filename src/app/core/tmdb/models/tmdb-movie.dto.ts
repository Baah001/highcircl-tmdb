export interface TmdbMovieListResponseDto {
  page: number;
  results: TmdbMovieListItemDto[];
  total_pages: number;
  total_results: number;
}

export interface TmdbMovieListItemDto {
  id: number;
  title: string;
  release_date: string | null;
  poster_path: string | null;
  vote_average: number;
}

export interface TmdbMovieDetailsDto {
  id: number;
  title: string;
  release_date: string | null;
  poster_path: string | null;
  overview: string;
  genres: TmdbGenreDto[];
  vote_average: number;
  runtime: number | null;
  original_language: string;
}

export interface TmdbGenreDto {
  id: number;
  name: string;
}
