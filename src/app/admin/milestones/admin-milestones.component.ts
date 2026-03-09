import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, Milestone } from '../../core/admin.service';
import { AuthService } from '../../core/auth.service';

type Mode = 'list' | 'create' | 'edit';

@Component({
  selector: 'app-admin-milestones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-milestones.component.html',
})
export class AdminMilestonesComponent implements OnInit {
  mode = signal<Mode>('list');
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  success = signal('');

  milestones = signal<Milestone[]>([]);
  deleting = signal<Set<string>>(new Set());

  // Form fields
  editingId = signal<string | null>(null);
  formYear = signal('');
  formTitle = signal('');
  formDescription = signal('');
  formSortOrder = signal(0);

  constructor(
    public auth: AuthService,
    private adminService: AdminService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.adminService.adminListMilestones().subscribe({
      next: (data) => {
        this.milestones.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          err?.status === 403
            ? "You don't have sufficient permissions to view this."
            : 'Failed to load milestones.',
        );
        this.loading.set(false);
      },
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.formYear.set('');
    this.formTitle.set('');
    this.formDescription.set('');
    this.formSortOrder.set(this.milestones().length);
    this.error.set('');
    this.success.set('');
    this.mode.set('create');
  }

  openEdit(m: Milestone): void {
    this.editingId.set(m.id);
    this.formYear.set(m.year);
    this.formTitle.set(m.title);
    this.formDescription.set(m.description);
    this.formSortOrder.set(m.sortOrder);
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
    const year = this.formYear().trim();
    const title = this.formTitle().trim();
    const description = this.formDescription().trim();
    const sortOrder = this.formSortOrder();

    if (!year || !title || !description) {
      this.error.set('Year, title and description are required.');
      return;
    }

    this.saving.set(true);
    this.error.set('');

    const payload = { year, title, description, sortOrder };

    const id = this.editingId();
    const req =
      id === null
        ? this.adminService.adminCreateMilestone(payload)
        : this.adminService.adminUpdateMilestone(id, payload);

    req.subscribe({
      next: (saved) => {
        if (id === null) {
          this.milestones.update((list) => [...list, saved].sort((a, b) => a.sortOrder - b.sortOrder || a.year.localeCompare(b.year)));
          this.success.set('Milestone created.');
        } else {
          this.milestones.update((list) =>
            list
              .map((m) => (m.id === id ? saved : m))
              .sort((a, b) => a.sortOrder - b.sortOrder || a.year.localeCompare(b.year)),
          );
          this.success.set('Milestone updated.');
        }
        this.saving.set(false);
        this.mode.set('list');
      },
      error: (err) => {
        this.error.set(
          err?.status === 403
            ? "You don't have sufficient permissions."
            : (err.error?.message ?? 'Failed to save milestone.'),
        );
        this.saving.set(false);
      },
    });
  }

  delete(m: Milestone): void {
    if (!confirm(`Delete milestone "${m.title} (${m.year})"?`)) return;

    this.deleting.update((s) => new Set([...s, m.id]));
    this.error.set('');

    this.adminService.adminDeleteMilestone(m.id).subscribe({
      next: () => {
        this.milestones.update((list) => list.filter((x) => x.id !== m.id));
        this.deleting.update((s) => {
          const n = new Set(s);
          n.delete(m.id);
          return n;
        });
        this.success.set('Milestone deleted.');
      },
      error: (err) => {
        this.error.set(
          err?.status === 403
            ? "You don't have sufficient permissions."
            : 'Failed to delete milestone.',
        );
        this.deleting.update((s) => {
          const n = new Set(s);
          n.delete(m.id);
          return n;
        });
      },
    });
  }

  isDeleting(id: string): boolean {
    return this.deleting().has(id);
  }
}
