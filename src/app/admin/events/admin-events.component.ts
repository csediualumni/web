import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import {
  AdminService,
  ApiEvent,
  EventRsvp,
  EventRegistration,
  EventSponsor,
  EventExpense,
  EventIncome,
  EventMode,
  EventStatus,
  SponsorTier,
  EventContactPerson,
} from '../../core/admin.service';
import { AuthService } from '../../core/auth.service';
import { RichTextEditorComponent } from '../../shared/rich-text-editor/rich-text-editor.component';
import { ImageInputComponent } from '../../shared/image-input/image-input.component';
import { convertToHtml } from '../../shared/content.utils';

type Mode = 'list' | 'create' | 'edit' | 'detail';
type DetailTab = 'registrations' | 'sponsors' | 'expenses' | 'income';

const MODES: EventMode[] = ['In-Person', 'Online', 'Hybrid'];
const STATUSES: EventStatus[] = ['upcoming', 'ongoing', 'past'];
const CATEGORIES = ['Reunion', 'Workshop', 'Seminar', 'Sports', 'Cultural', 'Webinar'];
const SPONSOR_TIERS: SponsorTier[] = ['title', 'platinum', 'gold', 'silver', 'bronze', 'supporter'];
const EXPENSE_CATS = ['Venue', 'Catering', 'Decoration', 'Equipment', 'Transport', 'Printing', 'Gift', 'Marketing', 'Miscellaneous'];
const INCOME_CATS = ['Sponsorship', 'Ticket Sales', 'Donation', 'Grant', 'Miscellaneous'];

type RegistrationRow = EventRegistration & {
  user: { id: string; email: string; displayName: string | null; phone: string | null; avatar: string | null };
  familyMembers: any[];
};

@Component({
  selector: 'app-admin-events',
  standalone: true,
  imports: [CommonModule, FormsModule, RichTextEditorComponent, ImageInputComponent],
  templateUrl: './admin-events.component.html',
})
export class AdminEventsComponent implements OnInit {
  @ViewChild('imageFileInput') imageFileInput!: ElementRef<HTMLInputElement>;

  // ── Navigation ─────────────────────────────────────────────────────────────
  mode = signal<Mode>('list');
  detailTab = signal<DetailTab>('registrations');

  // ── Shared state ───────────────────────────────────────────────────────────
  loading = signal(true);
  saving = signal(false);
  uploadingImage = signal(false);
  error = signal('');
  success = signal('');

  events = signal<ApiEvent[]>([]);
  viewingEvent = signal<ApiEvent | null>(null);
  deleting = signal<Set<string>>(new Set());
  publishing = signal<Set<string>>(new Set());

  // ── Detail: registrations ──────────────────────────────────────────────────
  registrations = signal<RegistrationRow[]>([]);
  registrationsLoaded = signal(false);
  registrationsLoading = signal(false);
  confirmingReg = signal<Set<string>>(new Set());

  // ── Detail: sponsors ───────────────────────────────────────────────────────
  sponsors = signal<EventSponsor[]>([]);
  sponsorsLoaded = signal(false);
  showSponsorForm = signal(false);
  editingSponsor = signal<EventSponsor | null>(null);
  sponsorName = signal('');
  sponsorLogoUrl = signal('');
  sponsorWebsiteUrl = signal('');
  sponsorTier = signal<SponsorTier>('gold');
  sponsorSortOrder = signal(0);
  savingSponsor = signal(false);

  // ── Detail: expenses ───────────────────────────────────────────────────────
  expenses = signal<EventExpense[]>([]);
  expensesLoaded = signal(false);
  showExpenseForm = signal(false);
  expenseTitle = signal('');
  expenseAmount = signal<number | null>(null);
  expenseCategory = signal(EXPENSE_CATS[0]);
  expenseNote = signal('');
  expenseDate = signal('');
  savingExpense = signal(false);

