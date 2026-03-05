import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Redirects '/' → '/dashboard' if logged in, otherwise '/auth/login' */
export const rootRedirectGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return router.createUrlTree(
    auth.isLoggedIn() ? ['/dashboard'] : ['/auth/login'],
  );
};
