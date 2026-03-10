import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService, Committee, CommitteeEntry } from '../core/admin.service';

const AVATAR_COLORS = [
  'bg-sky-600',
  'bg-blue-600',
  'bg-violet-600',
  'bg-emerald-600',
  'bg-rose-600',
  'bg-amber-600',
  'bg-indigo-600',
  'bg-teal-600',
];

export function colorFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export function initialsFor(displayName: string | null, email: string): string {
  const name = displayName?.trim() || email;
  const parts = name.split(/\s+/).filter(Boolean);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.substring(0, 2).toUpperCase();
}

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
  selector: 'app-committee',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './committee.component.html',
})
export class CommitteeComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  loading = signal(true);
  error = signal('');
  all = signal<Committee[]>([]);

  current = computed(() => this.all().find((c) => c.isCurrent) ?? null);
  past = computed(() => this.all().filter((c) => !c.isCurrent));

  ngOnInit(): void {
    this.adminService.getCommittees().subscribe({
      next: (data) => {
        this.all.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load committees.');
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
