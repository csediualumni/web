import { Injectable } from '@angular/core';

/** Minimal shape needed by progressPercent */
export interface CampaignProgress {
  raised: number;
  goal: number;
}

@Injectable({ providedIn: 'root' })
export class DonationsService {
  progressPercent(c: CampaignProgress): number {
    if (c.goal === 0) return 0;
    return Math.min(100, Math.round((c.raised / c.goal) * 100));
  }

  formatBDT(amount: number): string {
    if (amount >= 100_000) {
      return `৳${(amount / 100_000).toFixed(2).replace(/\.00$/, '')} lakh`;
    }
    return `৳${amount.toLocaleString('en-BD')}`;
  }
}
