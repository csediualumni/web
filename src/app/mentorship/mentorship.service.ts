import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Mentor {
  id: string;
  name: string;
  batch: number;
  role: string;
  company: string;
  country: string;
  city: string;
  initials: string | null;
  color: string | null;
  expertise: string[];
  bio: string;
  availability: string;
  mentees: number;
  rating: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApplyMentorshipDto {
  name: string;
  email: string;
  batch?: number | null;
  area: string;
  goals: string;
  type?: string;
}

@Injectable({ providedIn: 'root' })
export class MentorshipService {
  private readonly base = `${environment.apiUrl}/mentors`;
  private readonly http = inject(HttpClient);

  getMentors(): Observable<Mentor[]> {
    return this.http.get<Mentor[]>(this.base);
  }

  getMentorById(id: string): Observable<Mentor> {
    return this.http.get<Mentor>(`${this.base}/${id}`);
  }

  apply(dto: ApplyMentorshipDto): Observable<void> {
    return this.http.post<void>(`${this.base}/apply`, dto);
  }
}
