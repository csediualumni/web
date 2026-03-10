import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StatsService } from '../core/stats.service';
import { AdminService, Milestone, Committee } from '../core/admin.service';
import { colorFor, initialsFor } from '../committee/committee.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about.component.html',
})
export class AboutComponent implements OnInit {
  private statsService = inject(StatsService);
  private adminService = inject(AdminService);

  readonly stats$ = this.statsService.iconStats$;

  milestones = signal<Milestone[] | null>(null);
  milestonesError = signal(false);

  currentCommittee = signal<Committee | null>(null);
  committeeLoading = signal(true);

  ngOnInit(): void {
    this.adminService.getMilestones().subscribe({
      next: (data) => this.milestones.set(data),
      error: () => this.milestonesError.set(true),
    });

    this.adminService.getCommittees().subscribe({
      next: (data) => {
        this.currentCommittee.set(data.find((c) => c.isCurrent) ?? null);
        this.committeeLoading.set(false);
      },
      error: () => this.committeeLoading.set(false),
    });
  }

  colorFor = colorFor;
  initialsFor = initialsFor;

  readonly values = [
    {
      icon: 'fa-handshake',
      title: 'Community First',
      desc: 'Every decision we make puts the alumni community at the centre — inclusive, respectful, and collaborative.',
    },
    {
      icon: 'fa-lightbulb',
      title: 'Innovation',
      desc: 'We celebrate the engineering spirit. The platform itself is built and improved by our own alumni.',
    },
    {
      icon: 'fa-seedling',
      title: 'Giving Back',
      desc: 'Senior members mentor juniors, share opportunities, and contribute to making the next batch stronger.',
    },
    {
      icon: 'fa-globe',
      title: 'Global Reach',
      desc: 'Alumni from 80+ countries form a worldwide professional network accessible to every member.',
    },
    {
      icon: 'fa-shield-halved',
      title: 'Trust & Privacy',
      desc: 'Member data is treated with the highest standards of privacy and security.',
    },
    {
      icon: 'fa-infinity',
      title: 'Lifelong Connection',
      desc: 'Whether you graduated 2 years ago or 20, this is your network — now and always.',
    },
  ];
}
