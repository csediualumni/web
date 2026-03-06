import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs/operators';
import { AlumniService, AlumnusMember } from './alumni.service';

@Component({
  selector: 'app-alumni',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './alumni.component.html',
})
export class AlumniComponent {
  private readonly alumniService = inject(AlumniService);

  readonly loading = signal(true);

  readonly members = toSignal(
    this.alumniService.members$.pipe(tap(() => this.loading.set(false))),
    { initialValue: [] as AlumnusMember[] },
  );

  searchQuery = signal('');
  selectedBatch = signal('');
  selectedIndustry = signal('');
  selectedCountry = signal('');

  readonly batches = [
    2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016,
    2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024,
  ];

  readonly industries = [
    'Software Engineering',
    'Data Science & AI',
    'Cybersecurity',
    'Cloud & DevOps',
    'Product Management',
    'Academia & Research',
    'Entrepreneurship',
    'Networking & Systems',
    'Game Development',
    'Finance & Fintech',
  ];

  readonly countries = [
    'Bangladesh',
    'USA',
    'UK',
    'Canada',
    'Australia',
    'Germany',
    'Singapore',
    'UAE',
    'Japan',
    'Netherlands',
  ];

  filteredMembers = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const batch = this.selectedBatch();
    const industry = this.selectedIndustry();
    const country = this.selectedCountry();

    return this.members().filter((m) => {
      const matchesQuery =
        !q ||
        (m.name ?? '').toLowerCase().includes(q) ||
        (m.company ?? '').toLowerCase().includes(q) ||
        (m.role ?? '').toLowerCase().includes(q) ||
        (m.skills ?? []).some((s) => s.toLowerCase().includes(q));
      const matchesBatch = !batch || m.batch === +batch;
      const matchesIndustry = !industry || m.industry === industry;
      const matchesCountry = !country || m.country === country;
      return matchesQuery && matchesBatch && matchesIndustry && matchesCountry;
    });
  });

  hasFilters = computed(
    () =>
      !!this.searchQuery() ||
      !!this.selectedBatch() ||
      !!this.selectedIndustry() ||
      !!this.selectedCountry(),
  );

  clearFilters() {
    this.searchQuery.set('');
    this.selectedBatch.set('');
    this.selectedIndustry.set('');
    this.selectedCountry.set('');
  }

  readonly stats = [
    { value: '5,000+', label: 'Registered Alumni', icon: 'fa-users' },
    { value: '120+', label: 'Graduating Batches', icon: 'fa-layer-group' },
    { value: '80+', label: 'Countries', icon: 'fa-globe' },
    { value: '10+', label: 'Industries', icon: 'fa-briefcase' },
  ];
}
