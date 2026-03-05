import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
        'Dept. of CSE, Daffodil International University',
        'Daffodil Smart City, Birulia, Savar',
        'Dhaka-1216, Bangladesh',
      ],
      link: null,
    },
    {
      icon: 'fa-envelope',
      label: 'Email',
      lines: ['alumni@cse.diu.edu.bd'],
      link: 'mailto:alumni@cse.diu.edu.bd',
    },
    {
      icon: 'fa-phone',
      label: 'Phone',
      lines: ['+880 17XX-XXXXXX'],
      link: 'tel:+88017XXXXXXXX',
    },
    {
      icon: 'fa-clock',
      label: 'Office Hours',
      lines: ['Sunday – Thursday', '9:00 AM – 5:00 PM'],
      link: null,
    },
  ];

  readonly faqs = [
    {
      q: 'Who can join the CSE DIU Alumni Network?',
      a: 'Any graduate or current student of the CSE department at Daffodil International University can register for free.',
    },
    {
      q: 'How do I update my profile information?',
      a: 'Log in to your account, go to the Dashboard, and click "Edit Profile" to update your details.',
    },
    {
      q: 'I forgot my password. What should I do?',
      a: 'Use the "Sign in with Google" option or contact us at alumni@cse.diu.edu.bd and we will help you recover access.',
    },
    {
      q: 'How can I post a job opportunity for alumni?',
      a: 'Once logged in, navigate to the Job Board and use the "Post a Job" button. All posts are reviewed before publishing.',
    },
  ];

  openFaqs = signal<number[]>([]);

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
    // Simulate API call
    setTimeout(() => {
      this.submitting.set(false);
      this.submitted.set(true);
      this.form = { name: '', email: '', subject: '', message: '' };
    }, 1000);
  }
}
