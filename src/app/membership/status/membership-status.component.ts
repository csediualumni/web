import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { MembershipApplication, MembershipService } from '../../core/membership.service';

@Component({
  selector: 'app-membership-status',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './membership-status.component.html',
})
export class MembershipStatusComponent implements OnInit {
  loading = signal(true);
  error = signal('');
  application = signal<MembershipApplication | null>(null);

  readonly auth = inject(AuthService);
  private readonly membership = inject(MembershipService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.membership.getMyApplication().subscribe({
      next: (app) => {
        this.application.set(app);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 404) {
          // No application yet — send to apply page
          this.router.navigate(['/membership/apply']);
        } else {
          this.error.set('Failed to load your membership status. Please try again.');
        }
      },
    });
  }

  readonly statusLabel = computed(() => {
    const status = this.application()?.status;
    switch (status) {
      case 'payment_required':
        return 'Payment Required';
      case 'payment_submitted':
        return 'Payment Under Review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Not Approved';
      default:
        return 'Unknown';
    }
  });

  readonly statusClass = computed(() => {
    const status = this.application()?.status;
    switch (status) {
      case 'payment_required':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'payment_submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  });

  readonly statusIcon = computed(() => {
    const status = this.application()?.status;
    switch (status) {
      case 'payment_required':
        return 'fa-clock';
      case 'payment_submitted':
        return 'fa-hourglass-half';
      case 'approved':
        return 'fa-circle-check';
      case 'rejected':
        return 'fa-circle-xmark';
      default:
        return 'fa-circle-question';
    }
  });

  readonly statusDescription = computed(() => {
    const status = this.application()?.status;
    switch (status) {
      case 'payment_required':
        return 'Your application has been received. Please complete the ৳500 bKash payment to proceed.';
      case 'payment_submitted':
        return 'Your payment has been received and is being verified by our team. This usually takes 1–2 business days.';
      case 'approved':
        return 'Congratulations! Your membership has been approved. You now have full member access.';
      case 'rejected':
        return 'Your application was not approved at this time.';
      default:
        return '';
    }
  });

  get invoiceId(): string | null {
    return this.application()?.invoiceId ?? null;
  }

  get paymentUrl(): string {
    return this.invoiceId ? `/payment?invoiceId=${this.invoiceId}` : '/payment';
  }
}
