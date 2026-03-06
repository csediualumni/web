import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, Role, Permission } from '../../core/admin.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-roles.component.html',
})
export class AdminRolesComponent implements OnInit {
  loading = signal(true);
  error = signal('');
  roles = signal<Role[]>([]);
  allPermissions = signal<Permission[]>([]);
  selectedRole = signal<Role | null>(null);

  newRoleName = signal('');
  newRoleDesc = signal('');
  creatingRole = signal(false);
  deletingRoleId = signal<string | null>(null);
  togglingPerm = signal<Map<string, Set<string>>>(new Map());

  constructor(
    public auth: AuthService,
    private adminService: AdminService,
  ) {}

  ngOnInit(): void {
    this.adminService.listRoles().subscribe({
      next: (roles) => {
        this.roles.set(roles);
        this.adminService.listPermissions().subscribe({
          next: (perms) => {
            this.allPermissions.set(perms);
            this.loading.set(false);
          },
          error: () => {
            this.error.set('Failed to load permissions.');
            this.loading.set(false);
          },
        });
      },
      error: () => {
        this.error.set('Failed to load roles.');
        this.loading.set(false);
      },
    });
  }

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

  permBadgeGroup(group: string): string {
    const map: Record<string, string> = {
      users: 'bg-blue-50 text-blue-600',
      roles: 'bg-purple-50 text-purple-600',
      permissions: 'bg-amber-50 text-amber-600',
      invoices: 'bg-emerald-50 text-emerald-600',
    };
    return map[group.toLowerCase()] ?? 'bg-zinc-100 text-zinc-500';
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
    if (role.isSystem) {
      this.error.set('System roles cannot be deleted.');
      return;
    }
    if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;
    this.deletingRoleId.set(role.id);
    this.adminService.deleteRole(role.id).subscribe({
      next: () => {
        this.roles.update((list) => list.filter((r) => r.id !== role.id));
        if (this.selectedRole()?.id === role.id) this.selectedRole.set(null);
        this.deletingRoleId.set(null);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Failed to delete role.');
        this.deletingRoleId.set(null);
      },
    });
  }
}
