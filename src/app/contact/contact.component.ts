import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../core/admin.service';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './contact.component.html',
})
export class ContactComponent {
  form: ContactForm = { name: '', email: '', subject: '', message: '' };
  submitted = signal(false);
  submitting = signal(false);
  error = signal('');

  readonly subjects = [
    'General Inquiry',
    'Membership / Registration',
    'Technical Issue',
    'Events & Reunions',
    'Mentorship Programme',
    'Job Postings / Career',
    'Media & Press',
    'Other',
  ];

  readonly contactInfo = [
    {
      icon: 'fa-location-dot',
      label: 'Address',
      lines: [
        'Department of Computer Science & Engineering (CSE), Dhaka International University',
        'Satarkul, Badda, Dhaka-1212, Bangladesh',
      ],
      link: null,
    },
    {
      icon: 'fa-envelope',
      label: 'Email',
      lines: ['support@csediualumni.com'],
      link: 'mailto:support@csediualumni.com',
    },
    {
      icon: 'fa-phone',
      label: 'Phone',
      lines: ['+880 1624-350761'],
      link: 'tel:+8801624350761',
    },
    {
      icon: 'fa-clock',
      label: 'Office Hours',
      lines: ['Always Open'],
      link: null,
    },
  ];

  readonly faqs = [
    {
      q: 'Who can join the CSE DIU Alumni Network?',
      a: 'Any graduate or current student of the CSE department at Dhaka International University can register for free.',
    },
    {
      q: 'How do I update my profile information?',
      a: 'Log in to your account, go to the Dashboard, and click "Edit Profile" to update your details.',
    },
    {
      q: 'I forgot my password. What should I do?',
      a: 'Use the "Sign in with Google" option or contact us at support@csediualumni.com and we will help you recover access.',
    },
    {
      q: 'How can I post a job opportunity for alumni?',
      a: 'Once logged in, navigate to the Job Board and use the "Post a Job" button. All posts are reviewed before publishing.',
    },
  ];

  openFaqs = signal<number[]>([]);

  private readonly adminService = inject(AdminService);

  toggleFaq(index: number) {
    this.openFaqs.update((open) =>
      open.includes(index) ? open.filter((i) => i !== index) : [...open, index],
    );
  }

  isFaqOpen(index: number): boolean {
    return this.openFaqs().includes(index);
  }

  submitForm() {
    this.error.set('');
    const { name, email, subject, message } = this.form;
    if (!name.trim() || !email.trim() || !subject || !message.trim()) {
      this.error.set('Please fill in all fields before submitting.');
      return;
    }
    if (!email.includes('@')) {
      this.error.set('Please enter a valid email address.');
      return;
    }
    this.submitting.set(true);
    this.adminService
      .submitContactForm({
        name: name.trim(),
        email: email.trim(),
        subject,
        message: message.trim(),
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.submitted.set(true);
          this.form = { name: '', email: '', subject: '', message: '' };
        },
        error: () => {
          this.submitting.set(false);
          this.error.set('Failed to send your message. Please try again later.');
        },
      });
  }
}
