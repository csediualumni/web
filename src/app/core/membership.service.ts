import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type MembershipStatus = 'payment_required' | 'payment_submitted' | 'approved' | 'rejected';

export interface MembershipInvoice {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  payments: {
    id: string;
    amount: number;
    transactionId: string;
    status: string;
    createdAt: string;
  }[];
}

export interface MembershipApplication {
  id: string;
  userId: string;
  invoiceId: string | null;
  status: MembershipStatus;
  termsAcceptedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
  memberId: string | null;
  createdAt: string;
  updatedAt: string;
  invoice?: MembershipInvoice | null;
  user?: {
    id: string;
    email: string;
    displayName: string | null;
  };
}

export interface ApplyResponse {
  applicationId: string;
  invoiceId: string;
  paymentUrl: string;
}

@Injectable({ providedIn: 'root' })
export class MembershipService {
  private readonly base = `${environment.apiUrl}/membership`;

  private readonly http = inject(HttpClient);

  /** Submit a new membership application */
  apply(): Observable<ApplyResponse> {
    return this.http.post<ApplyResponse>(`${this.base}/apply`, {});
  }

  /** Get current user's own application */
  getMyApplication(): Observable<MembershipApplication> {
    return this.http.get<MembershipApplication>(`${this.base}/my`);
  }

  /** [Admin] List all membership applications */
  listRequests(): Observable<MembershipApplication[]> {
    return this.http.get<MembershipApplication[]>(`${this.base}/requests`);
  }

  /** [Admin] Get a single application */
  getRequest(id: string): Observable<MembershipApplication> {
    return this.http.get<MembershipApplication>(`${this.base}/requests/${id}`);
  }

  /** [Admin] Approve an application */
  approve(id: string): Observable<MembershipApplication> {
    return this.http.patch<MembershipApplication>(`${this.base}/requests/${id}/approve`, {});
  }

  /** [Admin] Reject an application */
  reject(id: string, reason: string): Observable<MembershipApplication> {
    return this.http.patch<MembershipApplication>(`${this.base}/requests/${id}/reject`, { reason });
  }
}
