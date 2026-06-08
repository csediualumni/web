import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { InvoiceService, Invoice, paidAmount, formatBDT } from '../../core/invoice.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-success.component.html',
})
export class PaymentSuccessComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly svc = inject(InvoiceService);

  invoice = signal<Invoice | null>(null);
  loading = signal(true);

  readonly fmt = formatBDT;

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('invoiceId');
    if (!id) {
      this.loading.set(false);
      return;
    }
    this.svc.getById(id).subscribe({
      next: (inv) => {
        this.invoice.set(inv);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  paid(): number {
    const inv = this.invoice();
    return inv ? paidAmount(inv) : 0;
  }
}
