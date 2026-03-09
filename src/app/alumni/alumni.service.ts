import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, shareReplay, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// ── API response shape ────────────────────────────────────────────

export interface PublicUser {
  id: string;
  displayName: string | null;
  avatar: string | null;
  email: string;
  memberId: string | null;
  batch: number | null;
  bio: string | null;
  jobTitle: string | null;
  company: string | null;
  industry: string | null;
  city: string | null;
  country: string | null;
  linkedin: string | null;
  github: string | null;
  twitter: string | null;
  website: string | null;
  openToMentoring: boolean;
  skills: string[] | null;
  experiences: { id: string; title: string; company: string; from: string; to: string }[];
  educations: { id: string; degree: string; institution: string; year: number | null }[];
  achievements: { id: string; title: string }[];
}

// ── Rich model used by components ────────────────────────────────

export interface AlumnusEducation {
  degree: string;
  institution: string;
  year: number;
}

export interface AlumnusExperience {
  role: string;
  company: string;
  from: string;
  to: string;
}

export interface AlumnusMember {
  id: string;
  name: string;
  memberId: string | null;
  batch: number | null;
  industry: string | null;
  country: string | null;
  city: string | null;
  role: string | null;
  company: string | null;
  initials: string;
  color: string;
  bio: string | null;
  skills: string[];
  achievements: string[];
  education: AlumnusEducation[];
  experience: AlumnusExperience[];
  openToMentoring: boolean;
  email: string;
  linkedin?: string | null;
  github?: string | null;
  twitter?: string | null;
  website?: string | null;
}

// ── Helpers ──────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-sky-600',
  'bg-blue-600',
  'bg-violet-600',
  'bg-emerald-600',
  'bg-rose-600',
  'bg-amber-600',
  'bg-indigo-600',
  'bg-teal-600',
  'bg-pink-600',
  'bg-cyan-600',
];

function colorFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initialsFor(displayName: string | null, email: string): string {
  const name = displayName?.trim() || email;
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function toAlumnusMember(u: PublicUser): AlumnusMember {
  return {
    id: u.id,
    name: u.displayName || u.email,
    memberId: u.memberId,
    batch: u.batch,
    industry: u.industry,
    country: u.country,
    city: u.city,
    role: u.jobTitle,
    company: u.company,
    initials: initialsFor(u.displayName, u.email),
    color: colorFor(u.id),
    bio: u.bio,
    skills: u.skills ?? [],
    achievements: (u.achievements ?? []).map((a) => a.title),
    education: (u.educations ?? []).map((e) => ({
      degree: e.degree,
      institution: e.institution,
      year: e.year ?? 0,
    })),
    experience: (u.experiences ?? []).map((e) => ({
      role: e.title,
      company: e.company,
      from: e.from,
      to: e.to,
    })),
    openToMentoring: u.openToMentoring,
    email: u.email,
    linkedin: u.linkedin,
    github: u.github,
    twitter: u.twitter,
    website: u.website,
  };
}

// ── Service ──────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AlumniService {
  private readonly http = inject(HttpClient);

  /** Shared, cached observable of all public alumni (admin excluded). */
  readonly members$: Observable<AlumnusMember[]> = this.http
    .get<PublicUser[]>(`${environment.apiUrl}/users`)
    .pipe(
      map((users) => users.map(toAlumnusMember)),
      shareReplay(1),
      catchError(() => of([])),
    );
}
