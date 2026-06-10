import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  AdminService,
  ApiEvent,
  EventRegistration,
  EventFamilyMember,
  EventCheckIn,
  CheckInType,
} from '../../core/admin.service';
import {
  EventsService,
  DistributionItem,
  DistributionRecord,
} from '../../core/events.service';
import { AuthService } from '../../core/auth.service';

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

const ITEM_ICONS: Record<string, string> = {
  kit: 'fa-bag-shopping',
  breakfast: 'fa-mug-hot',
  lunch: 'fa-bowl-rice',
  snacks: 'fa-cookie-bite',
  dinner: 'fa-utensils',
  gift: 'fa-gift',
  custom: 'fa-star',
};

@Component({
  selector: 'app-event-booth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-booth.component.html',
})
export class EventBoothComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly adminService = inject(AdminService);
  private readonly eventsService = inject(EventsService);
  readonly auth = inject(AuthService);

  readonly hasAccess = computed(() => this.auth.hasPermission('events:distribute'));

  eventId = signal('');
  phoneInput = signal('');
  loading = signal(false);
  error = signal('');
  registration = signal<RegistrationResult | null>(null);
  notesEditing = signal(false);
  notesValue = signal('');

  // Distribution system
  distributionItems = signal<DistributionItem[]>([]);
  distributions = signal<DistributionRecord[]>([]);
  distributing = signal<Set<string>>(new Set());
  distributeError = signal<string | null>(null);

  /** Device info captured once on init */
  private deviceInfo: Record<string, string> = {};

  itemIcon(type: string): string {
    return ITEM_ICONS[type] ?? 'fa-box';
  }

  itemLabel(item: DistributionItem): string {
    if (item.itemType === 'custom' && item.customLabel) return item.customLabel;
    const labels: Record<string, string> = {
      kit: 'Kit',
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      snacks: 'Snacks',
      dinner: 'Dinner',
      gift: 'Gift',
    };
    return labels[item.itemType] ?? item.itemType;
  }

  distributedQty(itemId: string, recipientType: 'main' | 'family'): number {
    return this.distributions()
      .filter((d) => d.distributionItemId === itemId && d.recipientType === recipientType)
      .reduce((sum, d) => sum + d.quantity, 0);
  }

  maxQty(item: DistributionItem, recipientType: 'main' | 'family'): number {
    if (recipientType === 'main') return item.appliesToMain ? item.quantityPerMain : 0;
    const reg = this.registration();
    const famCount = (reg as any)?.familyMembersCount ?? 0;
    return item.appliesToFamily ? item.quantityPerFamily * famCount : 0;
  }

  totalGiven(item: DistributionItem): number {
    return this.distributedQty(item.id, 'main') + this.distributedQty(item.id, 'family');
  }

  totalMax(item: DistributionItem): number {
    return this.maxQty(item, 'main') + this.maxQty(item, 'family');
  }

  isFullyGiven(item: DistributionItem): boolean {
    return this.totalMax(item) > 0 && this.totalGiven(item) >= this.totalMax(item);
  }

  isDistributing(item: DistributionItem): boolean {
    return this.distributing().has(item.id + '-main') || this.distributing().has(item.id + '-family');
  }

  canDistribute(item: DistributionItem, recipientType: 'main' | 'family'): boolean {
    if (recipientType === 'family') {
      const reg = this.registration();
      const famCount = (reg as any)?.familyMembersCount ?? 0;
      if (famCount === 0) return false;
    }
    const given = this.distributedQty(item.id, recipientType);
    const max = this.maxQty(item, recipientType);
    return max > 0 && given < max;
  }

  /** Single-tap: distribute to main and/or family in one action */
  distributeAll(item: DistributionItem): void {
    const reg = this.registration();
    if (!reg || this.isDistributing(item)) return;
    if (this.canDistribute(item, 'main')) this.distribute(item, 'main');
    if (this.canDistribute(item, 'family')) this.distribute(item, 'family');
  }

  ngOnInit(): void {
    this.eventId.set(this.route.snapshot.paramMap.get('id') ?? '');
    this.deviceInfo = { userAgent: navigator.userAgent };

    // Load distribution items for this event
    this.eventsService.getDistributionItems(this.eventId()).subscribe({
      next: (items) => this.distributionItems.set(items),
      error: () => {},
    });

    // Auto-load if QR params present
    const params = this.route.snapshot.queryParamMap;
    const reg = params.get('reg');
    const sig = params.get('sig');
    if (reg && sig) {
      this.loadByToken(reg, sig);
    }
  }

  loadByToken(reg: string, sig: string): void {
    this.loading.set(true);
    this.error.set('');
    this.registration.set(null);
    this.eventsService.boothLookupByToken(this.eventId(), reg, sig).subscribe({
      next: (result: any) => {
        this.registration.set(result);
        this.distributions.set(result.distributions ?? []);
        this.distributionItems.set(result.distributionItems ?? []);
        this.notesValue.set(result.notes ?? '');
        this.phoneInput.set(result.user?.phone ?? '');
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set(err?.error?.message ?? 'Invalid or expired QR code.');
        this.loading.set(false);
      },
    });
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
        // Load distributions for this registration
        this.loadDistributions(reg.id);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No registration found for this phone number.');
        this.loading.set(false);
      },
    });
  }

  private loadDistributions(registrationId: string): void {
    // Reload distribution state for this registration
    this.eventsService.getDistributionItems(this.eventId()).subscribe({ next: (items) => this.distributionItems.set(items) });
  }

  clear(): void {
    this.registration.set(null);
    this.distributions.set([]);
    this.phoneInput.set('');
    this.error.set('');
    this.distributeError.set(null);
  }

  distribute(item: DistributionItem, recipientType: 'main' | 'family'): void {
    const reg = this.registration();
    if (!reg || !this.canDistribute(item, recipientType)) return;

    const key = `${item.id}-${recipientType}`;
    if (this.distributing().has(key)) return;

    const qty = 1;
    this.distributing.update((s) => new Set([...s, key]));
    this.distributeError.set(null);

    this.eventsService.distribute(this.eventId(), {
      registrationId: reg.id,
      distributionItemId: item.id,
      recipientType,
      quantity: qty,
    }).subscribe({
      next: (record) => {
        this.distributions.update((d) => [...d, record]);
        this.distributing.update((s) => {
          const next = new Set(s);
          next.delete(key);
          return next;
        });
      },
      error: (err) => {
        this.distributeError.set(err?.error?.message ?? 'Failed to record distribution.');
        this.distributing.update((s) => {
          const next = new Set(s);
          next.delete(key);
          return next;
        });
      },
    });
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
