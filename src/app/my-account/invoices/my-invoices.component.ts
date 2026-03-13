import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InvoiceService, Invoice, paidAmount, dueAmount, formatBDT } from '../../core/invoice.service';

@Component({
  selector: 'app-my-invoices',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-invoices.component.html',
})
export class MyInvoicesComponent implements OnInit {
  private readonly invoiceService = inject(InvoiceService);

  invoices = signal<Invoice[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  readonly paidAmount = paidAmount;
  readonly dueAmount = dueAmount;
  readonly formatBDT = formatBDT;

  typeLabel(type: string): string {
    const labels: Record<string, string> = {
      membership: 'Membership',
      event: 'Event',
      donation: 'Donation',
      other: 'Other',
    };
    return labels[type] ?? type;
  }

  typeIcon(type: string): string {
    const icons: Record<string, string> = {
      membership: 'fa-id-card',
      event: 'fa-calendar-days',
      donation: 'fa-hand-holding-heart',
      other: 'fa-file',
    };
    return icons[type] ?? 'fa-file';
  }

  statusClass(status: string): string {
    const classes: Record<string, string> = {
      paid: 'bg-green-100 text-green-700',
      partial: 'bg-amber-100 text-amber-700',
      pending: 'bg-zinc-100 text-zinc-600',
      cancelled: 'bg-red-100 text-red-600',
      refunded: 'bg-blue-100 text-blue-700',
    };
    return classes[status] ?? 'bg-zinc-100 text-zinc-600';
  }

  ngOnInit(): void {
    this.invoiceService.getMyInvoices().subscribe({
      next: (list) => {
        this.invoices.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load invoices. Please try again.');
        this.loading.set(false);
      },
    });
  }
}
