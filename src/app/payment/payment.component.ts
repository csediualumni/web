import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  InvoiceService,
  Invoice,
  paidAmount,
  pendingAmount,
  dueAmount,
  formatBDT,
} from '../core/invoice.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment.component.html',
})
export class PaymentComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly svc = inject(InvoiceService);

  invoice = signal<Invoice | null>(null);
  loading = signal(true);
  notFound = signal(false);
  initiating = signal(false);
  error = signal('');

  // ── Computed ───────────────────────────────────────────────────
  readonly paid = computed(() => (this.invoice() ? paidAmount(this.invoice()!) : 0));
  readonly pending = computed(() => (this.invoice() ? pendingAmount(this.invoice()!) : 0));
  readonly due = computed(() => (this.invoice() ? dueAmount(this.invoice()!) : 0));
  readonly progressPct = computed(() => {
    const inv = this.invoice();
    if (!inv || inv.totalAmount === 0) return 0;
    return Math.min(100, Math.round((this.paid() / inv.totalAmount) * 100));
  });

  readonly fmt = formatBDT;

  // ── Lifecycle ──────────────────────────────────────────────────
  ngOnInit() {
    const id = this.route.snapshot.queryParamMap.get('invoiceId');
    if (!id) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }
    this.svc.getById(id).subscribe({
      next: (inv) => {
        this.invoice.set(inv);
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  payNow(): void {
    const inv = this.invoice();
    if (!inv || this.initiating()) return;
    this.initiating.set(true);
    this.error.set('');
    this.svc.initSslPayment(inv.id).subscribe({
      next: ({ gatewayUrl }) => {
        window.location.href = gatewayUrl;
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to initiate payment. Please try again.');
        this.initiating.set(false);
      },
    });
  }

  // ── Labels / colours ───────────────────────────────────────────
  statusLabel(status: Invoice['status']): string {
    return (
      {
        pending: 'Pending',
        partial: 'Partially Paid',
        paid: 'Fully Paid',
        cancelled: 'Cancelled',
        refunded: 'Refunded',
      }[status] ?? status
    );
  }

  statusColor(status: Invoice['status']): string {
    return (
      {
        pending: 'bg-amber-50 text-amber-700 border-amber-200',
        partial: 'bg-blue-50 text-blue-700 border-blue-200',
        paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        cancelled: 'bg-zinc-100 text-zinc-500 border-zinc-200',
        refunded: 'bg-violet-50 text-violet-700 border-violet-200',
      }[status] ?? ''
    );
  }

  paymentStatusLabel(s: string) {
    return (
      { pending: 'Processing', verified: 'Verified', rejected: 'Rejected', refunded: 'Refunded' }[
        s
      ] ?? s
    );
  }

  paymentStatusColor(s: string) {
    return (
      {
        pending: 'bg-amber-50 text-amber-700 border-amber-200',
        verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        rejected: 'bg-red-50 text-red-700 border-red-200',
        refunded: 'bg-violet-50 text-violet-700 border-violet-200',
      }[s] ?? ''
    );
  }
}
