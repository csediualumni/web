import { Component, OnInit, DestroyRef, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { IssuesService } from './issues.service';
import type { GithubIssue, GithubLabel } from './issues.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-issues',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './issues.component.html',
})
export class IssuesComponent implements OnInit {
  private readonly issuesSvc = inject(IssuesService);
  private readonly destroyRef = inject(DestroyRef);

  loading = signal(true);
  error = signal('');
  issues = signal<GithubIssue[]>([]);

  searchQuery = signal('');
  selectedLabel = signal('');

  ngOnInit(): void {
    this.issuesSvc
      .getOpenIssues()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.issues.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Failed to load issues from GitHub. Please try again later.');
          this.loading.set(false);
        },
      });
  }

  allLabels = computed<GithubLabel[]>(() => {
    const seen = new Set<string>();
    const labels: GithubLabel[] = [];
    for (const issue of this.issues()) {
      for (const label of issue.labels) {
        if (!seen.has(label.name)) {
          seen.add(label.name);
          labels.push(label);
        }
      }
    }
    return labels.sort((a, b) => a.name.localeCompare(b.name));
  });

  filteredIssues = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const label = this.selectedLabel();
    return this.issues().filter((issue) => {
      const matchQ =
        !q || issue.title.toLowerCase().includes(q) || (issue.body ?? '').toLowerCase().includes(q);
      const matchLabel = !label || issue.labels.some((l) => l.name === label);
      return matchQ && matchLabel;
    });
  });

  hasFilters = computed(() => !!this.searchQuery() || !!this.selectedLabel());

  clearFilters() {
    this.searchQuery.set('');
    this.selectedLabel.set('');
  }

  labelTextColor(hexColor: string): string {
    const r = parseInt(hexColor.slice(0, 2), 16);
    const g = parseInt(hexColor.slice(2, 4), 16);
    const b = parseInt(hexColor.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#111827' : '#ffffff';
  }

  timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
  }
}
