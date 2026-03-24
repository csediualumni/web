import { Component, computed, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { AdminService, Milestone } from '../core/admin.service';
import { StatsService } from '../core/stats.service';
import { NewsService, NewsArticle } from '../news/news.service';
import { JobsService, JobPosting } from '../jobs/jobs.service';
import {
  MembershipCardComponent,
  MemberCardData,
} from './membership-card/membership-card.component';

export interface PlatformStatCard {
  value: string;
  label: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

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
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly adminService = inject(AdminService);
  private readonly statsService = inject(StatsService);
  private readonly newsService = inject(NewsService);
  private readonly jobsService = inject(JobsService);

  ngOnInit() {
    // Refresh profile data silently so the completion ring is accurate
    this.auth.loadProfile().subscribe({ error: () => undefined });
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

  readonly userAvatar = computed(() => this.auth.currentUser()?.profile?.avatar ?? null);

  readonly memberSince = computed(() => {
    const p = this.auth.currentUser()?.profile as Record<string, unknown> | undefined;
    const raw = p?.['createdAt'];
    if (!raw) return '';
    return new Date(raw as string).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
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

  // ── Platform stats (live from API) ──────────────────────────────
  private static readonly STAT_COLORS: Pick<PlatformStatCard, 'iconBg' | 'iconColor'>[] = [
    { iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { iconBg: 'bg-violet-50', iconColor: 'text-violet-600' },
    { iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
  ];

  readonly platformStats = toSignal(
    this.statsService.iconStats$.pipe(
      map((stats) =>
        stats.map(
          (s, i) =>
            ({
              ...s,
              icon: s.icon ?? 'fa-chart-bar',
              ...DashboardComponent.STAT_COLORS[i % 4],
            }) as PlatformStatCard,
        ),
      ),
    ),
    { initialValue: [] as PlatformStatCard[] },
  );

  // ── Latest news (3 most recent) ────────────────────────────────
  readonly latestNews = toSignal(
    this.newsService.getAll().pipe(
      map((articles) =>
        [...articles]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 3),
      ),
      catchError(() => of([] as NewsArticle[])),
    ),
    { initialValue: [] as NewsArticle[] },
  );

  // ── Latest job postings (3 most recent) ───────────────────────
  readonly latestJobs = toSignal(
    this.jobsService.getAll().pipe(
      map((jobs) =>
        [...jobs]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3),
      ),
      catchError(() => of([] as JobPosting[])),
    ),
    { initialValue: [] as JobPosting[] },
  );

  // ── Community milestones (top 4 by sortOrder) ─────────────────
  readonly milestones = toSignal(
    this.adminService.getMilestones().pipe(
      map((items) =>
        [...items]
          .sort((a, b) => b.sortOrder - a.sortOrder || Number(b.year) - Number(a.year))
          .slice(0, 4),
      ),
      catchError(() => of([] as Milestone[])),
    ),
    { initialValue: [] as Milestone[] },
  );

  readonly recentActivity = computed<ActivityItem[]>(() => {
    const user = this.auth.currentUser();
    const p = user?.profile as Record<string, unknown> | undefined;
    const items: ActivityItem[] = [];

    const rawCreated = p?.['createdAt'];
    const createdLabel = rawCreated
      ? new Date(rawCreated as string).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'Previously';
    items.push({
      icon: 'fa-user-check',
      iconBg: 'bg-emerald-100 text-emerald-700',
      title: 'Your account was created successfully.',
      time: createdLabel,
    });

    if (user?.memberId) {
      items.push({
        icon: 'fa-id-card',
        iconBg: 'bg-blue-100 text-blue-700',
        title: 'Membership activated — welcome to the alumni family!',
        time: 'Active',
      });
    }

    items.push({
      icon: 'fa-bell',
      iconBg: 'bg-violet-100 text-violet-700',
      title: 'Welcome to the CSE DIU Alumni Network!',
      time: 'Permanent',
    });

    return items;
  });

  readonly upcomingEvents = toSignal(
    this.adminService.getEvents().pipe(
      map((events) =>
        events
          .filter((e) => e.status === 'upcoming')
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 3)
          .map((e) => ({
            id: e.id,
            title: e.title,
            date: new Date(e.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            location: e.location,
            badge: e.mode,
          })),
      ),
      catchError(() => of([] as UpcomingEvent[])),
    ),
    { initialValue: [] as UpcomingEvent[] },
  );

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
    this.router.navigate(['/manage']);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
