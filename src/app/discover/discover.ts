import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

import { prefersReducedMotion } from '../core/motion';
import { findPhoto, FOOT_PHOTOS, PTP_CONFIG, type FootPhoto } from '../core/ptp.config';
import { WalletService } from '../core/wallet.service';

interface Reveal {
  photo: FootPhoto;
  ugly: boolean;
}

@Component({
  selector: 'app-discover',
  imports: [NgOptimizedImage],
  templateUrl: './discover.html',
  styleUrl: './discover.scss',
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class Discover {
  private readonly wallet = inject(WalletService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reduceMotion = prefersReducedMotion();
  private readonly queue = signal<FootPhoto[]>(prettyQueue(this.wallet.ownedIds()));
  private originX = 0;
  private originY = 0;
  private activePointer: number | null = null;
  private leaveTimer = 0;
  private frame = 0;
  private pendingReveal: Reveal | null = null;

  protected readonly prettyPrice = PTP_CONFIG.prices.pretty;
  protected readonly blurPx = PTP_CONFIG.blurPx;
  protected readonly blur = `blur(${PTP_CONFIG.blurPx}px)`;
  protected readonly visible = computed(() => this.queue().slice(0, 2));
  protected readonly topList = computed(() => this.visible().slice(0, 1));
  protected readonly backList = computed(() => this.visible().slice(1, 2));
  protected readonly dragging = signal(false);
  protected readonly dragX = signal(0);
  protected readonly dragY = signal(0);
  protected readonly leaving = signal<'left' | 'right' | null>(null);
  protected readonly busy = signal(false);
  protected readonly message = signal('');
  protected readonly reveal = signal<Reveal | null>(null);
  protected readonly topTransform = computed(() => {
    const leaving = this.leaving();
    if (leaving === 'right') {
      return 'translate3d(120%, 0, 0) rotate(14deg)';
    }
    if (leaving === 'left') {
      return 'translate3d(-120%, 0, 0) rotate(-14deg)';
    }
    const x = this.dragX();
    const y = this.dragY();
    const rotate = Math.max(-14, Math.min(14, x / 16));
    return `translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg)`;
  });
  protected readonly yesOpacity = computed(() => Math.min(Math.max(this.dragX(), 0) / 90, 1));
  protected readonly noOpacity = computed(() => Math.min(Math.max(-this.dragX(), 0) / 90, 1));

  constructor() {
    this.destroyRef.onDestroy(() => {
      window.clearTimeout(this.leaveTimer);
      window.cancelAnimationFrame(this.frame);
    });
  }

  protected cardTransition(): string {
    if (this.reduceMotion || this.dragging()) {
      return 'none';
    }
    return 'transform 280ms ease';
  }

  protected onPointerDown(event: PointerEvent): void {
    if (this.busy() || this.queue().length === 0 || this.activePointer !== null) {
      return;
    }
    this.activePointer = event.pointerId;
    this.originX = event.clientX;
    this.originY = event.clientY;
    this.dragging.set(true);
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (event.pointerId !== this.activePointer || !this.dragging()) {
      return;
    }
    this.dragX.set(event.clientX - this.originX);
    this.dragY.set((event.clientY - this.originY) * 0.25);
  }

  protected onPointerUp(event: PointerEvent): void {
    if (event.pointerId !== this.activePointer) {
      return;
    }
    this.activePointer = null;
    const x = this.dragX();
    this.dragging.set(false);
    window.cancelAnimationFrame(this.frame);
    this.frame = window.requestAnimationFrame(() => {
      if (x > 90) {
        this.buy();
      } else if (x < -90) {
        this.pass();
      } else {
        this.dragX.set(0);
        this.dragY.set(0);
      }
    });
  }

  protected pass(): void {
    if (this.busy() || this.queue().length === 0) {
      return;
    }
    this.busy.set(true);
    this.message.set('');
    this.commitLeave('left', false);
  }

  protected buy(): void {
    const top = this.queue()[0];
    if (this.busy() || !top) {
      return;
    }
    this.busy.set(true);
    const decision = this.wallet.buy(top.id);
    if (decision.status === 'rejected') {
      this.busy.set(false);
      this.dragX.set(0);
      this.dragY.set(0);
      this.message.set('Pas assez de crédits');
      return;
    }
    const photo = findPhoto(decision.photoId);
    if (!photo) {
      this.busy.set(false);
      return;
    }
    this.pendingReveal = { photo, ugly: decision.status === 'ugly' };
    this.message.set('');
    this.commitLeave('right', decision.status === 'pretty');
  }

  protected dismissReveal(): void {
    this.reveal.set(null);
    this.busy.set(false);
  }

  protected onEscape(): void {
    if (this.reveal()) {
      this.dismissReveal();
    }
  }

  private commitLeave(direction: 'left' | 'right', removeTop: boolean): void {
    const finish = () => {
      this.queue.update((cards) => {
        const [first, ...rest] = cards;
        if (!first) {
          return cards;
        }
        return removeTop ? rest : [...rest, first];
      });
      this.leaving.set(null);
      this.dragX.set(0);
      this.dragY.set(0);
      const reveal = this.pendingReveal;
      this.pendingReveal = null;
      if (reveal) {
        this.reveal.set(reveal);
      } else {
        this.busy.set(false);
      }
    };

    if (this.reduceMotion) {
      finish();
      return;
    }

    this.leaving.set(direction);
    this.leaveTimer = window.setTimeout(finish, 280);
  }
}

function prettyQueue(ownedIds: readonly string[]): FootPhoto[] {
  const owned = new Set(ownedIds);
  return FOOT_PHOTOS.filter((photo) => photo.tier === 'pretty' && !owned.has(photo.id));
}
