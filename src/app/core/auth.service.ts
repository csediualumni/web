import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    permissions: string[];
    roles: { id: string; name: string }[];
    memberId: string | null;
  };
}

export interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  from: string;
  to: string;
  sortOrder?: number;
}

export interface EducationEntry {
  id: string;
  degree: string;
  institution: string;
  year: number | null;
  sortOrder?: number;
}

export interface AchievementEntry {
  id: string;
  title: string;
  sortOrder?: number;
}

export interface UserProfile {
  avatar: string | null;
  displayName: string | null;
  phone: string | null;
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
  skills: string[] | null;
  openToMentoring: boolean;
  profileVisibility: boolean;
  experiences: ExperienceEntry[];
  educations: EducationEntry[];
  achievements: AchievementEntry[];
}

export interface AuthUser {
  id: string;
  email: string;
  permissions: string[];
  roles: { id: string; name: string }[];
  memberId: string | null;
  profile?: Partial<UserProfile>;
}

export type UpdateProfileDto = Partial<UserProfile>;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base = `${environment.apiUrl}/auth`;

  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  readonly currentUser = signal<AuthUser | null>(this.loadUser());

  // ──────────────────────────────────────────────
  // Email / Password
  // ──────────────────────────────────────────────

  register(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/register`, { email, password }).pipe(
      tap((res) => {
        this.persistSession(res);
        this.loadProfile().subscribe({ error: () => undefined });
      }),
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/login`, { email, password }).pipe(
      tap((res) => {
        this.persistSession(res);
        this.loadProfile().subscribe({ error: () => undefined });
      }),
    );
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/reset-password`, { token, password });
  }

  // ──────────────────────────────────────────────
  // Google OAuth
  // ──────────────────────────────────────────────

  redirectToGoogle(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.location.href = `${this.base}/google`;
    }
  }

  /** Called by the callback component after Google redirects back */
  handleGoogleCallback(token: string, userId: string, email: string): void {
    // Decode JWT to extract permissions + roles
    const payload = this.decodeJwt(token);
    const res: AuthResponse = {
      accessToken: token,
      user: {
        id: userId,
        email,
        permissions: payload?.permissions ?? [],
        roles: payload?.roles ?? [],
        memberId: payload?.memberId ?? null,
      },
    };
    this.persistSession(res);
    this.loadProfile().subscribe({ error: () => undefined });
  }

  // ──────────────────────────────────────────────
  // Session helpers
  // ──────────────────────────────────────────────

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('auth_user');
    }
    this.currentUser.set(null);
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem('access_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasPermission(key: string): boolean {
    return this.currentUser()?.permissions.includes(key) ?? false;
  }

  hasRole(name: string): boolean {
    return this.currentUser()?.roles.some((r) => r.name === name) ?? false;
  }

  isGuest(): boolean {
    return this.hasRole('guest');
  }

  isMember(): boolean {
    return this.hasRole('member');
  }

  // ──────────────────────────────────────────────
  // Profile
  // ──────────────────────────────────────────────

  loadProfile(): Observable<UserProfile & { id: string; email: string }> {
    return this.http.get<UserProfile & { id: string; email: string }>(`${this.base}/me`).pipe(
      tap((data) => {
        const current = this.currentUser();
        if (current) {
          this.currentUser.set({ ...current, profile: data });
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('auth_user', JSON.stringify({ ...current, profile: data }));
          }
        }
      }),
    );
  }

  uploadAvatar(file: File): Observable<{ avatar: string }> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<{ avatar: string }>(`${this.base}/me/avatar`, fd).pipe(
      tap((res) => {
        const current = this.currentUser();
        if (current) {
          const updated = { ...current, profile: { ...current.profile, avatar: res.avatar } };
          this.currentUser.set(updated);
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('auth_user', JSON.stringify(updated));
          }
        }
      }),
    );
  }

  updateProfile(dto: UpdateProfileDto): Observable<UserProfile & { id: string; email: string }> {
    return this.http
      .patch<UserProfile & { id: string; email: string }>(`${this.base}/me`, dto)
      .pipe(
        tap((data) => {
          const current = this.currentUser();
          if (current) {
            this.currentUser.set({ ...current, profile: data });
            if (isPlatformBrowser(this.platformId)) {
              localStorage.setItem('auth_user', JSON.stringify({ ...current, profile: data }));
            }
          }
        }),
      );
  }

  // ────────────────────────────────────────────
  // Experience CRUD
  // ────────────────────────────────────────────

  addExperience(dto: Omit<ExperienceEntry, 'id'>): Observable<ExperienceEntry> {
    return this.http.post<ExperienceEntry>(`${this.base}/me/experience`, dto);
  }

  updateExperience(id: string, dto: Omit<ExperienceEntry, 'id'>): Observable<ExperienceEntry> {
    return this.http.patch<ExperienceEntry>(`${this.base}/me/experience/${id}`, dto);
  }

  deleteExperience(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/me/experience/${id}`);
  }

  // ────────────────────────────────────────────
  // Education CRUD
  // ────────────────────────────────────────────

  addEducation(dto: Omit<EducationEntry, 'id'>): Observable<EducationEntry> {
    return this.http.post<EducationEntry>(`${this.base}/me/education`, dto);
  }

  updateEducation(id: string, dto: Omit<EducationEntry, 'id'>): Observable<EducationEntry> {
    return this.http.patch<EducationEntry>(`${this.base}/me/education/${id}`, dto);
  }

  deleteEducation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/me/education/${id}`);
  }

  // ────────────────────────────────────────────
  // Achievement CRUD
  // ────────────────────────────────────────────

  addAchievement(dto: Omit<AchievementEntry, 'id'>): Observable<AchievementEntry> {
    return this.http.post<AchievementEntry>(`${this.base}/me/achievements`, dto);
  }

  updateAchievement(id: string, dto: Omit<AchievementEntry, 'id'>): Observable<AchievementEntry> {
    return this.http.patch<AchievementEntry>(`${this.base}/me/achievements/${id}`, dto);
  }

  deleteAchievement(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/me/achievements/${id}`);
  }

  // ────────────────────────────────────────────
  // Member ID
  // ────────────────────────────────────────────

  generateMemberId(): Observable<{ memberId: string }> {
    return this.http.post<{ memberId: string }>(`${this.base}/me/generate-member-id`, {}).pipe(
      tap((res) => {
        const current = this.currentUser();
        if (current) {
          const updated = { ...current, memberId: res.memberId };
          this.currentUser.set(updated);
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('auth_user', JSON.stringify(updated));
          }
        }
      }),
    );
  }

  private decodeJwt(token: string): {
    permissions?: string[];
    roles?: { id: string; name: string }[];
    memberId?: string | null;
  } | null {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  private persistSession(res: AuthResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('access_token', res.accessToken);
      localStorage.setItem('auth_user', JSON.stringify(res.user));
    }
    this.currentUser.set(res.user);
  }

  private loadUser(): AuthUser | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  }
}
