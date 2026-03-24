import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminScholarship, SaveScholarshipDto } from '../../core/admin.service';
import { AuthService } from '../../core/auth.service';
import { RichTextEditorComponent } from '../../shared/rich-text-editor/rich-text-editor.component';
import { convertToHtml } from '../../shared/content.utils';

type Mode = 'list' | 'create' | 'edit';

@Component({
  selector: 'app-admin-scholarships',
  standalone: true,
  imports: [CommonModule, FormsModule, RichTextEditorComponent],
  templateUrl: './admin-scholarships.component.html',
})
export class AdminScholarshipsComponent implements OnInit {
  mode = signal<Mode>('list');
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  success = signal('');

  scholarships = signal<AdminScholarship[]>([]);
  deleting = signal<Set<string>>(new Set());

  // ── Form fields ────────────────────────────────────────────────
  editingId = signal<string | null>(null);
  formTitle = signal('');
  formProvider = signal('');
  formAmount = signal('');
  formCurrency = signal('USD');
  formDeadline = signal('');
  formEligibility = signal('');
  formEligibilityFormat = signal<'html' | 'markdown'>('html');
  formLevel = signal('');
  formCountry = signal('');
  formType = signal('');
  formDescription = signal('');
  formDescriptionFormat = signal<'html' | 'markdown'>('html');
  formTags = signal(''); // comma-separated
  formLink = signal('');
  formFeatured = signal(false);
  formUrgent = signal(false);

  readonly levelOptions = ['Undergraduate', 'Postgraduate', 'PhD', 'Any'];
  readonly typeOptions = ['Full', 'Partial', 'Alumni-Funded', 'External'];

  readonly auth = inject(AuthService);
  private readonly adminSvc = inject(AdminService);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.adminSvc.listScholarships().subscribe({
      next: (data) => {
        this.scholarships.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          err?.status === 403
            ? "You don't have sufficient permissions to view this."
            : 'Failed to load scholarships.',
        );
        this.loading.set(false);
      },
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.formTitle.set('');
    this.formProvider.set('');
    this.formAmount.set('');
    this.formCurrency.set('USD');
    this.formDeadline.set('');
    this.formEligibility.set('');
    this.formEligibilityFormat.set('html');
    this.formLevel.set('Any');
    this.formCountry.set('');
    this.formType.set('Full');
    this.formDescription.set('');
    this.formDescriptionFormat.set('html');
    this.formTags.set('');
    this.formLink.set('');
    this.formFeatured.set(false);
    this.formUrgent.set(false);
    this.error.set('');
    this.success.set('');
    this.mode.set('create');
  }

  openEdit(s: AdminScholarship): void {
    this.editingId.set(s.id);
    this.formTitle.set(s.title);
    this.formProvider.set(s.provider);
    this.formAmount.set(s.amount);
    this.formCurrency.set(s.currency);
    this.formDeadline.set(s.deadline);
    this.formEligibility.set(s.eligibility);
    this.formEligibilityFormat.set('html');
    this.formLevel.set(s.level);
    this.formCountry.set(s.country);
    this.formType.set(s.type);
    this.formDescription.set(s.description);
    this.formDescriptionFormat.set('html');
    this.formTags.set((s.tags ?? []).join(', '));
    this.formLink.set(s.link);
    this.formFeatured.set(s.featured);
    this.formUrgent.set(s.urgent);
    this.error.set('');
    this.success.set('');
    this.mode.set('edit');
  }

  cancelForm(): void {
    this.mode.set('list');
    this.error.set('');
    this.success.set('');
  }

  save(): void {
    const title = this.formTitle().trim();
    const provider = this.formProvider().trim();
    const amount = this.formAmount().trim();
    const deadline = this.formDeadline().trim();
    const eligibility = convertToHtml(this.formEligibility().trim(), this.formEligibilityFormat());
    const level = this.formLevel().trim();
    const country = this.formCountry().trim();
    const type = this.formType().trim();
    const description = convertToHtml(this.formDescription().trim(), this.formDescriptionFormat());
    const link = this.formLink().trim();

    if (
      !title ||
      !provider ||
      !amount ||
      !deadline ||
      !eligibility ||
      !level ||
      !country ||
      !type ||
      !description ||
      !link
    ) {
      this.error.set('All required fields must be filled.');
      return;
    }

    const rawTags = this.formTags().trim();
    const tags = rawTags
      ? rawTags
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const dto: SaveScholarshipDto = {
      title,
      provider,
      amount,
      currency: this.formCurrency(),
      deadline,
      eligibility,
      level,
      country,
      type,
      description,
      tags,
      link,
      featured: this.formFeatured(),
      urgent: this.formUrgent(),
    };

    this.saving.set(true);
    this.error.set('');

    const id = this.editingId();
    const req =
      id === null
        ? this.adminSvc.adminCreateScholarship(dto)
        : this.adminSvc.adminUpdateScholarship(id, dto);

    req.subscribe({
      next: (saved) => {
        if (id === null) {
          this.scholarships.update((list) => [saved, ...list]);
          this.success.set('Scholarship created.');
        } else {
          this.scholarships.update((list) => list.map((s) => (s.id === id ? saved : s)));
          this.success.set('Scholarship updated.');
        }
        this.saving.set(false);
        this.mode.set('list');
      },
      error: (err) => {
        this.error.set(
          err?.status === 403
            ? "You don't have sufficient permissions."
            : (err?.error?.message ?? 'Failed to save scholarship.'),
        );
        this.saving.set(false);
      },
    });
  }

  delete(s: AdminScholarship): void {
    if (!confirm(`Delete "${s.title}"? This cannot be undone.`)) return;

    this.deleting.update((set) => new Set([...set, s.id]));
    this.error.set('');

    this.adminSvc.adminDeleteScholarship(s.id).subscribe({
      next: () => {
        this.scholarships.update((list) => list.filter((x) => x.id !== s.id));
        this.deleting.update((set) => {
          const n = new Set(set);
          n.delete(s.id);
          return n;
        });
        this.success.set(`"${s.title}" deleted.`);
      },
      error: (err) => {
        this.deleting.update((set) => {
          const n = new Set(set);
          n.delete(s.id);
          return n;
        });
        this.error.set(
          err?.status === 403
            ? "You don't have permission to delete scholarships."
            : 'Failed to delete scholarship.',
        );
      },
    });
  }

  isDeleting(id: string): boolean {
    return this.deleting().has(id);
  }

  typeBadgeClass(type: string): string {
    const map: Record<string, string> = {
      Full: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      Partial: 'bg-sky-100 text-sky-700 border border-sky-200',
      'Alumni-Funded': 'bg-violet-100 text-violet-700 border border-violet-200',
      External: 'bg-amber-100 text-amber-700 border border-amber-200',
    };
    return map[type] ?? 'bg-zinc-100 text-zinc-600 border border-zinc-200';
  }
}
