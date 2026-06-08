import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  AdminService,
  ApiEvent,
  EventSponsor,
  EventRegistration,
  SponsorTier,
  TShirtSize,
} from '../../core/admin.service';
import { AuthService } from '../../core/auth.service';

const TIER_ORDER: SponsorTier[] = ['title', 'platinum', 'gold', 'silver', 'bronze', 'supporter'];
const TIER_LABELS: Record<SponsorTier, string> = {
  title: 'Title Sponsor',
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
  supporter: 'Supporter',
};

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './event-detail.component.html',
})
export class EventDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly adminService = inject(AdminService);
  readonly auth = inject(AuthService);

  event = signal<ApiEvent | null>(null);
  sponsors = signal<EventSponsor[]>([]);
  myRegistration = signal<EventRegistration | null>(null);
  loading = signal(true);
  error = signal('');
  registering = signal(false);
  regError = signal('');

  // Registration form
  tShirtSize = signal<TShirtSize>('L');
  familyCount = signal(0);
  familyMembers = signal<{ name: string; tShirtSize: TShirtSize }[]>([]);
  donationAmount = signal(0);

  readonly tShirtSizes: TShirtSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

  sponsorsByTier = computed(() => {
    const grouped = new Map<SponsorTier, EventSponsor[]>();
    for (const tier of TIER_ORDER) grouped.set(tier, []);
    for (const s of this.sponsors()) {
      grouped.get(s.tier)?.push(s);
    }
    return TIER_ORDER.filter((t) => (grouped.get(t)?.length ?? 0) > 0).map((tier) => ({
      tier,
      label: TIER_LABELS[tier],
      items: grouped.get(tier)!,
    }));
  });

  totalFee = computed(() => {
    const ev = this.event();
    if (!ev) return 0;
    const ticket = ev.ticketPrice ?? 0;
    const family = this.familyCount() * (ev.familyMemberFee ?? ev.ticketPrice ?? 0);
    const donation = this.donationAmount();
    return ticket + family + donation;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.adminService.getEvent(id).subscribe({
      next: (ev) => {
        this.event.set(ev);
        this.sponsors.set((ev as any).sponsors ?? []);
        this.loading.set(false);
        if (this.auth.isLoggedIn()) {
          this.adminService.getMyRegistration(id).subscribe({
            next: (reg) => this.myRegistration.set(reg),
            error: () => {},
          });
        }
      },
      error: () => {
        this.error.set('Event not found or not available.');
        this.loading.set(false);
      },
    });
  }

  setFamilyCount(n: number): void {
    const ev = this.event();
    if (!ev?.allowFamilyMembers) return;
    const clamped = Math.max(0, n);
    const current = this.familyMembers();
    const updated = Array.from({ length: clamped }, (_, i) => current[i] ?? { name: '', tShirtSize: 'L' as TShirtSize });
    this.familyCount.set(clamped);
    this.familyMembers.set(updated);
  }

  updateFamilyMember(i: number, field: 'name' | 'tShirtSize', value: string): void {
    this.familyMembers.update((list) => {
      const updated = [...list];
      updated[i] = { ...updated[i], [field]: value };
      return updated;
    });
  }

  register(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    const ev = this.event();
    if (!ev) return;
    this.registering.set(true);
    this.regError.set('');
    this.adminService
      .registerForEvent(ev.id, {
        tShirtSize: this.tShirtSize(),
        familyMembersCount: this.familyCount(),
        familyMembers: this.familyMembers(),
        donationAmount: this.donationAmount(),
      })
      .subscribe({
        next: (res) => {
          this.myRegistration.set(res.registration);
          this.registering.set(false);
          if (res.invoiceId) {
            this.router.navigate(['/payment'], { queryParams: { invoiceId: res.invoiceId } });
          }
        },
        error: (err) => {
          this.regError.set(err?.error?.message ?? 'Registration failed. Please try again.');
          this.registering.set(false);
        },
      });
  }

  cancelRegistration(): void {
    if (!confirm('Cancel your registration for this event?')) return;
    const ev = this.event();
    if (!ev) return;
    this.adminService.cancelEventRegistration(ev.id).subscribe({
      next: () => this.myRegistration.set(null),
      error: (err) => alert(err?.error?.message ?? 'Could not cancel registration.'),
    });
  }

  formatDate(d: string): string {
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(d));
  }

  formatTime(t: string): string {
    if (!t) return '';
    const [h, m] = t.split(':');
    const dt = new Date();
    dt.setHours(+h, +m);
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(dt);
  }

  statusLabel(status: RegistrationStatus): { label: string; cls: string } {
    switch (status) {
      case 'confirmed':
        return { label: 'Confirmed ✓', cls: 'bg-emerald-100 text-emerald-700' };
      case 'pending_payment':
        return { label: 'Pending Payment', cls: 'bg-amber-100 text-amber-700' };
      default:
        return { label: 'Cancelled', cls: 'bg-red-100 text-red-600' };
    }
  }
}

type RegistrationStatus = 'pending_payment' | 'confirmed' | 'cancelled';
