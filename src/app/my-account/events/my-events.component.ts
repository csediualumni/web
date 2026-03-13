import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/admin.service';
import type { EventRsvp, ApiEvent } from '../../core/admin.service';
import { formatBDT } from '../../core/invoice.service';

type RsvpWithEvent = EventRsvp & { event: ApiEvent };

const PAID_CUTOFF_DAYS = 7;

@Component({
  selector: 'app-my-events',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-events.component.html',
})
export class MyEventsComponent implements OnInit {
  private readonly admin = inject(AdminService);

  rsvps = signal<RsvpWithEvent[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  cancellingId = signal<string | null>(null);
  cancelError = signal<string | null>(null);

  readonly formatBDT = formatBDT;

  statusClass(status: string): string {
    const classes: Record<string, string> = {
      registered: 'bg-green-100 text-green-700',
      pending_payment: 'bg-amber-100 text-amber-700',
      cancelled: 'bg-zinc-100 text-zinc-500',
    };
    return classes[status] ?? 'bg-zinc-100 text-zinc-500';
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      registered: 'Registered',
      pending_payment: 'Payment Pending',
      cancelled: 'Cancelled',
    };
    return labels[status] ?? status;
  }

  canCancel(rsvp: RsvpWithEvent): boolean {
    if (rsvp.status !== 'registered' && rsvp.status !== 'pending_payment') return false;
    if (rsvp.invoiceId) {
      const days = (new Date(rsvp.event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return days >= PAID_CUTOFF_DAYS;
    }
    return true;
  }

  cancelRsvp(rsvp: RsvpWithEvent): void {
    this.cancellingId.set(rsvp.id);
    this.cancelError.set(null);
    this.admin.cancelRsvpEvent(rsvp.eventId).subscribe({
      next: () => {
        this.rsvps.update((list) =>
          list.map((r) => (r.id === rsvp.id ? { ...r, status: 'cancelled' as const } : r)),
        );
        this.cancellingId.set(null);
      },
      error: (err: { error?: { message?: string } }) => {
        this.cancelError.set(err?.error?.message ?? 'Could not cancel. Please try again.');
        this.cancellingId.set(null);
      },
    });
  }

  ngOnInit(): void {
    this.admin.getMyRsvps().subscribe({
      next: (list) => {
        this.rsvps.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load your registrations. Please try again.');
        this.loading.set(false);
      },
    });
  }
}
