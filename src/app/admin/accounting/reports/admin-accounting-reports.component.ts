import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AccountingService,
  AuditReport,
  ReportData,
  CreateAuditReportDto,
  formatBDT,
  MONTH_NAMES,
} from '../../../core/accounting.service';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-admin-accounting-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-accounting-reports.component.html',
})
export class AdminAccountingReportsComponent implements OnInit {
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  success = signal('');

  reports = signal<AuditReport[]>([]);
  selectedReport = signal<ReportData | null>(null);
  loadingDetail = signal(false);

  showCreateForm = signal(false);
  formMonth = signal<number>(new Date().getMonth() + 1);
  formYear = signal<number>(new Date().getFullYear());
  formOpeningBalance = signal<number>(0);
  formSummary = signal('');

  readonly formatBDT = formatBDT;
  readonly MONTH_NAMES = MONTH_NAMES;
  readonly years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  readonly auth = inject(AuthService);
  private readonly svc = inject(AccountingService);

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loading.set(true);
    this.svc.getAllReports().subscribe({
      next: (reports) => {
        this.reports.set(reports);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load reports.');
        this.loading.set(false);
      },
    });
  }

  viewReport(report: AuditReport): void {
    this.loadingDetail.set(true);
    this.svc.getReportData(report.id).subscribe({
      next: (data) => {
        this.selectedReport.set(data);
        this.loadingDetail.set(false);
      },
      error: () => {
        this.error.set('Failed to load report data.');
        this.loadingDetail.set(false);
      },
    });
  }

  closeDetail(): void {
    this.selectedReport.set(null);
  }

  createReport(): void {
    const dto: CreateAuditReportDto = {
      month: this.formMonth(),
      year: this.formYear(),
      openingBalance: this.formOpeningBalance(),
      summary: this.formSummary() || undefined,
    };
    this.saving.set(true);
    this.svc.createReport(dto).subscribe({
      next: () => {
        this.saving.set(false);
        this.showCreateForm.set(false);
        this.success.set('Report created.');
        this.loadReports();
        setTimeout(() => this.success.set(''), 3000);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.message ?? 'Failed to create report.');
      },
    });
  }

  publish(report: AuditReport): void {
    this.svc.publishReport(report.id).subscribe({
      next: (updated) => this.reports.update((list) => list.map((r) => (r.id === updated.id ? updated : r))),
      error: () => this.error.set('Failed to publish report.'),
    });
  }

  unpublish(report: AuditReport): void {
    this.svc.unpublishReport(report.id).subscribe({
      next: (updated) => this.reports.update((list) => list.map((r) => (r.id === updated.id ? updated : r))),
      error: () => this.error.set('Failed to unpublish report.'),
    });
  }

  deleteReport(report: AuditReport): void {
    if (!confirm(`Delete the ${MONTH_NAMES[report.month - 1]} ${report.year} report?`)) return;
    this.svc.deleteReport(report.id).subscribe({
      next: () => this.reports.update((list) => list.filter((r) => r.id !== report.id)),
      error: () => this.error.set('Failed to delete report.'),
    });
  }

  printReport(): void {
    window.print();
  }

  monthName(m: number): string {
    return MONTH_NAMES[m - 1] ?? '';
  }
}
