import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// ── Shared models ─────────────────────────────────────────────────

export type InvoiceStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';
export type InvoiceType = 'donation' | 'event' | 'membership' | 'other';

export interface Invoice {
  id: string;
  type: InvoiceType;
  description: string;
  campaignTitle: string | null;
  totalAmount: number;
  status: InvoiceStatus;
  userId: string | null;
  donorName: string | null;
  donorMessage: string | null;
  isAnonymous: boolean;
  metadata: Record<string, unknown> | null;
  transactionId: string | null;
  valId: string | null;
  gateway: string | null;
  paidAt: string | null;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── DTOs ─────────────────────────────────────────────────────────

export interface CreateInvoiceDto {
  type?: InvoiceType;
  description: string;
  campaignTitle?: string;
  totalAmount: number;
  donorName?: string;
  donorMessage?: string;
  isAnonymous?: boolean;
  metadata?: Record<string, unknown>;
}

export interface RecentDonor {
  donorName: string | null;
  isAnonymous: boolean;
  totalAmount: number;
  campaignTitle: string | null;
  createdAt: string;
  metadata: Record<string, unknown> | null;
}

// ── Helpers ───────────────────────────────────────────────────────

export function isPaid(invoice: Invoice): boolean {
  return invoice.status === 'paid';
}

export function formatBDT(amount: number): string {
  return '৳' + amount.toLocaleString('en-BD');
}

// ── Service ───────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly base = `${environment.apiUrl}/invoices`;

  private readonly http = inject(HttpClient);

  // ── Public ────────────────────────────────────────────────────
  create(dto: CreateInvoiceDto): Observable<Invoice> {
    return this.http.post<Invoice>(this.base, dto);
  }

  getById(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.base}/${id}`);
  }
  getRecentDonors(limit = 8): Observable<RecentDonor[]> {
    return this.http.get<RecentDonor[]>(`${this.base}/donations/recent?limit=${limit}`);
  }
  // ── User self-service ─────────────────────────────
  getMyInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.base}/my`);
  }
  // ── Admin ─────────────────────────────────────────────────────
  listAll(page = 1, limit = 20): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.base}?page=${page}&limit=${limit}`);
  }

  updateInvoiceStatus(id: string, status: InvoiceStatus): Observable<Invoice> {
    return this.http.patch<Invoice>(`${this.base}/${id}/status`, { status });
  }

  updateAdminNote(id: string, adminNote: string): Observable<Invoice> {
    return this.http.patch<Invoice>(`${this.base}/${id}/note`, { adminNote });
  }

  initSslPayment(invoiceId: string): Observable<{ gatewayUrl: string }> {
    return this.http.post<{ gatewayUrl: string }>(
      `${this.base}/${invoiceId}/sslcommerz/init`,
      {},
    );
  }
}
