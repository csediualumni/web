import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import {
  MembershipApplication,
  MembershipService,
  MembershipStatus,
} from '../../core/membership.service';

type FilterTab = 'all' | MembershipStatus;

@Component({
  selector: 'app-admin-membership',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-membership.component.html',
})
export class AdminMembershipComponent implements OnInit {
  loading = signal(true);
  error = signal('');
  success = signal('');

  applications = signal<MembershipApplication[]>([]);
  selectedApp = signal<MembershipApplication | null>(null);

  filterTab = signal<FilterTab>('all');
  rejectReason = signal('');
  submittingAction = signal(false);
  showRejectModal = signal(false);
  rejectTargetId = signal<string | null>(null);

  filteredApps = computed(() => {
    const tab = this.filterTab();
    if (tab === 'all') return this.applications();
    return this.applications().filter((a) => a.status === tab);
  });

  countAll = computed(() => this.applications().length);
  countPaymentRequired = computed(
    () => this.applications().filter((a) => a.status === 'payment_required').length,
  );
  countPaymentSubmitted = computed(
    () => this.applications().filter((a) => a.status === 'payment_submitted').length,
  );
  countApproved = computed(
    () => this.applications().filter((a) => a.status === 'approved').length,
  );
  countRejected = computed(
    () => this.applications().filter((a) => a.status === 'rejected').length,
  );

  constructor(
    public auth: AuthService,
    private membership: MembershipService,
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading.set(true);
    this.error.set('');
    this.membership.listRequests().subscribe({
      next: (apps) => {
        this.applications.set(apps);
        const sel = this.selectedApp();
        if (sel) {
          const updated = apps.find((a) => a.id === sel.id);
          this.selectedApp.set(updated ?? null);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.status === 403 ? 'You don\'t have sufficient permissions to view this.' : 'Failed to load membership requests.');
        this.loading.set(false);
      },
    });
  }

  selectApp(app: MembershipApplication): void {
    this.selectedApp.set(this.selectedApp()?.id === app.id ? null : app);
    this.success.set('');
    this.error.set('');
  }

  approve(appId: string): void {
    this.submittingAction.set(true);
    this.success.set('');
    this.error.set('');
    this.membership.approve(appId).subscribe({
      next: () => {
        this.success.set('Application approved. User has been granted member access.');
        this.submittingAction.set(false);
        this.loadRequests();
      },
      error: (err) => {
        this.error.set(err?.status === 403 ? 'You don\'t have sufficient permissions.' : (err.error?.message ?? 'Failed to approve application.'));
        this.submittingAction.set(false);
      },
    });
  }

  openRejectModal(appId: string): void {
    this.rejectTargetId.set(appId);
    this.rejectReason.set('');
    this.showRejectModal.set(true);
  }

  closeRejectModal(): void {
    this.showRejectModal.set(false);
    this.rejectTargetId.set(null);
    this.rejectReason.set('');
  }

  confirmReject(): void {
    const id = this.rejectTargetId();
    const reason = this.rejectReason().trim();
    if (!id || !reason) return;

    this.submittingAction.set(true);
    this.success.set('');
    this.error.set('');
    this.membership.reject(id, reason).subscribe({
      next: (result) => {
        const refundMsg =
          result.status === 'rejected' &&
          result.invoice?.payments?.some((p) => p.status === 'refunded')
            ? ' Payment has been marked for refund.'
            : '';
        this.success.set(`Application rejected.${refundMsg}`);
        this.submittingAction.set(false);
        this.closeRejectModal();
        this.loadRequests();
      },
      error: (err) => {
        this.error.set(err?.status === 403 ? 'You don\'t have sufficient permissions.' : (err.error?.message ?? 'Failed to reject application.'));
        this.submittingAction.set(false);
        this.closeRejectModal();
      },
    });
  }

  statusLabel(status: MembershipStatus): string {
    switch (status) {
      case 'payment_required':
        return 'Payment Required';
      case 'payment_submitted':
        return 'Payment Submitted';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
    }
  }

  statusClass(status: MembershipStatus): string {
    switch (status) {
      case 'payment_required':
        return 'bg-amber-100 text-amber-700';
      case 'payment_submitted':
        return 'bg-blue-100 text-blue-700';
      case 'approved':
        return 'bg-emerald-100 text-emerald-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
    }
  }

  canApprove(app: MembershipApplication): boolean {
    return app.status !== 'approved' && app.status !== 'rejected';
  }

  canReject(app: MembershipApplication): boolean {
    return app.status !== 'approved' && app.status !== 'rejected';
  }
}
