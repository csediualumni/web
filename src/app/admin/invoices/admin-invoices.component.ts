import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  InvoiceService,
  Invoice,
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
  updatingInvoiceId = signal<string | null>(null);

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

  fmt(amount: number): string {
    return formatBDT(amount);
  }

  invoiceStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      cancelled: 'bg-zinc-100 text-zinc-500 border-zinc-200',
      refunded: 'bg-purple-50 text-purple-700 border-purple-200',
    };
    return map[status] ?? 'bg-zinc-100 text-zinc-500 border-zinc-200';
  }
}
