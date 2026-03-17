import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NewsService, NewsArticle } from '../news.service';
import { ContentRendererComponent } from '../../shared/content-renderer/content-renderer.component';
import { categoryColor } from '../news.utils';
import { SeoService } from '../../core/seo.service';

const SITE_NAME = 'CSE DIU Alumni';

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ContentRendererComponent],
  templateUrl: './news-detail.component.html',
})
export class NewsDetailComponent implements OnInit {
  private readonly newsSvc = inject(NewsService);
  private readonly route = inject(ActivatedRoute);
  private readonly titleService = inject(Title);
  private readonly seo = inject(SeoService);

  loading = signal(true);
  error = signal('');
  article = signal<NewsArticle | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.newsSvc.getById(id).subscribe({
      next: (data) => {
        this.article.set(data);
        this.loading.set(false);
        this.titleService.setTitle(`${data.title} | ${SITE_NAME}`);
        this.seo.update({ title: data.title });
      },
      error: (err) => {
        this.error.set(err?.status === 404 ? 'Article not found.' : 'Failed to load article.');
        this.loading.set(false);
      },
    });
  }

  categoryColor = categoryColor;
}
