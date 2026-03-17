import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import {
  AdminService,
  ApiEvent,
  EventRsvp,
  EventMode,
  EventStatus,
} from '../../core/admin.service';
import { AuthService } from '../../core/auth.service';
import { RichTextEditorComponent } from '../../shared/rich-text-editor/rich-text-editor.component';
import { convertToHtml } from '../../shared/content.utils';

type Mode = 'list' | 'create' | 'edit' | 'rsvps';

const MODES: EventMode[] = ['In-Person', 'Online', 'Hybrid'];
const STATUSES: EventStatus[] = ['upcoming', 'ongoing', 'past'];
const CATEGORIES = ['Reunion', 'Workshop', 'Seminar', 'Sports', 'Cultural', 'Webinar'];

@Component({
  selector: 'app-admin-events',
  standalone: true,
  imports: [CommonModule, FormsModule, RichTextEditorComponent],
  templateUrl: './admin-events.component.html',
})
export class AdminEventsComponent implements OnInit {
  @ViewChild('imageFileInput') imageFileInput!: ElementRef<HTMLInputElement>;

  mode = signal<Mode>('list');
  loading = signal(true);
  saving = signal(false);
  uploadingImage = signal(false);
  error = signal('');
  success = signal('');

  events = signal<ApiEvent[]>([]);
  rsvps = signal<EventRsvp[]>([]);
  viewingEvent = signal<ApiEvent | null>(null);
  rsvpsLoading = signal(false);
  deleting = signal<Set<string>>(new Set());
  confirmingRsvp = signal<Set<string>>(new Set());

  // Form fields
  editingId = signal<string | null>(null);
  formTitle = signal('');
  formDescription = signal('');
  formDescriptionFormat = signal<'html' | 'markdown'>('html');
  formDate = signal(''); // ISO date "YYYY-MM-DD"
  formTime = signal('');
  formLocation = signal('');
  formCity = signal('');
  formMode = signal<EventMode>('In-Person');
  formCategory = signal('Reunion');
  formStatus = signal<EventStatus>('upcoming');
  formSeats = signal<number | null>(null);
  formImageUrl = signal('');
  formColor = signal('bg-zinc-200');
  formFeatured = signal(false);
  formRegistrationUrl = signal('');
  formSortOrder = signal(0);
  /** Ticket price in BDT; null/0 = free event */
  formTicketPrice = signal<number | null>(null);

  readonly modes = MODES;
  readonly statuses = STATUSES;
  readonly categories = CATEGORIES;

  readonly auth = inject(AuthService);
  private readonly adminService = inject(AdminService);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.adminService.adminListEvents().subscribe({
      next: (data) => {
        this.events.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          err?.status === 403
            ? "You don't have sufficient permissions to view events."
            : 'Failed to load events.',
        );
        this.loading.set(false);
      },
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.formTitle.set('');
    this.formDescription.set('');
    this.formDescriptionFormat.set('html');
    this.formDate.set('');
    this.formTime.set('');
    this.formLocation.set('');
    this.formCity.set('');
    this.formMode.set('In-Person');
    this.formCategory.set('Reunion');
    this.formStatus.set('upcoming');
    this.formSeats.set(null);
    this.formImageUrl.set('');
    this.formColor.set('bg-zinc-200');
    this.formFeatured.set(false);
    this.formRegistrationUrl.set('');
    this.formSortOrder.set(this.events().length);
    this.formTicketPrice.set(null);
    this.error.set('');
    this.success.set('');
    this.mode.set('create');
  }

  openEdit(e: ApiEvent): void {
    this.editingId.set(e.id);
    this.formTitle.set(e.title);
    this.formDescription.set(e.description);
    this.formDescriptionFormat.set('html');
    // Convert ISO date to YYYY-MM-DD for date input
    this.formDate.set(e.date.substring(0, 10));
    this.formTime.set(e.time);
    this.formLocation.set(e.location);
    this.formCity.set(e.city);
    this.formMode.set(e.mode);
    this.formCategory.set(e.category);
    this.formStatus.set(e.status);
    this.formSeats.set(e.seats);
    this.formImageUrl.set(e.imageUrl ?? '');
    this.formColor.set(e.color);
    this.formFeatured.set(e.featured);
    this.formRegistrationUrl.set(e.registrationUrl ?? '');
    this.formSortOrder.set(e.sortOrder);
    this.formTicketPrice.set(e.ticketPrice ?? null);
    this.error.set('');
    this.success.set('');
    this.mode.set('edit');
  }

