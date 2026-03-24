import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AdminService,
  AdminJobPosting,
  SaveJobPostingDto,
  AdminJobType,
} from '../../core/admin.service';
import { AuthService } from '../../core/auth.service';
import { RichTextEditorComponent } from '../../shared/rich-text-editor/rich-text-editor.component';
import { convertToHtml } from '../../shared/content.utils';

type Mode = 'list' | 'create' | 'edit';

@Component({
  selector: 'app-admin-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, RichTextEditorComponent],
  templateUrl: './admin-jobs.component.html',
})
export class AdminJobsComponent implements OnInit {
  mode = signal<Mode>('list');
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  success = signal('');

  jobs = signal<AdminJobPosting[]>([]);
  deleting = signal<Set<string>>(new Set());

  // ── Form fields ────────────────────────────────────────────────
  editingId = signal<string | null>(null);
  formTitle = signal('');
  formCompany = signal('');
  formLocation = signal('');
  formCountry = signal('');
  formType = signal<AdminJobType>('Full-time');
  formIndustry = signal('');
  formExperience = signal('');
  formSalary = signal('');
  formPosted = signal('');
  formDeadline = signal('');
  formDescription = signal('');
  formDescriptionFormat = signal<'html' | 'markdown'>('html');
  formSkills = signal(''); // comma-separated
  formFeatured = signal(false);
  formPostedById = signal('');

  readonly jobTypes: AdminJobType[] = [
    'Full-time',
    'Part-time',
    'Internship',
    'Remote',
    'Contract',
  ];

  readonly auth = inject(AuthService);
  private readonly adminSvc = inject(AdminService);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.adminSvc.listJobPostings().subscribe({
      next: (data) => {
        this.jobs.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          err?.status === 403
            ? "You don't have sufficient permissions to view this."
            : 'Failed to load job postings.',
        );
        this.loading.set(false);
      },
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.formTitle.set('');
    this.formCompany.set('');
    this.formLocation.set('');
    this.formCountry.set('');
    this.formType.set('Full-time');
    this.formIndustry.set('');
    this.formExperience.set('');
    this.formSalary.set('');
    this.formPosted.set('');
    this.formDeadline.set('');
    this.formDescription.set('');
    this.formDescriptionFormat.set('html');
    this.formSkills.set('');
    this.formFeatured.set(false);
    this.formPostedById.set('');
    this.error.set('');
    this.success.set('');
    this.mode.set('create');
  }

  openEdit(j: AdminJobPosting): void {
    this.editingId.set(j.id);
    this.formTitle.set(j.title);
    this.formCompany.set(j.company);
    this.formLocation.set(j.location);
    this.formCountry.set(j.country);
    this.formType.set(j.type);
    this.formIndustry.set(j.industry);
    this.formExperience.set(j.experience);
    this.formSalary.set(j.salary ?? '');
    this.formPosted.set(j.posted);
    this.formDeadline.set(j.deadline);
    this.formDescription.set(j.description);
    this.formDescriptionFormat.set('html');
    this.formSkills.set((j.skills ?? []).join(', '));
    this.formFeatured.set(j.featured);
    this.formPostedById.set(j.postedById ?? '');
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
    const company = this.formCompany().trim();
    const location = this.formLocation().trim();
    const country = this.formCountry().trim();
    const industry = this.formIndustry().trim();
    const experience = this.formExperience().trim();
    const posted = this.formPosted().trim();
    const deadline = this.formDeadline().trim();
    const description = convertToHtml(this.formDescription().trim(), this.formDescriptionFormat());

    if (
      !title ||
      !company ||
      !location ||
      !country ||
      !industry ||
      !experience ||
      !posted ||
      !deadline ||
      !description
    ) {
      this.error.set('All required fields must be filled.');
      return;
    }

    const rawSkills = this.formSkills().trim();
    const skills = rawSkills
      ? rawSkills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const postedById = this.formPostedById().trim() || undefined;

    const dto: SaveJobPostingDto = {
      title,
      company,
      location,
      country,
      type: this.formType(),
      industry,
      experience,
      salary: this.formSalary().trim() || undefined,
      posted,
      deadline,
      description,
      skills,
      featured: this.formFeatured(),
      postedById,
    };

    this.saving.set(true);
    this.error.set('');

    const id = this.editingId();
    const req =
      id === null
        ? this.adminSvc.adminCreateJobPosting(dto)
        : this.adminSvc.adminUpdateJobPosting(id, dto);

    req.subscribe({
      next: (saved) => {
        if (id === null) {
          this.jobs.update((list) => [saved, ...list]);
          this.success.set('Job posting created.');
        } else {
          this.jobs.update((list) => list.map((j) => (j.id === id ? saved : j)));
          this.success.set('Job posting updated.');
        }
        this.saving.set(false);
        this.mode.set('list');
      },
      error: (err) => {
        this.error.set(
          err?.status === 403
            ? "You don't have sufficient permissions."
            : (err?.error?.message ?? 'Failed to save job posting.'),
        );
        this.saving.set(false);
      },
    });
  }

  delete(j: AdminJobPosting): void {
    if (!confirm(`Delete "${j.title}" at ${j.company}? This cannot be undone.`)) return;

    this.deleting.update((s) => new Set([...s, j.id]));
    this.error.set('');

    this.adminSvc.adminDeleteJobPosting(j.id).subscribe({
      next: () => {
        this.jobs.update((list) => list.filter((x) => x.id !== j.id));
        this.deleting.update((s) => {
          const n = new Set(s);
          n.delete(j.id);
          return n;
        });
        this.success.set(`"${j.title}" deleted.`);
      },
      error: (err) => {
        this.deleting.update((s) => {
          const n = new Set(s);
          n.delete(j.id);
          return n;
        });
        this.error.set(
          err?.status === 403
            ? "You don't have permission to delete job postings."
            : 'Failed to delete job posting.',
        );
      },
    });
  }

  isDeleting(id: string): boolean {
    return this.deleting().has(id);
  }

  postedByLabel(j: AdminJobPosting): string {
    if (!j.postedBy) return j.postedById ?? '—';
    return j.postedBy.displayName ?? j.postedBy.email ?? j.postedById ?? '—';
  }

  typeBadgeClass(type: AdminJobType): string {
    const map: Record<string, string> = {
      'Full-time': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      'Part-time': 'bg-sky-100 text-sky-700 border border-sky-200',
      Internship: 'bg-violet-100 text-violet-700 border border-violet-200',
      Remote: 'bg-amber-100 text-amber-700 border border-amber-200',
      Contract: 'bg-zinc-100 text-zinc-600 border border-zinc-200',
    };
    return map[type] ?? 'bg-zinc-100 text-zinc-600 border border-zinc-200';
  }
}
