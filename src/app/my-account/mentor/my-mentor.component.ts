import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService, AdminMentorApplication, ApplicationStatus } from '../../core/admin.service';

@Component({
  selector: 'app-my-mentor',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-mentor.component.html',
})
export class MyMentorComponent implements OnInit {
  private readonly admin = inject(AdminService);

  application = signal<AdminMentorApplication | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  statusLabel(status: ApplicationStatus): string {
    const labels: Record<ApplicationStatus, string> = {
      pending: 'Pending Review',
      reviewing: 'Under Review',
      accepted: 'Accepted',
      rejected: 'Rejected',
    };
    return labels[status];
  }

  statusClass(status: ApplicationStatus): string {
    const classes: Record<ApplicationStatus, string> = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      reviewing: 'bg-blue-100 text-blue-700 border-blue-200',
      accepted: 'bg-green-100 text-green-700 border-green-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
    };
    return classes[status];
  }

  statusIcon(status: ApplicationStatus): string {
    const icons: Record<ApplicationStatus, string> = {
      pending: 'fa-clock',
      reviewing: 'fa-magnifying-glass',
      accepted: 'fa-circle-check',
      rejected: 'fa-circle-xmark',
    };
    return icons[status];
  }

  ngOnInit(): void {
    this.admin.getMyMentorApplication().subscribe({
      next: (app) => {
        this.application.set(app);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load your application. Please try again.');
        this.loading.set(false);
      },
    });
  }
}
