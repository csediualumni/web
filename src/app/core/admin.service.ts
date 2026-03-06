import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface NewsletterSubscription {
  id: string;
  email: string;
  isActive: boolean;
  subscribedAt: string;
}

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
  permissions: {
    permission: { id: string; key: string; description: string | null; group: string | null };
  }[];
  _count?: { userRoles: number };
}

export interface Permission {
  id: string;
  key: string;
  description: string | null;
  group: string | null;
}

export type ContactTicketStatus = 'open' | 'in_progress' | 'resolved';

export interface ContactTicketComment {
  id: string;
  ticketId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface ContactTicket {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactTicketStatus;
  comments: ContactTicketComment[];
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly adminBase = `${environment.apiUrl}/admin`;
  private readonly rolesBase = `${environment.apiUrl}/roles`;
  private readonly permsBase = `${environment.apiUrl}/permissions`;
  private readonly newsletterBase = `${environment.apiUrl}/newsletter`;
  private readonly contactBase = `${environment.apiUrl}/contact`;

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

  // ── Newsletter (public subscribe) ───────────────────────
  subscribeNewsletter(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.newsletterBase}/subscribe`, { email });
  }

  // ── Newsletter (admin) ─────────────────────────────────
  listNewsletterSubscriptions(): Observable<NewsletterSubscription[]> {
    return this.http.get<NewsletterSubscription[]>(`${this.adminBase}/newsletter/subscriptions`);
  }

  toggleNewsletterSubscription(id: string): Observable<NewsletterSubscription> {
    return this.http.patch<NewsletterSubscription>(`${this.adminBase}/newsletter/subscriptions/${id}/toggle`, {});
  }

  deleteNewsletterSubscription(id: string): Observable<void> {
    return this.http.delete<void>(`${this.adminBase}/newsletter/subscriptions/${id}`);
  }

  sendNewsletter(subject: string, htmlBody: string): Observable<{ sent: number }> {
    return this.http.post<{ sent: number }>(`${this.adminBase}/newsletter/send`, { subject, htmlBody });
  }

  // ── Contact Tickets (public submit) ────────────────────────
  submitContactForm(data: { name: string; email: string; subject: string; message: string }): Observable<ContactTicket> {
    return this.http.post<ContactTicket>(this.contactBase, data);
  }

  // ── Contact Tickets (admin) ────────────────────────────────
  listContactTickets(): Observable<ContactTicket[]> {
    return this.http.get<ContactTicket[]>(`${this.adminBase}/contact/tickets`);
  }

  getContactTicket(id: string): Observable<ContactTicket> {
    return this.http.get<ContactTicket>(`${this.adminBase}/contact/tickets/${id}`);
  }

  updateContactTicketStatus(id: string, status: ContactTicketStatus): Observable<ContactTicket> {
    return this.http.patch<ContactTicket>(`${this.adminBase}/contact/tickets/${id}/status`, { status });
  }

  addContactTicketComment(id: string, body: string, authorName: string): Observable<ContactTicket> {
    return this.http.post<ContactTicket>(`${this.adminBase}/contact/tickets/${id}/comments`, { body, authorName });
  }

  deleteContactTicket(id: string): Observable<void> {
    return this.http.delete<void>(`${this.adminBase}/contact/tickets/${id}`);
  }
}
