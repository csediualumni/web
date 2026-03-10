import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type CampaignStatus = 'active' | 'completed' | 'upcoming';

export interface Campaign {
  id: number;
  title: string;
  tagline: string;
  description: string;
  goal: number;
  /** Computed server-side from verified invoices */
  raised: number;
  /** Computed server-side from verified invoices */
  donors: number;
  status: CampaignStatus;
  deadline: string | null;
  category: string;
  icon: string;
  color: string;
  featured: boolean;
  impact: string[];
  updates: string[] | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class CampaignService {
  private readonly base = `${environment.apiUrl}/campaigns`;
  private readonly http = inject(HttpClient);

  getAll(): Observable<Campaign[]> {
    return this.http.get<Campaign[]>(this.base);
  }

  getById(id: number): Observable<Campaign> {
    return this.http.get<Campaign>(`${this.base}/${id}`);
  }
}
