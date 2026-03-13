import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// ── Shared models ─────────────────────────────────────────────────

export type InvoiceStatus = 'pending' | 'partial' | 'paid' | 'cancelled' | 'refunded';
export type InvoiceType = 'donation' | 'event' | 'membership' | 'other';
export type PaymentStatus = 'pending' | 'verified' | 'rejected' | 'refunded';

export interface InvoicePayment {
  id: string;
  invoiceId: string;
  amount: number;
  transactionId: string;
  senderBkash: string | null;
  status: PaymentStatus;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
}

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
  payments: InvoicePayment[];
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

export interface SubmitPaymentDto {
  amount: number;
  transactionId: string;
  senderBkash?: string;
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

export function paidAmount(invoice: Invoice): number {
  return invoice.payments.filter((p) => p.status === 'verified').reduce((s, p) => s + p.amount, 0);
}

export function pendingAmount(invoice: Invoice): number {
  return invoice.payments.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
}

export function dueAmount(invoice: Invoice): number {
  return Math.max(0, invoice.totalAmount - paidAmount(invoice));
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
  submitPayment(invoiceId: string, dto: SubmitPaymentDto): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.base}/${invoiceId}/payments`, dto);
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

  updatePaymentStatus(
    invoiceId: string,
    paymentId: string,
    status: PaymentStatus,
    adminNote?: string,
  ): Observable<Invoice> {
    return this.http.patch<Invoice>(`${this.base}/${invoiceId}/payments/${paymentId}/status`, {
      status,
      adminNote,
    });
  }

  refundPayment(invoiceId: string, paymentId: string, adminNote?: string): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.base}/${invoiceId}/payments/${paymentId}/refund`, {
      adminNote,
    });
  }
}
