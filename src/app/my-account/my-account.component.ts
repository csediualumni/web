import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-my-account',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './my-account.component.html',
})
export class MyAccountComponent {
  sidebarOpen = signal(false);

  readonly navItems = [
    { label: 'Overview', path: 'overview', icon: 'fa-house' },
    { label: 'Edit Profile', path: 'profile', icon: 'fa-user-pen' },
    { label: 'Membership', path: 'membership', icon: 'fa-id-card' },
    { label: 'My Invoices', path: 'invoices', icon: 'fa-file-invoice-dollar' },
    { label: 'My Events', path: 'events', icon: 'fa-calendar-check' },
    { label: 'My Research', path: 'research', icon: 'fa-microscope' },
    { label: 'Mentorship', path: 'mentor', icon: 'fa-chalkboard-user' },
    { label: 'My Research Papers', path: 'research', icon: 'fa-file-lines' },
  ];

  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
