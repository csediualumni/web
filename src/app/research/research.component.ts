import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ResearchService } from './research.service';
import type { ResearchPaper } from './research.service';

@Component({
  selector: 'app-research',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './research.component.html',
})
export class ResearchComponent implements OnInit {
  private readonly researchSvc = inject(ResearchService);

  loading = signal(true);
  error = signal('');
  papers = signal<ResearchPaper[]>([]);

  allTags = signal<string[]>(['All']);
  years = signal<string[]>(['All']);

  activeTag = signal('All');
  activeYear = signal('All');
  searchQuery = signal('');

  ngOnInit(): void {
    this.researchSvc.getAll().subscribe({
      next: (data) => {
        this.papers.set(data);
        const tagSet = new Set<string>();
        const yearSet = new Set<string>();
        data.forEach((p) => {
          (p.tags ?? []).forEach((t) => tagSet.add(t));
          yearSet.add(String(p.year));
        });
        this.allTags.set(['All', ...Array.from(tagSet).sort()]);
        this.years.set(['All', ...Array.from(yearSet).sort((a, b) => +b - +a)]);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load research papers.');
        this.loading.set(false);
      },
    });
  }

  filteredPapers = computed(() => {
    const tag = this.activeTag();
    const year = this.activeYear();
    const q = this.searchQuery().toLowerCase();
    return this.papers().filter((p) => {
      const matchTag = tag === 'All' || (p.tags ?? []).includes(tag);
      const matchYear = year === 'All' || p.year === +year;
      const matchQ =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.authors ?? []).some((a) => a.toLowerCase().includes(q));
      return matchTag && matchYear && matchQ;
    });
  });

  setTag(t: string) { this.activeTag.set(t); }
  setYear(y: string) { this.activeYear.set(y); }

  venueIcon(type: string): string {
    return type === 'journal' ? 'fa-book-open' : type === 'conference' ? 'fa-users-line' : 'fa-file-lines';
  }

  venueColor(type: string): string {
    return type === 'journal'
      ? 'bg-emerald-100 text-emerald-700'
      : type === 'conference'
        ? 'bg-sky-100 text-sky-700'
        : 'bg-zinc-100 text-zinc-600';
  }
}
