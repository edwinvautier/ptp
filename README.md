# PTP

A private joke. Static, mobile-first POC. Reloading the page resets credits and purchases.

## Run

```bash
npm start
```

Then open http://localhost:4200/.

## Images, prices, blur

Drop images into `public/feet/pretty/` and `public/feet/ugly/` (jpg, png, webp, gif, svg, avif). `npm start` and the build pick them up on their own. Prices and catalog blur live in [`src/app/core/ptp.config.ts`](src/app/core/ptp.config.ts).

## GitHub Pages

The workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) publishes the `main` and `master` branches. In the repository: Settings, Pages, Build and deployment, GitHub Actions.
