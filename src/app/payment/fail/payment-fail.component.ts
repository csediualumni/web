import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-fail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-fail.component.html',
})
export class PaymentFailComponent {
  private readonly route = inject(ActivatedRoute);

  readonly invoiceId = this.route.snapshot.queryParamMap.get('invoiceId');

  get retryUrl(): string {
    return this.invoiceId ? `/payment?invoiceId=${this.invoiceId}` : '/donations';
  }
}
