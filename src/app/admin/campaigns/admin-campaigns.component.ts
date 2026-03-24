import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AdminService,
  AdminCampaign,
  SaveCampaignDto,
  CampaignStatus,
} from '../../core/admin.service';
import { AuthService } from '../../core/auth.service';
import { RichTextEditorComponent } from '../../shared/rich-text-editor/rich-text-editor.component';
import { convertToHtml } from '../../shared/content.utils';

type Mode = 'list' | 'create' | 'edit';

@Component({
  selector: 'app-admin-campaigns',
  standalone: true,
  imports: [CommonModule, FormsModule, RichTextEditorComponent],
  templateUrl: './admin-campaigns.component.html',
})
export class AdminCampaignsComponent implements OnInit {
  mode = signal<Mode>('list');
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  success = signal('');

  campaigns = signal<AdminCampaign[]>([]);
  deleting = signal<Set<number>>(new Set());

  // ── Form fields ────────────────────────────────────────────────
  editingId = signal<number | null>(null);
  formTitle = signal('');
  formTagline = signal('');
  formDescription = signal('');
  formDescriptionFormat = signal<'html' | 'markdown'>('html');
  formGoal = signal(0);
  formStatus = signal<CampaignStatus>('active');
  formDeadline = signal('');
  formCategory = signal('');
  formIcon = signal('fa-hand-holding-heart');
  formColor = signal('bg-emerald-600');
  formFeatured = signal(false);
  formImpact = signal(''); // newline-delimited
  formUpdates = signal(''); // newline-delimited

  readonly statusOptions: { value: CampaignStatus; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'upcoming', label: 'Coming Soon' },
  ];

  readonly colorOptions = [
    { value: 'bg-blue-600', label: 'Blue' },
    { value: 'bg-violet-600', label: 'Violet' },
    { value: 'bg-emerald-600', label: 'Emerald' },
    { value: 'bg-rose-600', label: 'Rose' },
    { value: 'bg-amber-500', label: 'Amber' },
    { value: 'bg-teal-600', label: 'Teal' },
    { value: 'bg-orange-600', label: 'Orange' },
    { value: 'bg-sky-600', label: 'Sky' },
  ];

  readonly auth = inject(AuthService);
  private readonly adminSvc = inject(AdminService);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.adminSvc.adminListCampaigns().subscribe({
      next: (data) => {
        this.campaigns.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          err?.status === 403
            ? "You don't have sufficient permissions to view this."
            : 'Failed to load campaigns.',
        );
        this.loading.set(false);
      },
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.formTitle.set('');
    this.formTagline.set('');
    this.formDescription.set('');
    this.formDescriptionFormat.set('html');
    this.formGoal.set(0);
    this.formStatus.set('active');
    this.formDeadline.set('');
    this.formCategory.set('');
    this.formIcon.set('fa-hand-holding-heart');
    this.formColor.set('bg-emerald-600');
    this.formFeatured.set(false);
    this.formImpact.set('');
    this.formUpdates.set('');
    this.error.set('');
    this.success.set('');
    this.mode.set('create');
  }

  openEdit(c: AdminCampaign): void {
    this.editingId.set(c.id);
    this.formTitle.set(c.title);
    this.formTagline.set(c.tagline);
    this.formDescription.set(c.description);
    this.formDescriptionFormat.set('html');
    this.formGoal.set(c.goal);
    this.formStatus.set(c.status);
    this.formDeadline.set(c.deadline ?? '');
    this.formCategory.set(c.category);
    this.formIcon.set(c.icon);
    this.formColor.set(c.color);
    this.formFeatured.set(c.featured);
    this.formImpact.set((c.impact ?? []).join('\n'));
    this.formUpdates.set((c.updates ?? []).join('\n'));
    this.error.set('');
    this.success.set('');
    this.mode.set('edit');
  }

  cancelForm(): void {
    this.mode.set('list');
    this.error.set('');
    this.success.set('');
  }

  private toLines(raw: string): string[] {
    return raw
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
  }

  save(): void {
    const title = this.formTitle().trim();
    const tagline = this.formTagline().trim();
    const description = convertToHtml(this.formDescription().trim(), this.formDescriptionFormat());
    const goal = this.formGoal();
    const category = this.formCategory().trim();
    const icon = this.formIcon().trim();
    const color = this.formColor().trim();

    if (!title || !tagline || !description || goal < 1 || !category || !icon || !color) {
      this.error.set('Title, tagline, description, goal, category, icon and colour are required.');
      return;
    }

    const dto: SaveCampaignDto = {
      title,
      tagline,
      description,
      goal,
      status: this.formStatus(),
      deadline: this.formDeadline().trim() || null,
      category,
      icon,
      color,
      featured: this.formFeatured(),
      impact: this.toLines(this.formImpact()),
      updates:
        this.toLines(this.formUpdates()).length > 0 ? this.toLines(this.formUpdates()) : null,
    };

    this.saving.set(true);
    this.error.set('');

    const id = this.editingId();
    const req =
      id === null
        ? this.adminSvc.adminCreateCampaign(dto)
        : this.adminSvc.adminUpdateCampaign(id, dto);

    req.subscribe({
      next: (saved) => {
        if (id === null) {
          this.campaigns.update((list) => [...list, saved]);
          this.success.set('Campaign created.');
        } else {
          this.campaigns.update((list) => list.map((c) => (c.id === id ? saved : c)));
          this.success.set('Campaign updated.');
        }
        this.saving.set(false);
        this.mode.set('list');
      },
      error: (err) => {
        this.error.set(
          err?.status === 403
            ? "You don't have sufficient permissions."
            : (err?.error?.message ?? 'Failed to save campaign.'),
        );
        this.saving.set(false);
      },
    });
  }

  delete(c: AdminCampaign): void {
    if (!confirm(`Delete campaign "${c.title}"? This cannot be undone.`)) return;

    this.deleting.update((s) => new Set([...s, c.id]));
    this.error.set('');

    this.adminSvc.adminDeleteCampaign(c.id).subscribe({
      next: () => {
        this.campaigns.update((list) => list.filter((x) => x.id !== c.id));
        this.deleting.update((s) => {
          const n = new Set(s);
          n.delete(c.id);
          return n;
        });
        this.success.set(`Campaign "${c.title}" deleted.`);
      },
      error: (err) => {
        this.deleting.update((s) => {
          const n = new Set(s);
          n.delete(c.id);
          return n;
        });
        this.error.set(
          err?.status === 403
            ? "You don't have permission to delete campaigns."
            : 'Failed to delete campaign.',
        );
      },
    });
  }

  isDeleting(id: number): boolean {
    return this.deleting().has(id);
  }

  formatBDT(amount: number): string {
    if (amount >= 100_000) {
      return `৳${(amount / 100_000).toFixed(2).replace(/\.00$/, '')} lakh`;
    }
    return `৳${amount.toLocaleString('en-BD')}`;
  }

  progressPercent(c: AdminCampaign): number {
    if (c.goal === 0) return 0;
    return Math.min(100, Math.round(((c.raised ?? 0) / c.goal) * 100));
  }

  statusBadgeClass(status: CampaignStatus): string {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'upcoming':
        return 'bg-amber-100 text-amber-700 border border-amber-200';
    }
  }
}
