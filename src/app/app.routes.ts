import { Routes } from '@angular/router';
import { adminGuard } from './core/admin.guard';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    // Public homepage
    path: '',
    loadComponent: () =>
      import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./auth/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('./auth/callback/callback.component').then(
        (m) => m.AuthCallbackComponent,
      ),
  },
  {
    path: 'auth/reset-password',
    loadComponent: () =>
      import('./auth/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent,
      ),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./admin/admin.component').then((m) => m.AdminComponent),
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      {
        path: 'users',
        loadComponent: () =>
          import('./admin/users/admin-users.component').then(
            (m) => m.AdminUsersComponent,
          ),
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('./admin/roles/admin-roles.component').then(
            (m) => m.AdminRolesComponent,
          ),
      },
      {
        path: 'invoices',
        loadComponent: () =>
          import('./admin/invoices/admin-invoices.component').then(
            (m) => m.AdminInvoicesComponent,
          ),
      },
    ],
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'alumni',
    loadComponent: () =>
      import('./alumni/alumni.component').then((m) => m.AlumniComponent),
  },
  {
    path: 'alumni/:id',
    loadComponent: () =>
      import('./alumni/profile/alumni-profile.component').then(
        (m) => m.AlumniProfileComponent,
      ),
  },
  {
    path: 'committee',
    loadComponent: () =>
      import('./committee/committee.component').then(
        (m) => m.CommitteeComponent,
      ),
  },
  {
    path: 'events',
    loadComponent: () =>
      import('./events/events.component').then((m) => m.EventsComponent),
  },
  {
    path: 'donations',
    loadComponent: () =>
      import('./donations/donations.component').then(
        (m) => m.DonationsComponent,
      ),
  },
  {
    path: 'payment',
    loadComponent: () =>
      import('./payment/payment.component').then((m) => m.PaymentComponent),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./contact/contact.component').then((m) => m.ContactComponent),
  },
  {
    path: 'gallery',
    loadComponent: () =>
      import('./gallery/gallery.component').then((m) => m.GalleryComponent),
  },
  {
    path: 'sitemap',
    loadComponent: () =>
      import('./legal/sitemap/sitemap.component').then(
        (m) => m.SitemapComponent,
      ),
  },
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./legal/privacy-policy/privacy-policy.component').then(
        (m) => m.PrivacyPolicyComponent,
      ),
  },
  {
    path: 'terms',
    loadComponent: () =>
      import('./legal/terms/terms.component').then((m) => m.TermsComponent),
  },
  {
    path: 'accessibility',
    loadComponent: () =>
      import('./legal/accessibility/accessibility.component').then(
        (m) => m.AccessibilityComponent,
      ),
  },
  {
    path: 'cookie-policy',
    loadComponent: () =>
      import('./legal/cookie-policy/cookie-policy.component').then(
        (m) => m.CookiePolicyComponent,
      ),
  },
  {
    path: 'jobs',
    loadComponent: () =>
      import('./jobs/jobs.component').then((m) => m.JobsComponent),
  },
  {
    path: 'scholarships',
    loadComponent: () =>
      import('./scholarships/scholarships.component').then(
        (m) => m.ScholarshipsComponent,
      ),
  },
  {
    path: 'mentorship',
    loadComponent: () =>
      import('./mentorship/mentorship.component').then(
        (m) => m.MentorshipComponent,
      ),
  },
  {
    path: 'research',
    loadComponent: () =>
      import('./research/research.component').then(
        (m) => m.ResearchComponent,
      ),
  },
  {
    path: 'news',
    loadComponent: () =>
      import('./news/news.component').then((m) => m.NewsComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
