import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Allows access only when logged in; redirects to /auth/login otherwise */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // During SSR localStorage is unavailable — let the browser re-evaluate after hydration
  if (!isPlatformBrowser(platformId)) return true;

  return auth.isLoggedIn() ? true : router.createUrlTree(['/auth/login']);
};
