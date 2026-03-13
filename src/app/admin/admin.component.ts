import { Component, computed, inject, signal } from '@angular/core';
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

  private readonly allNavItems = [
    { label: 'Users', path: 'users', icon: 'fa-users', permission: 'users:read' },
    { label: 'Roles & Permissions', path: 'roles', icon: 'fa-shield-halved', permission: 'roles:read' },
    { label: 'Membership', path: 'membership', icon: 'fa-id-card', permission: 'membership:read' },
    { label: 'Invoices', path: 'invoices', icon: 'fa-file-invoice-dollar', permission: 'invoices:read' },
    { label: 'Newsletter', path: 'newsletter', icon: 'fa-envelope', permission: 'newsletter:read' },
    { label: 'Contact Tickets', path: 'contact', icon: 'fa-headset', permission: 'contact:read' },
    { label: 'History / Milestones', path: 'milestones', icon: 'fa-timeline', permission: 'milestones:read' },
    { label: 'Committees', path: 'committees', icon: 'fa-crown', permission: 'committees:read' },
    { label: 'Events', path: 'events', icon: 'fa-calendar-days', permission: 'events:read' },
    { label: 'Campaigns', path: 'campaigns', icon: 'fa-hand-holding-heart', permission: 'campaigns:write' },
    { label: 'Gallery', path: 'gallery', icon: 'fa-images', permission: 'gallery:read' },
    { label: 'News', path: 'news', icon: 'fa-newspaper', permission: 'news:read' },
    { label: 'Research', path: 'research', icon: 'fa-microscope', permission: 'research:read' },
    { label: 'Mentors', path: 'mentors', icon: 'fa-chalkboard-user', permission: 'mentors:read' },
    { label: 'Scholarships', path: 'scholarships', icon: 'fa-graduation-cap', permission: 'scholarships:read' },
    { label: 'Job Board', path: 'jobs', icon: 'fa-briefcase', permission: 'jobs:read' },
    { label: 'Site Config', path: 'config', icon: 'fa-gear', permission: 'config:edit' },
  ];

  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly navItems = computed(() =>
    this.allNavItems.filter((item) => this.auth.hasPermission(item.permission)),
  );

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
