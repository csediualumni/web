import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { manageDefaultGuard } from './core/manage-default.guard';

export const routes: Routes = [
  {
    // Public homepage
    path: '',
    title: 'Welcome',
    data: {
      description:
        'Welcome to the CSE DIU Alumni Association – the official network connecting Computer Science & Engineering graduates of Daffodil International University worldwide.',
      keywords:
        'CSE DIU Alumni, Daffodil International University, computer science alumni, DIU graduates, alumni association, alumni network',
    },
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
        title: 'My Research',
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
    data: {
      description:
        'Learn about the CSE DIU Alumni Association – our history, mission, milestones, and the leadership team driving our alumni community forward.',
      keywords:
        'about CSE DIU Alumni, alumni history, alumni mission, DIU CSE committee, alumni leadership',
    },
    loadComponent: () => import('./about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'alumni',
    title: 'Alumni Directory',
    data: {
      description:
        'Browse the CSE DIU Alumni Directory – search and connect with Computer Science & Engineering graduates by batch, industry, or location.',
      keywords:
        'CSE DIU alumni directory, DIU graduates, computer science alumni search, alumni by batch',
    },
    loadComponent: () => import('./alumni/alumni.component').then((m) => m.AlumniComponent),
  },
  {
    path: 'alumni/:id',
    title: 'Alumni Profile',
    data: {
      description: 'View the alumni profile of a CSE DIU graduate – career details, batch, and contact information.',
      keywords: 'CSE DIU alumni profile, graduate profile, DIU CSE member',
    },
    loadComponent: () =>
      import('./alumni/profile/alumni-profile.component').then((m) => m.AlumniProfileComponent),
  },
  {
    path: 'committee',
    title: 'Committee',
    data: {
      description:
        'Meet the executive committee of the CSE DIU Alumni Association – the dedicated leaders volunteering their time to serve our alumni community.',
      keywords:
        'CSE DIU Alumni committee, executive committee, alumni leadership, DIU CSE committee members',
    },
    loadComponent: () =>
      import('./committee/committee.component').then((m) => m.CommitteeComponent),
  },
  {
    path: 'committee/:id',
    title: 'Committee Detail',
    data: {
      description: 'Detailed information about a CSE DIU Alumni Association committee.',
      keywords: 'CSE DIU Alumni committee detail, alumni committee, DIU CSE committee',
    },
    loadComponent: () =>
      import('./committee/detail/committee-detail.component').then(
        (m) => m.CommitteeDetailComponent,
      ),
  },
  {
    path: 'events',
    title: 'Events',
    data: {
      description:
        'Stay informed about upcoming CSE DIU Alumni events – reunions, workshops, seminars, and networking sessions for graduates.',
      keywords:
        'CSE DIU Alumni events, alumni reunions, DIU workshops, alumni networking, CSE alumni seminar',
    },
    loadComponent: () => import('./events/events.component').then((m) => m.EventsComponent),
  },
  {
    path: 'donations',
    title: 'Donations',
    data: {
      description:
        'Support the CSE DIU Alumni community through your generous donations. Help fund scholarships, events, and resources for students and graduates.',
      keywords:
        'CSE DIU Alumni donations, support alumni, DIU CSE fund, alumni donation, scholarship fund',
    },
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
    data: {
      description:
        'Get in touch with the CSE DIU Alumni Association. Reach out for membership queries, event information, or partnership opportunities.',
      keywords:
        'contact CSE DIU Alumni, alumni association contact, DIU CSE contact, alumni support',
    },
    loadComponent: () => import('./contact/contact.component').then((m) => m.ContactComponent),
  },
  {
    path: 'gallery',
    title: 'Gallery',
    data: {
      description:
        'Browse photos and memories from CSE DIU Alumni events, reunions, and community gatherings.',
      keywords: 'CSE DIU Alumni gallery, alumni photos, DIU CSE event photos, alumni memories',
    },
    loadComponent: () => import('./gallery/gallery.component').then((m) => m.GalleryComponent),
  },
  {
    path: 'sitemap',
    title: 'Sitemap',
    data: {
      description: 'Explore all pages and sections of the CSE DIU Alumni Association website.',
      keywords: 'CSE DIU Alumni sitemap, website pages, alumni site navigation',
    },
    loadComponent: () =>
      import('./legal/sitemap/sitemap.component').then((m) => m.SitemapComponent),
  },
  {
    path: 'privacy-policy',
    title: 'Privacy Policy',
    data: {
      description:
        'Read the privacy policy of the CSE DIU Alumni Association. Understand how we collect, use, and protect your personal data.',
      keywords: 'CSE DIU Alumni privacy policy, data protection, alumni privacy',
    },
    loadComponent: () =>
      import('./legal/privacy-policy/privacy-policy.component').then(
        (m) => m.PrivacyPolicyComponent,
      ),
  },
  {
    path: 'terms',
    title: 'Terms of Service',
    data: {
      description:
        'Review the Terms of Service for using the CSE DIU Alumni Association platform and its features.',
      keywords: 'CSE DIU Alumni terms of service, terms and conditions, alumni platform terms',
    },
    loadComponent: () => import('./legal/terms/terms.component').then((m) => m.TermsComponent),
  },
  {
    path: 'accessibility',
    title: 'Accessibility',
    data: {
      description:
        'Learn about the accessibility features and commitments of the CSE DIU Alumni Association website.',
      keywords: 'CSE DIU Alumni accessibility, web accessibility, inclusive design',
    },
    loadComponent: () =>
      import('./legal/accessibility/accessibility.component').then((m) => m.AccessibilityComponent),
  },
  {
    path: 'cookie-policy',
    title: 'Cookie Policy',
    data: {
      description:
        'Understand how the CSE DIU Alumni Association website uses cookies and similar tracking technologies.',
      keywords: 'CSE DIU Alumni cookie policy, cookies, tracking policy',
    },
    loadComponent: () =>
      import('./legal/cookie-policy/cookie-policy.component').then((m) => m.CookiePolicyComponent),
  },
  {
    path: 'jobs',
    title: 'Jobs',
    data: {
      description:
        'Explore job opportunities, internships, and career resources shared within the CSE DIU Alumni network.',
      keywords:
        'CSE DIU Alumni jobs, alumni job board, DIU CSE careers, computer science jobs Bangladesh',
    },
    loadComponent: () => import('./jobs/jobs.component').then((m) => m.JobsComponent),
  },
  {
    path: 'scholarships',
    title: 'Scholarships',
    data: {
      description:
        'Discover scholarship opportunities available to CSE DIU students and alumni, supported by the alumni association.',
      keywords:
        'CSE DIU Alumni scholarships, DIU scholarship, computer science scholarship Bangladesh, alumni scholarship fund',
    },
    loadComponent: () =>
      import('./scholarships/scholarships.component').then((m) => m.ScholarshipsComponent),
  },
  {
    path: 'mentorship',
    title: 'Mentorship',
    data: {
      description:
        'Connect with experienced CSE DIU Alumni mentors or offer your own expertise. The mentorship programme bridges current students with successful graduates.',
      keywords:
        'CSE DIU Alumni mentorship, alumni mentor, DIU CSE mentoring, career mentorship Bangladesh',
    },
    loadComponent: () =>
      import('./mentorship/mentorship.component').then((m) => m.MentorshipComponent),
  },
  {
    path: 'research',
    title: 'Research',
    data: {
      description:
        'Read and share research papers and academic publications contributed by CSE DIU alumni and faculty.',
      keywords:
        'CSE DIU Alumni research, research papers, DIU CSE publications, computer science research Bangladesh',
    },
    loadComponent: () => import('./research/research.component').then((m) => m.ResearchComponent),
  },
  {
    path: 'news',
    title: 'News',
    data: {
      description:
        'Stay up-to-date with the latest news, announcements, and achievements from the CSE DIU Alumni community.',
      keywords:
        'CSE DIU Alumni news, alumni announcements, DIU CSE news, alumni achievements',
    },
    loadComponent: () => import('./news/news.component').then((m) => m.NewsComponent),
  },
  {
    path: 'news/:id',
    title: 'News Article',
    data: {
      description: 'Read the latest news articles and announcements from the CSE DIU Alumni community.',
      keywords: 'CSE DIU Alumni news article, alumni announcement, DIU CSE update',
    },
    loadComponent: () =>
      import('./news/detail/news-detail.component').then((m) => m.NewsDetailComponent),
  },
  {
    path: 'issues',
    title: 'Issues',
    data: {
      description:
        'Browse open issues and contribute to the CSE DIU Alumni web platform on GitHub. Help improve the community website.',
      keywords:
        'CSE DIU Alumni issues, GitHub issues, open source contributions, DIU CSE web platform',
    },
    loadComponent: () => import('./issues/issues.component').then((m) => m.IssuesComponent),
  },
  {
    path: 'contributors',
    title: 'Contributors',
    data: {
      description:
        'Meet the developers and contributors who built and maintain the CSE DIU Alumni web platform.',
      keywords:
        'CSE DIU Alumni contributors, web platform developers, open source contributors, DIU CSE developers',
    },
    loadComponent: () =>
      import('./contributors/contributors.component').then((m) => m.ContributorsComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
