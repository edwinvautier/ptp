import type { FootPhoto } from "./ptp.config";

// Généré par scripts/scan-feet.mjs à partir de public/feet/pretty et public/feet/ugly.
export const FOOT_PHOTOS: readonly FootPhoto[] = [
  { id: "pretty-first.jpg", src: "feet/pretty/first.jpg", tier: "pretty" },
  {
    id: "pretty-pretty_1.jpg",
    src: "feet/pretty/pretty_1.jpg",
    tier: "pretty",
  },
  {
    id: "pretty-pretty_2.webp",
    src: "feet/pretty/pretty_2.webp",
    tier: "pretty",
  },
  {
    id: "pretty-pretty_3.jpg",
    src: "feet/pretty/pretty_3.jpg",
    tier: "pretty",
  },
  { id: "ugly-ugly_1.jpg", src: "feet/ugly/ugly_1.jpg", tier: "ugly" },
  { id: "ugly-ugly_2.jpg", src: "feet/ugly/ugly_2.jpg", tier: "ugly" },
  { id: "ugly-ugly_3.jpg", src: "feet/ugly/ugly_3.jpg", tier: "ugly" },
  { id: "ugly-ugly_4.png", src: "feet/ugly/ugly_4.png", tier: "ugly" },
  { id: "ugly-ugly_5.jpg", src: "feet/ugly/ugly_5.jpg", tier: "ugly" },
];
