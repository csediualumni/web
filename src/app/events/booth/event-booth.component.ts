import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  AdminService,
  ApiEvent,
  EventRegistration,
  EventFamilyMember,
  EventCheckIn,
  CheckInType,
} from '../../core/admin.service';

type RegistrationResult = EventRegistration & {
  user: {
    id: string;
    email: string;
    displayName: string | null;
    phone: string | null;
    avatar: string | null;
    studentId: string | null;
    batch: string | null;
  };
  familyMembers: EventFamilyMember[];
  checkIns: EventCheckIn[];
};

const CHECK_IN_TYPES: { type: CheckInType; label: string; icon: string }[] = [
  { type: 'kit', label: 'Kit', icon: 'fa-bag-shopping' },
  { type: 'breakfast', label: 'Breakfast', icon: 'fa-mug-hot' },
  { type: 'lunch', label: 'Lunch', icon: 'fa-bowl-rice' },
  { type: 'snacks', label: 'Snacks', icon: 'fa-cookie-bite' },
  { type: 'dinner', label: 'Dinner', icon: 'fa-utensils' },
  { type: 'gift', label: 'Gift', icon: 'fa-gift' },
];

@Component({
  selector: 'app-event-booth',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './event-booth.component.html',
})
export class EventBoothComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly adminService = inject(AdminService);

  eventId = signal('');
  phoneInput = signal('');
  loading = signal(false);
  error = signal('');
  registration = signal<RegistrationResult | null>(null);
  checkingIn = signal<Set<string>>(new Set());
  customLabel = signal('');
  showCustomInput = signal(false);
  notesEditing = signal(false);
  notesValue = signal('');

  readonly checkInTypes = CHECK_IN_TYPES;

  ngOnInit(): void {
    this.eventId.set(this.route.snapshot.paramMap.get('id') ?? '');
  }

  lookup(): void {
    const phone = this.phoneInput().trim();
    if (!phone) return;
    this.loading.set(true);
    this.error.set('');
    this.registration.set(null);
    this.adminService.boothLookup(this.eventId(), phone).subscribe({
      next: (reg) => {
        this.registration.set(reg);
        this.notesValue.set(reg.notes ?? '');
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No registration found for this phone number.');
        this.loading.set(false);
      },
    });
  }

  clear(): void {
    this.registration.set(null);
    this.phoneInput.set('');
    this.error.set('');
  }

  getCheckIn(type: CheckInType): EventCheckIn | undefined {
    return this.registration()?.checkIns?.find((c) => c.type === type);
  }

  checkIn(type: CheckInType, customLabel?: string): void {
    const reg = this.registration();
    if (!reg) return;
    const key = customLabel ? `${type}-${customLabel}` : type;
    if (this.checkingIn().has(key)) return;

    this.checkingIn.update((s) => new Set([...s, key]));
    this.adminService
      .boothCheckIn(reg.id, { type, customLabel })
      .subscribe({
        next: (checkIn) => {
          this.registration.update((r) => r ? { ...r, checkIns: [...(r.checkIns ?? []), checkIn] } : r);
          this.showCustomInput.set(false);
          this.customLabel.set('');
          this.checkingIn.update((s) => {
            const next = new Set(s);
            next.delete(key);
            return next;
          });
        },
        error: () => {
          this.checkingIn.update((s) => {
            const next = new Set(s);
            next.delete(key);
            return next;
          });
        },
      });
  }

  submitCustom(): void {
    const label = this.customLabel().trim();
    if (!label) return;
    this.checkIn('custom', label);
  }

  saveNotes(): void {
    const reg = this.registration();
    if (!reg) return;
    this.adminService.boothUpdateNotes(reg.id, this.notesValue()).subscribe({
      next: () => {
        this.registration.update((r) => r ? { ...r, notes: this.notesValue() } : r);
        this.notesEditing.set(false);
      },
      error: () => {},
    });
  }

  formatTime(ts: string): string {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(ts));
  }

  formatDate(d: string): string {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(d));
  }
}
