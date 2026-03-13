import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SiteConfigService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/config`;

  readonly config = signal<Record<string, string | null>>({});

  load(): Observable<Record<string, string | null>> {
    return this.http.get<Record<string, string | null>>(this.baseUrl).pipe(
      tap((data) => this.config.set(data)),
      catchError(() => of({})),
    );
  }

  logo = () => this.config()['logoUrl'] ?? null;
  favicon = () => this.config()['faviconUrl'] ?? null;
  supportEmail = () => this.config()['supportEmail'] ?? null;
  supportPhone = () => this.config()['supportPhone'] ?? null;
  bkashNumber = () => this.config()['bkashNumber'] ?? null;
  location = () => this.config()['location'] ?? null;
  facebookUrl = () => this.config()['facebookUrl'] ?? null;
  twitterUrl = () => this.config()['twitterUrl'] ?? null;
  linkedinUrl = () => this.config()['linkedinUrl'] ?? null;
  instagramUrl = () => this.config()['instagramUrl'] ?? null;
  youtubeUrl = () => this.config()['youtubeUrl'] ?? null;
  githubUrl = () => this.config()['githubUrl'] ?? null;

  update(data: Record<string, string | null>): Observable<Record<string, string | null>> {
    return this.http.patch<Record<string, string | null>>(this.baseUrl, data).pipe(
      tap((updated) => this.config.set(updated)),
    );
  }

  uploadLogo(file: File): Observable<{ logoUrl: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ logoUrl: string }>(`${this.baseUrl}/logo`, form).pipe(
      tap(({ logoUrl }) => this.config.update((c) => ({ ...c, logoUrl }))),
    );
  }

  uploadFavicon(file: File): Observable<{ faviconUrl: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ faviconUrl: string }>(`${this.baseUrl}/favicon`, form).pipe(
      tap(({ faviconUrl }) => this.config.update((c) => ({ ...c, faviconUrl }))),
    );
  }
}
