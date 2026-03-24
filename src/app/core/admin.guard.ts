import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // During SSR localStorage is unavailable — let the browser re-evaluate after hydration
  if (!isPlatformBrowser(platformId)) return true;

  const user = auth.currentUser();
  if (user && user.permissions?.includes('users:read')) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