  // ── Detail: income ─────────────────────────────────────────────────────────
  income = signal<{ items: EventIncome[]; registrationTotal: number; supplementaryTotal: number; grandTotal: number } | null>(null);
  incomeLoaded = signal(false);
  showIncomeForm = signal(false);
  incomeTitle = signal('');
  incomeAmount = signal<number | null>(null);
  incomeCategory = signal(INCOME_CATS[0]);
  incomeNote = signal('');
  incomeDate = signal('');
  savingIncome = signal(false);

  // ── Create / Edit form fields ──────────────────────────────────────────────
  editingId = signal<string | null>(null);
  formTitle = signal('');
  formDescription = signal('');
  formDescriptionFormat = signal<'html' | 'markdown'>('html');
  formDate = signal('');
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
  formTicketPrice = signal<number | null>(null);
  // Extended fields
  formTimeline = signal<{ time: string; title: string; description: string }[]>([]);
  formGuestPresident = signal<{ name: string; designation: string; image: string }>({ name: '', designation: '', image: '' });
  formGuestChief = signal<{ name: string; designation: string; image: string }>({ name: '', designation: '', image: '' });
  formGuestSpecial = signal<{ name: string; designation: string; image: string }[]>([]);
  formActivities = signal('');
  formActivitiesFormat = signal<'html' | 'markdown'>('html');
  formAllowFamily = signal(false);
  formFamilyFee = signal<number | null>(null);
  formDonationEnabled = signal(false);
  formContactPersons = signal<{ name: string; image: string; phone: string; email: string }[]>([]);

  readonly modes = MODES;
  readonly statuses = STATUSES;
  readonly categories = CATEGORIES;
  readonly sponsorTiers = SPONSOR_TIERS;
  readonly expenseCategories = EXPENSE_CATS;
  readonly incomeCategories = INCOME_CATS;

