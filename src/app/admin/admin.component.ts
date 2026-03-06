import { Component, signal } from '@angular/core';
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
    { label: 'Invoices', path: 'invoices', icon: 'fa-file-invoice-dollar' },
    { label: 'Newsletter', path: 'newsletter', icon: 'fa-envelope' },
  ];

  constructor(
    public auth: AuthService,
    private router: Router,
  ) {}

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
