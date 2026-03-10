import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type { AdminNewsArticle } from '../core/admin.service';

/** Public-facing news article (same shape as AdminNewsArticle — no auth-only fields) */
export type NewsArticle = AdminNewsArticle;

@Injectable({ providedIn: 'root' })
export class NewsService {
  private readonly base = `${environment.apiUrl}/news`;
  private readonly http = inject(HttpClient);

  getAll(): Observable<NewsArticle[]> {
    return this.http.get<NewsArticle[]>(this.base);
  }

  getById(id: string): Observable<NewsArticle> {
    return this.http.get<NewsArticle>(`${this.base}/${id}`);
  }
}
