import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NewsService, NewsArticle } from './news.service';
import { ContentRendererComponent } from '../shared/content-renderer/content-renderer.component';

export type NewsCategory =
  | 'All'
  | 'Announcement'
  | 'Achievement'
  | 'Events'
  | 'Research'
  | 'Career'
  | 'Community';

export type { NewsArticle };

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, RouterLink, ContentRendererComponent],
  templateUrl: './news.component.html',
})
export class NewsComponent implements OnInit {
  private readonly newsSvc = inject(NewsService);

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
  expandedId = signal<string | null>(null);

  articles = signal<NewsArticle[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.newsSvc.getAll().subscribe({
      next: (data) => {
        this.articles.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load news. Please try again later.');
        this.loading.set(false);
      },
    });
  }

  filteredArticles = computed(() => {
    const cat = this.activeCategory();
    const list =
      cat === 'All'
        ? this.articles()
        : this.articles().filter((a) => a.category === cat);
    // Pinned first
    return [...list].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  });

  featuredArticles = computed(() => this.articles().filter((a) => a.featured));

  setCategory(c: NewsCategory) {
    this.activeCategory.set(c);
  }

  toggleExpand(id: string) {
    this.expandedId.update((v) => (v === id ? null : id));
  }

  isExpanded(id: string): boolean {
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
