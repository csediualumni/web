import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DonationsService, Campaign } from './donations.service';
import { InvoiceService } from '../core/invoice.service';
import { AuthService } from '../core/auth.service';

type DonateTab = 'active' | 'completed' | 'upcoming';

@Component({
  selector: 'app-donations',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './donations.component.html',
})
export class DonationsComponent {
  readonly svc         = inject(DonationsService);
  private readonly inv = inject(InvoiceService);
  readonly auth        = inject(AuthService);
  private readonly router = inject(Router);

  // ── Tabs ──────────────────────────────────────────────────
  activeTab = signal<DonateTab>('active');
  readonly tabs: { key: DonateTab; label: string; icon: string }[] = [
    { key: 'active',    label: 'Active Campaigns',    icon: 'fa-bolt' },
    { key: 'completed', label: 'Completed',           icon: 'fa-circle-check' },
    { key: 'upcoming',  label: 'Coming Soon',         icon: 'fa-clock' },
  ];

  // ── Expanded campaign details ──────────────────────────────
  expandedId = signal<number | null>(null);
  toggleExpand(id: number) {
    this.expandedId.update((prev) => (prev === id ? null : id));
  }

  // ── Donation form (per campaign) ───────────────────────────
  activeDonationId = signal<number | null>(null);
  selectedAmount = signal<number | null>(500);
  customAmount = signal('');
  isAnonymous = signal(false);
  submitting = signal(false);
  submitted = signal(false);
  formError = signal('');

  readonly quickAmounts = [500, 1000, 2000, 5000, 10000, 25000];

  openDonationForm(id: number) {
    this.activeDonationId.set(id);
    this.submitted.set(false);
    this.submitting.set(false);
    this.formError.set('');
    this.selectedAmount.set(500);
    this.customAmount.set('');
    // Force anonymous when not logged in
    this.isAnonymous.set(!this.auth.isLoggedIn());
    // Scroll to form after tick
    setTimeout(() => {
      document.getElementById(`donation-form-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  }

  closeDonationForm() {
    this.activeDonationId.set(null);
    this.submitted.set(false);
    this.formError.set('');
  }

  selectQuick(amount: number) {
    this.selectedAmount.set(amount);
    this.customAmount.set('');
  }

  onCustomInput(val: string) {
    this.customAmount.set(val);
    this.selectedAmount.set(null);
  }

  effectiveAmount(): number {
    if (this.customAmount() && Number(this.customAmount()) > 0) {
      return Number(this.customAmount());
    }
    return this.selectedAmount() ?? 0;
  }

  submitDonation() {
    const amount = this.effectiveAmount();
    if (amount < 100) return;

    const campaignId = this.activeDonationId();
    const campaign = this.svc.campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;

    this.submitting.set(true);
    this.formError.set('');

    const user = this.auth.currentUser();
    const isAnon = this.isAnonymous();

    this.inv.create({
      type: 'donation',
      description: `Donation to: ${campaign.title}`,
      campaignTitle: campaign.title,
      totalAmount: amount,
      donorName: isAnon ? undefined : (user?.email?.trim() || undefined),
      isAnonymous: isAnon,
      metadata: { campaignId: campaign.id, campaignCategory: campaign.category },
    }).subscribe({
      next: (invoice) => {
        this.submitting.set(false);
        this.router.navigate(['/payment'], { queryParams: { invoiceId: invoice.id } });
      },
      error: (err) => {
        this.submitting.set(false);
        this.formError.set(err?.error?.message ?? 'Could not create invoice. Please try again.');
      },
    });
  }

  // ── Computed lists ─────────────────────────────────────────
  readonly activeCampaigns  = computed(() => this.svc.getActive());
  readonly pastCampaigns    = computed(() => this.svc.getPast());
  readonly upcomingCampaigns = computed(() => this.svc.getUpcoming());
  readonly featuredCampaigns = computed(() => this.svc.getFeatured());

  readonly visibleCampaigns = computed<Campaign[]>(() => {
    const t = this.activeTab();
    if (t === 'active')    return this.activeCampaigns();
    if (t === 'completed') return this.pastCampaigns();
    return this.upcomingCampaigns();
  });

  // ── Stats ─────────────────────────────────────────────────
  readonly stats = computed(() => {
    const all = this.svc.campaigns;
    const totalRaised = all.reduce((s, c) => s + c.raised, 0);
    const totalDonors = all.reduce((s, c) => s + c.donors, 0);
    const completedCount = all.filter((c) => c.status === 'completed').length;
    return [
      { label: 'Total Raised',       value: this.svc.formatBDT(totalRaised), icon: 'fa-bangladeshi-taka-sign' },
      { label: 'Unique Donors',      value: totalDonors.toLocaleString(),     icon: 'fa-users' },
      { label: 'Campaigns Funded',   value: completedCount.toString(),        icon: 'fa-circle-check' },
      { label: 'Active Campaigns',   value: this.activeCampaigns().length.toString(), icon: 'fa-bolt' },
    ];
  });
}
