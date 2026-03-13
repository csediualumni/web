import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { SiteConfigService } from '../../core/site-config.service';

export interface NavLink {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  private router = inject(Router);
  auth = inject(AuthService);
  siteConfig = inject(SiteConfigService);

  mobileMenuOpen = signal(false);
  userDropdownOpen = signal(false);
  scrolled = signal(false);

  readonly navLinks: NavLink[] = [
    { label: 'Home', path: '/', icon: 'fa-house' },
    { label: 'About', path: '/about', icon: 'fa-circle-info' },
    { label: 'Alumni', path: '/alumni', icon: 'fa-users' },
    { label: 'Committee', path: '/committee', icon: 'fa-crown' },
    { label: 'Events', path: '/events', icon: 'fa-calendar-days' },
    { label: 'Donate', path: '/donations', icon: 'fa-hand-holding-heart' },
    { label: 'Gallery', path: '/gallery', icon: 'fa-images' },
    { label: 'Contact', path: '/contact', icon: 'fa-envelope' },
  ];

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 12);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('#user-menu-btn') && !target.closest('#user-menu-dropdown')) {
      this.userDropdownOpen.set(false);
    }
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update((v) => !v);
  }

  toggleUserDropdown() {
    this.userDropdownOpen.update((v) => !v);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  isAdmin(): boolean {
    return this.auth.hasPermission('users:read');
  }

  logout() {
    this.auth.logout();
    this.userDropdownOpen.set(false);
    this.mobileMenuOpen.set(false);
    this.router.navigate(['/auth/login']);
  }

  get userInitial(): string {
    const email = this.auth.currentUser()?.email ?? '';
    return email ? email[0].toUpperCase() : '?';
  }

  get userEmail(): string {
    return this.auth.currentUser()?.email ?? '';
  }

  get userAvatar(): string | null {
    return this.auth.currentUser()?.profile?.avatar ?? null;
  }
}
