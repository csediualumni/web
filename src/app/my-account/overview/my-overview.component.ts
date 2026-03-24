import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MembershipService, MembershipApplication } from '../../core/membership.service';
import { InvoiceService, Invoice, dueAmount, formatBDT } from '../../core/invoice.service';
import { AdminService, ApplicationStatus } from '../../core/admin.service';
import type { EventRsvp, ApiEvent } from '../../core/admin.service';

type RsvpWithEvent = EventRsvp & { event: ApiEvent };

@Component({
  selector: 'app-my-overview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-overview.component.html',
})
export class MyOverviewComponent implements OnInit {
  private readonly membership = inject(MembershipService);
  private readonly invoices = inject(InvoiceService);
  private readonly admin = inject(AdminService);

  application = signal<MembershipApplication | null>(null);
  invoiceList = signal<Invoice[]>([]);
  rsvps = signal<RsvpWithEvent[]>([]);
  mentorApp = signal<{ status: ApplicationStatus } | null>(null);

  loading = signal(true);

  readonly formatBDT = formatBDT;

  get pendingInvoices(): Invoice[] {
    return this.invoiceList().filter((i) => i.status === 'pending' || i.status === 'partial');
  }

  get upcomingRsvps(): RsvpWithEvent[] {
    const now = new Date();
    return this.rsvps().filter((r) => r.status === 'registered' && new Date(r.event.date) >= now);
  }

  membershipLabel(status: string): string {
    const labels: Record<string, string> = {
      payment_required: 'Payment Required',
      payment_submitted: 'Under Review',
      approved: 'Active Member',
      rejected: 'Rejected',
    };
    return labels[status] ?? status;
  }

  membershipClass(status: string): string {
    const classes: Record<string, string> = {
      approved: 'bg-green-100 text-green-700',
      payment_submitted: 'bg-blue-100 text-blue-700',
      payment_required: 'bg-amber-100 text-amber-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return classes[status] ?? 'bg-zinc-100 text-zinc-600';
  }

  mentorStatusLabel(status: ApplicationStatus): string {
    const labels: Record<ApplicationStatus, string> = {
      pending: 'Pending',
      reviewing: 'Under Review',
      accepted: 'Accepted',
      rejected: 'Rejected',
    };
    return labels[status];
  }

  mentorStatusClass(status: ApplicationStatus): string {
    const classes: Record<ApplicationStatus, string> = {
      pending: 'bg-amber-100 text-amber-700',
      reviewing: 'bg-blue-100 text-blue-700',
      accepted: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return classes[status];
  }

  ngOnInit(): void {
    let done = 0;
    const finish = () => {
      if (++done === 4) this.loading.set(false);
    };

    this.membership.getMyApplication().subscribe({
      next: (app) => {
        this.application.set(app);
        finish();
      },
      error: () => finish(),
    });

    this.invoices.getMyInvoices().subscribe({
      next: (list) => {
        this.invoiceList.set(list);
        finish();
      },
      error: () => finish(),
    });

    this.admin.getMyRsvps().subscribe({
      next: (list) => {
        this.rsvps.set(list);
        finish();
      },
      error: () => finish(),
    });

    this.admin.getMyMentorApplication().subscribe({
      next: (app) => {
        this.mentorApp.set(app);
        finish();
      },
      error: () => finish(),
    });
  }
}
