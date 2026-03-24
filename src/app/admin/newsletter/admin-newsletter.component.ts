import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AdminService,
  NewsletterSubscription,
  NewsletterSend,
  NewsletterDraft,
} from '../../core/admin.service';
import { AuthService } from '../../core/auth.service';
import { RichTextEditorComponent } from '../../shared/rich-text-editor/rich-text-editor.component';
import { convertToHtml } from '../../shared/content.utils';

type Tab = 'subscriptions' | 'compose' | 'drafts' | 'history';

@Component({
  selector: 'app-admin-newsletter',
  standalone: true,
  imports: [CommonModule, FormsModule, RichTextEditorComponent],
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
  htmlBodyFormat = signal<'html' | 'markdown'>('html');
  sending = signal(false);
  sendResult = signal<{ sent: number } | null>(null);
  /** ID of the draft that was loaded into the compose form (if any) */
  activeDraftId = signal<string | null>(null);

  // Filter & search
  filterStatus = signal<'all' | 'active' | 'inactive'>('all');
  searchText = signal('');

  // History
  sends = signal<NewsletterSend[]>([]);
  loadingHistory = signal(false);
  viewingSend = signal<NewsletterSend | null>(null);

  // Monthly drafts
  drafts = signal<NewsletterDraft[]>([]);
  loadingDrafts = signal(false);
  deletingDraft = signal<Set<string>>(new Set());
  sendingDraft = signal<Set<string>>(new Set());

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
  pendingDraftCount = computed(() => this.drafts().filter((d) => d.status === 'pending').length);

  readonly auth = inject(AuthService);
  private readonly adminService = inject(AdminService);

  ngOnInit(): void {
    this.loadSubscriptions();
    this.loadHistory();
    this.loadDrafts();
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

  loadHistory(): void {
    this.loadingHistory.set(true);
    this.adminService.listNewsletterSends().subscribe({
      next: (sends) => {
        this.sends.set(sends);
        this.loadingHistory.set(false);
      },
      error: () => {
        this.loadingHistory.set(false);
      },
    });
  }

  loadDrafts(): void {
    this.loadingDrafts.set(true);
    this.adminService.listNewsletterDrafts().subscribe({
      next: (drafts) => {
        this.drafts.set(drafts);
        this.loadingDrafts.set(false);
      },
      error: () => {
        this.loadingDrafts.set(false);
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

  isDeletingDraft(id: string): boolean {
    return this.deletingDraft().has(id);
  }

  isSendingDraft(id: string): boolean {
    return this.sendingDraft().has(id);
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

  /** Load a monthly draft into the Compose tab for editing before sending */
  loadDraftIntoCompose(draft: NewsletterDraft): void {
    this.subject.set(draft.subject);
    this.htmlBody.set(draft.htmlBody);
    this.htmlBodyFormat.set('html');
    this.activeDraftId.set(draft.id);
    this.setTab('compose');
  }

  deleteDraft(draft: NewsletterDraft): void {
    if (!this.auth.hasPermission('newsletter:write')) return;
    if (!confirm(`Delete the draft for ${draft.digestMonth}? This cannot be undone.`)) return;

    const s = new Set(this.deletingDraft());
    s.add(draft.id);
    this.deletingDraft.set(s);

    this.adminService.deleteNewsletterDraft(draft.id).subscribe({
      next: () => {
        this.drafts.update((list) => list.filter((d) => d.id !== draft.id));
        this._clearDeletingDraft(draft.id);
      },
      error: (err) => {
        this.error.set(
          err?.status === 403
            ? "You don't have sufficient permissions."
            : 'Failed to delete draft.',
        );
        this._clearDeletingDraft(draft.id);
      },
    });
  }

  /** Send a draft directly without opening Compose */
  sendDraft(draft: NewsletterDraft): void {
    if (!this.auth.hasPermission('newsletter:write')) return;
    if (
      !confirm(
        `Send the ${draft.digestMonth} digest newsletter to ${this.activeCount()} active subscribers?`,
      )
    )
      return;

    const s = new Set(this.sendingDraft());
    s.add(draft.id);
    this.sendingDraft.set(s);
    this.error.set('');
    this.success.set('');

    this.adminService.sendNewsletterDraft(draft.id).subscribe({
      next: (result) => {
        this._clearSendingDraft(draft.id);
        this.drafts.update((list) =>
          list.map((d) => (d.id === draft.id ? { ...d, status: 'sent' as const } : d)),
        );
        this.success.set(`Monthly digest sent to ${result.sent} subscriber(s).`);
        this.loadHistory();
      },
      error: (err) => {
        this._clearSendingDraft(draft.id);
        this.error.set(
          err?.status === 403
            ? "You don't have sufficient permissions."
            : (err.error?.message ?? 'Failed to send draft.'),
        );
      },
    });
  }

  viewSend(send: NewsletterSend): void {
    this.viewingSend.set(send);
  }

  closeSendView(): void {
    this.viewingSend.set(null);
  }

  sendNewsletter(): void {
    const subject = this.subject().trim();
    const rawBody = this.htmlBody().trim();
    if (!subject || !rawBody) {
      this.error.set('Subject and message body are required.');
      return;
    }
    // Convert markdown to HTML before sending (email clients need HTML)
    const htmlBody = convertToHtml(rawBody, this.htmlBodyFormat());
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
        // If this was sent from a draft, mark it sent in the drafts list
        const draftId = this.activeDraftId();
        if (draftId) {
          this.drafts.update((list) =>
            list.map((d) => (d.id === draftId ? { ...d, status: 'sent' as const } : d)),
          );
        }
        this.subject.set('');
        this.htmlBody.set('');
        this.htmlBodyFormat.set('html');
        this.activeDraftId.set(null);
        this.loadHistory();
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

  /** Format a digestMonth string like "2026-03" to "March 2026" */
  formatDigestMonth(digestMonth: string): string {
    const [year, month] = digestMonth.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
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

  private _clearDeletingDraft(id: string): void {
    const s = new Set(this.deletingDraft());
    s.delete(id);
    this.deletingDraft.set(s);
  }

  private _clearSendingDraft(id: string): void {
    const s = new Set(this.sendingDraft());
    s.delete(id);
    this.sendingDraft.set(s);
  }
}
