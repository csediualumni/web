import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Ordered list mirrors allNavItems in admin.component.ts */
const MANAGE_NAV_ITEMS = [
  { path: 'users', permission: 'users:read' },
  { path: 'roles', permission: 'roles:read' },
  { path: 'membership', permission: 'membership:read' },
  { path: 'invoices', permission: 'invoices:read' },
  { path: 'newsletter', permission: 'newsletter:read' },
  { path: 'contact', permission: 'contact:read' },
  { path: 'milestones', permission: 'milestones:read' },
  { path: 'committees', permission: 'committees:read' },
  { path: 'events', permission: 'events:read' },
  { path: 'campaigns', permission: 'campaigns:write' },
  { path: 'gallery', permission: 'gallery:read' },
  { path: 'news', permission: 'news:read' },
  { path: 'research', permission: 'research:read' },
  { path: 'mentors', permission: 'mentors:read' },
  { path: 'scholarships', permission: 'scholarships:read' },
  { path: 'jobs', permission: 'jobs:read' },
];

/**
 * Redirects /manage → the first child route the user has permission to access.
 * Falls back to /dashboard if the user has no manage permissions at all.
 */
export const manageDefaultGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const first = MANAGE_NAV_ITEMS.find((item) => auth.hasPermission(item.permission));
  return router.createUrlTree(first ? ['/manage', first.path] : ['/dashboard']);
};
