import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JobsService } from './jobs.service';
import type { JobPosting, JobType } from './jobs.service';
import { ContentRendererComponent } from '../shared/content-renderer/content-renderer.component';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ContentRendererComponent],
  templateUrl: './jobs.component.html',
})
export class JobsComponent implements OnInit {
  private readonly jobsSvc = inject(JobsService);

  loading = signal(true);
  error = signal('');
  jobs = signal<JobPosting[]>([]);

  searchQuery = signal('');
  selectedType = signal('');
  selectedIndustry = signal('');
  selectedExperience = signal('');

  readonly types: JobType[] = ['Full-time', 'Part-time', 'Internship', 'Remote', 'Contract'];

  // Derived from loaded data
  industries = computed(() => [...new Set(this.jobs().map((j) => j.industry))].sort());
  experienceLevels = computed(() => [...new Set(this.jobs().map((j) => j.experience))].sort());

  ngOnInit(): void {
    this.jobsSvc.getAll().subscribe({
      next: (data) => { this.jobs.set(data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load job postings.'); this.loading.set(false); },
    });
  }

  filteredJobs = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const type = this.selectedType();
    const industry = this.selectedIndustry();
    const exp = this.selectedExperience();
    return this.jobs().filter((j) => {
      const matchQ = !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || (j.skills ?? []).some((s) => s.toLowerCase().includes(q));
      const matchType = !type || j.type === type;
      const matchIndustry = !industry || j.industry === industry;
      const matchExp = !exp || j.experience === exp;
      return matchQ && matchType && matchIndustry && matchExp;
    });
  });

  hasFilters = computed(() => !!this.searchQuery() || !!this.selectedType() || !!this.selectedIndustry() || !!this.selectedExperience());

  clearFilters() {
    this.searchQuery.set('');
    this.selectedType.set('');
    this.selectedIndustry.set('');
    this.selectedExperience.set('');
  }

  postedByName(job: JobPosting): string {
    if (!job.postedBy) return '';
    return job.postedBy.displayName ?? job.postedBy.email;
  }

  typeColor(type: JobType): string {
    const map: Record<JobType, string> = {
      'Full-time': 'bg-emerald-100 text-emerald-700',
      'Part-time': 'bg-sky-100 text-sky-700',
      Internship: 'bg-violet-100 text-violet-700',
      Remote: 'bg-amber-100 text-amber-700',
      Contract: 'bg-rose-100 text-rose-700',
    };
    return map[type] ?? 'bg-zinc-100 text-zinc-600';
  }
}
