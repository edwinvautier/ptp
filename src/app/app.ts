import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { IntroService } from './core/intro.service';
import { Splash } from './splash/splash';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Splash],
  template: `
    @if (showIntro()) {
      <app-splash (done)="finishIntro()" />
    } @else {
      <router-outlet />
    }
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
      min-height: 100dvh;
    }
  `,
})
export class App {
  private readonly intro = inject(IntroService);
  protected readonly showIntro = this.intro.visible;

  protected finishIntro(): void {
    this.intro.finish();
  }
}
