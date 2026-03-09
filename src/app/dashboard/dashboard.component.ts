import { Component, computed, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/auth.service';
import { MembershipCardComponent, MemberCardData } from './membership-card/membership-card.component';

export interface ActivityItem {
  icon: string;
  iconBg: string;
  title: string;
  time: string;
}

export interface UpcomingEvent {
  title: string;
  date: string;
  location: string;
  badge: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MembershipCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  constructor(
    public auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    // Refresh profile data silently so the completion ring is accurate
    this.auth.loadProfile().subscribe({ error: () => {} });
  }

  // ── Computed helpers ─────────────────────────────────────────
  readonly userInitial = computed(() => {
    const email = this.auth.currentUser()?.email;
    return (email?.[0] ?? '?').toUpperCase();
  });

  readonly userEmail = computed(() => this.auth.currentUser()?.email ?? '');

  readonly displayName = computed(() => {
    const email = this.userEmail();
    return email.split('@')[0];
  });

  readonly roles = computed(() => this.auth.currentUser()?.roles ?? []);

  readonly memberSince = computed(() => {
    // Placeholder — replace with real createdAt from API
    return 'March 2026';
  });

  readonly memberCardData = computed<MemberCardData | null>(() => {
    const user = this.auth.currentUser();
    if (!user?.memberId) return null;
    const profile = user.profile as Record<string, unknown> | undefined;
    return {
      name: (profile?.['displayName'] as string | null) ?? user.email.split('@')[0],
      memberId: user.memberId,
      batch: (profile?.['batch'] as number | null) ?? null,
      email: user.email,
      jobTitle: (profile?.['jobTitle'] as string | null) ?? null,
      company: (profile?.['company'] as string | null) ?? null,
    };
  });

  isAdmin(): boolean {
    return this.auth.hasPermission('users:read');
  }

  isGuest(): boolean {
    return this.auth.isGuest();
  }

  isMember(): boolean {
    return this.auth.isMember();
  }

  // ── Static demo data (replace with API calls when ready) ─────
  readonly stats = [
    {
      label: 'Profile Views',
      value: '—',
      icon: 'fa-eye',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Connections',
      value: '—',
      icon: 'fa-user-group',
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
    {
      label: 'Events Attended',
      value: '—',
      icon: 'fa-calendar-check',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Posts Shared',
      value: '—',
      icon: 'fa-paper-plane',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ];

  readonly recentActivity: ActivityItem[] = [
    {
      icon: 'fa-user-check',
      iconBg: 'bg-emerald-100 text-emerald-700',
      title: 'Your account was created successfully.',
      time: 'Just now',
    },
    {
      icon: 'fa-shield-halved',
      iconBg: 'bg-blue-100 text-blue-700',
      title: 'Profile security check passed.',
      time: '1 min ago',
    },
    {
      icon: 'fa-bell',
      iconBg: 'bg-violet-100 text-violet-700',
      title: 'Welcome to the CSE DIU Alumni Network!',
      time: 'Today',
    },
  ];

  readonly upcomingEvents: UpcomingEvent[] = [
    {
      title: 'Annual Alumni Reunion 2026',
      date: 'Apr 15, 2026',
      location: 'DIU Campus, Savar',
      badge: 'In-person',
    },
    {
      title: 'Tech Talk: AI in Bangladesh',
      date: 'Mar 22, 2026',
      location: 'Online — Zoom',
      badge: 'Webinar',
    },
    {
      title: 'CSE Career Fair Spring 2026',
      date: 'Mar 30, 2026',
      location: 'DIU Auditorium',
      badge: 'In-person',
    },
  ];

  readonly quickLinks = [
    { label: 'Edit Profile', path: '/profile', icon: 'fa-user-pen' },
    { label: 'Alumni Directory', path: '/alumni', icon: 'fa-users' },
    { label: 'Job Board', path: '/jobs', icon: 'fa-briefcase' },
    { label: 'Events', path: '/events', icon: 'fa-calendar-days' },
    { label: 'Mentorship', path: '/mentorship', icon: 'fa-handshake' },
    { label: 'Gallery', path: '/gallery', icon: 'fa-images' },
    { label: 'News', path: '/news', icon: 'fa-newspaper' },
  ];

  readonly profileCompletion = computed(() => {
    const p = this.auth.currentUser()?.profile as Record<string, unknown> | undefined;
    if (!p) return 0;
    const fields = [
      p['displayName'],
      p['batch'],
      p['bio'],
      p['jobTitle'],
      p['company'],
      p['city'],
      p['country'],
      p['industry'],
      p['linkedin'] || p['github'],
      Array.isArray(p['skills']) && (p['skills'] as string[]).length > 0,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  });

  goToAdmin(): void {
    this.router.navigate(['/admin']);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
