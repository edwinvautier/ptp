import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { IntroService } from '../core/intro.service';
import { WalletService } from '../core/wallet.service';

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private readonly wallet = inject(WalletService);
  private readonly intro = inject(IntroService);
  private readonly router = inject(Router);
  protected readonly credits = this.wallet.credits;

  protected replayIntro(): void {
    void this.router.navigateByUrl('/');
    this.intro.replay();
  }
}
