import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AdminService,
  AdminMentor,
  SaveMentorDto,
  ApplicationStatus,
  AdminMentorApplication,
} from '../../core/admin.service';
import { AuthService } from '../../core/auth.service';
import { RichTextEditorComponent } from '../../shared/rich-text-editor/rich-text-editor.component';
import { convertToHtml } from '../../shared/content.utils';

type Mode = 'list' | 'create' | 'edit';
type Tab = 'mentors' | 'applications';

@Component({
  selector: 'app-admin-mentors',
  standalone: true,
  imports: [CommonModule, FormsModule, RichTextEditorComponent],
  templateUrl: './admin-mentors.component.html',
})
export class AdminMentorsComponent implements OnInit {
  tab = signal<Tab>('mentors');
  mode = signal<Mode>('list');
  loading = signal(true);
  loadingApps = signal(true);
  saving = signal(false);
  error = signal('');
  success = signal('');

  mentors = signal<AdminMentor[]>([]);
  applications = signal<AdminMentorApplication[]>([]);
  deleting = signal<Set<string>>(new Set());
  updatingStatus = signal<Set<string>>(new Set());

  // ── Form fields ────────────────────────────────────────────────
  editingId = signal<string | null>(null);
  formName = signal('');
  formBatch = signal<number>(2000);
  formRole = signal('');
  formCompany = signal('');
  formCountry = signal('');
  formCity = signal('');
  formInitials = signal('');
  formColor = signal('');
  formExpertise = signal('');  // comma-separated
  formBio = signal('');
  formBioFormat = signal<'html' | 'markdown'>('html');
  formAvailability = signal('');
  formMentees = signal(0);
  formRating = signal(0);
  formFeatured = signal(false);

  readonly availabilityOptions = ['Open', 'Limited', 'Closed'];
  readonly statusOptions: ApplicationStatus[] = ['pending', 'reviewing', 'accepted', 'rejected'];

  readonly auth = inject(AuthService);
  private readonly adminSvc = inject(AdminService);

  ngOnInit(): void {
    this.loadMentors();
    this.loadApplications();
  }

  loadMentors(): void {
    this.loading.set(true);
    this.error.set('');
    this.adminSvc.listMentors().subscribe({
      next: (data) => { this.mentors.set(data); this.loading.set(false); },
      error: (err) => {
        this.error.set(
          err?.status === 403
            ? "You don't have sufficient permissions to view this."
            : 'Failed to load mentors.',
        );
        this.loading.set(false);
      },
    });
  }

  loadApplications(): void {
    this.loadingApps.set(true);
    this.adminSvc.listMentorApplications().subscribe({
      next: (data) => { this.applications.set(data); this.loadingApps.set(false); },
      error: () => { this.loadingApps.set(false); },
    });
  }

  switchTab(t: Tab): void {
    this.tab.set(t);
    this.mode.set('list');
    this.error.set('');
    this.success.set('');
  }

  openCreate(): void {
    this.editingId.set(null);
    this.formName.set('');
    this.formBatch.set(2000);
    this.formRole.set('');
    this.formCompany.set('');
    this.formCountry.set('');
    this.formCity.set('');
    this.formInitials.set('');
    this.formColor.set('');
    this.formExpertise.set('');
    this.formBio.set('');
    this.formBioFormat.set('html');
    this.formAvailability.set('Open');
    this.formMentees.set(0);
    this.formRating.set(0);
    this.formFeatured.set(false);
    this.error.set('');
    this.success.set('');
    this.mode.set('create');
  }

