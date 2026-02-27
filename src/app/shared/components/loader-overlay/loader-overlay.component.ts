import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-loader-overlay',
  standalone: true,
  templateUrl: './loader-overlay.component.html',
  styleUrl: './loader-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderOverlayComponent {
  readonly loaderService = inject(LoaderService);
}
