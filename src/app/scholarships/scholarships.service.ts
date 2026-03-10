import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Scholarship {
  id: string;
  title: string;
  provider: string;
  amount: string;
  currency: string;
  deadline: string;
  eligibility: string;
  level: string;
  country: string;
  type: string;
  description: string;
  tags: string[];
  link: string;
  featured: boolean;
  urgent: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ScholarshipsService {
  private readonly base = `${environment.apiUrl}/scholarships`;
  private readonly http = inject(HttpClient);

  getAll(): Observable<Scholarship[]> {
    return this.http.get<Scholarship[]>(this.base);
  }

  getById(id: string): Observable<Scholarship> {
    return this.http.get<Scholarship>(`${this.base}/${id}`);
  }
}
