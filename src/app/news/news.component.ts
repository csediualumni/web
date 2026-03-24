import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NewsService, NewsArticle } from './news.service';
import { ContentRendererComponent } from '../shared/content-renderer/content-renderer.component';
import { categoryColor } from './news.utils';

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
      cat === 'All' ? this.articles() : this.articles().filter((a) => a.category === cat);
    // Pinned first
    return [...list].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  });

  featuredArticles = computed(() => this.articles().filter((a) => a.featured));

  setCategory(c: NewsCategory) {
    this.activeCategory.set(c);
  }

  categoryColor = categoryColor;
}
