import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ReferenceItem {
  id: string;
  name: string;
  sortOrder: number;
}

@Injectable({ providedIn: 'root' })
export class ReferenceService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/reference`;

  listDepartments(q?: string): Observable<ReferenceItem[]> {
    return this.http.get<ReferenceItem[]>(`${this.base}/departments`, q ? { params: { q } } : {});
  }

  createDepartment(name: string): Observable<ReferenceItem> {
    return this.http.post<ReferenceItem>(`${this.base}/departments`, { name });
  }

  listShifts(): Observable<ReferenceItem[]> {
    return this.http.get<ReferenceItem[]>(`${this.base}/shifts`);
  }

  listSessions(q?: string): Observable<ReferenceItem[]> {
    return this.http.get<ReferenceItem[]>(`${this.base}/sessions`, q ? { params: { q } } : {});
  }

  createSession(name: string): Observable<ReferenceItem> {
    return this.http.post<ReferenceItem>(`${this.base}/sessions`, { name });
  }
}
