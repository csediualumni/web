import { Component, ElementRef, inject, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AdminService, AdminUser, ImportMembersResult, Role } from '../../core/admin.service';
import { AuthService } from '../../core/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-users.component.html',
})
export class AdminUsersComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  loading = signal(true);
  error = signal('');
  users = signal<AdminUser[]>([]);
  allRoles = signal<Role[]>([]);
  togglingRole = signal<Map<string, Set<string>>>(new Map());

  importing = signal(false);
  importResult = signal<ImportMembersResult | null>(null);
  showImportErrors = signal(false);

  // Edit user profile
  editingUser = signal<AdminUser | null>(null);
  editForm!: FormGroup;
  savingEdit = signal(false);
  editError = signal('');

  // Generate Member ID
  generatingMemberId = signal<Set<string>>(new Set());

  readonly auth = inject(AuthService);
  private readonly adminService = inject(AdminService);
  private readonly fb = inject(FormBuilder);

  ngOnInit(): void {
    forkJoin({
      users: this.adminService.listUsers(),
      roles: this.adminService.listRoles(),
    }).subscribe({
      next: ({ users, roles }) => {
        this.users.set(users);
        this.allRoles.set(roles);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          err?.status === 403
            ? "You don't have sufficient permissions to view this."
            : 'Failed to load users.',
        );
        this.loading.set(false);
      },
    });
  }

  hasRole(user: AdminUser, roleId: string): boolean {
    return user.userRoles.some((ur) => ur.role.id === roleId);
  }

  isTogglingRole(userId: string, roleId: string): boolean {
    return this.togglingRole().get(userId)?.has(roleId) ?? false;
  }

  triggerImport(): void {
    this.fileInput.nativeElement.value = '';
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.importing.set(true);
    this.importResult.set(null);
    this.showImportErrors.set(false);
    this.error.set('');

    this.adminService.importMembers(file).subscribe({
      next: (result) => {
        this.importResult.set(result);
        this.importing.set(false);
        // Refresh user list to show newly imported members
        this.adminService.listUsers().subscribe({ next: (u) => this.users.set(u) });
      },
      error: (err) => {
        this.error.set(
          err?.error?.message ?? 'Import failed. Please check the file and try again.',
        );
        this.importing.set(false);
      },
    });
  }

  toggleUserRole(user: AdminUser, roleId: string): void {
    if (!this.auth.hasPermission('users:assign_role')) return;
    const currently = this.hasRole(user, roleId);

    const map = new Map(this.togglingRole());
    const set = new Set(map.get(user.id) ?? []);
    set.add(roleId);
    map.set(user.id, set);
    this.togglingRole.set(map);

    const req = currently
      ? this.adminService.removeUserRole(user.id, roleId)
      : this.adminService.addUserRole(user.id, roleId);

    req.subscribe({
      next: () => {
        // Reload the full user list to pick up any auto-generated memberId
        this.adminService.listUsers().subscribe({ next: (u) => this.users.set(u) });
        this._clearTogglingRole(user.id, roleId);
      },
      error: (err) => {
        this.error.set(
          err?.status === 403
            ? "You don't have sufficient permissions."
            : (err.error?.message ?? 'Failed to update role.'),
        );
        this._clearTogglingRole(user.id, roleId);
      },
    });
  }

  openEdit(user: AdminUser): void {
    this.editingUser.set(user);
    this.editError.set('');
    this.editForm = this.fb.group({
      displayName: [user.displayName ?? ''],
      phone: [user.phone ?? ''],
      batch: [user.batch ?? ''],
      bio: [user.bio ?? ''],
      jobTitle: [user.jobTitle ?? ''],
      company: [user.company ?? ''],
      industry: [user.industry ?? ''],
      city: [user.city ?? ''],
      country: [user.country ?? ''],
      skills: [(user.skills ?? []).join(', ')],
      openToMentoring: [user.openToMentoring ?? false],
      profileVisibility: [user.profileVisibility ?? false],
    });
  }

  closeEdit(): void {
    this.editingUser.set(null);
    this.editError.set('');
  }

  saveEdit(): void {
    const user = this.editingUser();
    if (!user) return;
    this.savingEdit.set(true);
    this.editError.set('');
    const raw = this.editForm.getRawValue();
    const dto = {
      displayName: raw.displayName || undefined,
      phone: raw.phone || undefined,
      batch: raw.batch !== '' && raw.batch !== null ? Number(raw.batch) : undefined,
      bio: raw.bio || undefined,
      jobTitle: raw.jobTitle || undefined,
      company: raw.company || undefined,
      industry: raw.industry || undefined,
      city: raw.city || undefined,
      country: raw.country || undefined,
      skills: raw.skills
        ? String(raw.skills)
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],
      openToMentoring: raw.openToMentoring,
      profileVisibility: raw.profileVisibility,
    };
    this.adminService.updateUserProfile(user.id, dto).subscribe({
      next: (updated) => {
        this.users.update((list) =>
          list.map((u) =>
            u.id === user.id
              ? {
                  ...u,
                  displayName: updated.displayName,
                  phone: updated.phone,
                  batch: updated.batch,
                  bio: updated.bio,
                  jobTitle: updated.jobTitle,
                  company: updated.company,
                  industry: updated.industry,
                  city: updated.city,
                  country: updated.country,
                  skills: updated.skills,
                  openToMentoring: updated.openToMentoring,
                  profileVisibility: updated.profileVisibility,
                }
              : u,
          ),
        );
        this.savingEdit.set(false);
        this.closeEdit();
      },
      error: (err) => {
        this.editError.set(err?.error?.message ?? 'Failed to save changes.');
        this.savingEdit.set(false);
      },
    });
  }

  hasMemberRole(user: AdminUser): boolean {
    return user.userRoles.some((ur) => ur.role.name === 'member');
  }

  isGeneratingMemberId(userId: string): boolean {
    return this.generatingMemberId().has(userId);
  }

  doGenerateMemberId(user: AdminUser): void {
    const next = new Set(this.generatingMemberId());
    next.add(user.id);
    this.generatingMemberId.set(next);
    this.adminService.generateMemberIdForUser(user.id).subscribe({
      next: (res) => {
        this.users.update((list) =>
          list.map((u) => (u.id === user.id ? { ...u, memberId: res.memberId } : u)),
        );
        const done = new Set(this.generatingMemberId());
        done.delete(user.id);
        this.generatingMemberId.set(done);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to generate member ID.');
        const done = new Set(this.generatingMemberId());
        done.delete(user.id);
        this.generatingMemberId.set(done);
      },
    });
  }

  private _clearTogglingRole(userId: string, roleId: string): void {
    const map = new Map(this.togglingRole());
    const set = new Set(map.get(userId) ?? []);
    set.delete(roleId);
    if (set.size === 0) map.delete(userId);
    else map.set(userId, set);
    this.togglingRole.set(map);
  }
}
