import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { AlumniService, AlumnusMember } from '../alumni.service';

@Component({
  selector: 'app-alumni-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './alumni-profile.component.html',
})
export class AlumniProfileComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly alumniService = inject(AlumniService);

  member = signal<AlumnusMember | null>(null);
  notFound = signal(false);

  // Related (same batch or industry, excluding current member)
  related = signal<AlumnusMember[]>([]);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.alumniService.members$.pipe(take(1)).subscribe((members) => {
      const found = members.find((m) => m.id === id);
      if (found) {
        this.member.set(found);
        const rel = members
          .filter(
            (m) =>
              m.id !== found.id &&
              (m.batch === found.batch || m.industry === found.industry),
          )
          .slice(0, 3);
        this.related.set(rel);
      } else {
        this.notFound.set(true);
      }
    });
  }
}
