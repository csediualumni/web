import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// ── Models ────────────────────────────────────────────────────

export type CategoryType = 'income' | 'expense' | 'both';
export type TransactionType = 'income' | 'expense';
export type TransactionReferenceType = 'invoice_payment' | 'manual';

export interface AccountCategory {
  id: string;
  name: string;
  type: CategoryType;
  isSystem: boolean;
  createdAt: string;
}

export interface AccountTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  category: AccountCategory;
  description: string;
  date: string;
  referenceId: string | null;
  referenceType: TransactionReferenceType;
  receiptUrl: string | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditReport {
  id: string;
  month: number;
  year: number;
  openingBalance: number;
  totalIncome: number;
  totalExpense: number;
  closingBalance: number;
  summary: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AccountingSummary {
  totalIncome: number;
  totalExpense: number;
  breakdown: { categoryId: string; name: string; type: string; amount: number }[];
}

export interface TransactionPage {
  data: AccountTransaction[];
  total: number;
}

export interface ReportData {
  report: AuditReport;
  incomeTransactions: AccountTransaction[];
  expenseTransactions: AccountTransaction[];
  breakdown: { categoryId: string; name: string; type: string; amount: number }[];
}

// ── DTOs ─────────────────────────────────────────────────────

export interface CreateCategoryDto {
  name: string;
  type?: CategoryType;
}

export interface CreateTransactionDto {
  type: TransactionType;
  amount: number;
  categoryId: string;
  description: string;
  date: string;
  referenceId?: string;
  referenceType?: TransactionReferenceType;
  receiptUrl?: string;
}

export interface CreateAuditReportDto {
  month: number;
  year: number;
  openingBalance: number;
  summary?: string;
}

export interface AutoImportDto {
  month: number;
  year: number;
}

// ── Helpers ───────────────────────────────────────────────────

export function formatBDT(amount: number): string {
  return '৳' + amount.toLocaleString('en-BD');
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ── Service ───────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AccountingService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/accounting`;

  // ── Categories ────────────────────────────────────────────────

  getCategories(): Observable<AccountCategory[]> {
    return this.http.get<AccountCategory[]>(`${this.base}/categories`);
  }

  createCategory(dto: CreateCategoryDto): Observable<AccountCategory> {
    return this.http.post<AccountCategory>(`${this.base}/categories`, dto);
  }

  updateCategory(id: string, dto: CreateCategoryDto): Observable<AccountCategory> {
    return this.http.patch<AccountCategory>(`${this.base}/categories/${id}`, dto);
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/categories/${id}`);
  }

  // ── Transactions ──────────────────────────────────────────────

  getTransactions(filters: {
    type?: string;
    categoryId?: string;
    month?: number;
    year?: number;
    page?: number;
    limit?: number;
  } = {}): Observable<TransactionPage> {
    let params = new HttpParams();
    if (filters.type) params = params.set('type', filters.type);
    if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
    if (filters.month != null) params = params.set('month', filters.month.toString());
    if (filters.year != null) params = params.set('year', filters.year.toString());
    if (filters.page != null) params = params.set('page', filters.page.toString());
    if (filters.limit != null) params = params.set('limit', filters.limit.toString());
    return this.http.get<TransactionPage>(`${this.base}/transactions`, { params });
  }

  createTransaction(dto: CreateTransactionDto): Observable<AccountTransaction> {
    return this.http.post<AccountTransaction>(`${this.base}/transactions`, dto);
  }

  autoImport(dto: AutoImportDto): Observable<{ imported: number }> {
    return this.http.post<{ imported: number }>(`${this.base}/transactions/auto-import`, dto);
  }

  updateTransaction(id: string, dto: Partial<CreateTransactionDto>): Observable<AccountTransaction> {
    return this.http.patch<AccountTransaction>(`${this.base}/transactions/${id}`, dto);
  }

  deleteTransaction(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/transactions/${id}`);
  }

  getSummary(month: number, year: number): Observable<AccountingSummary> {
    const params = new HttpParams().set('month', month).set('year', year);
    return this.http.get<AccountingSummary>(`${this.base}/summary`, { params });
  }

  // ── Audit Reports ─────────────────────────────────────────────

  getAllReports(): Observable<AuditReport[]> {
    return this.http.get<AuditReport[]>(`${this.base}/reports`);
  }

  getPublishedReports(): Observable<AuditReport[]> {
    return this.http.get<AuditReport[]>(`${this.base}/reports/published`);
  }

  getReport(id: string): Observable<AuditReport> {
    return this.http.get<AuditReport>(`${this.base}/reports/${id}`);
  }

  getReportData(id: string): Observable<ReportData> {
    return this.http.get<ReportData>(`${this.base}/reports/${id}/data`);
  }

  createReport(dto: CreateAuditReportDto): Observable<AuditReport> {
    return this.http.post<AuditReport>(`${this.base}/reports`, dto);
  }

  publishReport(id: string): Observable<AuditReport> {
    return this.http.post<AuditReport>(`${this.base}/reports/${id}/publish`, {});
  }

  unpublishReport(id: string): Observable<AuditReport> {
    return this.http.post<AuditReport>(`${this.base}/reports/${id}/unpublish`, {});
  }

  deleteReport(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/reports/${id}`);
  }
}