  readonly auth = inject(AuthService);
  private readonly adminService = inject(AdminService);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.adminService.adminListEvents().subscribe({
      next: (data) => { this.events.set(data); this.loading.set(false); },
      error: (err) => {
        this.error.set(err?.status === 403 ? "You don't have sufficient permissions." : 'Failed to load events.');
        this.loading.set(false);
      },
    });
  }

  // ── List actions ───────────────────────────────────────────────────────────

  openCreate(): void {
    this.editingId.set(null);
    this.resetForm();
    this.formSortOrder.set(this.events().length);
    this.error.set('');
    this.success.set('');
    this.mode.set('create');
  }

  openEdit(e: ApiEvent): void {
    this.editingId.set(e.id);
    this.formTitle.set(e.title);
    this.formDescription.set(e.description);
    this.formDescriptionFormat.set('html');
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
    this.formTimeline.set(e.timeline ? e.timeline.map(t => ({ ...t, description: t.description ?? '' })) : []);
    this.formGuestPresident.set(e.guestList?.president
      ? { name: e.guestList.president.name, designation: e.guestList.president.designation ?? '', image: e.guestList.president.image ?? '' }
      : { name: '', designation: '', image: '' });
    this.formGuestChief.set(e.guestList?.chiefGuest
      ? { name: e.guestList.chiefGuest.name, designation: e.guestList.chiefGuest.designation ?? '', image: e.guestList.chiefGuest.image ?? '' }
      : { name: '', designation: '', image: '' });
    this.formGuestSpecial.set(e.guestList?.specialGuests
      ? e.guestList.specialGuests.map(g => ({ name: g.name, designation: g.designation ?? '', image: g.image ?? '' }))
      : []);
    this.formActivities.set(e.activities ?? '');
    this.formActivitiesFormat.set('html');
    this.formAllowFamily.set(e.allowFamilyMembers ?? false);
    this.formFamilyFee.set(e.familyMemberFee ?? null);
    this.formDonationEnabled.set(e.donationEnabled ?? false);
    this.formContactPersons.set(e.contactPersons
      ? e.contactPersons.map(c => ({ name: c.name, image: c.image ?? '', phone: c.phone ?? '', email: c.email ?? '' }))
      : []);
    this.error.set('');
    this.success.set('');
    this.mode.set('edit');
  }

  openDetail(e: ApiEvent): void {
    this.viewingEvent.set(e);
    this.detailTab.set('registrations');
    this.registrationsLoaded.set(false);
    this.sponsorsLoaded.set(false);
    this.expensesLoaded.set(false);
    this.incomeLoaded.set(false);
    this.registrations.set([]);
    this.sponsors.set([]);
    this.expenses.set([]);
    this.income.set(null);
    this.error.set('');
    this.mode.set('detail');
    this.loadTab('registrations');
  }

  switchTab(tab: DetailTab): void {
    this.detailTab.set(tab);
    this.loadTab(tab);
  }

  loadTab(tab: DetailTab): void {
    const id = this.viewingEvent()?.id;
    if (!id) return;
    switch (tab) {
      case 'registrations':
        if (!this.registrationsLoaded()) {
          this.registrationsLoading.set(true);
          this.adminService.adminListEventRegistrations(id).subscribe({
            next: (data) => { this.registrations.set(data as RegistrationRow[]); this.registrationsLoaded.set(true); this.registrationsLoading.set(false); },
            error: () => this.registrationsLoading.set(false),
          });
        }
        break;
      case 'sponsors':
        if (!this.sponsorsLoaded()) {
          this.adminService.adminGetEvent(id).subscribe({
            next: (ev) => { this.sponsors.set(ev.sponsors ?? []); this.sponsorsLoaded.set(true); },
            error: () => {},
          });
        }
        break;
      case 'expenses':
        if (!this.expensesLoaded()) {
          this.adminService.adminListExpenses(id).subscribe({
            next: (data) => { this.expenses.set(data); this.expensesLoaded.set(true); },
            error: () => {},
          });
        }
        break;
      case 'income':
        if (!this.incomeLoaded()) {
          this.adminService.adminListIncome(id).subscribe({
            next: (data) => { this.income.set(data); this.incomeLoaded.set(true); },
            error: () => {},
          });
        }
        break;
    }
  }

  cancelForm(): void {
    this.mode.set('list');
    this.error.set('');
    this.success.set('');
  }

  // ── Timeline helpers ────────────────────────────────────────────────────────
  addTimelineItem(): void {
    this.formTimeline.update(list => [...list, { time: '', title: '', description: '' }]);
  }

  removeTimelineItem(i: number): void {
    this.formTimeline.update(list => list.filter((_, idx) => idx !== i));
  }

  updateTimelineItem(i: number, field: 'time' | 'title' | 'description', value: string): void {
    this.formTimeline.update(list => {
      const updated = [...list];
      updated[i] = { ...updated[i], [field]: value };
      return updated;
    });
  }

  addSpecialGuest(): void {
    this.formGuestSpecial.update(list => [...list, { name: '', designation: '', image: '' }]);
  }

  removeSpecialGuest(i: number): void {
    this.formGuestSpecial.update(list => list.filter((_, idx) => idx !== i));
  }

  updateSpecialGuest(i: number, field: 'name' | 'designation' | 'image', value: string): void {
    this.formGuestSpecial.update(list => {
      const updated = [...list];
      updated[i] = { ...updated[i], [field]: value };
      return updated;
    });
  }

  updateGuestField(type: 'president' | 'chief', field: 'name' | 'designation' | 'image', value: string): void {
    if (type === 'president') {
      this.formGuestPresident.update(g => ({ ...g, [field]: value }));
    } else {
      this.formGuestChief.update(g => ({ ...g, [field]: value }));
    }
  }

  addContactPerson(): void {
    this.formContactPersons.update(list => [...list, { name: '', image: '', phone: '', email: '' }]);
  }

  removeContactPerson(i: number): void {
    this.formContactPersons.update(list => list.filter((_, idx) => idx !== i));
  }

  updateContactPerson(i: number, field: 'name' | 'image' | 'phone' | 'email', value: string): void {
    this.formContactPersons.update(list => {
      const updated = [...list];
      updated[i] = { ...updated[i], [field]: value };
      return updated;
    });
  }

  // ── Image upload ────────────────────────────────────────────────────────────
  triggerImageUpload(): void {
    this.imageFileInput.nativeElement.click();
  }

  onImageFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) { this.error.set('Only JPEG, PNG, WebP and GIF images are allowed.'); return; }
    if (file.size > 5 * 1024 * 1024) { this.error.set('Image must be smaller than 5 MB.'); return; }
    this.uploadingImage.set(true);
    this.error.set('');
    this.adminService.uploadEventImage(file).pipe(finalize(() => this.uploadingImage.set(false))).subscribe({
      next: ({ url }) => this.formImageUrl.set(url),
      error: () => this.error.set('Image upload failed. Please try again.'),
    });
  }

  // ── Save form ───────────────────────────────────────────────────────────────
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
      title, description, date, time, location, city,
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
      timeline: this.formTimeline().filter(t => t.time.trim() && t.title.trim()),
      guestList: {
        president: this.formGuestPresident().name.trim() ? { name: this.formGuestPresident().name.trim(), designation: this.formGuestPresident().designation.trim() || undefined, image: this.formGuestPresident().image.trim() || undefined } : undefined,
        chiefGuest: this.formGuestChief().name.trim() ? { name: this.formGuestChief().name.trim(), designation: this.formGuestChief().designation.trim() || undefined, image: this.formGuestChief().image.trim() || undefined } : undefined,
        specialGuests: this.formGuestSpecial().filter(g => g.name.trim()).map(g => ({ name: g.name.trim(), designation: g.designation.trim() || undefined, image: g.image.trim() || undefined })),
      },
      activities: convertToHtml(this.formActivities().trim(), this.formActivitiesFormat()) || undefined,
      allowFamilyMembers: this.formAllowFamily(),
      familyMemberFee: this.formAllowFamily() ? (this.formFamilyFee() ?? null) : null,
      donationEnabled: this.formDonationEnabled(),
      contactPersons: this.formContactPersons().filter(c => c.name.trim()).map(c => ({
        name: c.name.trim(),
        image: c.image.trim() || undefined,
        phone: c.phone.trim() || undefined,
        email: c.email.trim() || undefined,
      })),
    };

    const id = this.editingId();
    const req = id === null
      ? this.adminService.adminCreateEvent(payload)
      : this.adminService.adminUpdateEvent(id, payload);

    req.subscribe({
      next: (saved) => {
        if (id === null) {
          this.events.update(list => [...list, saved].sort((a, b) => a.sortOrder - b.sortOrder || a.date.localeCompare(b.date)));
          this.success.set('Event created as draft. Fill the checklist and publish when ready.');
        } else {
          this.events.update(list => list.map(e => e.id === id ? saved : e).sort((a, b) => a.sortOrder - b.sortOrder || a.date.localeCompare(b.date)));
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

  // ── Delete / Publish ────────────────────────────────────────────────────────
  deleteEvent(e: ApiEvent): void {
    if (!confirm(`Delete "${e.title}"? This will also remove all registrations.`)) return;
    this.deleting.update(s => new Set([...s, e.id]));
    this.adminService.adminDeleteEvent(e.id).subscribe({
      next: () => {
        this.events.update(list => list.filter(ev => ev.id !== e.id));
        this.success.set(`"${e.title}" deleted.`);
        this.deleting.update(s => { const n = new Set(s); n.delete(e.id); return n; });
      },
      error: () => {
        this.error.set('Failed to delete event.');
        this.deleting.update(s => { const n = new Set(s); n.delete(e.id); return n; });
      },
    });
  }

  publish(e: ApiEvent): void {
    this.publishing.update(s => new Set([...s, e.id]));
    this.adminService.adminPublishEvent(e.id).subscribe({
      next: (updated) => {
        this.events.update(list => list.map(ev => ev.id === e.id ? updated : ev));
        this.success.set(`"${e.title}" is now live!`);
        this.publishing.update(s => { const n = new Set(s); n.delete(e.id); return n; });
      },
      error: (err) => {
        const checklist: string[] = err?.error?.checklist ?? [];
        this.error.set((err?.error?.message ?? 'Could not publish.') + (checklist.length ? ' — ' + checklist.join('; ') : ''));
        this.publishing.update(s => { const n = new Set(s); n.delete(e.id); return n; });
      },
    });
  }

  unpublish(e: ApiEvent): void {
    this.publishing.update(s => new Set([...s, e.id]));
    this.adminService.adminUnpublishEvent(e.id).subscribe({
      next: (updated) => {
        this.events.update(list => list.map(ev => ev.id === e.id ? updated : ev));
        this.success.set(`"${e.title}" unpublished.`);
        this.publishing.update(s => { const n = new Set(s); n.delete(e.id); return n; });
      },
      error: () => {
        this.error.set('Could not unpublish.');
        this.publishing.update(s => { const n = new Set(s); n.delete(e.id); return n; });
      },
    });
  }

  // ── Sponsors ────────────────────────────────────────────────────────────────
  openSponsorForm(sponsor?: EventSponsor): void {
    this.editingSponsor.set(sponsor ?? null);
    this.sponsorName.set(sponsor?.name ?? '');
    this.sponsorLogoUrl.set(sponsor?.logoUrl ?? '');
    this.sponsorWebsiteUrl.set(sponsor?.websiteUrl ?? '');
    this.sponsorTier.set(sponsor?.tier ?? 'gold');
    this.sponsorSortOrder.set(sponsor?.sortOrder ?? 0);
    this.showSponsorForm.set(true);
  }

  saveSponsor(): void {
    const eventId = this.viewingEvent()?.id;
    if (!eventId || !this.sponsorName().trim()) return;
    this.savingSponsor.set(true);
    const data = {
      name: this.sponsorName().trim(),
      logoUrl: this.sponsorLogoUrl().trim() || undefined,
      websiteUrl: this.sponsorWebsiteUrl().trim() || undefined,
      tier: this.sponsorTier(),
      sortOrder: this.sponsorSortOrder(),
    };
    const editing = this.editingSponsor();
    const req = editing
      ? this.adminService.adminUpdateSponsor(eventId, editing.id, data)
      : this.adminService.adminCreateSponsor(eventId, data);
    req.subscribe({
      next: (saved) => {
        if (editing) {
          this.sponsors.update(list => list.map(s => s.id === saved.id ? saved : s));
        } else {
          this.sponsors.update(list => [...list, saved]);
        }
        this.showSponsorForm.set(false);
        this.savingSponsor.set(false);
      },
      error: () => this.savingSponsor.set(false),
    });
  }

  deleteSponsor(sponsor: EventSponsor): void {
    const eventId = this.viewingEvent()?.id;
    if (!eventId || !confirm('Remove this sponsor?')) return;
    this.adminService.adminDeleteSponsor(eventId, sponsor.id).subscribe({
      next: () => this.sponsors.update(list => list.filter(s => s.id !== sponsor.id)),
      error: () => this.error.set('Failed to remove sponsor.'),
    });
  }

  // ── Expenses ────────────────────────────────────────────────────────────────
  saveExpense(): void {
    const eventId = this.viewingEvent()?.id;
    if (!eventId) return;
    if (!this.expenseTitle().trim() || !this.expenseAmount() || !this.expenseDate()) {
      this.error.set('Title, amount, and date are required.');
      return;
    }
    this.savingExpense.set(true);
    this.adminService.adminCreateExpense(eventId, {
      title: this.expenseTitle().trim(),
      amount: this.expenseAmount()!,
      category: this.expenseCategory(),
      note: this.expenseNote().trim() || undefined,
      expenseDate: this.expenseDate(),
    }).subscribe({
      next: (saved) => {
        this.expenses.update(list => [saved, ...list]);
        this.showExpenseForm.set(false);
        this.expenseTitle.set(''); this.expenseAmount.set(null); this.expenseNote.set(''); this.expenseDate.set('');
        this.savingExpense.set(false);
      },
      error: () => this.savingExpense.set(false),
    });
  }

  deleteExpense(expense: EventExpense): void {
    const eventId = this.viewingEvent()?.id;
    if (!eventId || !confirm('Remove this expense?')) return;
    this.adminService.adminDeleteExpense(eventId, expense.id).subscribe({
      next: () => this.expenses.update(list => list.filter(e => e.id !== expense.id)),
      error: () => this.error.set('Failed to remove expense.'),
    });
  }

  get expenseTotal(): number {
    return this.expenses().reduce((sum, e) => sum + e.amount, 0);
  }

  // ── Income ──────────────────────────────────────────────────────────────────
  saveIncome(): void {
    const eventId = this.viewingEvent()?.id;
    if (!eventId) return;
    if (!this.incomeTitle().trim() || !this.incomeAmount() || !this.incomeDate()) {
      this.error.set('Title, amount, and date are required.');
      return;
    }
    this.savingIncome.set(true);
    this.adminService.adminCreateIncome(eventId, {
      title: this.incomeTitle().trim(),
      amount: this.incomeAmount()!,
      category: this.incomeCategory(),
      note: this.incomeNote().trim() || undefined,
      incomeDate: this.incomeDate(),
    }).subscribe({
      next: (saved) => {
        this.income.update(d => d
          ? { ...d, items: [saved, ...d.items], supplementaryTotal: d.supplementaryTotal + saved.amount, grandTotal: d.grandTotal + saved.amount }
          : d);
        this.showIncomeForm.set(false);
        this.incomeTitle.set(''); this.incomeAmount.set(null); this.incomeNote.set(''); this.incomeDate.set('');
        this.savingIncome.set(false);
      },
      error: () => this.savingIncome.set(false),
    });
  }

  // ── Registrations ───────────────────────────────────────────────────────────
  confirmRegistration(reg: RegistrationRow): void {
    const eventId = this.viewingEvent()?.id;
    if (!eventId) return;
    this.confirmingReg.update(s => new Set([...s, reg.id]));
    this.adminService.adminConfirmEventRegistration(eventId, reg.id).subscribe({
      next: (updated) => {
        this.registrations.update(list => list.map(r => r.id === updated.id ? { ...r, ...updated } : r));
        this.confirmingReg.update(s => { const n = new Set(s); n.delete(reg.id); return n; });
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to confirm registration.');
        this.confirmingReg.update(s => { const n = new Set(s); n.delete(reg.id); return n; });
      },
    });
  }

  // ── Utilities ───────────────────────────────────────────────────────────────
  formatDate(d: string): string {
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(d));
  }

  formatCurrency(n: number): string {
    return `৳${n.toLocaleString()}`;
  }

  private resetForm(): void {
    this.formTitle.set(''); this.formDescription.set(''); this.formDescriptionFormat.set('html');
    this.formDate.set(''); this.formTime.set(''); this.formLocation.set(''); this.formCity.set('');
    this.formMode.set('In-Person'); this.formCategory.set('Reunion'); this.formStatus.set('upcoming');
    this.formSeats.set(null); this.formImageUrl.set(''); this.formColor.set('bg-zinc-200');
    this.formFeatured.set(false); this.formRegistrationUrl.set(''); this.formSortOrder.set(0);
    this.formTicketPrice.set(null); this.formTimeline.set([]);
    this.formGuestPresident.set({ name: '', designation: '', image: '' });
    this.formGuestChief.set({ name: '', designation: '', image: '' });
    this.formGuestSpecial.set([]); this.formActivities.set('');
    this.formActivitiesFormat.set('html'); this.formAllowFamily.set(false);
    this.formFamilyFee.set(null); this.formDonationEnabled.set(false);
    this.formContactPersons.set([]);
  }
}
