import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-status-panel',
  standalone: true,
  templateUrl: './status-panel.component.html',
  styleUrl: './status-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusPanelComponent {
  readonly title = input.required<string>();
  readonly message = input<string>('');
  readonly buttonLabel = input<string>('');
  readonly buttonClick = output<void>();
}
