import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/admin.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();

  newsletterEmail = signal('');
  subscribed  = signal(false);
  subscribing = signal(false);
  subError    = signal('');

  constructor(private adminService: AdminService) {}

  subscribeNewsletter() {
    const email = this.newsletterEmail().trim();
    if (!email || !email.includes('@')) return;
    this.subscribing.set(true);
    this.subError.set('');
    this.adminService.subscribeNewsletter(email).subscribe({
      next: () => {
        this.subscribing.set(false);
        this.subscribed.set(true);
        this.newsletterEmail.set('');
      },
      error: (err) => {
        this.subscribing.set(false);
        const msg: string = err?.error?.message ?? 'Subscription failed. Please try again.';
        this.subError.set(Array.isArray(msg) ? msg[0] : msg);
      },
    });
  }
}
