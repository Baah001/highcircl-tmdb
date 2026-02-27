export interface MovieListItemModel {
  id: number;
  title: string;
  releaseDate: string;
  posterThumbnailUrl?: string | null;
  rating: number;
}

export interface MovieDetailsModel {
  id: number;
  title: string;
  releaseDate: string;
  posterUrl?: string;
  overview: string;
  genres: string[];
  rating: number;
  runtimeMinutes?: number;
  languageCode: string;
  backdropUrl?: string;
}
