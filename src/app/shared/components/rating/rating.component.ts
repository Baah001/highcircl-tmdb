import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './rating.component.html',
  styleUrl: './rating.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingComponent {
  readonly rating = input.required<number>();
}
