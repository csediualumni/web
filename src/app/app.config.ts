import {
  APP_INITIALIZER,
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, TitleStrategy, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';
import { AppTitleStrategy } from './core/title.strategy';
import { SiteConfigService } from './core/site-config.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(),
    provideRouter(
      routes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
    ),
    provideHttpClient(withInterceptors([authInterceptor]), withFetch()),
    { provide: TitleStrategy, useClass: AppTitleStrategy },
    {
      provide: APP_INITIALIZER,
      useFactory: (siteConfig: SiteConfigService) => () => firstValueFrom(siteConfig.load()),
      deps: [SiteConfigService],
      multi: true,
    },
  ],
};
