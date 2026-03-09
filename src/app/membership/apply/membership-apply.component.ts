import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { MembershipService } from '../../core/membership.service';

@Component({
  selector: 'app-membership-apply',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './membership-apply.component.html',
})
export class MembershipApplyComponent implements OnInit {
  termsAccepted = signal(false);
  policyAccepted = signal(false);
  loading = signal(false);
  error = signal('');

  constructor(
    public auth: AuthService,
    private membership: MembershipService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // If the user already has an application, redirect to status page
    if (!this.auth.isGuest() && this.auth.isLoggedIn()) {
      this.membership.getMyApplication().subscribe({
        next: (app) => {
          if (app && app.status !== 'rejected') {
            this.router.navigate(['/membership/status']);
          }
        },
        error: () => {
          // 404 = no application yet, stay on this page
        },
      });
    }
  }

  get canSubmit(): boolean {
    return this.termsAccepted() && this.policyAccepted() && !this.loading();
  }

  submit(): void {
    if (!this.canSubmit) return;

    this.loading.set(true);
    this.error.set('');

    this.membership.apply().subscribe({
      next: (res) => {
        // Navigate to payment page with invoiceId
        this.router.navigate(['/payment'], {
          queryParams: { invoiceId: res.invoiceId },
        });
      },
      error: (err) => {
        this.loading.set(false);
        const msg: string = err.error?.message ?? '';
        if (typeof msg === 'string' && msg.includes('active')) {
          this.error.set(msg);
        } else {
          this.error.set(
            'Something went wrong. Please try again or contact support.',
          );
        }
      },
    });
  }
}
