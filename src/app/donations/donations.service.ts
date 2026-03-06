import { Injectable } from '@angular/core';

export type CampaignStatus = 'active' | 'completed' | 'upcoming';

export interface Campaign {
  id: number;
  title: string;
  tagline: string;
  description: string;
  goal: number; // BDT
  raised: number; // BDT
  donors: number;
  status: CampaignStatus;
  deadline?: string; // display string
  category: string;
  icon: string; // fa icon
  color: string; // Tailwind colour class (bg-*)
  featured?: boolean;
  impact: string[]; // bullet points on how funds are used
  updates?: string[]; // latest update notes
}

export interface Donor {
  name: string;
  amount: number;
  batch?: number;
  message?: string;
  anonymous: boolean;
  date: string;
}

@Injectable({ providedIn: 'root' })
export class DonationsService {
  readonly campaigns: Campaign[] = [
    // ── Active / Featured ──────────────────────────────────
    {
      id: 1,
      title: 'Alumni Scholarship Fund 2026',
      tagline: 'Help a deserving student write their future.',
      description:
        'Every year, several academically brilliant students from underprivileged backgrounds struggle to continue their CSE education at DIU. Your donation directly funds tuition waivers, laptops, and living stipends for one complete academic year. No bureaucracy — 100% of donations go to recipients selected by a transparent committee.',
      goal: 1_500_000,
      raised: 987_400,
      donors: 214,
      status: 'active',
      deadline: 'June 30, 2026',
      category: 'Scholarship',
      icon: 'fa-graduation-cap',
      color: 'bg-blue-600',
      featured: true,
      impact: [
        'Full tuition waiver for one academic year per recipient',
        'Laptop & essential equipment allowance (BDT 40,000)',
        'Monthly living stipend (BDT 5,000 × 10 months)',
        'Mentorship pairing with a senior alumni volunteer',
      ],
      updates: [
        'March 2026: Shortlisted 12 candidates for final review.',
        'Feb 2026: BDT 9.87 lakh raised — 66% of goal reached!',
        'Jan 2026: Campaign officially launched by the 2024–25 committee.',
      ],
    },
    {
      id: 2,
      title: 'DIU CSE Lab Upgrade Project',
      tagline: 'Better labs → better engineers.',
      description:
        'The undergraduate computer lab equipment at DIU CSE Department is aging. We are raising funds to equip two labs with modern workstations, high-speed networking, and an IoT & embedded systems corner, benefiting 400+ students every semester.',
      goal: 2_000_000,
      raised: 1_340_000,
      donors: 178,
      status: 'active',
      deadline: 'September 15, 2026',
      category: 'Infrastructure',
      icon: 'fa-server',
      color: 'bg-violet-600',
      featured: true,
      impact: [
        '20 new i7 workstations with 32 GB RAM each',
        'Dedicated GPU server for AI/ML coursework',
        'IoT & embedded-systems corner (Raspberry Pi, Arduino kits)',
        'Fibre-optic 10 Gbps LAN upgrade for both labs',
      ],
      updates: [
        'March 2026: Vendor quotes finalised; procurement to begin at 80% funding.',
        'Feb 2026: BDT 13.4 lakh raised — 67% of goal.',
      ],
    },
    {
      id: 3,
      title: 'Annual Alumni Sports & Cultural Day',
      tagline: 'Reunite. Compete. Celebrate.',
      description:
        'Help us fund the logistics, venue, equipment, and catering for the annual Sports & Cultural Day — a beloved tradition that reunites batches from across the country and beyond for a day of friendly competition and celebration.',
      goal: 300_000,
      raised: 300_000,
      donors: 96,
      status: 'completed',
      category: 'Event',
      icon: 'fa-trophy',
      color: 'bg-amber-500',
      featured: false,
      impact: [
        'Venue booking and setup at DIU Permanent Campus',
        'Sports equipment and prizes for 8 event categories',
        'Catering for 600 attendees',
        'Live streaming for overseas alumni',
      ],
    },
    {
      id: 4,
      title: 'Emergency Relief — Flood Aid 2024',
      tagline: 'Standing by our community in crisis.',
      description:
        'In response to the devastating 2024 floods across Bangladesh, the alumni network mobilised swiftly to provide food packages, drinking water, and temporary shelter contributions to affected families, including several alumni families.',
      goal: 500_000,
      raised: 612_000,
      donors: 341,
      status: 'completed',
      category: 'Relief',
      icon: 'fa-hand-holding-heart',
      color: 'bg-rose-600',
      featured: false,
      impact: [
        'Food packages distributed to 820+ families',
        'Clean water & purification tablets for 200 households',
        'Temporary shelter materials for 45 families',
        'BDT 1.12 lakh surplus reinvested into scholarship fund',
      ],
    },
    {
      id: 5,
      title: 'Alumni Research Grant 2026',
      tagline: 'Funding the next breakthrough from our community.',
      description:
        'A new initiative to provide micro-grants (BDT 50,000–1,50,000) to CSE DIU alumni pursuing independent or collaborative applied research. Open to all alumni regardless of current institution or employer.',
      goal: 800_000,
      raised: 0,
      donors: 0,
      status: 'upcoming',
      deadline: 'Opens July 2026',
      category: 'Research',
      icon: 'fa-flask',
      color: 'bg-teal-600',
      featured: false,
      impact: [
        'Micro-grants of BDT 50,000–1,50,000 per project',
        'Support for publication fees at reputed venues',
        'Infrastructure credits (cloud compute, datasets)',
        'Mentorship from senior researcher alumni',
      ],
    },
  ];

  readonly recentDonors: Donor[] = [
    {
      name: 'Ariful Islam',
      amount: 10_000,
      batch: 2018,
      message: 'For the scholars who follow!',
      anonymous: false,
      date: 'Mar 5, 2026',
    },
    { name: 'Anonymous', amount: 25_000, anonymous: true, date: 'Mar 4, 2026' },
    {
      name: 'Nusrat Jahan',
      amount: 15_000,
      batch: 2019,
      message: 'Happy to give back to DIU.',
      anonymous: false,
      date: 'Mar 3, 2026',
    },
    { name: 'Mahmudul Hasan', amount: 5_000, batch: 2016, anonymous: false, date: 'Mar 2, 2026' },
    { name: 'Anonymous', amount: 50_000, anonymous: true, date: 'Mar 2, 2026' },
    {
      name: 'Rakibul Islam',
      amount: 20_000,
      batch: 2015,
      message: 'Lab upgrade is long overdue!',
      anonymous: false,
      date: 'Mar 1, 2026',
    },
    { name: 'Sadia Rahman', amount: 8_000, batch: 2020, anonymous: false, date: 'Feb 28, 2026' },
    { name: 'Anonymous', amount: 5_000, anonymous: true, date: 'Feb 27, 2026' },
  ];

  getActive(): Campaign[] {
    return this.campaigns.filter((c) => c.status === 'active');
  }

  getPast(): Campaign[] {
    return this.campaigns.filter((c) => c.status === 'completed');
  }

  getUpcoming(): Campaign[] {
    return this.campaigns.filter((c) => c.status === 'upcoming');
  }

  getFeatured(): Campaign[] {
    return this.campaigns.filter((c) => c.featured);
  }

  getById(id: number): Campaign | undefined {
    return this.campaigns.find((c) => c.id === id);
  }

  progressPercent(c: Campaign): number {
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
