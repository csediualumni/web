import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, ContactTicket, ContactTicketStatus } from '../../core/admin.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-admin-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-contact.component.html',
})
export class AdminContactComponent implements OnInit {
  loading = signal(true);
  error = signal('');
  success = signal('');

  tickets = signal<ContactTicket[]>([]);
  selectedTicket = signal<ContactTicket | null>(null);

  // Filter / search
  filterStatus = signal<'all' | ContactTicketStatus>('all');
  searchText = signal('');

  filteredTickets = computed(() => {
    const status = this.filterStatus();
    const q = this.searchText().toLowerCase();
    return this.tickets().filter((t) => {
      const matchStatus = status === 'all' || t.status === status;
      const matchText =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q);
      return matchStatus && matchText;
    });
  });

  // Counts
  openCount = computed(() => this.tickets().filter((t) => t.status === 'open').length);
  inProgressCount = computed(() => this.tickets().filter((t) => t.status === 'in_progress').length);
  resolvedCount = computed(() => this.tickets().filter((t) => t.status === 'resolved').length);

  // Comment form
  newComment = signal('');
  addingComment = signal(false);
  updatingStatus = signal(false);
  deleting = signal(false);

  readonly auth = inject(AuthService);
  private readonly adminService = inject(AdminService);

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.loading.set(true);
    this.error.set('');
    this.adminService.listContactTickets().subscribe({
      next: (tickets) => {
        this.tickets.set(tickets);
        // Refresh selected ticket if it was open
        const sel = this.selectedTicket();
        if (sel) {
          const updated = tickets.find((t) => t.id === sel.id);
          this.selectedTicket.set(updated ?? null);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          err?.status === 403
            ? "You don't have sufficient permissions to view this."
            : 'Failed to load contact tickets.',
        );
        this.loading.set(false);
      },
    });
  }

  selectTicket(ticket: ContactTicket): void {
    this.selectedTicket.set(ticket);
    this.newComment.set('');
    this.error.set('');
    this.success.set('');
  }

  closeDetail(): void {
    this.selectedTicket.set(null);
    this.error.set('');
    this.success.set('');
  }

  updateStatus(status: ContactTicketStatus): void {
    const ticket = this.selectedTicket();
    if (!ticket || this.updatingStatus()) return;
    this.updatingStatus.set(true);
    this.error.set('');
    this.adminService.updateContactTicketStatus(ticket.id, status).subscribe({
      next: (updated) => {
        this.selectedTicket.set(updated);
        this.tickets.update((list) => list.map((t) => (t.id === updated.id ? updated : t)));
        this.success.set(`Status updated to "${this.statusLabel(status)}".`);
        this.updatingStatus.set(false);
        setTimeout(() => this.success.set(''), 3000);
      },
      error: (err) => {
        this.error.set(
          err?.status === 403
            ? "You don't have sufficient permissions."
            : 'Failed to update status.',
        );
        this.updatingStatus.set(false);
      },
    });
  }

  addComment(): void {
    const ticket = this.selectedTicket();
    const body = this.newComment().trim();
    if (!ticket || !body || this.addingComment()) return;

    const authorName =
      this.auth.currentUser()?.profile?.displayName || this.auth.currentUser()?.email || 'Admin';

    this.addingComment.set(true);
    this.error.set('');
    this.adminService.addContactTicketComment(ticket.id, body, authorName).subscribe({
      next: (updated) => {
        this.selectedTicket.set(updated);
        this.tickets.update((list) => list.map((t) => (t.id === updated.id ? updated : t)));
        this.newComment.set('');
        this.addingComment.set(false);
        this.success.set('Comment added. Email sent to contact person.');
        setTimeout(() => this.success.set(''), 3000);
      },
      error: (err) => {
        this.error.set(
          err?.status === 403 ? "You don't have sufficient permissions." : 'Failed to add comment.',
        );
        this.addingComment.set(false);
      },
    });
  }

  deleteTicket(ticket: ContactTicket): void {
    if (!confirm(`Delete ticket from "${ticket.name}"? This cannot be undone.`)) return;
    this.deleting.set(true);
    this.adminService.deleteContactTicket(ticket.id).subscribe({
      next: () => {
        this.tickets.update((list) => list.filter((t) => t.id !== ticket.id));
        if (this.selectedTicket()?.id === ticket.id) this.selectedTicket.set(null);
        this.deleting.set(false);
      },
      error: (err) => {
        this.error.set(
          err?.status === 403
            ? "You don't have sufficient permissions."
            : 'Failed to delete ticket.',
        );
        this.deleting.set(false);
      },
    });
  }

  statusLabel(status: ContactTicketStatus | string): string {
    const map: Record<string, string> = {
      open: 'Open',
      in_progress: 'In Progress',
      resolved: 'Resolved',
    };
    return map[status] ?? status;
  }

  statusClass(status: ContactTicketStatus | string): string {
    const map: Record<string, string> = {
      open: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-amber-100 text-amber-700',
      resolved: 'bg-emerald-100 text-emerald-700',
    };
    return map[status] ?? 'bg-zinc-100 text-zinc-600';
  }

  statusDotClass(status: ContactTicketStatus | string): string {
    const map: Record<string, string> = {
      open: 'bg-blue-500',
      in_progress: 'bg-amber-500',
      resolved: 'bg-emerald-500',
    };
    return map[status] ?? 'bg-zinc-400';
  }

  readonly allStatuses: ContactTicketStatus[] = ['open', 'in_progress', 'resolved'];
}
