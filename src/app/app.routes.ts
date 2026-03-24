import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { manageDefaultGuard } from './core/manage-default.guard';

export const routes: Routes = [
  {
    // Public homepage
    path: '',
    title: 'Welcome',
    loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'auth/login',
    title: 'Login',
    loadComponent: () => import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/register',
    title: 'Register',
    loadComponent: () =>
      import('./auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'auth/callback',
    title: 'Authenticating',
    loadComponent: () =>
      import('./auth/callback/callback.component').then((m) => m.AuthCallbackComponent),
  },
  {
    path: 'auth/reset-password',
    title: 'Reset Password',
    loadComponent: () =>
      import('./auth/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent,
      ),
  },
  {
    path: 'dashboard',
    title: 'Dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  // ── Legacy redirects so old bookmarks keep working ───────────────
  { path: 'profile', redirectTo: '/my/profile', pathMatch: 'full' },
  { path: 'membership/apply', redirectTo: '/my/membership', pathMatch: 'full' },
  { path: 'membership/status', redirectTo: '/my/membership', pathMatch: 'full' },
  { path: 'membership', redirectTo: '/my/membership', pathMatch: 'full' },
  // ── My Account portal ────────────────────────────────────────────
  {
    path: 'my',
    title: 'My Account',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./my-account/my-account.component').then((m) => m.MyAccountComponent),
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      {
        path: 'overview',
        title: 'Overview',
        loadComponent: () =>
          import('./my-account/overview/my-overview.component').then((m) => m.MyOverviewComponent),
      },
      {
        path: 'profile',
        title: 'Edit Profile',
        loadComponent: () =>
          import('./profile/profile-edit.component').then((m) => m.ProfileEditComponent),
      },
      {
        path: 'membership',
        title: 'Membership',
        loadComponent: () =>
          import('./membership/status/membership-status.component').then(
            (m) => m.MembershipStatusComponent,
          ),
      },
      {
        path: 'membership/apply',
        title: 'Apply for Membership',
        loadComponent: () =>
          import('./membership/apply/membership-apply.component').then(
            (m) => m.MembershipApplyComponent,
          ),
      },
      {
        path: 'invoices',
        title: 'My Invoices',
        loadComponent: () =>
          import('./my-account/invoices/my-invoices.component').then(
            (m) => m.MyInvoicesComponent,
          ),
      },
      {
        path: 'events',
        title: 'My Events',
        loadComponent: () =>
          import('./my-account/events/my-events.component').then((m) => m.MyEventsComponent),
      },
      {
        path: 'mentor',
        title: 'Mentorship Application',
        loadComponent: () =>
          import('./my-account/mentor/my-mentor.component').then((m) => m.MyMentorComponent),
      },
      {
        path: 'research',
        title: 'My Research Papers',
        loadComponent: () =>
          import('./my-account/research/my-research.component').then((m) => m.MyResearchComponent),
      },
    ],
  },
  {
    path: 'manage',
    title: 'Admin',
    canActivate: [authGuard],
    loadComponent: () => import('./admin/admin.component').then((m) => m.AdminComponent),
    children: [
      { path: '', canActivate: [manageDefaultGuard], loadComponent: () => import('./admin/admin.component').then((m) => m.AdminComponent) },
      {
        path: 'users',
        title: 'Manage Users',
        loadComponent: () =>
          import('./admin/users/admin-users.component').then((m) => m.AdminUsersComponent),
      },
      {
        path: 'roles',
        title: 'Manage Roles',
        loadComponent: () =>
          import('./admin/roles/admin-roles.component').then((m) => m.AdminRolesComponent),
      },
      {
        path: 'invoices',
        title: 'Manage Invoices',
        loadComponent: () =>
          import('./admin/invoices/admin-invoices.component').then((m) => m.AdminInvoicesComponent),
      },
      {
        path: 'newsletter',
        title: 'Manage Newsletter',
        loadComponent: () =>
          import('./admin/newsletter/admin-newsletter.component').then(
            (m) => m.AdminNewsletterComponent,
          ),
      },
      {
        path: 'membership',
        title: 'Manage Membership',
        loadComponent: () =>
          import('./admin/membership/admin-membership.component').then(
            (m) => m.AdminMembershipComponent,
          ),
      },
      {
        path: 'contact',
        title: 'Manage Contact',
        loadComponent: () =>
          import('./admin/contact/admin-contact.component').then((m) => m.AdminContactComponent),
      },
      {
        path: 'milestones',
        title: 'Manage Milestones',
        loadComponent: () =>
          import('./admin/milestones/admin-milestones.component').then(
            (m) => m.AdminMilestonesComponent,
          ),
      },
      {
        path: 'committees',
        title: 'Manage Committees',
        loadComponent: () =>
          import('./admin/committees/admin-committees.component').then(
            (m) => m.AdminCommitteesComponent,
          ),
      },
      {
        path: 'events',
        title: 'Manage Events',
        loadComponent: () =>
          import('./admin/events/admin-events.component').then((m) => m.AdminEventsComponent),
      },
      {
        path: 'campaigns',
        title: 'Manage Campaigns',
        loadComponent: () =>
          import('./admin/campaigns/admin-campaigns.component').then(
            (m) => m.AdminCampaignsComponent,
          ),
      },
      {
        path: 'gallery',
        title: 'Manage Gallery',
        loadComponent: () =>
          import('./admin/gallery/admin-gallery.component').then(
            (m) => m.AdminGalleryComponent,
          ),
      },
      {
        path: 'news',
        title: 'Manage News',
        loadComponent: () =>
          import('./admin/news/admin-news.component').then(
            (m) => m.AdminNewsComponent,
          ),
      },
      {
        path: 'research',
        title: 'Manage Research',
        loadComponent: () =>
          import('./admin/research/admin-research.component').then(
            (m) => m.AdminResearchComponent,
          ),
      },
      {
        path: 'mentors',
        title: 'Manage Mentors',
        loadComponent: () =>
          import('./admin/mentors/admin-mentors.component').then(
            (m) => m.AdminMentorsComponent,
          ),
      },
      {
        path: 'scholarships',
        title: 'Manage Scholarships',
        loadComponent: () =>
          import('./admin/scholarships/admin-scholarships.component').then(
            (m) => m.AdminScholarshipsComponent,
          ),
      },
      {
        path: 'jobs',
        title: 'Manage Jobs',
        loadComponent: () =>
          import('./admin/jobs/admin-jobs.component').then(
            (m) => m.AdminJobsComponent,
          ),
      },
      {
        path: 'config',
        title: 'Site Configuration',
        loadComponent: () =>
          import('./admin/config/admin-config.component').then(
            (m) => m.AdminConfigComponent,
          ),
      },
    ],
  },
  {
    path: 'about',
    title: 'About',
    loadComponent: () => import('./about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'alumni',
    title: 'Alumni Directory',
    loadComponent: () => import('./alumni/alumni.component').then((m) => m.AlumniComponent),
  },
  {
    path: 'alumni/:id',
    title: 'Alumni Profile',
    loadComponent: () =>
      import('./alumni/profile/alumni-profile.component').then((m) => m.AlumniProfileComponent),
  },
  {
    path: 'committee',
    title: 'Committee',
    loadComponent: () =>
      import('./committee/committee.component').then((m) => m.CommitteeComponent),
  },
  {
    path: 'committee/:id',
    title: 'Committee Detail',
    loadComponent: () =>
      import('./committee/detail/committee-detail.component').then(
        (m) => m.CommitteeDetailComponent,
      ),
  },
  {
    path: 'events',
    title: 'Events',
    loadComponent: () => import('./events/events.component').then((m) => m.EventsComponent),
  },
  {
    path: 'donations',
    title: 'Donations',
    loadComponent: () =>
      import('./donations/donations.component').then((m) => m.DonationsComponent),
  },
  {
    path: 'payment',
    title: 'Payment',
    loadComponent: () => import('./payment/payment.component').then((m) => m.PaymentComponent),
  },
  {
    path: 'contact',
    title: 'Contact',
    loadComponent: () => import('./contact/contact.component').then((m) => m.ContactComponent),
  },
  {
    path: 'gallery',
    title: 'Gallery',
    loadComponent: () => import('./gallery/gallery.component').then((m) => m.GalleryComponent),
  },
  {
    path: 'sitemap',
    title: 'Sitemap',
    loadComponent: () =>
      import('./legal/sitemap/sitemap.component').then((m) => m.SitemapComponent),
  },
  {
    path: 'privacy-policy',
    title: 'Privacy Policy',
    loadComponent: () =>
      import('./legal/privacy-policy/privacy-policy.component').then(
        (m) => m.PrivacyPolicyComponent,
      ),
  },
  {
    path: 'terms',
    title: 'Terms of Service',
    loadComponent: () => import('./legal/terms/terms.component').then((m) => m.TermsComponent),
  },
  {
    path: 'accessibility',
    title: 'Accessibility',
    loadComponent: () =>
      import('./legal/accessibility/accessibility.component').then((m) => m.AccessibilityComponent),
  },
  {
    path: 'cookie-policy',
    title: 'Cookie Policy',
    loadComponent: () =>
      import('./legal/cookie-policy/cookie-policy.component').then((m) => m.CookiePolicyComponent),
  },
  {
    path: 'jobs',
    title: 'Jobs',
    loadComponent: () => import('./jobs/jobs.component').then((m) => m.JobsComponent),
  },
  {
    path: 'scholarships',
    title: 'Scholarships',
    loadComponent: () =>
      import('./scholarships/scholarships.component').then((m) => m.ScholarshipsComponent),
  },
  {
    path: 'mentorship',
    title: 'Mentorship',
    loadComponent: () =>
      import('./mentorship/mentorship.component').then((m) => m.MentorshipComponent),
  },
  {
    path: 'research',
    title: 'Research',
    loadComponent: () => import('./research/research.component').then((m) => m.ResearchComponent),
  },
  {
    path: 'news',
    title: 'News',
    loadComponent: () => import('./news/news.component').then((m) => m.NewsComponent),
  },
  {
    path: 'issues',
    title: 'Issues',
    loadComponent: () => import('./issues/issues.component').then((m) => m.IssuesComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
