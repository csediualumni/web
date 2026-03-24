import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GithubMember {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  type: string;
}

@Injectable({ providedIn: 'root' })
export class ContributorsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://api.github.com/orgs/csediualumni/members?per_page=100';

  getMembers(): Observable<GithubMember[]> {
    return this.http.get<GithubMember[]>(this.apiUrl);
  }
}
