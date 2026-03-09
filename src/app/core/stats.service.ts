import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, shareReplay, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface PlatformStats {
  alumniCount: number;
  batchCount: number;
  countryCount: number;
  eventsHosted: number;
}

export interface FormattedStat {
  value: string;
  label: string;
  icon?: string;
}

function fmt(n: number): string {
  // Always append '+' to show minimum counts
  return n.toLocaleString() + '+';
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  private readonly http = inject(HttpClient);

  private readonly raw$: Observable<PlatformStats> = this.http
    .get<PlatformStats>(`${environment.apiUrl}/users/stats`)
    .pipe(
      shareReplay(1),
      catchError(() =>
        of({
          alumniCount: 5000,
          batchCount: 120,
          countryCount: 80,
          eventsHosted: 200,
        }),
      ),
    );

  /** Stats formatted for the home / about page (no icons) */
  readonly homeStats$: Observable<FormattedStat[]> = this.raw$.pipe(
    map((s) => [
      { value: fmt(s.alumniCount), label: 'Alumni Members' },
      { value: fmt(s.batchCount), label: 'Batches' },
      { value: fmt(s.countryCount), label: 'Countries' },
      { value: fmt(s.eventsHosted), label: 'Events Hosted' },
    ]),
  );

  /** Stats formatted for the about / alumni page (with icons) */
  readonly iconStats$: Observable<FormattedStat[]> = this.raw$.pipe(
    map((s) => [
      { value: fmt(s.alumniCount), label: 'Alumni Members', icon: 'fa-users' },
      { value: fmt(s.batchCount), label: 'Batches', icon: 'fa-layer-group' },
      { value: fmt(s.countryCount), label: 'Countries', icon: 'fa-globe' },
      { value: fmt(s.eventsHosted), label: 'Events Hosted', icon: 'fa-calendar-check' },
    ]),
  );

  /** Stats for the alumni directory page (subset with icons) */
  readonly alumniPageStats$: Observable<FormattedStat[]> = this.raw$.pipe(
    map((s) => [
      { value: fmt(s.alumniCount), label: 'Registered Alumni', icon: 'fa-users' },
      { value: fmt(s.batchCount), label: 'Graduating Batches', icon: 'fa-layer-group' },
      { value: fmt(s.countryCount), label: 'Countries', icon: 'fa-globe' },
      { value: '10+', label: 'Industries', icon: 'fa-briefcase' },
    ]),
  );
}
