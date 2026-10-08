import { computed, Service, signal } from '@angular/core';

import { findPhoto, FOOT_PHOTOS, PTP_CONFIG, type FootPhoto } from './ptp.config';
import { resolvePurchase, type PurchaseDecision } from './purchase';

interface WalletState {
  credits: number;
  ownedIds: string[];
}

@Service()
export class WalletService {
  private readonly state = signal<WalletState>({
    credits: PTP_CONFIG.startingCredits,
    ownedIds: [],
  });

  readonly credits = computed(() => this.state().credits);
  readonly ownedIds = computed(() => this.state().ownedIds);
  readonly ownedPhotos = computed(() =>
    this.state()
      .ownedIds.map((id) => findPhoto(id))
      .filter((photo): photo is FootPhoto => photo !== undefined),
  );

  buy(prettyId: string): PurchaseDecision {
    const current = this.state();
    if (current.ownedIds.includes(prettyId)) {
      return { status: 'rejected' };
    }

    const owned = new Set(current.ownedIds);
    const availableUglyIds = FOOT_PHOTOS.filter(
      (photo) => photo.tier === 'ugly' && !owned.has(photo.id),
    ).map((photo) => photo.id);

    const decision = resolvePurchase({
      credits: current.credits,
      prettyId,
      prettyPrice: PTP_CONFIG.prices.pretty,
      uglyPrice: PTP_CONFIG.prices.ugly,
      availableUglyIds,
      randomIndex: Math.floor(Math.random() * Math.max(availableUglyIds.length, 1)),
    });

    if (decision.status === 'rejected') {
      return decision;
    }
    if (current.ownedIds.includes(decision.photoId)) {
      return { status: 'rejected' };
    }

    this.state.set({
      credits: current.credits - decision.price,
      ownedIds: [...current.ownedIds, decision.photoId],
    });
    return decision;
  }
}
