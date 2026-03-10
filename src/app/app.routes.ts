import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    // Public homepage
    path: '',
    loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('./auth/callback/callback.component').then((m) => m.AuthCallbackComponent),
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
      import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'membership/apply',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./membership/apply/membership-apply.component').then(
        (m) => m.MembershipApplyComponent,
      ),
  },
  {
    path: 'membership/status',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./membership/status/membership-status.component').then(
        (m) => m.MembershipStatusComponent,
      ),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./profile/profile-edit.component').then((m) => m.ProfileEditComponent),
  },
  {
    path: 'manage',
    canActivate: [authGuard],
    loadComponent: () => import('./admin/admin.component').then((m) => m.AdminComponent),
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      {
        path: 'users',
        loadComponent: () =>
          import('./admin/users/admin-users.component').then((m) => m.AdminUsersComponent),
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('./admin/roles/admin-roles.component').then((m) => m.AdminRolesComponent),
      },
      {
        path: 'invoices',
        loadComponent: () =>
          import('./admin/invoices/admin-invoices.component').then((m) => m.AdminInvoicesComponent),
      },
      {
        path: 'newsletter',
        loadComponent: () =>
          import('./admin/newsletter/admin-newsletter.component').then(
            (m) => m.AdminNewsletterComponent,
          ),
      },
      {
        path: 'membership',
        loadComponent: () =>
          import('./admin/membership/admin-membership.component').then(
            (m) => m.AdminMembershipComponent,
          ),
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./admin/contact/admin-contact.component').then((m) => m.AdminContactComponent),
      },
      {
        path: 'milestones',
        loadComponent: () =>
          import('./admin/milestones/admin-milestones.component').then(
            (m) => m.AdminMilestonesComponent,
          ),
      },
      {
        path: 'committees',
        loadComponent: () =>
          import('./admin/committees/admin-committees.component').then(
            (m) => m.AdminCommitteesComponent,
          ),
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./admin/events/admin-events.component').then((m) => m.AdminEventsComponent),
      },
      {
        path: 'campaigns',
        loadComponent: () =>
          import('./admin/campaigns/admin-campaigns.component').then(
            (m) => m.AdminCampaignsComponent,
          ),
      },
      {
        path: 'gallery',
        loadComponent: () =>
          import('./admin/gallery/admin-gallery.component').then(
            (m) => m.AdminGalleryComponent,
          ),
      },
      {
        path: 'news',
        loadComponent: () =>
          import('./admin/news/admin-news.component').then(
            (m) => m.AdminNewsComponent,
          ),
      },
    ],
  },
  {
    path: 'about',
    loadComponent: () => import('./about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'alumni',
    loadComponent: () => import('./alumni/alumni.component').then((m) => m.AlumniComponent),
  },
  {
    path: 'alumni/:id',
    loadComponent: () =>
      import('./alumni/profile/alumni-profile.component').then((m) => m.AlumniProfileComponent),
  },
  {
    path: 'committee',
    loadComponent: () =>
      import('./committee/committee.component').then((m) => m.CommitteeComponent),
  },
  {
    path: 'committee/:id',
    loadComponent: () =>
      import('./committee/detail/committee-detail.component').then(
        (m) => m.CommitteeDetailComponent,
      ),
  },
  {
    path: 'events',
    loadComponent: () => import('./events/events.component').then((m) => m.EventsComponent),
  },
  {
    path: 'donations',
    loadComponent: () =>
      import('./donations/donations.component').then((m) => m.DonationsComponent),
  },
  {
    path: 'payment',
    loadComponent: () => import('./payment/payment.component').then((m) => m.PaymentComponent),
  },
  {
    path: 'contact',
    loadComponent: () => import('./contact/contact.component').then((m) => m.ContactComponent),
  },
  {
    path: 'gallery',
    loadComponent: () => import('./gallery/gallery.component').then((m) => m.GalleryComponent),
  },
  {
    path: 'sitemap',
    loadComponent: () =>
      import('./legal/sitemap/sitemap.component').then((m) => m.SitemapComponent),
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
    loadComponent: () => import('./legal/terms/terms.component').then((m) => m.TermsComponent),
  },
  {
    path: 'accessibility',
    loadComponent: () =>
      import('./legal/accessibility/accessibility.component').then((m) => m.AccessibilityComponent),
  },
  {
    path: 'cookie-policy',
    loadComponent: () =>
      import('./legal/cookie-policy/cookie-policy.component').then((m) => m.CookiePolicyComponent),
  },
  {
    path: 'jobs',
    loadComponent: () => import('./jobs/jobs.component').then((m) => m.JobsComponent),
  },
  {
    path: 'scholarships',
    loadComponent: () =>
      import('./scholarships/scholarships.component').then((m) => m.ScholarshipsComponent),
  },
  {
    path: 'mentorship',
    loadComponent: () =>
      import('./mentorship/mentorship.component').then((m) => m.MentorshipComponent),
  },
  {
    path: 'research',
    loadComponent: () => import('./research/research.component').then((m) => m.ResearchComponent),
  },
  {
    path: 'news',
    loadComponent: () => import('./news/news.component').then((m) => m.NewsComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
