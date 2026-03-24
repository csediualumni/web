import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Redirects '/' → '/dashboard' if logged in, otherwise '/auth/login' */
export const rootRedirectGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // During SSR localStorage is unavailable — serve the home page, let browser redirect
  if (!isPlatformBrowser(platformId)) return true;

  return router.createUrlTree(auth.isLoggedIn() ? ['/dashboard'] : ['/auth/login']);
};
