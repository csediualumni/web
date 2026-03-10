import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, NewsletterSubscription } from '../../core/admin.service';
import { AuthService } from '../../core/auth.service';

type Tab = 'subscriptions' | 'compose';

@Component({
  selector: 'app-admin-newsletter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-newsletter.component.html',
})
export class AdminNewsletterComponent implements OnInit {
  activeTab = signal<Tab>('subscriptions');
  loading = signal(true);
  error = signal('');
  success = signal('');

  subscriptions = signal<NewsletterSubscription[]>([]);
  toggling = signal<Set<string>>(new Set());
  deleting = signal<Set<string>>(new Set());

  // Compose form
  subject = signal('');
  htmlBody = signal('');
  sending = signal(false);
  previewHtml = signal(false);
  sendResult = signal<{ sent: number } | null>(null);

  // Filter & search
  filterStatus = signal<'all' | 'active' | 'inactive'>('all');
  searchText = signal('');

  filteredSubs = computed(() => {
    const status = this.filterStatus();
    const q = this.searchText().toLowerCase();
    return this.subscriptions().filter((s) => {
      const matchStatus =
        status === 'all' ||
        (status === 'active' && s.isActive) ||
        (status === 'inactive' && !s.isActive);
      const matchText = !q || s.email.toLowerCase().includes(q);
      return matchStatus && matchText;
    });
  });

  totalCount = computed(() => this.subscriptions().length);
  activeCount = computed(() => this.subscriptions().filter((s) => s.isActive).length);

  readonly auth = inject(AuthService);
  private readonly adminService = inject(AdminService);

  ngOnInit(): void {
    this.loadSubscriptions();
  }

  loadSubscriptions(): void {
    this.loading.set(true);
    this.error.set('');
    this.adminService.listNewsletterSubscriptions().subscribe({
      next: (subs) => {
        this.subscriptions.set(subs);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          err?.status === 403
            ? "You don't have sufficient permissions to view this."
            : 'Failed to load subscriptions.',
        );
        this.loading.set(false);
      },
    });
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
    this.success.set('');
    this.error.set('');
  }

  isToggling(id: string): boolean {
    return this.toggling().has(id);
  }

  isDeleting(id: string): boolean {
    return this.deleting().has(id);
  }

  toggle(sub: NewsletterSubscription): void {
    if (!this.auth.hasPermission('newsletter:write')) return;
    const s = new Set(this.toggling());
    s.add(sub.id);
    this.toggling.set(s);

    this.adminService.toggleNewsletterSubscription(sub.id).subscribe({
      next: (updated) => {
        this.subscriptions.update((list) => list.map((x) => (x.id === sub.id ? updated : x)));
        this._clearToggling(sub.id);
      },
      error: (err) => {
        this.error.set(
          err?.status === 403
            ? "You don't have sufficient permissions."
            : 'Failed to update subscription.',
        );
        this._clearToggling(sub.id);
      },
    });
  }

  delete(sub: NewsletterSubscription): void {
    if (!this.auth.hasPermission('newsletter:write')) return;
    if (!confirm(`Remove ${sub.email} from subscriptions?`)) return;

    const s = new Set(this.deleting());
    s.add(sub.id);
    this.deleting.set(s);

    this.adminService.deleteNewsletterSubscription(sub.id).subscribe({
      next: () => {
        this.subscriptions.update((list) => list.filter((x) => x.id !== sub.id));
        this._clearDeleting(sub.id);
      },
      error: (err) => {
        this.error.set(
          err?.status === 403
            ? "You don't have sufficient permissions."
            : 'Failed to delete subscription.',
        );
        this._clearDeleting(sub.id);
      },
    });
  }

  sendNewsletter(): void {
    const subject = this.subject().trim();
    const htmlBody = this.htmlBody().trim();
    if (!subject || !htmlBody) {
      this.error.set('Subject and message body are required.');
      return;
    }
    if (!confirm(`Send this newsletter to ${this.activeCount()} active subscribers?`)) return;

    this.sending.set(true);
    this.error.set('');
    this.success.set('');
    this.sendResult.set(null);

    this.adminService.sendNewsletter(subject, htmlBody).subscribe({
      next: (result) => {
        this.sending.set(false);
        this.sendResult.set(result);
        this.success.set(`Newsletter sent to ${result.sent} subscriber(s).`);
        this.subject.set('');
        this.htmlBody.set('');
      },
      error: (err) => {
        this.sending.set(false);
        this.error.set(
          err?.status === 403
            ? "You don't have sufficient permissions."
            : (err.error?.message ?? 'Failed to send newsletter.'),
        );
      },
    });
  }

  private _clearToggling(id: string): void {
    const s = new Set(this.toggling());
    s.delete(id);
    this.toggling.set(s);
  }

  private _clearDeleting(id: string): void {
    const s = new Set(this.deleting());
    s.delete(id);
    this.deleting.set(s);
  }
}
