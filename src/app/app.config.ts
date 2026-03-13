import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, TitleStrategy } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';
import { AppTitleStrategy } from './core/title.strategy';
import { SiteConfigService } from './core/site-config.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: TitleStrategy, useClass: AppTitleStrategy },
    {
      provide: APP_INITIALIZER,
      useFactory: (siteConfig: SiteConfigService) => () => firstValueFrom(siteConfig.load()),
      deps: [SiteConfigService],
      multi: true,
    },
  ],
};
