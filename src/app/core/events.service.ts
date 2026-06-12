import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DistributionItem {
  id: string;
  eventId: string;
  itemType: 'kit' | 'breakfast' | 'lunch' | 'snacks' | 'dinner' | 'gift' | 'custom';
  customLabel: string | null;
  appliesToMain: boolean;
  appliesToFamily: boolean;
  quantityPerMain: number;
  quantityPerFamily: number;
  sortOrder: number;
}

export interface DistributionRecord {
  id: string;
  registrationId: string;
  distributionItemId: string;
  recipientType: 'main' | 'family';
  quantity: number;
  distributedByUserId: string;
  deviceInfo: Record<string, unknown> | null;
  distributedAt: string;
  item?: DistributionItem;
}

export interface DistributionSummaryItem {
  item: DistributionItem;
  entitledMain: number;
  entitledFamily: number;
  distributedMain: number;
  distributedFamily: number;
  remainingMain: number;
  remainingFamily: number;
}

export interface RegisterWithProfileDto {
  profile: {
    fullName: string;
    email: string;
    phone: string;
    gender: 'male' | 'female';
    birthday?: string;
    bloodGroup?: string;
    nationality?: string;
    religion?: string;
    presentAddress?: string;
    permanentAddress?: string;
    profession?: string;
    organization?: string;
    designation?: string;
    photo?: string;
    batch?: number;
    experiences?: { title: string; company: string; from: string; to: string }[];
    educations?: { degree: string; institution: string; year?: number }[];
  };
  tShirtSize?: string;
  familyMembersCount?: number;
  familyMembers?: { name: string; relation?: string }[];
  donationAmount?: number;
}

export interface GuestRegistrationResponse {
  registration: {
    id: string;
    status: string;
    eventId: string;
    invoiceId?: string;
  };
  isNewUser: boolean;
  accessToken?: string;
}

@Injectable({ providedIn: 'root' })
export class EventsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/events`;

  // ── QR Code ────────────────────────────────────────────────────────────────

  getMyRegistrationQrUrl(eventId: string): Observable<{ boothUrl: string }> {
    return this.http.get<{ boothUrl: string }>(`${this.base}/${eventId}/my-registration/qr-url`);
  }

  // ── Guest Registration ──────────────────────────────────────────────────────

  checkEmail(email: string): Observable<{ exists: boolean; isGuest: boolean }> {
    return this.http.post<{ exists: boolean; isGuest: boolean }>(
      `${environment.apiUrl}/auth/check-email`,
      { email },
    );
  }

  registerWithProfile(
    eventId: string,
    dto: RegisterWithProfileDto,
  ): Observable<GuestRegistrationResponse> {
    return this.http.post<GuestRegistrationResponse>(
      `${this.base}/${eventId}/register-with-profile`,
      dto,
    );
  }

  registerLoggedIn(
    eventId: string,
    dto: { tShirtSize?: string; familyMembersCount?: number; donationAmount?: number },
  ): Observable<{ message: string; registration: { id: string; invoiceId?: string; status: string } }> {
    return this.http.post<{ message: string; registration: { id: string; invoiceId?: string; status: string } }>(
      `${this.base}/${eventId}/register`,
      dto,
    );
  }

  // ── Distribution ────────────────────────────────────────────────────────────

  getDistributionItems(eventId: string): Observable<DistributionItem[]> {
    return this.http.get<DistributionItem[]>(`${this.base}/${eventId}/distribution-items`);
  }

  createDistributionItem(
    eventId: string,
    dto: Partial<DistributionItem>,
  ): Observable<DistributionItem> {
    return this.http.post<DistributionItem>(`${this.base}/${eventId}/distribution-items`, dto);
  }

  updateDistributionItem(
    eventId: string,
    itemId: string,
    dto: Partial<DistributionItem>,
  ): Observable<DistributionItem> {
    return this.http.patch<DistributionItem>(
      `${this.base}/${eventId}/distribution-items/${itemId}`,
      dto,
    );
  }

  deleteDistributionItem(eventId: string, itemId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${eventId}/distribution-items/${itemId}`);
  }

  distribute(
    eventId: string,
    dto: {
      registrationId: string;
      distributionItemId: string;
      recipientType: 'main' | 'family';
      quantity: number;
    },
  ): Observable<DistributionRecord> {
    return this.http.post<DistributionRecord>(`${this.base}/${eventId}/booth/distribute`, dto);
  }

  // Booth QR token lookup
  boothLookupByToken(
    eventId: string,
    reg: string,
    sig: string,
  ): Observable<{ registration: unknown; distributions: DistributionRecord[] }> {
    return this.http.get<{ registration: unknown; distributions: DistributionRecord[] }>(
      `${this.base}/${eventId}/booth/by-reg`,
      { params: { reg, sig } },
    );
  }

  getDistributionSummary(eventId: string): Observable<DistributionSummaryItem[]> {
    return this.http.get<DistributionSummaryItem[]>(
      `${this.base}/${eventId}/admin/distribution-summary`,
    );
  }

  getDistributionLog(
    eventId: string,
    skip = 0,
    take = 50,
  ): Observable<{ data: DistributionRecord[]; total: number }> {
    return this.http.get<{ data: DistributionRecord[]; total: number }>(
      `${this.base}/${eventId}/admin/distributions`,
      { params: { skip: String(skip), take: String(take) } },
    );
  }

  getRegistrationDistributions(
    eventId: string,
  ): Observable<{ distributions: DistributionRecord[]; items: DistributionItem[] }> {
    return this.http.get<{ distributions: DistributionRecord[]; items: DistributionItem[] }>(
      `${this.base}/${eventId}/registration/distributions`,
    );
  }
}
