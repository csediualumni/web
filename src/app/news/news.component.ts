import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export type NewsCategory =
  | 'All'
  | 'Announcement'
  | 'Achievement'
  | 'Events'
  | 'Research'
  | 'Career'
  | 'Community';

export interface NewsArticle {
  id: number;
  title: string;
  summary: string;
  body: string;
  category: Exclude<NewsCategory, 'All'>;
  author: string;
  date: string;
  readTime: string;
  icon: string;
  color: string;
  pinned?: boolean;
  featured?: boolean;
}

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './news.component.html',
})
export class NewsComponent {
  readonly categories: NewsCategory[] = [
    'All',
    'Announcement',
    'Achievement',
    'Events',
    'Research',
    'Career',
    'Community',
  ];

  activeCategory = signal<NewsCategory>('All');
  expandedId = signal<number | null>(null);

  readonly articles: NewsArticle[] = [
    {
      id: 1,
      category: 'Announcement',
      title: 'Platform 2.0 Launch: New Features for Alumni Members',
      summary:
        'The CSE DIU Alumni Network has launched a major update with improved search, an enhanced alumni directory, event management, and a new mentorship matching system.',
      body: 'We are proud to announce the full launch of the CSE DIU Alumni Network Platform 2.0. This release represents months of work by our volunteer engineering team — all CSE DIU alumni themselves. Key new features include real-time alumni search with skill and location filters, a fully revamped events system with registration and seat tracking, a mentorship program with structured matching, searchable research paper repository, and a job board exclusively for alumni connections.\n\nAll existing members have been automatically migrated. If you experience any issues, please use the Contact page to reach our team.',
      author: 'Platform Team',
      date: 'March 5, 2026',
      readTime: '3 min read',
      icon: 'fa-rocket',
      color: 'bg-violet-100',
      pinned: true,
      featured: true,
    },
    {
      id: 2,
      category: 'Achievement',
      title: "Alumni Nusrat Jahan (Batch '19) Joins Google as ML Engineer",
      summary:
        "We congratulate Nusrat Jahan on securing a role at Google's AI division in San Francisco, working on large-scale ML infrastructure.",
      body: 'CSE DIU alumna Nusrat Jahan (Batch 2019) has joined Google as a Machine Learning Engineer in San Francisco, California. Nusrat completed her Master\'s in Computer Science at Stanford University with a focus on ML systems and will be working within Google\'s Core ML team on infrastructure that powers Search and Google Assistant.\n\n"I owe a huge part of my journey to the mentorship I received through the CSE DIU Alumni Network," said Nusrat. "The connections and guidance from seniors were invaluable during both my master\'s application and job search."\n\nNusrat is actively volunteering as a mentor on the platform — you can find her profile in the Mentorship section.',
      author: 'Community Desk',
      date: 'March 1, 2026',
      readTime: '2 min read',
      icon: 'fa-trophy',
      color: 'bg-amber-100',
      featured: true,
    },
    {
      id: 3,
      category: 'Events',
      title: 'Grand Alumni Reunion 2026 — Registrations Now Open',
      summary:
        'The biggest event on the alumni calendar returns on April 12, 2026. Early-bird registration is open with limited seats.',
      body: "Planning is well under way for the Grand Alumni Reunion 2026, scheduled for April 12 at the DIU Permanent Campus in Birulia, Dhaka. This year's event expects 500+ attendees across all batches.\n\nThe evening will feature a welcome reception, award ceremony recognising outstanding alumni achievements, a networking dinner, and musical performances by alumni artists. A special batch-wise photo session will be organised for the first time.\n\nTickets are BDT 1,200 per person and include dinner and refreshments. Seats are filling up fast — register via the Events page before March 31.",
      author: 'Events Committee',
      date: 'February 28, 2026',
      readTime: '2 min read',
      icon: 'fa-calendar-check',
      color: 'bg-emerald-100',
    },
    {
      id: 4,
      category: 'Research',
      title: 'BanglaBERT++ Paper Accepted at ACL 2025 Findings',
      summary:
        "Alumni researchers Nusrat Jahan and Mehedi Hasan's paper on contextual Bangla NLP embeddings has been accepted at ACL 2025.",
      body: 'We are delighted to share that the research paper "BanglaBERT++: Enhanced Contextual Embeddings for Low-Resource Bangla NLP Tasks" by CSE DIU alumni Nusrat Jahan and Mehedi Hasan has been accepted at the ACL 2025 Findings track.\n\nThe paper introduces domain-adaptive pre-training strategies that push state-of-the-art performance on Bangla sentiment analysis, named-entity recognition, and question answering. It has already received 61 citations since its preprint release.\n\nThe full paper is available in the Research Papers section of this platform. We invite all alumni working in NLP and low-resource language research to share their work with us.',
      author: 'Research Desk',
      date: 'February 20, 2026',
      readTime: '3 min read',
      icon: 'fa-file-lines',
      color: 'bg-sky-100',
    },
    {
      id: 5,
      category: 'Career',
      title: 'Alumni Job Board Now Live — 8 Exclusive Openings',
      summary:
        'The CSE DIU Alumni Job Board has launched with 8 positions shared exclusively by alumni at Samsung, Google, bKash, Pathao, and more.',
      body: 'The Alumni Job Board is now live with its first batch of job postings — all shared by CSE DIU alumni at their respective companies. Current openings include positions at Samsung R&D, Pathao, bKash, Microsoft, Chaldal, Nagad, Grameenphone, and Shajgoj.\n\nRoles range from entry-level internships to senior engineer and leadership positions across software engineering, data science, product management, and cybersecurity.\n\nAlumni who wish to post a job at their company can do so by logging in to the platform. All posts are reviewed within 24 hours before going live.',
      author: 'Career Desk',
      date: 'February 15, 2026',
      readTime: '2 min read',
      icon: 'fa-briefcase',
      color: 'bg-rose-100',
    },
    {
      id: 6,
      category: 'Community',
      title: 'CSE DIU Alumni Endowment Scholarship: First Recipient Announced',
      summary:
        'The inaugural recipient of the alumni-funded endowment scholarship has been announced. Meet Rasel Ahmed, current CSE DIU student.',
      body: 'We are thrilled to announce that Rasel Ahmed, a third-year CSE DIU student from Sylhet, has been selected as the inaugural recipient of the CSE DIU Alumni Endowment Scholarship.\n\nRasel maintains a CGPA of 3.82 while supporting his family financially. The BDT 50,000 scholarship, crowd-funded entirely by our alumni community, will cover his remaining tuition and living costs for the academic year.\n\n"I never imagined this level of support from people I have never even met," said Rasel. "This motivates me to give back to the next generation the same way these alumni have given to me."\n\nDonations to the scholarship fund remain open. Find out more on the Scholarships page.',
      author: 'Community Desk',
      date: 'February 10, 2026',
      readTime: '3 min read',
      icon: 'fa-heart',
      color: 'bg-pink-100',
    },
    {
      id: 7,
      category: 'Achievement',
      title: "Rakibul Islam's Startup TechVenture BD Raises BDT 3 Crore Seed Round",
      summary:
        "CSE DIU alumnus and entrepreneur Rakibul Islam (Batch '15) has closed a BDT 3 crore seed round for his tech startup TechVenture BD.",
      body: 'TechVenture BD, the Dhaka-based SaaS company co-founded by CSE DIU alumnus Rakibul Islam (Batch 2015), has successfully closed a BDT 3 crore seed funding round led by a consortium of Bangladeshi angel investors.\n\nThe startup operates a B2B operations management platform used by over 200 SMEs across Bangladesh. The new capital will fund a 15-person engineering team expansion and regional expansion into Nepal and Myanmar.\n\n"Building a startup from scratch while staying connected to the alumni network — for hiring, advisors, and moral support — has been priceless," said Rakibul. "Several of our early engineers are CSE DIU graduates."',
      author: 'Community Desk',
      date: 'January 30, 2026',
      readTime: '3 min read',
      icon: 'fa-chart-line',
      color: 'bg-teal-100',
    },
    {
      id: 8,
      category: 'Announcement',
      title: 'Mentorship Programme Opens for Applications — 30 Spots Available',
      summary:
        'The CSE DIU Alumni Mentorship Programme is accepting applications for 30 mentee spots mentored by senior alumni from Google, Microsoft, Samsung, and more.',
      body: 'Following a successful pilot with 15 pairs, the CSE DIU Alumni Mentorship Programme is now fully open for applications. Thirty mentee spots are available for the March–June 2026 cohort, paired with senior alumni mentors from companies including Google, Microsoft, Samsung, Shopify, and MIT CSAIL.\n\nMentorship formats include 1-on-1 video sessions, async text-based guidance, and group workshops. Areas of mentorship cover software engineering, ML/AI, cloud careers, product management, research, and entrepreneurship.\n\nApplications close March 20, 2026. Apply through the Mentorship page.',
      author: 'Mentorship Team',
      date: 'January 25, 2026',
      readTime: '2 min read',
      icon: 'fa-handshake',
      color: 'bg-indigo-100',
      pinned: true,
    },
  ];

  filteredArticles = computed(() => {
    const cat = this.activeCategory();
    const list = cat === 'All' ? this.articles : this.articles.filter((a) => a.category === cat);
    // Pinned first
    return [...list].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  });

  featuredArticles = computed(() => this.articles.filter((a) => a.featured));

  setCategory(c: NewsCategory) {
    this.activeCategory.set(c);
  }

  toggleExpand(id: number) {
    this.expandedId.update((v) => (v === id ? null : id));
  }

  isExpanded(id: number): boolean {
    return this.expandedId() === id;
  }

  categoryColor(cat: string): string {
    const map: Record<string, string> = {
      Announcement: 'bg-violet-100 text-violet-700',
      Achievement: 'bg-amber-100 text-amber-700',
      Events: 'bg-emerald-100 text-emerald-700',
      Research: 'bg-sky-100 text-sky-700',
      Career: 'bg-rose-100 text-rose-700',
      Community: 'bg-pink-100 text-pink-700',
    };
    return map[cat] ?? 'bg-zinc-100 text-zinc-600';
  }
}
