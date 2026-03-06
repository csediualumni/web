import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommitteeService, Committee } from './committee.service';
import { AlumniService, AlumnusMember } from '../alumni/alumni.service';

export interface ResolvedMember {
  alumnus: AlumnusMember;
  designation: string;
  note?: string;
}

export interface ResolvedCommittee {
  committee: Committee;
  members: ResolvedMember[];
}

@Component({
  selector: 'app-committee',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './committee.component.html',
})
export class CommitteeComponent {
  private readonly committeeService = inject(CommitteeService);
  private readonly alumniService = inject(AlumniService);

  private readonly allMembers = toSignal(this.alumniService.members$, {
    initialValue: [] as AlumnusMember[],
  });

  /** IDs of expanded past‑committee panels */
  expandedIds = signal<Set<number>>(new Set());

  readonly current = computed<ResolvedCommittee | null>(() => {
    const c = this.committeeService.getCurrent();
    if (!c) return null;
    return this.resolve(c);
  });

  readonly past = computed<ResolvedCommittee[]>(() =>
    this.committeeService.getPast().map((c) => this.resolve(c)),
  );

  private resolve(committee: Committee): ResolvedCommittee {
    const members: ResolvedMember[] = committee.members.reduce<ResolvedMember[]>((acc, entry) => {
      const alumnus = this.allMembers().find((m) => m.id === String(entry.alumniId));
      if (alumnus) {
        acc.push({ alumnus, designation: entry.designation, note: entry.note });
      }
      return acc;
    }, []);
    return { committee, members };
  }

  togglePast(id: number) {
    this.expandedIds.update((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  isExpanded(id: number): boolean {
    return this.expandedIds().has(id);
  }

  /** Designation display order map for sorting */
  private readonly order: Record<string, number> = {
    President: 0,
    'Vice President': 1,
    'General Secretary': 2,
    'Joint Secretary': 3,
    Treasurer: 4,
    'Assistant Treasurer': 5,
    'Executive Member': 6,
  };

  sortedMembers(members: ResolvedMember[]): ResolvedMember[] {
    return [...members].sort(
      (a, b) => (this.order[a.designation] ?? 99) - (this.order[b.designation] ?? 99),
    );
  }
}
