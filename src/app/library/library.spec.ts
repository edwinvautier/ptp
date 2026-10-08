import { TestBed } from '@angular/core/testing';

import { FOOT_PHOTOS } from '../core/ptp.config';
import { WalletService } from '../core/wallet.service';
import { Library } from './library';

describe('Library', () => {
  it('shows a candle screen over an open photo and closes it on click', async () => {
    const fixture = TestBed.createComponent(Library);
    const pretty = FOOT_PHOTOS.find((photo) => photo.tier === 'pretty');
    TestBed.inject(WalletService).buy(pretty!.id);
    await fixture.whenStable();

    const thumb = fixture.nativeElement.querySelector(
      'button[aria-label="Agrandir la photo"]',
    ) as HTMLButtonElement;
    thumb.click();
    await fixture.whenStable();

    const lightboxButtons = [
      ...fixture.nativeElement.querySelectorAll('.lightbox button'),
    ] as HTMLButtonElement[];
    expect(lightboxButtons.map((button) => button.textContent?.trim())).toEqual([
      'Acheter une bougie parfumée',
      'Fermer',
    ]);

    lightboxButtons[0].click();
    await fixture.whenStable();
    const weird = fixture.nativeElement.querySelector('.weird') as HTMLButtonElement;
    expect(weird.textContent?.trim()).toBe("T'es bizarre un peu non ?");

    weird.click();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.weird')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Fermer');
  });
});
