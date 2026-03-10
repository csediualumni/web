import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type JobType = 'Full-time' | 'Part-time' | 'Internship' | 'Remote' | 'Contract';

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  country: string;
  type: JobType;
  industry: string;
  experience: string;
  salary: string | null;
  posted: string;
  deadline: string;
  description: string;
  skills: string[];
  featured: boolean;
  postedById: string | null;
  postedBy: { id: string; displayName: string | null; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class JobsService {
  private readonly base = `${environment.apiUrl}/jobs`;
  private readonly http = inject(HttpClient);

  getAll(): Observable<JobPosting[]> {
    return this.http.get<JobPosting[]>(this.base);
  }

  getById(id: string): Observable<JobPosting> {
    return this.http.get<JobPosting>(`${this.base}/${id}`);
  }
}
