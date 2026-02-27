import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { MovieListItemModel } from '../../../core/tmdb/models/movie.models';
import { RatingComponent } from '../rating/rating.component';

@Component({
  selector: 'app-movie-list-item',
  standalone: true,
  imports: [RouterLink, RatingComponent],
  templateUrl: './movie-list-item.component.html',
  styleUrl: './movie-list-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieListItemComponent {
  readonly movie = input.required<MovieListItemModel>();
}
