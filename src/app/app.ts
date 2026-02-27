import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderOverlayComponent } from './shared/components/loader-overlay/loader-overlay.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoaderOverlayComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('highcircl-tmdb');
}
