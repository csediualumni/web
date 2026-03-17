import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { switchMap, take, takeUntil } from 'rxjs/operators';
import { AlumniService, AlumnusMember } from '../alumni.service';
import { ContentRendererComponent } from '../../shared/content-renderer/content-renderer.component';
import { SeoService } from '../../core/seo.service';

const SITE_NAME = 'CSE DIU Alumni';

@Component({
  selector: 'app-alumni-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, ContentRendererComponent],
  templateUrl: './alumni-profile.component.html',
})
export class AlumniProfileComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly alumniService = inject(AlumniService);
  private readonly titleService = inject(Title);
  private readonly seo = inject(SeoService);
  private readonly destroy$ = new Subject<void>();

  member = signal<AlumnusMember | null>(null);
  notFound = signal(false);

  // Related (same batch or industry, excluding current member)
  related = signal<AlumnusMember[]>([]);

  ngOnInit() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id') ?? '';
          this.member.set(null);
          this.notFound.set(false);
          this.related.set([]);
          return this.alumniService.members$.pipe(
            take(1),
            switchMap((members) => [{ id, members }]),
          );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe(({ id, members }) => {
        const found = members.find((m) => m.id === id);
        if (found) {
          this.member.set(found);
          this.titleService.setTitle(`${found.name} | ${SITE_NAME}`);
          this.seo.update({ title: found.name, ogUrl: `/alumni/${found.id}` });
          const rel = members
            .filter(
              (m) => m.id !== found.id && (m.batch === found.batch || m.industry === found.industry),
            )
            .slice(0, 3);
          this.related.set(rel);
        } else {
          this.notFound.set(true);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
