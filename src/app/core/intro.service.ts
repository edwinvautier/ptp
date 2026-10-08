import { Service, signal } from '@angular/core';

@Service()
export class IntroService {
  readonly visible = signal(true);

  replay(): void {
    this.visible.set(true);
  }

  finish(): void {
    this.visible.set(false);
  }
}