  cancelForm(): void {
    this.mode.set('list');
    this.error.set('');
    this.success.set('');
  }

  triggerImageUpload(): void {
    this.imageFileInput.nativeElement.click();
  }

  onImageFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!input) return;
    // Reset so the same file can be re-selected after clearing
    input.value = '';

    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      this.error.set('Only JPEG, PNG, WebP and GIF images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.error.set('Image must be smaller than 5 MB.');
      return;
    }

    this.uploadingImage.set(true);
    this.error.set('');

    this.adminService
      .uploadEventImage(file)
      .pipe(finalize(() => this.uploadingImage.set(false)))
      .subscribe({
        next: ({ url }) => this.formImageUrl.set(url),
        error: () => this.error.set('Image upload failed. Please try again.'),
      });
  }

  save(): void {
    const title = this.formTitle().trim();
    const description = convertToHtml(this.formDescription().trim(), this.formDescriptionFormat());
    const date = this.formDate().trim();
    const time = this.formTime().trim();
    const location = this.formLocation().trim();
    const city = this.formCity().trim();

    if (!title || !description || !date || !time || !location || !city) {
      this.error.set('Title, description, date, time, location and city are required.');
      return;
    }

    this.saving.set(true);
    this.error.set('');

    const payload = {
      title,
      description,
      date,
      time,
      location,
      city,
      mode: this.formMode(),
      category: this.formCategory(),
      status: this.formStatus(),
      seats: this.formSeats(),
      imageUrl: this.formImageUrl().trim() || null,
      color: this.formColor().trim() || 'bg-zinc-200',
      featured: this.formFeatured(),
      registrationUrl: this.formRegistrationUrl().trim() || null,
      sortOrder: this.formSortOrder(),
      ticketPrice: this.formTicketPrice() || null,
    };

    const id = this.editingId();
    const req =
      id === null
        ? this.adminService.adminCreateEvent(payload)
        : this.adminService.adminUpdateEvent(id, payload);

    req.subscribe({
      next: (saved) => {
        if (id === null) {
          this.events.update((list) =>
            [...list, saved].sort(
              (a, b) => a.sortOrder - b.sortOrder || a.date.localeCompare(b.date),
            ),
          );
          this.success.set('Event created.');
        } else {
          this.events.update((list) =>
            list
              .map((e) => (e.id === id ? saved : e))
              .sort((a, b) => a.sortOrder - b.sortOrder || a.date.localeCompare(b.date)),
          );
          this.success.set('Event updated.');
        }
        this.saving.set(false);
        this.mode.set('list');
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to save event.');
        this.saving.set(false);
      },
    });
  }

  deleteEvent(e: ApiEvent): void {
    if (!confirm(`Delete "${e.title}"? This will also remove all RSVPs.`)) return;
    this.deleting.update((s) => new Set([...s, e.id]));
    this.adminService.adminDeleteEvent(e.id).subscribe({
      next: () => {
        this.events.update((list) => list.filter((ev) => ev.id !== e.id));
        this.success.set(`"${e.title}" deleted.`);
        this.deleting.update((s) => {
          const next = new Set(s);
          next.delete(e.id);
          return next;
        });
      },
      error: () => {
        this.error.set('Failed to delete event.');
        this.deleting.update((s) => {
          const next = new Set(s);
          next.delete(e.id);
          return next;
        });
      },
    });
  }

  viewRsvps(e: ApiEvent): void {
    this.viewingEvent.set(e);
    this.rsvpsLoading.set(true);
    this.rsvps.set([]);
    this.mode.set('rsvps');
    this.adminService.adminListEventRsvps(e.id).subscribe({
      next: (data) => {
        this.rsvps.set(data);
        this.rsvpsLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load RSVPs.');
        this.rsvpsLoading.set(false);
      },
    });
  }

  formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateStr));
  }

  confirmRsvp(rsvp: import('../../core/admin.service').EventRsvp): void {
    const eventId = this.viewingEvent()?.id;
    if (!eventId) return;

    this.confirmingRsvp.update((s) => new Set([...s, rsvp.id]));
    this.adminService.adminConfirmEventRsvp(eventId, rsvp.id).subscribe({
      next: (updated) => {
        this.rsvps.update((list) => list.map((r) => (r.id === updated.id ? updated : r)));
        this.confirmingRsvp.update((s) => {
          const n = new Set(s);
          n.delete(rsvp.id);
          return n;
        });
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to confirm RSVP.');
        this.confirmingRsvp.update((s) => {
          const n = new Set(s);
          n.delete(rsvp.id);
          return n;
        });
      },
    });
  }
}
