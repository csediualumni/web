import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();

  newsletterEmail = signal('');
  subscribed = signal(false);
  subscribing = signal(false);

  subscribeNewsletter() {
    const email = this.newsletterEmail().trim();
    if (!email || !email.includes('@')) return;
    this.subscribing.set(true);
    // Simulate API call
    setTimeout(() => {
      this.subscribing.set(false);
      this.subscribed.set(true);
      this.newsletterEmail.set('');
    }, 800);
  }
}
