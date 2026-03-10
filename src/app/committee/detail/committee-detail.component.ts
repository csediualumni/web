import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AdminService, Committee, CommitteeEntry } from '../../core/admin.service';
import { colorFor, initialsFor } from '../committee.component';

const DESIGNATION_ORDER: Record<string, number> = {
  President: 0,
  'Vice President': 1,
  'General Secretary': 2,
  'Joint Secretary': 3,
  Treasurer: 4,
  'Assistant Treasurer': 5,
  'Executive Member': 6,
};

@Component({
  selector: 'app-committee-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './committee-detail.component.html',
})
export class CommitteeDetailComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly route = inject(ActivatedRoute);

  loading = signal(true);
  error = signal('');
  committee = signal<Committee | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.adminService.getCommittee(id).subscribe({
      next: (data) => {
        this.committee.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.status === 404 ? 'Committee not found.' : 'Failed to load committee.');
        this.loading.set(false);
      },
    });
  }

  colorFor = colorFor;
  initialsFor = initialsFor;
  readonly Boolean = Boolean;

  sortedMembers(members: CommitteeEntry[]): CommitteeEntry[] {
    return [...members].sort(
      (a, b) => (DESIGNATION_ORDER[a.designation] ?? 99) - (DESIGNATION_ORDER[b.designation] ?? 99),
    );
  }
}
