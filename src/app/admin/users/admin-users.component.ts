import { Component, ElementRef, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, AdminUser, ImportMembersResult, Role } from '../../core/admin.service';
import { AuthService } from '../../core/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
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

  constructor(
    public auth: AuthService,
    private adminService: AdminService,
  ) {}

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
        this.error.set(err?.status === 403 ? 'You don\'t have sufficient permissions to view this.' : 'Failed to load users.');
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
        this.error.set(err?.error?.message ?? 'Import failed. Please check the file and try again.');
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
        this.users.update((list) =>
          list.map((u) => {
            if (u.id !== user.id) return u;
            const newRoles = currently
              ? u.userRoles.filter((ur) => ur.role.id !== roleId)
              : [...u.userRoles, { role: this.allRoles().find((r) => r.id === roleId)! }];
            return { ...u, userRoles: newRoles };
          }),
        );
        this._clearTogglingRole(user.id, roleId);
      },
      error: (err) => {
        this.error.set(err?.status === 403 ? 'You don\'t have sufficient permissions.' : (err.error?.message ?? 'Failed to update role.'));
        this._clearTogglingRole(user.id, roleId);
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
