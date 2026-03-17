import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MentorshipService } from './mentorship.service';
import type { Mentor, ApplyMentorshipDto } from './mentorship.service';
import { ContentRendererComponent } from '../shared/content-renderer/content-renderer.component';

interface MentorshipForm {
  name: string;
  email: string;
  batch: string;
  area: string;
  goals: string;
  type: string;
}

@Component({
  selector: 'app-mentorship',
  standalone: true,
  imports: [CommonModule, FormsModule, ContentRendererComponent],
  templateUrl: './mentorship.component.html',
})
export class MentorshipComponent implements OnInit {
  private readonly mentorshipSvc = inject(MentorshipService);

  loading = signal(true);
  error = signal('');
  mentors = signal<Mentor[]>([]);

  readonly areas = [
    'Software Engineering',
    'Data Science & AI',
    'Cloud & DevOps',
    'Cybersecurity',
    'Product Management',
    'Career Transition',
    'Higher Studies / Research',
    'Entrepreneurship',
  ];

  activeTab = signal<'mentors' | 'apply'>('mentors');

  form: MentorshipForm = { name: '', email: '', batch: '', area: '', goals: '', type: 'mentee' };
  submitted = signal(false);
  submitting = signal(false);
  formError = signal('');
  submitError = signal('');

  readonly steps = [
    { icon: 'fa-file-signature', title: 'Apply', desc: 'Fill in the mentorship request form with your goals, area of interest, and preferred format.' },
    { icon: 'fa-user-check', title: 'Get Matched', desc: 'Our team reviews your application and matches you with the most suitable mentor within 5–7 days.' },
    { icon: 'fa-handshake', title: 'Connect', desc: 'Receive an introduction email. Schedule your first session and kick off the mentorship journey.' },
    { icon: 'fa-chart-line', title: 'Grow', desc: 'Engage in regular sessions at your chosen cadence. Track progress and reach your goals.' },
  ];

  ngOnInit(): void {
    this.mentorshipSvc.getMentors().subscribe({
      next: (data) => { this.mentors.set(data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load mentors.'); this.loading.set(false); },
    });
  }

  submitForm() {
    this.formError.set('');
    const { name, email, batch, area, goals } = this.form;
    if (!name.trim() || !email.trim() || !batch.trim() || !area || !goals.trim()) {
      this.formError.set('Please fill in all required fields.');
      return;
    }
    if (!email.includes('@')) {
      this.formError.set('Please enter a valid email address.');
      return;
    }
    this.submitting.set(true);
    const dto: ApplyMentorshipDto = {
      name: name.trim(), email: email.trim(),
      batch: batch ? +batch : null,
      area, goals: goals.trim(), type: this.form.type,
    };
    this.mentorshipSvc.apply(dto).subscribe({
      next: () => { this.submitting.set(false); this.submitted.set(true); },
      error: (err: any) => {
        this.submitError.set(err?.error?.message ?? 'Failed to submit. Please try again.');
        this.submitting.set(false);
      },
    });
  }

  getInitials(mentor: Mentor): string {
    if (mentor.initials) return mentor.initials;
    return mentor.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getColor(mentor: Mentor): string { return mentor.color ?? 'bg-slate-600'; }

  stars(): number[] { return Array.from({ length: 5 }, (_, i) => i + 1); }
}
