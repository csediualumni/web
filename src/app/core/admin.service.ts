import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AdminUser {
  id: string;
  email: string;
  displayName: string | null;
  avatar: string | null;
  googleId: string | null;
  createdAt: string;
  updatedAt: string;
  userRoles: { role: { id: string; name: string } }[];
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  createdAt: string;
  permissions: { permission: { id: string; key: string; description: string | null; group: string | null } }[];
  _count?: { userRoles: number };
}

export interface Permission {
  id: string;
  key: string;
  description: string | null;
  group: string | null;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly adminBase = `${environment.apiUrl}/admin`;
  private readonly rolesBase = `${environment.apiUrl}/roles`;
  private readonly permsBase = `${environment.apiUrl}/permissions`;

  constructor(private http: HttpClient) {}

  // ── Users ──────────────────────────────────────────────
  listUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.adminBase}/users`);
  }

  setUserRoles(userId: string, roleIds: string[]): Observable<AdminUser> {
    return this.http.post<AdminUser>(`${this.adminBase}/users/${userId}/roles`, { roleIds });
  }

  addUserRole(userId: string, roleId: string): Observable<void> {
    return this.http.post<void>(`${this.adminBase}/users/${userId}/roles/${roleId}`, {});
  }

  removeUserRole(userId: string, roleId: string): Observable<void> {
    return this.http.delete<void>(`${this.adminBase}/users/${userId}/roles/${roleId}`);
  }

  // ── Roles ──────────────────────────────────────────────
  listRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.rolesBase);
  }

  getRole(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.rolesBase}/${id}`);
  }

  createRole(name: string, description?: string): Observable<Role> {
    return this.http.post<Role>(this.rolesBase, { name, description });
  }

  updateRole(id: string, data: { name?: string; description?: string }): Observable<Role> {
    return this.http.patch<Role>(`${this.rolesBase}/${id}`, data);
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.rolesBase}/${id}`);
  }

  setRolePermissions(roleId: string, permissionIds: string[]): Observable<Role> {
    return this.http.post<Role>(`${this.rolesBase}/${roleId}/permissions`, { permissionIds });
  }

  addRolePermission(roleId: string, permissionId: string): Observable<void> {
    return this.http.post<void>(`${this.rolesBase}/${roleId}/permissions/${permissionId}`, {});
  }

  removeRolePermission(roleId: string, permissionId: string): Observable<void> {
    return this.http.delete<void>(`${this.rolesBase}/${roleId}/permissions/${permissionId}`);
  }

  // ── Permissions ────────────────────────────────────────
  listPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(this.permsBase);
  }
}
