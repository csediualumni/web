import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StatsService } from '../core/stats.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about.component.html',
})
export class AboutComponent {
  private statsService = inject(StatsService);
  readonly stats$ = this.statsService.iconStats$;

  readonly milestones = [
    {
      year: '2002',
      title: 'Department Founded',
      desc: 'The Department of Computer Science & Engineering was established at Dhaka International University, launching the first batch of CSE students.',
    },
    {
      year: '2008',
      title: 'Alumni Association Formed',
      desc: 'Early graduates formed the first informal alumni group to maintain ties with the university and support incoming students.',
    },
    {
      year: '2015',
      title: 'Community Milestones',
      desc: 'The alumni network surpassed 1,000 registered members. Career fairs and mentorship programmes were formally introduced.',
    },
    {
      year: '2020',
      title: 'Going Digital',
      desc: 'A dedicated digital platform was launched enabling global alumni to connect, share opportunities, and collaborate remotely.',
    },
    {
      year: '2024',
      title: 'New Platform',
      desc: 'The current CSE DIU Alumni Network was rebuilt from the ground up — faster, smarter, and designed for the next generation.',
    },
  ];

  readonly team = [
    {
      name: 'Dr. Md. Sazzadur Rahman',
      role: 'Head of Department, CSE',
      icon: 'fa-user-tie',
      initials: 'SR',
    },
    {
      name: 'Alumni Executive Board',
      role: 'Elected representatives from each graduating class.',
      icon: 'fa-people-group',
      initials: 'EB',
    },
    {
      name: 'Technical Committee',
      role: 'Volunteer alumni engineers who build and maintain the platform.',
      icon: 'fa-code',
      initials: 'TC',
    },
    {
      name: 'Events & Outreach',
      role: 'Organises reunions, seminars, and community initiatives.',
      icon: 'fa-calendar-star',
      initials: 'EO',
    },
  ];

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
