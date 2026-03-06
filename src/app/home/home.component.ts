import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  readonly stats = [
    { value: '5,000+', label: 'Alumni Members' },
    { value: '120+', label: 'Batches' },
    { value: '80+', label: 'Countries' },
    { value: '200+', label: 'Events Hosted' },
  ];

  readonly features = [
    {
      icon: 'fa-users',
      title: 'Alumni Directory',
      desc: 'Connect with CSE DIU graduates around the world. Search by batch, industry, or location.',
    },
    {
      icon: 'fa-calendar-days',
      title: 'Events & Reunions',
      desc: 'Stay updated on upcoming alumni gatherings, workshops, seminars, and annual reunions.',
    },
    {
      icon: 'fa-briefcase',
      title: 'Career Opportunities',
      desc: 'Explore exclusive job postings, internships, and referrals shared within the alumni network.',
    },
    {
      icon: 'fa-handshake',
      title: 'Mentorship',
      desc: 'Get guidance from experienced seniors or give back by mentoring current students.',
    },
    {
      icon: 'fa-newspaper',
      title: 'News & Research',
      desc: 'Read the latest achievements, research papers, and announcements from the community.',
    },
    {
      icon: 'fa-medal',
      title: 'Scholarships',
      desc: 'Discover scholarship opportunities supported and promoted by our alumni community.',
    },
  ];

  ctaAction() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/auth/register']);
    }
  }

  get ctaLabel(): string {
    return this.auth.isLoggedIn() ? 'Go to Dashboard' : 'Join the Network';
  }

  get ctaIcon(): string {
    return this.auth.isLoggedIn() ? 'fa-gauge' : 'fa-user-plus';
  }
}
