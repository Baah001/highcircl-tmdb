import { Injectable, computed, signal } from '@angular/core';

export type LoaderState = {
  isLoading: boolean;
  message: string;
};

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private readonly state = signal<LoaderState>({
    isLoading: true,
    message: '',
  });

  readonly isLoading = computed(() => this.state().isLoading);
  readonly message = computed(() => this.state().message);

  show(message: string = 'Loading...'): void {
    this.state.set({ isLoading: true, message });
  }


  hide(): void {
    this.state.set({ isLoading: false, message: '' });
  }
}
