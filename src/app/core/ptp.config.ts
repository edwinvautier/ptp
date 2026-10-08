import { FOOT_PHOTOS } from './foot-photos.generated';

export type FootTier = 'pretty' | 'ugly';

export interface FootPhoto {
  id: string;
  src: string;
  tier: FootTier;
}

export const PTP_CONFIG = {
  startingCredits: 100,
  blurPx: 18,
  prices: {
    pretty: 40,
    ugly: 3,
  },
} as const;

export { FOOT_PHOTOS };

const photosById = new Map(FOOT_PHOTOS.map((photo) => [photo.id, photo]));

export function findPhoto(id: string): FootPhoto | undefined {
  return photosById.get(id);
}
