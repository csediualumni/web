import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Milestone {
  id: string;
  year: string;
  title: string;
  description: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommitteeMemberUser {
  id: string;
  displayName: string | null;
  email: string;
  avatar: string | null;
  batch: number | null;
  jobTitle: string | null;
  company: string | null;
  city: string | null;
  country: string | null;
}

export interface CommitteeEntry {
  id: string;
  designation: string;
  sortOrder: number;
  note: string | null;
  user: CommitteeMemberUser;
}

export interface Committee {
  id: string;
  term: string;
  sessionLabel: string;
  isCurrent: boolean;
  theme: string | null;
  sortOrder: number;
  members: CommitteeEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface DesignationMapping {
  id: string;
  designation: string;
  roleId: string | null;
  role: { id: string; name: string; description: string | null } | null;
  createdAt: string;
}

export interface ImportMembersResult {
  created: number;
  updated: number;
  errors: { row: number; email: string; reason: string }[];
}

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
  private readonly milestonesBase = `${environment.apiUrl}/milestones`;

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

  // ── Milestones (public) ─────────────────────────────────
  getMilestones(): Observable<Milestone[]> {
    return this.http.get<Milestone[]>(this.milestonesBase);
  }

  // ── Milestones (admin) ─────────────────────────────────
  adminListMilestones(): Observable<Milestone[]> {
    return this.http.get<Milestone[]>(`${this.adminBase}/milestones`);
  }

  adminCreateMilestone(data: { year: string; title: string; description: string; sortOrder?: number }): Observable<Milestone> {
    return this.http.post<Milestone>(`${this.adminBase}/milestones`, data);
  }

  adminUpdateMilestone(id: string, data: Partial<{ year: string; title: string; description: string; sortOrder: number }>): Observable<Milestone> {
    return this.http.patch<Milestone>(`${this.adminBase}/milestones/${id}`, data);
  }

  adminDeleteMilestone(id: string): Observable<void> {
    return this.http.delete<void>(`${this.adminBase}/milestones/${id}`);
  }

  // ── Committees (public) ─────────────────────────────────────────
  getCommittees(): Observable<Committee[]> {
    return this.http.get<Committee[]>(`${environment.apiUrl}/committees`);
  }

  getCommittee(id: string): Observable<Committee> {
    return this.http.get<Committee>(`${environment.apiUrl}/committees/${id}`);
  }

  // ── Committees (admin) ──────────────────────────────────────────
  adminListCommittees(): Observable<Committee[]> {
    return this.http.get<Committee[]>(`${this.adminBase}/committees`);
  }

  adminCreateCommittee(data: { term: string; sessionLabel: string; isCurrent?: boolean; theme?: string; sortOrder?: number }): Observable<Committee> {
    return this.http.post<Committee>(`${this.adminBase}/committees`, data);
  }

  adminUpdateCommittee(id: string, data: Partial<{ term: string; sessionLabel: string; isCurrent: boolean; theme: string; sortOrder: number }>): Observable<Committee> {
    return this.http.patch<Committee>(`${this.adminBase}/committees/${id}`, data);
  }

  adminDeleteCommittee(id: string): Observable<void> {
    return this.http.delete<void>(`${this.adminBase}/committees/${id}`);
  }

  adminAddCommitteeMember(committeeId: string, data: { userId: string; designation: string; sortOrder?: number; note?: string }): Observable<CommitteeEntry> {
    return this.http.post<CommitteeEntry>(`${this.adminBase}/committees/${committeeId}/members`, data);
  }

  adminUpdateCommitteeMember(memberId: string, data: Partial<{ designation: string; sortOrder: number; note: string }>): Observable<CommitteeEntry> {
    return this.http.patch<CommitteeEntry>(`${this.adminBase}/committees/members/${memberId}`, data);
  }

  adminRemoveCommitteeMember(memberId: string): Observable<void> {
    return this.http.delete<void>(`${this.adminBase}/committees/members/${memberId}`);
  }

  // ── Designation → Role mappings (admin) ──────────────────────────
  adminListDesignationMappings(): Observable<DesignationMapping[]> {
    return this.http.get<DesignationMapping[]>(`${this.adminBase}/designation-roles`);
  }

  adminSetDesignationMapping(designation: string, roleId: string): Observable<DesignationMapping> {
    return this.http.post<DesignationMapping>(`${this.adminBase}/designation-roles`, { designation, roleId });
  }

  adminUpdateDesignationMapping(id: string, roleId: string): Observable<DesignationMapping> {
    return this.http.patch<DesignationMapping>(`${this.adminBase}/designation-roles/${id}`, { roleId });
  }

  adminRemoveDesignationMapping(id: string): Observable<void> {
    return this.http.delete<void>(`${this.adminBase}/designation-roles/${id}`);
  }

  // ── Bulk member import ───────────────────────────────────
  importMembers(file: File): Observable<ImportMembersResult> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<ImportMembersResult>(`${this.adminBase}/users/import`, form);
  }
}
