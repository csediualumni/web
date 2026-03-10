import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ScholarshipsService } from './scholarships.service';
import type { Scholarship } from './scholarships.service';

@Component({
  selector: 'app-scholarships',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './scholarships.component.html',
})
export class ScholarshipsComponent implements OnInit {
  private readonly scholarshipsSvc = inject(ScholarshipsService);

  loading = signal(true);
  error = signal('');
  scholarships = signal<Scholarship[]>([]);

  levels = signal<string[]>(['All']);
  countries = signal<string[]>(['All']);

  activeLevel = signal('All');
  activeCountry = signal('All');

  ngOnInit(): void {
    this.scholarshipsSvc.getAll().subscribe({
      next: (data) => {
        this.scholarships.set(data);
        const levelSet = new Set<string>();
        const countrySet = new Set<string>();
        data.forEach((s) => { levelSet.add(s.level); countrySet.add(s.country); });
        this.levels.set(['All', ...Array.from(levelSet).sort()]);
        this.countries.set(['All', ...Array.from(countrySet).sort()]);
        this.loading.set(false);
      },
      error: () => { this.error.set('Failed to load scholarships.'); this.loading.set(false); },
    });
  }

  filteredScholarships = computed(() => {
    const level = this.activeLevel();
    const country = this.activeCountry();
    return this.scholarships().filter(
      (s) => (level === 'All' || s.level === level) && (country === 'All' || s.country === country),
    );
  });

  stats = computed(() => {
    const all = this.scholarships();
    const countries = new Set(all.map((s) => s.country)).size;
    const fullyFunded = all.filter((s) =>
      s.amount.toLowerCase().includes('full') || s.currency.toLowerCase().includes('full')
    ).length;
    const alumniCount = all.filter((s) => s.type.toLowerCase().includes('alumni')).length;
    return [
      { value: all.length > 0 ? all.length + '+' : '0', label: 'Active Scholarships', icon: 'fa-medal' },
      { value: String(countries), label: 'Countries', icon: 'fa-globe' },
      { value: String(fullyFunded), label: 'Fully Funded', icon: 'fa-star' },
      { value: String(alumniCount), label: 'Alumni-Funded', icon: 'fa-heart' },
    ];
  });

  setLevel(l: string) { this.activeLevel.set(l); }
  setCountry(c: string) { this.activeCountry.set(c); }
}
