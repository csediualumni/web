import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  AccountingService,
  AuditReport,
  ReportData,
  formatBDT,
  MONTH_NAMES,
} from '../core/accounting.service';

@Component({
  selector: 'app-accounting-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accounting-reports.component.html',
})
export class AccountingReportsComponent implements OnInit {
  loading = signal(true);
  error = signal('');
  reports = signal<AuditReport[]>([]);

  selectedReport = signal<ReportData | null>(null);
  loadingDetail = signal(false);

  readonly formatBDT = formatBDT;
  readonly MONTH_NAMES = MONTH_NAMES;

  private readonly svc = inject(AccountingService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.svc.getPublishedReports().subscribe({
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
        this.error.set('Failed to load report.');
        this.loadingDetail.set(false);
      },
    });
  }

  closeDetail(): void {
    this.selectedReport.set(null);
  }

  printReport(): void {
    window.print();
  }

  monthName(m: number): string {
    return MONTH_NAMES[m - 1] ?? '';
  }
}
