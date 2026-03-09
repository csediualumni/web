import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AdminService, ApiEvent, EventMode, EventStatus } from '../core/admin.service';
import { AuthService } from '../core/auth.service';

// Re-export for template compatibility
export type { EventStatus, EventMode };
export type { ApiEvent as CalendarEvent };

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './events.component.html',
})
export class EventsComponent implements OnInit {
  readonly categories = ['All', 'Reunion', 'Workshop', 'Seminar', 'Sports', 'Cultural', 'Webinar'];
  readonly tabs: EventStatus[] = ['upcoming', 'past'];

  activeTab = signal<EventStatus>('upcoming');
  activeCategory = signal('All');

  events = signal<ApiEvent[]>([]);
  loading = signal(true);
  apiError = signal('');

  /** eventId → 'registered' | 'cancelled' — tracks RSVP state during session */
  myRsvps = signal<Map<string, 'registered' | 'cancelled'>>(new Map());
  /** eventId set — tracks ongoing RSVP request */
  rsvping = signal<Set<string>>(new Set());

  filteredEvents = computed(() => {
    const tab = this.activeTab();
    const cat = this.activeCategory();
    return this.events().filter(
      (e) => e.status === tab && (cat === 'All' || e.category === cat),
    );
  });

  featuredEvent = computed(() =>
    this.events().find((e) => e.featured && e.status === 'upcoming'),
  );

  upcomingCount = computed(
    () => this.events().filter((e) => e.status === 'upcoming').length,
  );
  pastCount = computed(
    () => this.events().filter((e) => e.status === 'past').length,
  );

  constructor(
    private readonly adminService: AdminService,
    public readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.adminService.getEvents().subscribe({
      next: (data) => {
        this.events.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.apiError.set('Could not load events. Please try again later.');
        this.loading.set(false);
      },
    });
  }

  setTab(tab: EventStatus): void {
    this.activeTab.set(tab);
    this.activeCategory.set('All');
  }

  setCategory(cat: string): void {
    this.activeCategory.set(cat);
  }

  isRegistered(eventId: string): boolean {
    return this.myRsvps().get(eventId) === 'registered';
  }

  isRsvping(eventId: string): boolean {
    return this.rsvping().has(eventId);
  }

  register(event: ApiEvent): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    if (this.isRsvping(event.id)) return;

    this.rsvping.update((s) => new Set([...s, event.id]));

    this.adminService.rsvpEvent(event.id).subscribe({
      next: () => {
        this.myRsvps.update((m) => new Map([...m, [event.id, 'registered']]));
        // Decrement seatsLeft locally for instant UI feedback
        this.events.update((list) =>
          list.map((e) =>
            e.id === event.id && e.seatsLeft !== null
              ? { ...e, seatsLeft: Math.max(0, e.seatsLeft - 1), rsvpCount: e.rsvpCount + 1 }
              : e,
          ),
        );
        this.rsvping.update((s) => {
          const next = new Set(s);
          next.delete(event.id);
          return next;
        });
      },
      error: (err) => {
        const msg: string = err?.error?.message ?? 'Registration failed.';
        alert(msg);
        this.rsvping.update((s) => {
          const next = new Set(s);
          next.delete(event.id);
          return next;
        });
      },
    });
  }

  cancelRsvp(event: ApiEvent): void {
    if (!confirm('Cancel your registration for this event?')) return;
    if (this.isRsvping(event.id)) return;

    this.rsvping.update((s) => new Set([...s, event.id]));

    this.adminService.cancelRsvpEvent(event.id).subscribe({
      next: () => {
        this.myRsvps.update((m) => new Map([...m, [event.id, 'cancelled']]));
        // Increment seatsLeft locally
        this.events.update((list) =>
          list.map((e) =>
            e.id === event.id && e.seats !== null
              ? { ...e, seatsLeft: (e.seatsLeft ?? 0) + 1, rsvpCount: Math.max(0, e.rsvpCount - 1) }
              : e,
          ),
        );
        this.rsvping.update((s) => {
          const next = new Set(s);
          next.delete(event.id);
          return next;
        });
      },
      error: () => {
        this.rsvping.update((s) => {
          const next = new Set(s);
          next.delete(event.id);
          return next;
        });
      },
    });
  }

  formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateStr));
  }

  occupancyPercent(e: ApiEvent): number {
    if (e.seats === null || e.seatsLeft === null) return 0;
    return Math.round(((e.seats - e.seatsLeft) / e.seats) * 100);
  }

  modeIcon(mode: EventMode): string {
    return mode === 'Online'
      ? 'fa-wifi'
      : mode === 'Hybrid'
        ? 'fa-layer-group'
        : 'fa-location-dot';
  }

  statusBadge(e: ApiEvent): { label: string; classes: string } {
    if (e.seatsLeft !== null && e.seatsLeft <= 20) {
      return { label: 'Almost Full', classes: 'bg-red-100 text-red-700' };
    }
    if (e.status === 'upcoming') {
      return { label: 'Open', classes: 'bg-emerald-100 text-emerald-700' };
    }
    if (e.status === 'ongoing') {
      return { label: 'Ongoing', classes: 'bg-blue-100 text-blue-700' };
    }
    return { label: 'Completed', classes: 'bg-zinc-100 text-zinc-500' };
  }
}
