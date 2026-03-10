import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent {
  sidebarOpen = signal(false);

  navItems = [
    { label: 'Users', path: 'users', icon: 'fa-users' },
    { label: 'Roles & Permissions', path: 'roles', icon: 'fa-shield-halved' },
    { label: 'Membership', path: 'membership', icon: 'fa-id-card' },
    { label: 'Invoices', path: 'invoices', icon: 'fa-file-invoice-dollar' },
    { label: 'Newsletter', path: 'newsletter', icon: 'fa-envelope' },
    { label: 'Contact Tickets', path: 'contact', icon: 'fa-headset' },
    { label: 'History / Milestones', path: 'milestones', icon: 'fa-timeline' },
    { label: 'Committees', path: 'committees', icon: 'fa-crown' },
    { label: 'Events', path: 'events', icon: 'fa-calendar-days' },
    { label: 'Campaigns', path: 'campaigns', icon: 'fa-hand-holding-heart' },
    { label: 'Gallery', path: 'gallery', icon: 'fa-images' },
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
