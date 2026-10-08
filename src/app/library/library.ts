import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  runInInjectionContext,
  signal,
  viewChild,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

import type { FootPhoto } from '../core/ptp.config';
import { prefersReducedMotion } from '../core/motion';
import { WalletService } from '../core/wallet.service';

@Component({
  selector: 'app-library',
  imports: [NgOptimizedImage],
  templateUrl: './library.html',
  styleUrl: './library.scss',
})
export class Library {
  private readonly wallet = inject(WalletService);
  private readonly injector = inject(Injector);
  private readonly closeButton = viewChild<ElementRef<HTMLButtonElement>>('closeButton');
  private readonly candleButton = viewChild<ElementRef<HTMLButtonElement>>('candleButton');
  private readonly weirdButton = viewChild<ElementRef<HTMLButtonElement>>('weirdButton');
  private returnFocus: HTMLElement | null = null;

  protected readonly photos = this.wallet.ownedPhotos;
  protected readonly selected = signal<FootPhoto | null>(null);
  protected readonly candle = signal(false);
  private readonly glowIndex = signal(0);

  constructor() {
    if (prefersReducedMotion()) {
      return;
    }
    const timer = window.setInterval(() => this.advanceGlow(), 2000);
    inject(DestroyRef).onDestroy(() => window.clearInterval(timer));
  }

  protected glowing(index: number): boolean {
    const count = this.photos().length;
    if (count === 0) {
      return false;
    }
    if (count === 1) {
      return this.glowIndex() % 2 === 0;
    }
    return this.glowIndex() % count === index;
  }

  private advanceGlow(): void {
    const count = this.photos().length;
    if (count === 0) {
      return;
    }
    const cycle = count === 1 ? 2 : count;
    this.glowIndex.update((index) => (index + 1) % cycle);
  }

  protected open(photo: FootPhoto, event: Event): void {
    this.returnFocus = event.currentTarget instanceof HTMLElement ? event.currentTarget : null;
    this.selected.set(photo);
    runInInjectionContext(this.injector, () => {
      afterNextRender(() => {
        this.closeButton()?.nativeElement.focus();
      });
    });
  }

  protected close(): void {
    this.candle.set(false);
    this.selected.set(null);
    this.returnFocus?.focus();
    this.returnFocus = null;
  }

  protected openCandle(event: Event): void {
    event.stopPropagation();
    this.candle.set(true);
    runInInjectionContext(this.injector, () => {
      afterNextRender(() => {
        this.weirdButton()?.nativeElement.focus();
      });
    });
  }

  protected closeCandle(): void {
    this.candle.set(false);
    this.candleButton()?.nativeElement.focus();
  }

  protected onWeirdKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeCandle();
      return;
    }
    if (event.key === 'Tab') {
      event.preventDefault();
      this.weirdButton()?.nativeElement.focus();
    }
  }

  protected onDialogKeydown(event: KeyboardEvent): void {
    if (this.candle()) {
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }
    if (event.key === 'Tab') {
      event.preventDefault();
      const candle = this.candleButton()?.nativeElement;
      const close = this.closeButton()?.nativeElement;
      (document.activeElement === candle ? close : candle)?.focus();
    }
  }
}
