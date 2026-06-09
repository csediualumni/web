import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AdminService, Committee, CommitteeEntry } from '../../core/admin.service';
import { colorFor, initialsFor } from '../committee.component';

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

  /** Members arrive pre-sorted by designation priority then name from the API. */
  sortedMembers(members: CommitteeEntry[]): CommitteeEntry[] {
    return [...members];
  }
}
