import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService, AdminUser, Role, Permission } from '../core/admin.service';
import { AuthService } from '../core/auth.service';
import { forkJoin } from 'rxjs';

type Tab = 'users' | 'roles';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit {
  // ── Tab ──────────────────────────────────────────────
  activeTab = signal<Tab>('users');

  // ── Shared ───────────────────────────────────────────
  loading = signal(true);
  error = signal('');

  // ── Users tab ────────────────────────────────────────
  users = signal<AdminUser[]>([]);
  allRoles = signal<Role[]>([]);
  /** userId → set of roleIds being toggled right now */
  togglingRole = signal<Map<string, Set<string>>>(new Map());

  // ── Roles tab ────────────────────────────────────────
  roles = signal<Role[]>([]);
  allPermissions = signal<Permission[]>([]);
  /** Role being edited in the side-panel */
  selectedRole = signal<Role | null>(null);
  /** Create-role form */
  newRoleName = signal('');
  newRoleDesc = signal('');
  creatingRole = signal(false);
  /** role id → permissions being toggled */
  togglingPerm = signal<Map<string, Set<string>>>(new Map());
  deletingRoleId = signal<string | null>(null);

  constructor(
    public auth: AuthService,
    private adminService: AdminService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    forkJoin({
      users: this.adminService.listUsers(),
      roles: this.adminService.listRoles(),
      permissions: this.adminService.listPermissions(),
    }).subscribe({
      next: ({ users, roles, permissions }) => {
        this.users.set(users);
        this.allRoles.set(roles);
        this.roles.set(roles);
        this.allPermissions.set(permissions);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load data.');
        this.loading.set(false);
      },
    });
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
    this.selectedRole.set(null);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  canManage(): boolean {
    return this.auth.hasPermission('users:assign_role') || this.auth.hasPermission('roles:write');
  }

  // ── Users helpers ─────────────────────────────────────
  getUserRoleIds(user: AdminUser): string[] {
    return user.userRoles.map((ur) => ur.role.id);
  }

  hasRole(user: AdminUser, roleId: string): boolean {
    return this.getUserRoleIds(user).includes(roleId);
  }

  isTogglingRole(userId: string, roleId: string): boolean {
    return this.togglingRole().get(userId)?.has(roleId) ?? false;
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
        this.error.set(err.error?.message ?? 'Failed to update role.');
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

  // ── Roles helpers ─────────────────────────────────────
  selectRole(role: Role): void {
    this.selectedRole.set(this.selectedRole()?.id === role.id ? null : role);
  }

  getRolePermissionIds(role: Role): string[] {
    return role.permissions.map((rp) => rp.permission.id);
  }

  hasPermissionOnRole(role: Role, permId: string): boolean {
    return this.getRolePermissionIds(role).includes(permId);
  }

  isTogglingPerm(roleId: string, permId: string): boolean {
    return this.togglingPerm().get(roleId)?.has(permId) ?? false;
  }

  groupedPermissions(): { group: string; permissions: Permission[] }[] {
    const map = new Map<string, Permission[]>();
    for (const p of this.allPermissions()) {
      const g = p.group ?? 'Other';
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(p);
    }
    return Array.from(map.entries()).map(([group, permissions]) => ({ group, permissions }));
  }

  toggleRolePermission(role: Role, permId: string): void {
    if (!this.auth.hasPermission('permissions:assign')) return;
    const currently = this.hasPermissionOnRole(role, permId);

    const map = new Map(this.togglingPerm());
    const set = new Set(map.get(role.id) ?? []);
    set.add(permId);
    map.set(role.id, set);
    this.togglingPerm.set(map);

    const req = currently
      ? this.adminService.removeRolePermission(role.id, permId)
      : this.adminService.addRolePermission(role.id, permId);

    req.subscribe({
      next: () => {
        const allPerms = this.allPermissions();
        this.roles.update((list) =>
          list.map((r) => {
            if (r.id !== role.id) return r;
            const newPerms = currently
              ? r.permissions.filter((rp) => rp.permission.id !== permId)
              : [...r.permissions, { permission: allPerms.find((p) => p.id === permId)! }];
            return { ...r, permissions: newPerms };
          }),
        );
        // sync selectedRole
        const updated = this.roles().find((r) => r.id === role.id);
        if (this.selectedRole()?.id === role.id && updated) this.selectedRole.set(updated);
        this._clearTogglingPerm(role.id, permId);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Failed to update permission.');
        this._clearTogglingPerm(role.id, permId);
      },
    });
  }

  private _clearTogglingPerm(roleId: string, permId: string): void {
    const map = new Map(this.togglingPerm());
    const set = new Set(map.get(roleId) ?? []);
    set.delete(permId);
    if (set.size === 0) map.delete(roleId);
    else map.set(roleId, set);
    this.togglingPerm.set(map);
  }

  createRole(): void {
    const name = this.newRoleName().trim();
    if (!name) return;
    this.creatingRole.set(true);
    this.adminService.createRole(name, this.newRoleDesc().trim() || undefined).subscribe({
      next: (role) => {
        this.roles.update((list) => [...list, role]);
        this.allRoles.update((list) => [...list, role]);
        this.newRoleName.set('');
        this.newRoleDesc.set('');
        this.creatingRole.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Failed to create role.');
        this.creatingRole.set(false);
      },
    });
  }

  deleteRole(role: Role): void {
    if (role.isSystem) { this.error.set('System roles cannot be deleted.'); return; }
    if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;
    this.deletingRoleId.set(role.id);
    this.adminService.deleteRole(role.id).subscribe({
      next: () => {
        this.roles.update((list) => list.filter((r) => r.id !== role.id));
        this.allRoles.update((list) => list.filter((r) => r.id !== role.id));
        if (this.selectedRole()?.id === role.id) this.selectedRole.set(null);
        this.deletingRoleId.set(null);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Failed to delete role.');
        this.deletingRoleId.set(null);
      },
    });
  }

  permBadgeGroup(group: string): string {
    const map: Record<string, string> = {
      users: 'bg-blue-50 text-blue-600',
      roles: 'bg-purple-50 text-purple-600',
      permissions: 'bg-amber-50 text-amber-600',
    };
    return map[group.toLowerCase()] ?? 'bg-gray-100 text-gray-500';
  }
}
