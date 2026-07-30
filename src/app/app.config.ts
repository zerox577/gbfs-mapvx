import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideIcons } from '@ng-icons/core';

import { matMenu, matClose, matElectricBike, matElectricScooter, matPedalBike } from '@ng-icons/material-icons/baseline';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideIcons({
      matMenu,
      matClose,
      matElectricBike,
      matElectricScooter,
      matPedalBike,
    }),
    provideRouter(routes)
  ]
};
