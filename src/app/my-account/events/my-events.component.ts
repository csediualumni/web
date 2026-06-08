import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/admin.service';
import type { EventRsvp, ApiEvent, EventRegistration } from '../../core/admin.service';
import { formatBDT } from '../../core/invoice.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import QRCode from 'qrcode';

type RsvpWithEvent = EventRsvp & { event: ApiEvent };
type RegistrationWithEvent = EventRegistration & { event: ApiEvent };

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
  registrations = signal<RegistrationWithEvent[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  cancellingId = signal<string | null>(null);
  cancelError = signal<string | null>(null);
  /** Map from registrationId → base64 QR data URL */
  qrMap = signal<Map<string, string>>(new Map());

  readonly formatBDT = formatBDT;

  statusClass(status: string): string {
    const classes: Record<string, string> = {
      registered: 'bg-green-100 text-green-700',
      confirmed: 'bg-emerald-100 text-emerald-700',
      pending_payment: 'bg-amber-100 text-amber-700',
      cancelled: 'bg-zinc-100 text-zinc-500',
    };
    return classes[status] ?? 'bg-zinc-100 text-zinc-500';
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      registered: 'Registered',
      confirmed: 'Confirmed ✓',
      pending_payment: 'Payment Pending',
      cancelled: 'Cancelled',
    };
    return labels[status] ?? status;
  }

  canCancelRsvp(rsvp: RsvpWithEvent): boolean {
    if (rsvp.status !== 'registered' && rsvp.status !== 'pending_payment') return false;
    if (rsvp.invoiceId) {
      const days = (new Date(rsvp.event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return days >= PAID_CUTOFF_DAYS;
    }
    return true;
  }

  canCancelRegistration(reg: RegistrationWithEvent): boolean {
    if (reg.status === 'cancelled') return false;
    const days = (new Date(reg.event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return days >= PAID_CUTOFF_DAYS;
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

  cancelRegistration(reg: RegistrationWithEvent): void {
    if (!confirm('Cancel your registration for this event?')) return;
    this.cancellingId.set(reg.id);
    this.cancelError.set(null);
    this.admin.cancelEventRegistration(reg.eventId).subscribe({
      next: () => {
        this.registrations.update((list) =>
          list.map((r) => (r.id === reg.id ? { ...r, status: 'cancelled' as const } : r)),
        );
        this.cancellingId.set(null);
      },
      error: (err: { error?: { message?: string } }) => {
        this.cancelError.set(err?.error?.message ?? 'Could not cancel. Please try again.');
        this.cancellingId.set(null);
      },
    });
  }

  private async generateQrCodes(registrations: RegistrationWithEvent[]): Promise<void> {
    const map = new Map<string, string>();
    for (const reg of registrations) {
      if (reg.status === 'confirmed' && reg.user?.phone) {
        try {
          const url = await QRCode.toDataURL(reg.user.phone, {
            width: 256,
            margin: 2,
            color: { dark: '#18181b', light: '#ffffff' },
          });
          map.set(reg.id, url);
        } catch {
          // skip if generation fails
        }
      }
    }
    this.qrMap.set(map);
  }

  downloadQr(regId: string, eventTitle: string): void {
    const dataUrl = this.qrMap().get(regId);
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `qr-${eventTitle.replace(/\s+/g, '-').toLowerCase()}.png`;
    a.click();
  }

  ngOnInit(): void {
    forkJoin({
      rsvps: this.admin.getMyRsvps().pipe(catchError(() => of([]))),
      registrations: this.admin.getMyRegistrations().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ rsvps, registrations }) => {
        this.rsvps.set(rsvps);
        this.registrations.set(registrations);
        this.loading.set(false);
        void this.generateQrCodes(registrations);
      },
      error: () => {
        this.error.set('Could not load your registrations. Please try again.');
        this.loading.set(false);
      },
    });
  }

  formatDate(d: string): string {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(d));
  }
}
