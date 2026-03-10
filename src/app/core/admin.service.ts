import { inject, Injectable } from '@angular/core';
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

export type CampaignStatus = 'active' | 'completed' | 'upcoming';
export interface AdminCampaign {
  id: number;
  title: string;
  tagline: string;
  description: string;
  goal: number;
  raised: number;
  donors: number;
  status: CampaignStatus;
  deadline: string | null;
  category: string;
  icon: string;
  color: string;
  featured: boolean;
  impact: string[];
  updates: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaveCampaignDto {
  title: string;
  tagline: string;
  description: string;
  goal: number;
  status: CampaignStatus;
  deadline?: string | null;
  category: string;
  icon: string;
  color: string;
  featured: boolean;
  impact: string[];
  updates?: string[] | null;
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

export type EventMode = 'In-Person' | 'Online' | 'Hybrid';
export type EventStatus = 'upcoming' | 'ongoing' | 'past';
export type RsvpStatus = 'registered' | 'cancelled' | 'pending_payment';

export interface ApiEvent {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  time: string;
  location: string;
  city: string;
  mode: EventMode;
  category: string;
  status: EventStatus;
  seats: number | null;
  seatsLeft: number | null; // server-computed
  rsvpCount: number; // server-computed
  imageUrl: string | null;
  color: string;
  featured: boolean;
  registrationUrl: string | null;
  sortOrder: number;
  /** Ticket price in BDT. null or 0 = free event. */
  ticketPrice: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface EventRsvp {
  id: string;
  eventId: string;
  userId: string;
  status: RsvpStatus;
  /** Present for paid-event RSVPs */
  invoiceId: string | null;
  user?: { id: string; email: string; displayName: string | null; avatar: string | null };
  createdAt: string;
  updatedAt: string;
}

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

export type NewsCategory =
  | 'Announcement'
  | 'Achievement'
  | 'Events'
  | 'Research'
  | 'Career'
  | 'Community';

export interface AdminNewsArticle {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: NewsCategory;
  author: string;
  date: string;
  readTime: string;
  icon: string;
  color: string;
  pinned: boolean;
  featured: boolean;
  sortOrder: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaveNewsArticleDto {
  title: string;
  summary: string;
  body: string;
  category: NewsCategory;
  author: string;
  date: string;
  readTime: string;
  icon: string;
  color: string;
  pinned?: boolean;
  featured?: boolean;
  sortOrder?: number | null;
}

// ── Research ─────────────────────────────────────────────────────

export type VenueType = 'journal' | 'conference' | 'preprint';

export interface AdminResearchPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  year: number;
  venue: string;
  venueType: VenueType;
  tags: string[];
  doi: string | null;
  link: string;
  citations: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaveResearchPaperDto {
  title: string;
  authors: string[];
  abstract: string;
  year: number;
  venue: string;
  venueType: VenueType;
  tags?: string[];
  doi?: string | null;
  link: string;
  citations?: number;
  featured?: boolean;
}

// ── Mentorship ───────────────────────────────────────────────────

export interface AdminMentor {
  id: string;
  name: string;
  batch: number;
  role: string;
  company: string;
  country: string;
  city: string;
  initials: string | null;
  color: string | null;
  expertise: string[];
  bio: string;
  availability: string;
  mentees: number;
  rating: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaveMentorDto {
  name: string;
  batch: number;
  role: string;
  company: string;
  country: string;
  city: string;
  initials?: string | null;
  color?: string | null;
  expertise?: string[];
  bio: string;
  availability: string;
  mentees?: number;
  rating?: number;
  featured?: boolean;
}

export type ApplicationStatus = 'pending' | 'reviewing' | 'accepted' | 'rejected';

export interface AdminMentorApplication {
  id: string;
  name: string;
  email: string;
  batch: number | null;
  area: string;
  goals: string;
  type: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

// ── Scholarships ─────────────────────────────────────────────────

export interface AdminScholarship {
  id: string;
  title: string;
  provider: string;
  amount: string;
  currency: string;
  deadline: string;
  eligibility: string;
  level: string;
  country: string;
  type: string;
  description: string;
  tags: string[];
  link: string;
  featured: boolean;
  urgent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaveScholarshipDto {
  title: string;
  provider: string;
  amount: string;
  currency: string;
  deadline: string;
  eligibility: string;
  level: string;
  country: string;
  type: string;
  description: string;
  tags?: string[];
  link: string;
  featured?: boolean;
  urgent?: boolean;
}

// ── Jobs ────────────────────────────────────────────────────────

export type AdminJobType = 'Full-time' | 'Part-time' | 'Internship' | 'Remote' | 'Contract';

export interface AdminJobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  country: string;
  type: AdminJobType;
  industry: string;
  experience: string;
  salary: string | null;
  posted: string;
  deadline: string;
  description: string;
  skills: string[];
  featured: boolean;
  postedById: string | null;
  postedBy: { id: string; displayName: string | null; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaveJobPostingDto {
  title: string;
  company: string;
  location: string;
  country: string;
  type: AdminJobType;
  industry: string;
  experience: string;
  salary?: string | null;
  posted: string;
  deadline: string;
  description: string;
  skills?: string[];
  featured?: boolean;
  postedById?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly adminBase = `${environment.apiUrl}/admin`;
  private readonly rolesBase = `${environment.apiUrl}/roles`;
  private readonly permsBase = `${environment.apiUrl}/permissions`;
  private readonly newsletterBase = `${environment.apiUrl}/newsletter`;
  private readonly contactBase = `${environment.apiUrl}/contact`;
  private readonly milestonesBase = `${environment.apiUrl}/milestones`;
  private readonly eventsBase = `${environment.apiUrl}/events`;

  private readonly http = inject(HttpClient);

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
    return this.http.patch<NewsletterSubscription>(
      `${this.adminBase}/newsletter/subscriptions/${id}/toggle`,
      {},
    );
  }

  deleteNewsletterSubscription(id: string): Observable<void> {
    return this.http.delete<void>(`${this.adminBase}/newsletter/subscriptions/${id}`);
  }

  sendNewsletter(subject: string, htmlBody: string): Observable<{ sent: number }> {
    return this.http.post<{ sent: number }>(`${this.adminBase}/newsletter/send`, {
      subject,
      htmlBody,
    });
  }

  // ── Contact Tickets (public submit) ────────────────────────
  submitContactForm(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Observable<ContactTicket> {
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
    return this.http.patch<ContactTicket>(`${this.adminBase}/contact/tickets/${id}/status`, {
      status,
    });
  }

  addContactTicketComment(id: string, body: string, authorName: string): Observable<ContactTicket> {
    return this.http.post<ContactTicket>(`${this.adminBase}/contact/tickets/${id}/comments`, {
      body,
      authorName,
    });
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

  adminCreateMilestone(data: {
    year: string;
    title: string;
    description: string;
    sortOrder?: number;
  }): Observable<Milestone> {
    return this.http.post<Milestone>(`${this.adminBase}/milestones`, data);
  }

  adminUpdateMilestone(
    id: string,
    data: Partial<{ year: string; title: string; description: string; sortOrder: number }>,
  ): Observable<Milestone> {
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

  adminCreateCommittee(data: {
    term: string;
    sessionLabel: string;
    isCurrent?: boolean;
    theme?: string;
    sortOrder?: number;
  }): Observable<Committee> {
    return this.http.post<Committee>(`${this.adminBase}/committees`, data);
  }

  adminUpdateCommittee(
    id: string,
    data: Partial<{
      term: string;
      sessionLabel: string;
      isCurrent: boolean;
      theme: string;
      sortOrder: number;
    }>,
  ): Observable<Committee> {
    return this.http.patch<Committee>(`${this.adminBase}/committees/${id}`, data);
  }

  adminDeleteCommittee(id: string): Observable<void> {
    return this.http.delete<void>(`${this.adminBase}/committees/${id}`);
  }

  adminAddCommitteeMember(
    committeeId: string,
    data: { userId: string; designation: string; sortOrder?: number; note?: string },
  ): Observable<CommitteeEntry> {
    return this.http.post<CommitteeEntry>(
      `${this.adminBase}/committees/${committeeId}/members`,
      data,
    );
  }

  adminUpdateCommitteeMember(
    memberId: string,
    data: Partial<{ designation: string; sortOrder: number; note: string }>,
  ): Observable<CommitteeEntry> {
    return this.http.patch<CommitteeEntry>(
      `${this.adminBase}/committees/members/${memberId}`,
      data,
    );
  }

  adminRemoveCommitteeMember(memberId: string): Observable<void> {
    return this.http.delete<void>(`${this.adminBase}/committees/members/${memberId}`);
  }

  // ── Designation → Role mappings (admin) ──────────────────────────
  adminListDesignationMappings(): Observable<DesignationMapping[]> {
    return this.http.get<DesignationMapping[]>(`${this.adminBase}/designation-roles`);
  }

  adminSetDesignationMapping(designation: string, roleId: string): Observable<DesignationMapping> {
    return this.http.post<DesignationMapping>(`${this.adminBase}/designation-roles`, {
      designation,
      roleId,
    });
  }

  adminUpdateDesignationMapping(id: string, roleId: string): Observable<DesignationMapping> {
    return this.http.patch<DesignationMapping>(`${this.adminBase}/designation-roles/${id}`, {
      roleId,
    });
  }

  adminRemoveDesignationMapping(id: string): Observable<void> {
    return this.http.delete<void>(`${this.adminBase}/designation-roles/${id}`);
  }

  // ── Events (public) ─────────────────────────────────
  getEvents(): Observable<ApiEvent[]> {
    return this.http.get<ApiEvent[]>(this.eventsBase);
  }

  getEvent(id: string): Observable<ApiEvent> {
    return this.http.get<ApiEvent>(`${this.eventsBase}/${id}`);
  }

  // ── Events RSVP (auth required) ─────────────────────────
  rsvpEvent(
    id: string,
  ): Observable<{ message: string; rsvp: EventRsvp; invoiceId?: string; paymentUrl?: string }> {
    return this.http.post<{
      message: string;
      rsvp: EventRsvp;
      invoiceId?: string;
      paymentUrl?: string;
    }>(`${this.eventsBase}/${id}/rsvp`, {});
  }

  cancelRsvpEvent(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.eventsBase}/${id}/rsvp`);
  }

  getMyRsvp(id: string): Observable<EventRsvp | null> {
    return this.http.get<EventRsvp | null>(`${this.eventsBase}/${id}/rsvp`);
  }

  // ── Events (admin) ───────────────────────────────────
  adminListEvents(): Observable<ApiEvent[]> {
    return this.http.get<ApiEvent[]>(`${this.adminBase}/events`);
  }

  adminCreateEvent(data: {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    city: string;
    mode: EventMode;
    category: string;
    status: EventStatus;
    seats?: number | null;
    imageUrl?: string | null;
    color?: string;
    featured?: boolean;
    registrationUrl?: string | null;
    sortOrder?: number;
    ticketPrice?: number | null;
  }): Observable<ApiEvent> {
    return this.http.post<ApiEvent>(`${this.adminBase}/events`, data);
  }

  adminUpdateEvent(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      date: string;
      time: string;
      location: string;
      city: string;
      mode: EventMode;
      category: string;
      status: EventStatus;
      seats: number | null;
      imageUrl: string | null;
      color: string;
      featured: boolean;
      registrationUrl: string | null;
      sortOrder: number;
      ticketPrice: number | null;
    }>,
  ): Observable<ApiEvent> {
    return this.http.patch<ApiEvent>(`${this.adminBase}/events/${id}`, data);
  }

  adminDeleteEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.adminBase}/events/${id}`);
  }

  adminListEventRsvps(id: string): Observable<EventRsvp[]> {
    return this.http.get<EventRsvp[]>(`${this.adminBase}/events/${id}/rsvps`);
  }

  adminConfirmEventRsvp(eventId: string, rsvpId: string): Observable<EventRsvp> {
    return this.http.post<EventRsvp>(
      `${this.adminBase}/events/${eventId}/rsvps/${rsvpId}/confirm`,
      {},
    );
  }

  // ── Bulk member import ───────────────────────────────────
  importMembers(file: File): Observable<ImportMembersResult> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<ImportMembersResult>(`${this.adminBase}/users/import`, form);
  }

  // ── Image upload ─────────────────────────────────────────
  uploadEventImage(file: File): Observable<{ url: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ url: string }>(`${this.adminBase}/upload/image`, form);
  }

  // ── Campaigns ─────────────────────────────────────────────
  private readonly campaignsBase = `${environment.apiUrl}/campaigns`;

  adminListCampaigns(): Observable<AdminCampaign[]> {
    return this.http.get<AdminCampaign[]>(this.campaignsBase);
  }

  adminCreateCampaign(dto: SaveCampaignDto): Observable<AdminCampaign> {
    return this.http.post<AdminCampaign>(this.campaignsBase, dto);
  }

  adminUpdateCampaign(id: number, dto: Partial<SaveCampaignDto>): Observable<AdminCampaign> {
    return this.http.patch<AdminCampaign>(`${this.campaignsBase}/${id}`, dto);
  }

  adminDeleteCampaign(id: number): Observable<void> {
    return this.http.delete<void>(`${this.campaignsBase}/${id}`);
  }

  // ── News ──────────────────────────────────────────────────────
  private readonly newsBase = `${environment.apiUrl}/news`;

  listNewsArticles(): Observable<AdminNewsArticle[]> {
    return this.http.get<AdminNewsArticle[]>(this.newsBase);
  }

  adminCreateNewsArticle(dto: SaveNewsArticleDto): Observable<AdminNewsArticle> {
    return this.http.post<AdminNewsArticle>(this.newsBase, dto);
  }

  adminUpdateNewsArticle(id: string, dto: Partial<SaveNewsArticleDto>): Observable<AdminNewsArticle> {
    return this.http.patch<AdminNewsArticle>(`${this.newsBase}/${id}`, dto);
  }

  adminDeleteNewsArticle(id: string): Observable<void> {
    return this.http.delete<void>(`${this.newsBase}/${id}`);
  }

  // ── Research ──────────────────────────────────────────────────
  private readonly researchBase = `${environment.apiUrl}/research`;

  listResearchPapers(): Observable<AdminResearchPaper[]> {
    return this.http.get<AdminResearchPaper[]>(this.researchBase);
  }

  adminCreateResearchPaper(dto: SaveResearchPaperDto): Observable<AdminResearchPaper> {
    return this.http.post<AdminResearchPaper>(this.researchBase, dto);
  }

  adminUpdateResearchPaper(id: string, dto: Partial<SaveResearchPaperDto>): Observable<AdminResearchPaper> {
    return this.http.patch<AdminResearchPaper>(`${this.researchBase}/${id}`, dto);
  }

  adminDeleteResearchPaper(id: string): Observable<void> {
    return this.http.delete<void>(`${this.researchBase}/${id}`);
  }

  // ── Mentors ───────────────────────────────────────────────────
  private readonly mentorsBase = `${environment.apiUrl}/mentors`;

  listMentors(): Observable<AdminMentor[]> {
    return this.http.get<AdminMentor[]>(this.mentorsBase);
  }

  adminCreateMentor(dto: SaveMentorDto): Observable<AdminMentor> {
    return this.http.post<AdminMentor>(this.mentorsBase, dto);
  }

  adminUpdateMentor(id: string, dto: Partial<SaveMentorDto>): Observable<AdminMentor> {
    return this.http.patch<AdminMentor>(`${this.mentorsBase}/${id}`, dto);
  }

  adminDeleteMentor(id: string): Observable<void> {
    return this.http.delete<void>(`${this.mentorsBase}/${id}`);
  }

  listMentorApplications(): Observable<AdminMentorApplication[]> {
    return this.http.get<AdminMentorApplication[]>(`${this.mentorsBase}/admin/applications`);
  }

  updateApplicationStatus(id: string, status: ApplicationStatus): Observable<AdminMentorApplication> {
    return this.http.patch<AdminMentorApplication>(`${this.mentorsBase}/admin/applications/${id}/status`, { status });
  }

  // ── Scholarships ──────────────────────────────────────────────
  private readonly scholarshipsBase = `${environment.apiUrl}/scholarships`;

  listScholarships(): Observable<AdminScholarship[]> {
    return this.http.get<AdminScholarship[]>(this.scholarshipsBase);
  }

  adminCreateScholarship(dto: SaveScholarshipDto): Observable<AdminScholarship> {
    return this.http.post<AdminScholarship>(this.scholarshipsBase, dto);
  }

  adminUpdateScholarship(id: string, dto: Partial<SaveScholarshipDto>): Observable<AdminScholarship> {
    return this.http.patch<AdminScholarship>(`${this.scholarshipsBase}/${id}`, dto);
  }

  adminDeleteScholarship(id: string): Observable<void> {
    return this.http.delete<void>(`${this.scholarshipsBase}/${id}`);
  }

  // ── Jobs ──────────────────────────────────────────────────────
  private readonly jobsBase = `${environment.apiUrl}/jobs`;

  listJobPostings(): Observable<AdminJobPosting[]> {
    return this.http.get<AdminJobPosting[]>(this.jobsBase);
  }

  adminCreateJobPosting(dto: SaveJobPostingDto): Observable<AdminJobPosting> {
    return this.http.post<AdminJobPosting>(this.jobsBase, dto);
  }

  adminUpdateJobPosting(id: string, dto: Partial<SaveJobPostingDto>): Observable<AdminJobPosting> {
    return this.http.patch<AdminJobPosting>(`${this.jobsBase}/${id}`, dto);
  }

  adminDeleteJobPosting(id: string): Observable<void> {
    return this.http.delete<void>(`${this.jobsBase}/${id}`);
  }
}
