import { Injectable } from '@angular/core';

export interface CommitteeMemberEntry {
  alumniId: number;
  designation: string;
  /** Optional note shown on the card (e.g. tenure detail) */
  note?: string;
}

export interface Committee {
  id: number;
  term: string;          // e.g. "2024–2025"
  sessionLabel: string;  // e.g. "Session 2024–25"
  isCurrent: boolean;
  theme: string;         // Optional theme / motto for the term
  members: CommitteeMemberEntry[];
}

@Injectable({ providedIn: 'root' })
export class CommitteeService {
  readonly committees: Committee[] = [
    // ── Current ────────────────────────────────────────────
    {
      id: 1,
      term: '2024–2025',
      sessionLabel: 'Current Committee',
      isCurrent: true,
      theme: '"Connecting Futures, Celebrating Roots"',
      members: [
        { alumniId: 7,  designation: 'President' },
        { alumniId: 1,  designation: 'Vice President' },
        { alumniId: 3,  designation: 'General Secretary' },
        { alumniId: 9,  designation: 'Joint Secretary' },
        { alumniId: 11, designation: 'Treasurer' },
        { alumniId: 5,  designation: 'Assistant Treasurer' },
        { alumniId: 4,  designation: 'Executive Member' },
        { alumniId: 6,  designation: 'Executive Member' },
        { alumniId: 2,  designation: 'Executive Member' },
      ],
    },

    // ── Past ───────────────────────────────────────────────
    {
      id: 2,
      term: '2022–2023',
      sessionLabel: 'Session 2022–23',
      isCurrent: false,
      theme: '"Growing Together, Giving Back"',
      members: [
        { alumniId: 9,  designation: 'President' },
        { alumniId: 7,  designation: 'Vice President' },
        { alumniId: 5,  designation: 'General Secretary' },
        { alumniId: 11, designation: 'Joint Secretary' },
        { alumniId: 3,  designation: 'Treasurer' },
        { alumniId: 1,  designation: 'Executive Member' },
        { alumniId: 12, designation: 'Executive Member' },
        { alumniId: 8,  designation: 'Executive Member' },
      ],
    },
    {
      id: 3,
      term: '2020–2021',
      sessionLabel: 'Session 2020–21',
      isCurrent: false,
      theme: '"Bridging Knowledge Across Generations"',
      members: [
        { alumniId: 3,  designation: 'President' },
        { alumniId: 9,  designation: 'Vice President' },
        { alumniId: 7,  designation: 'General Secretary' },
        { alumniId: 1,  designation: 'Joint Secretary' },
        { alumniId: 12, designation: 'Treasurer' },
        { alumniId: 5,  designation: 'Assistant Treasurer' },
        { alumniId: 4,  designation: 'Executive Member' },
        { alumniId: 10, designation: 'Executive Member' },
      ],
    },
    {
      id: 4,
      term: '2018–2019',
      sessionLabel: 'Session 2018–19',
      isCurrent: false,
      theme: '"Alumni First, Always"',
      members: [
        { alumniId: 5,  designation: 'President' },
        { alumniId: 3,  designation: 'Vice President' },
        { alumniId: 9,  designation: 'General Secretary' },
        { alumniId: 7,  designation: 'Joint Secretary' },
        { alumniId: 11, designation: 'Treasurer' },
        { alumniId: 6,  designation: 'Executive Member' },
        { alumniId: 8,  designation: 'Executive Member' },
      ],
    },
  ];

  getCurrent(): Committee | undefined {
    return this.committees.find((c) => c.isCurrent);
  }

  getPast(): Committee[] {
    return this.committees.filter((c) => !c.isCurrent);
  }

  getAll(): Committee[] {
    return this.committees;
  }

  getById(id: number): Committee | undefined {
    return this.committees.find((c) => c.id === id);
  }
}
