import { PRECONNECT_CHECK_BLOCKLIST } from '@angular/common';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withHashLocation()),
    {
      provide: PRECONNECT_CHECK_BLOCKLIST,
      useFactory: () => {
        const hostname = globalThis.location?.hostname;
        return hostname ? [hostname] : [];
      },
    },
  ],
};
