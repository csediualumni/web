import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
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
import {
  EventRegistrationFormComponent,
  RegistrationSuccess,
} from '../registration-form/event-registration-form.component';

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
  imports: [CommonModule, RouterLink, FormsModule, EventRegistrationFormComponent],
  templateUrl: './event-detail.component.html',
})
export class EventDetailComponent implements OnInit, OnDestroy {
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
  showSizeChart = signal(false);
  familyCount = signal(0);
  donationAmount = signal(0);

  // Countdown
  countdownDisplay = signal<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  countdownLabel = signal('');
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  readonly sizeChartRows: { size: TShirtSize; chest: string; length: string }[] = [
    { size: 'XS', chest: '34"', length: '27"' },
    { size: 'S',  chest: '36"', length: '28"' },
    { size: 'M',  chest: '38"', length: '29"' },
    { size: 'L',  chest: '40"', length: '30"' },
    { size: 'XL', chest: '42"', length: '31"' },
    { size: 'XXL', chest: '44"', length: '32"' },
    { size: 'XXXL', chest: '46"', length: '33"' },
  ];

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
        this.startCountdown(ev);
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

  ngOnDestroy(): void {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
  }

  private startCountdown(ev: ApiEvent): void {
    const tick = () => {
      const now = Date.now();
      const openAt = ev.registrationOpenAt ? new Date(ev.registrationOpenAt).getTime() : null;
      const closeAt = ev.registrationCloseAt ? new Date(ev.registrationCloseAt).getTime() : null;

      let target: number | null = null;
      let label = '';

      if (openAt && now < openAt) {
        // Registration not yet open — count down to opening
        target = openAt;
        label = 'Registration opens in';
      } else if (closeAt && now < closeAt) {
        // Registration open — count down to deadline
        target = closeAt;
        label = 'Registration closes in';
      } else if (!openAt && !closeAt) {
        // No explicit dates — fallback: count down to 7 days before event
        const msPerDay = 1000 * 60 * 60 * 24;
        const eventTime = new Date(ev.date).getTime();
        const fallbackClose = eventTime - 7 * msPerDay;
        if (now < fallbackClose) {
          target = fallbackClose;
          label = 'Registration closes in';
        }
      }

      if (!target) {
        this.countdownDisplay.set(null);
        return;
      }

      const diff = target - now;
      if (diff <= 0) {
        this.countdownDisplay.set({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        this.countdownLabel.set(label);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      this.countdownDisplay.set({ days, hours, minutes, seconds });
      this.countdownLabel.set(label);
    };

    tick();
    this.countdownInterval = setInterval(tick, 1000);
  }

  setFamilyCount(n: number): void {
    const ev = this.event();
    if (!ev?.allowFamilyMembers) return;
    this.familyCount.set(Math.max(0, n));
  }

  /** Called when the new registration form emits a successful registration */
  onRegistered(result: RegistrationSuccess): void {
    if (result.invoiceId) {
      this.router.navigate(['/payment'], { queryParams: { invoiceId: result.invoiceId } });
    } else {
      this.router.navigate(['/my-account/events']);
    }
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

  formatDate(d: string | null | undefined): string {
    if (!d) return '';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(dt);
  }

  now(): number {
    return Date.now();
  }

  toDate(d: string): number {
    return new Date(d).getTime();
  }

  formatTime(t: string | null | undefined): string {
    if (!t || typeof t !== 'string') return '';
    const [h, m] = t.split(':');
    const hours = parseInt(h, 10);
    const mins = parseInt(m ?? '0', 10);
    if (isNaN(hours) || isNaN(mins)) return t;
    const dt = new Date();
    dt.setHours(hours, mins, 0, 0);
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
