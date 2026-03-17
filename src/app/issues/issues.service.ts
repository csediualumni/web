import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface GithubLabel {
  id: number;
  name: string;
  color: string;
  description: string | null;
}

export interface GithubUser {
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface GithubMilestone {
  title: string;
  html_url: string;
}

export interface GithubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  labels: GithubLabel[];
  user: GithubUser;
  comments: number;
  milestone: GithubMilestone | null;
}

@Injectable({ providedIn: 'root' })
export class IssuesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl =
    'https://api.github.com/repos/csediualumni/web/issues?state=open&per_page=100';

  getOpenIssues(): Observable<GithubIssue[]> {
    return this.http
      .get<GithubIssue[]>(this.apiUrl)
      .pipe(map((issues) => issues.filter((issue) => !('pull_request' in issue))));
  }
}
