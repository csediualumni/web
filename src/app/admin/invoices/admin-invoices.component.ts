import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  InvoiceService,
  Invoice,
  InvoicePayment,
  PaymentStatus,
  paidAmount,
  dueAmount,
  formatBDT,
} from '../../core/invoice.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-admin-invoices',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-invoices.component.html',
})
export class AdminInvoicesComponent implements OnInit {
  loading = signal(true);
  error = signal('');
  invoices = signal<Invoice[]>([]);
  expandedInvoiceId = signal<string | null>(null);
  updatingInvoiceId = signal<string | null>(null);
  updatingPaymentId = signal<string | null>(null);
  paymentDraftStatus = signal<Map<string, PaymentStatus>>(new Map());
  paymentAdminNote = signal<Map<string, string>>(new Map());

  readonly auth = inject(AuthService);
  private readonly invoiceService = inject(InvoiceService);

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.loading.set(true);
    this.error.set('');
    this.invoiceService.listAll(1, 100).subscribe({
      next: (data) => {
        this.invoices.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          err?.status === 403
            ? "You don't have sufficient permissions to view this."
            : 'Failed to load invoices.',
        );
        this.loading.set(false);
      },
    });
  }

  toggleInvoice(id: string): void {
    this.expandedInvoiceId.set(this.expandedInvoiceId() === id ? null : id);
  }

  setInvoiceStatus(invoice: Invoice, status: string): void {
    if (!this.auth.hasPermission('invoices:write')) return;
    this.updatingInvoiceId.set(invoice.id);
    this.invoiceService.updateInvoiceStatus(invoice.id, status as Invoice['status']).subscribe({
      next: (updated) => {
        this.invoices.update((list) => list.map((i) => (i.id === updated.id ? updated : i)));
        this.updatingInvoiceId.set(null);
      },
      error: (err) => {
        this.error.set(
          err?.status === 403
            ? "You don't have sufficient permissions."
            : (err.error?.message ?? 'Failed to update invoice.'),
        );
        this.updatingInvoiceId.set(null);
      },
    });
  }

  getPaymentDraftStatus(paymentId: string, currentStatus: PaymentStatus): PaymentStatus {
    return this.paymentDraftStatus().get(paymentId) ?? currentStatus;
  }

  setPaymentDraftStatus(paymentId: string, status: PaymentStatus): void {
    const map = new Map(this.paymentDraftStatus());
    map.set(paymentId, status);
    this.paymentDraftStatus.set(map);
  }

  getPaymentNote(paymentId: string): string {
    return this.paymentAdminNote().get(paymentId) ?? '';
  }

  setPaymentNote(paymentId: string, note: string): void {
    const map = new Map(this.paymentAdminNote());
    map.set(paymentId, note);
    this.paymentAdminNote.set(map);
  }

  isPaymentDirty(payment: InvoicePayment): boolean {
    const draft = this.paymentDraftStatus().get(payment.id);
    return !!draft && draft !== payment.status;
  }

  savePaymentStatus(invoice: Invoice, payment: InvoicePayment): void {
    if (!this.auth.hasPermission('invoices:write')) return;
    const status = this.getPaymentDraftStatus(payment.id, payment.status);
    const note = this.getPaymentNote(payment.id) || undefined;
    this.updatingPaymentId.set(payment.id);
    this.invoiceService.updatePaymentStatus(invoice.id, payment.id, status, note).subscribe({
      next: (updated) => {
        this.invoices.update((list) => list.map((i) => (i.id === updated.id ? updated : i)));
        const ds = new Map(this.paymentDraftStatus());
        ds.delete(payment.id);
        this.paymentDraftStatus.set(ds);
        const ns = new Map(this.paymentAdminNote());
        ns.delete(payment.id);
        this.paymentAdminNote.set(ns);
        this.updatingPaymentId.set(null);
      },
      error: (err) => {
        this.error.set(
          err?.status === 403
            ? "You don't have sufficient permissions."
            : (err.error?.message ?? 'Failed to update payment.'),
        );
        this.updatingPaymentId.set(null);
      },
    });
  }

  invoicePaid(invoice: Invoice): number {
    return paidAmount(invoice);
  }
  invoiceDue(invoice: Invoice): number {
    return dueAmount(invoice);
  }
  fmt(amount: number): string {
    return formatBDT(amount);
  }

  invoiceStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      partial: 'bg-blue-50 text-blue-700 border-blue-200',
      paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      cancelled: 'bg-zinc-100 text-zinc-500 border-zinc-200',
      refunded: 'bg-purple-50 text-purple-700 border-purple-200',
    };
    return map[status] ?? 'bg-zinc-100 text-zinc-500 border-zinc-200';
  }

  paymentStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-700',
      verified: 'bg-emerald-50 text-emerald-700',
      rejected: 'bg-red-50 text-red-600',
      refunded: 'bg-purple-50 text-purple-700',
    };
    return map[status] ?? 'bg-zinc-100 text-zinc-500';
  }
}