  openEdit(m: AdminMentor): void {
    this.editingId.set(m.id);
    this.formName.set(m.name);
    this.formBatch.set(m.batch);
    this.formRole.set(m.role);
    this.formCompany.set(m.company);
    this.formCountry.set(m.country);
    this.formCity.set(m.city);
    this.formInitials.set(m.initials ?? '');
    this.formColor.set(m.color ?? '');
    this.formExpertise.set((m.expertise ?? []).join(', '));
    this.formBio.set(m.bio);
    this.formBioFormat.set('html');
    this.formAvailability.set(m.availability);
    this.formMentees.set(m.mentees);
    this.formRating.set(m.rating);
    this.formFeatured.set(m.featured);
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
    const name = this.formName().trim();
    const role = this.formRole().trim();
    const company = this.formCompany().trim();
    const country = this.formCountry().trim();
    const city = this.formCity().trim();
    const bio = convertToHtml(this.formBio().trim(), this.formBioFormat());
    const availability = this.formAvailability().trim();

    if (!name || !role || !company || !country || !city || !bio || !availability) {
      this.error.set('Name, role, company, country, city, bio and availability are required.');
      return;
    }

    const rawExpertise = this.formExpertise().trim();
    const expertise = rawExpertise ? rawExpertise.split(',').map((s) => s.trim()).filter(Boolean) : [];

    const dto: SaveMentorDto = {
      name,
      batch: this.formBatch(),
      role,
      company,
      country,
      city,
      initials: this.formInitials().trim() || undefined,
      color: this.formColor().trim() || undefined,
      expertise,
      bio,
      availability,
      mentees: this.formMentees(),
      rating: this.formRating(),
      featured: this.formFeatured(),
    };

    this.saving.set(true);
    this.error.set('');

    const id = this.editingId();
    const req =
      id === null
        ? this.adminSvc.adminCreateMentor(dto)
        : this.adminSvc.adminUpdateMentor(id, dto);

    req.subscribe({
      next: (saved) => {
        if (id === null) {
          this.mentors.update((list) => [saved, ...list]);
          this.success.set('Mentor created.');
        } else {
          this.mentors.update((list) => list.map((m) => (m.id === id ? saved : m)));
          this.success.set('Mentor updated.');
        }
        this.saving.set(false);
        this.mode.set('list');
      },
      error: (err) => {
        this.error.set(
          err?.status === 403
            ? "You don't have sufficient permissions."
            : (err?.error?.message ?? 'Failed to save mentor.'),
        );
        this.saving.set(false);
      },
    });
  }

  delete(m: AdminMentor): void {
    if (!confirm(`Delete mentor "${m.name}"? This cannot be undone.`)) return;

    this.deleting.update((s) => new Set([...s, m.id]));
    this.error.set('');

    this.adminSvc.adminDeleteMentor(m.id).subscribe({
      next: () => {
        this.mentors.update((list) => list.filter((x) => x.id !== m.id));
        this.deleting.update((s) => { const n = new Set(s); n.delete(m.id); return n; });
        this.success.set(`Mentor "${m.name}" deleted.`);
      },
      error: (err) => {
        this.deleting.update((s) => { const n = new Set(s); n.delete(m.id); return n; });
        this.error.set(
          err?.status === 403
            ? "You don't have permission to delete mentors."
            : 'Failed to delete mentor.',
        );
      },
    });
  }

  isDeleting(id: string): boolean {
    return this.deleting().has(id);
  }

  updateStatus(app: AdminMentorApplication, status: ApplicationStatus): void {
    if (this.updatingStatus().has(app.id)) return;
    this.updatingStatus.update((s) => new Set([...s, app.id]));

    this.adminSvc.updateApplicationStatus(app.id, status).subscribe({
      next: (updated) => {
        this.applications.update((list) => list.map((a) => (a.id === app.id ? updated : a)));
        this.updatingStatus.update((s) => { const n = new Set(s); n.delete(app.id); return n; });
      },
      error: () => {
        this.updatingStatus.update((s) => { const n = new Set(s); n.delete(app.id); return n; });
      },
    });
  }

  isUpdatingStatus(id: string): boolean {
    return this.updatingStatus().has(id);
  }

  statusBadgeClass(status: ApplicationStatus): string {
    const map: Record<string, string> = {
      pending:   'bg-zinc-100 text-zinc-600 border border-zinc-200',
      reviewing: 'bg-sky-100 text-sky-700 border border-sky-200',
      accepted:  'bg-emerald-100 text-emerald-700 border border-emerald-200',
      rejected:  'bg-red-100 text-red-700 border border-red-200',
    };
    return map[status] ?? 'bg-zinc-100 text-zinc-600 border border-zinc-200';
  }

  availabilityBadgeClass(av: string): string {
    const map: Record<string, string> = {
      Open:    'bg-emerald-100 text-emerald-700 border border-emerald-200',
      Limited: 'bg-amber-100 text-amber-700 border border-amber-200',
      Closed:  'bg-red-100 text-red-700 border border-red-200',
    };
    return map[av] ?? 'bg-zinc-100 text-zinc-600 border border-zinc-200';
  }
}
