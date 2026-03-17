import { Component, OnInit, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ContributorsService } from './contributors.service';
import type { GithubMember } from './contributors.service';

@Component({
  selector: 'app-contributors',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contributors.component.html',
})
export class ContributorsComponent implements OnInit {
  private readonly contributorsSvc = inject(ContributorsService);
  private readonly destroyRef = inject(DestroyRef);

  loading = signal(true);
  error = signal('');
  members = signal<GithubMember[]>([]);

  ngOnInit(): void {
    this.contributorsSvc
      .getMembers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.members.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Failed to load contributors from GitHub. Please try again later.');
          this.loading.set(false);
        },
      });
  }
}
