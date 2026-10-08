import { Component, DestroyRef, inject, output, signal } from '@angular/core';

import { prefersReducedMotion } from '../core/motion';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.html',
  styleUrl: './splash.scss',
})
export class Splash {
  readonly done = output<void>();

  private readonly destroyRef = inject(DestroyRef);
  private finished = false;
  protected readonly phase = signal<'letters' | 'words'>(
    prefersReducedMotion() ? 'words' : 'letters',
  );

  constructor() {
    const timers: number[] = [];
    const reduceMotion = prefersReducedMotion();
    if (!reduceMotion) {
      timers.push(window.setTimeout(() => this.phase.set('words'), 1600));
    }
    timers.push(window.setTimeout(() => this.finish(), reduceMotion ? 700 : 3200));
    this.destroyRef.onDestroy(() => {
      for (const timer of timers) {
        window.clearTimeout(timer);
      }
    });
  }

  protected finish(): void {
    if (this.finished) {
      return;
    }
    this.finished = true;
    this.done.emit();
  }
}
