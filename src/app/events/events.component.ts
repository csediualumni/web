import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService, ApiEvent, EventMode, EventStatus } from '../core/admin.service';
import { AuthService } from '../core/auth.service';
import { ContentRendererComponent } from '../shared/content-renderer/content-renderer.component';

// Re-export for template compatibility
export type { EventStatus, EventMode };
export type { ApiEvent as CalendarEvent };

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, ContentRendererComponent],
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
  myRsvps = signal<Map<string, 'registered' | 'cancelled' | 'pending_payment'>>(new Map());
  /** eventId set — tracks ongoing RSVP request */
  rsvping = signal<Set<string>>(new Set());

  private static readonly PAID_CUTOFF_DAYS = 7;

  /** Returns true if a paid event is still open for registration (> 7 days away). */
  isPaidRegistrationOpen(event: ApiEvent): boolean {
    if (!event.ticketPrice) return true; // free event — no cutoff
    const msPerDay = 1000 * 60 * 60 * 24;
    const days = Math.floor((new Date(event.date).getTime() - Date.now()) / msPerDay);
    return days >= EventsComponent.PAID_CUTOFF_DAYS;
  }

  /** Returns true if a paid RSVP can still be cancelled (> 7 days away). */
  isPaidCancellationAllowed(event: ApiEvent): boolean {
    if (!event.ticketPrice) return true; // free event — no cutoff
    const msPerDay = 1000 * 60 * 60 * 24;
    const days = Math.floor((new Date(event.date).getTime() - Date.now()) / msPerDay);
    return days >= EventsComponent.PAID_CUTOFF_DAYS;
  }

  filteredEvents = computed(() => {
    const tab = this.activeTab();
    const cat = this.activeCategory();
    return this.events().filter((e) => e.status === tab && (cat === 'All' || e.category === cat));
  });

  featuredEvent = computed(() => this.events().find((e) => e.featured && e.status === 'upcoming'));

  upcomingCount = computed(() => this.events().filter((e) => e.status === 'upcoming').length);
  pastCount = computed(() => this.events().filter((e) => e.status === 'past').length);

  private readonly adminService = inject(AdminService);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

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

    // Client-side guard for paid events: registration cutoff
    if (!this.isPaidRegistrationOpen(event)) {
      alert('Registration for this paid event is closed 7 days before the event.');
      return;
    }

    this.rsvping.update((s) => new Set([...s, event.id]));

    this.adminService.rsvpEvent(event.id).subscribe({
      next: (res) => {
        this.rsvping.update((s) => {
          const next = new Set(s);
          next.delete(event.id);
          return next;
        });

        // Paid event: redirect to payment page
        if (res.invoiceId) {
          this.myRsvps.update((m) => new Map([...m, [event.id, 'pending_payment']]));
          this.router.navigate(['/payment'], { queryParams: { invoiceId: res.invoiceId } });
          return;
        }

        // Free event: mark registered and update seat count
        this.myRsvps.update((m) => new Map([...m, [event.id, 'registered']]));
        this.events.update((list) =>
          list.map((e) =>
            e.id === event.id && e.seatsLeft !== null
              ? { ...e, seatsLeft: Math.max(0, e.seatsLeft - 1), rsvpCount: e.rsvpCount + 1 }
              : e,
          ),
        );
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
    // Client-side guard for paid events: cancellation cutoff
    if (!this.isPaidCancellationAllowed(event)) {
      alert('Cancellation is not allowed within 7 days of the event.');
      return;
    }

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
    return mode === 'Online' ? 'fa-wifi' : mode === 'Hybrid' ? 'fa-layer-group' : 'fa-location-dot';
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
