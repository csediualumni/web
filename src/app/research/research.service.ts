import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type VenueType = 'journal' | 'conference' | 'preprint';

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  year: number;
  venue: string;
  venueType: VenueType;
  tags: string[];
  doi: string | null;
  link: string;
  citations: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ResearchService {
  private readonly base = `${environment.apiUrl}/research`;
  private readonly http = inject(HttpClient);

  getAll(): Observable<ResearchPaper[]> {
    return this.http.get<ResearchPaper[]>(this.base);
  }

  getById(id: string): Observable<ResearchPaper> {
    return this.http.get<ResearchPaper>(`${this.base}/${id}`);
  }
}
