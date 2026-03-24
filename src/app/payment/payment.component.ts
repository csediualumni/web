import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  InvoiceService,
  Invoice,
  SubmitPaymentDto,
  paidAmount,
  pendingAmount,
  dueAmount,
  formatBDT,
} from '../core/invoice.service';
import { SiteConfigService } from '../core/site-config.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './payment.component.html',
})
export class PaymentComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly svc = inject(InvoiceService);
  readonly siteConfig = inject(SiteConfigService);

  invoice = signal<Invoice | null>(null);
  loading = signal(true);
  notFound = signal(false);
  error = signal('');

  // ── Form ───────────────────────────────────────────────────────
  readonly quickAmounts = [100, 250, 500, 1000, 2000, 5000];
  formAmount = signal<number | null>(null);
  customAmountStr = signal('');
  transactionId = signal('');
  senderBkash = signal('');
  submitting = signal(false);
  submitted = signal(false);

  // ── Computed ───────────────────────────────────────────────────
  readonly paid = computed(() => (this.invoice() ? paidAmount(this.invoice()!) : 0));
  readonly pending = computed(() => (this.invoice() ? pendingAmount(this.invoice()!) : 0));
  readonly due = computed(() => (this.invoice() ? dueAmount(this.invoice()!) : 0));
  readonly progressPct = computed(() => {
    const inv = this.invoice();
    if (!inv || inv.totalAmount === 0) return 0;
    return Math.min(100, Math.round((this.paid() / inv.totalAmount) * 100));
  });

  readonly effectiveAmount = computed(() => {
    const custom = Number(this.customAmountStr());
    if (custom > 0) return custom;
    return this.formAmount() ?? 0;
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
        // Pre-fill amount with due amount if it's a round number
        if (dueAmount(inv) > 0) {
          this.formAmount.set(dueAmount(inv));
        }
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  // ── Interactions ───────────────────────────────────────────────
  selectQuick(amt: number) {
    this.formAmount.set(amt);
    this.customAmountStr.set('');
  }

  onCustomInput(val: string) {
    this.customAmountStr.set(val);
    this.formAmount.set(null);
  }

  canSubmit(): boolean {
    const inv = this.invoice();
    if (!inv) return false;
    if (inv.status === 'cancelled' || inv.status === 'paid') return false;
    if (this.effectiveAmount() < 10) return false;
    if (!this.transactionId().trim()) return false;
    if (!inv.isAnonymous && !this.senderBkash().trim()) return false;
    return true;
  }

  submit() {
    if (!this.canSubmit() || this.submitting()) return;
    const inv = this.invoice()!;
    this.submitting.set(true);
    this.error.set('');

    const dto: SubmitPaymentDto = {
      amount: this.effectiveAmount(),
      transactionId: this.transactionId().trim(),
      senderBkash: inv.isAnonymous ? undefined : this.senderBkash().trim() || undefined,
    };

    this.svc.submitPayment(inv.id, dto).subscribe({
      next: (updated) => {
        this.invoice.set(updated);
        this.submitted.set(true);
        this.submitting.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to submit payment. Please try again.');
        this.submitting.set(false);
      },
    });
  }

  resetForm() {
    this.submitted.set(false);
    this.formAmount.set(null);
    this.customAmountStr.set('');
    this.transactionId.set('');
    this.senderBkash.set('');
    this.error.set('');
  }

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
      { pending: 'Under Review', verified: 'Verified', rejected: 'Rejected', refunded: 'Refunded' }[
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
