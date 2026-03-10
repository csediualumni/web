import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Mentor {
  id: number;
  name: string;
  batch: number;
  role: string;
  company: string;
  country: string;
  city: string;
  expertise: string[];
  bio: string;
  initials: string;
  color: string;
  availability: string;
  mentees: number;
  rating: number;
}

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
  imports: [CommonModule, FormsModule],
  templateUrl: './mentorship.component.html',
})
export class MentorshipComponent {
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

  readonly mentors: Mentor[] = [
    {
      id: 1,
      name: 'Ariful Islam',
      batch: 2018,
      role: 'Senior Software Engineer',
      company: 'Samsung R&D',
      country: 'Bangladesh',
      city: 'Dhaka',
      availability: '2 hrs/week',
      expertise: ['Java', 'System Design', 'Backend Engineering', 'Career Guidance'],
      bio: 'Backend engineer with 8 years at Samsung. Passionate about helping junior devs navigate the backend landscape and break into top-tier tech.',
      initials: 'AI',
      color: 'bg-sky-600',
      mentees: 12,
      rating: 4.9,
    },
    {
      id: 2,
      name: 'Nusrat Jahan',
      batch: 2019,
      role: 'ML Engineer',
      company: 'Google',
      country: 'USA',
      city: 'San Francisco',
      availability: '1 hr/week',
      expertise: ['Machine Learning', 'Python', 'MLOps', 'Research'],
      bio: 'ML engineer at Google working on large-scale AI systems. Mentor specialising in ML career paths, PhD applications, and technical interview prep.',
      initials: 'NJ',
      color: 'bg-violet-600',
      mentees: 8,
      rating: 5.0,
    },
    {
      id: 3,
      name: 'Mahmudul Hasan',
      batch: 2016,
      role: 'DevOps Lead',
      company: 'Thoughtworks',
      country: 'UK',
      city: 'London',
      availability: '3 hrs/week',
      expertise: ['Kubernetes', 'AWS', 'DevOps Culture', 'Architecture'],
      bio: 'DevOps lead helping companies scale engineering practices. Loves mentoring on cloud careers, infrastructure design, and developer productivity.',
      initials: 'MH',
      color: 'bg-emerald-600',
      mentees: 15,
      rating: 4.8,
    },
    {
      id: 4,
      name: 'Sadia Rahman',
      batch: 2020,
      role: 'Product Manager',
      company: 'Shopify',
      country: 'Canada',
      city: 'Toronto',
      availability: '2 hrs/week',
      expertise: ['Product Strategy', 'Agile', 'Career Switching to PM', 'UX'],
      bio: 'PM at Shopify with a background in engineering. Specialises in guiding developers who want to transition into product management roles.',
      initials: 'SR',
      color: 'bg-rose-600',
      mentees: 9,
      rating: 4.7,
    },
    {
      id: 5,
      name: 'Rakibul Islam',
      batch: 2015,
      role: 'Co-Founder & CTO',
      company: 'TechVenture BD',
      country: 'Bangladesh',
      city: 'Dhaka',
      availability: '2 hrs/week',
      expertise: ['Entrepreneurship', 'System Design', 'Startup Strategy', 'Leadership'],
      bio: 'Serial entrepreneur and CTO who has built and scaled two tech startups in Bangladesh. Mentors aspiring founders on idea validation, hiring, and fundraising.',
      initials: 'RI',
      color: 'bg-teal-600',
      mentees: 20,
      rating: 4.9,
    },
    {
      id: 6,
      name: 'Nafis Hossain',
      batch: 2014,
      role: 'PhD Researcher',
      company: 'MIT CSAIL',
      country: 'USA',
      city: 'Boston',
      availability: '1.5 hrs/week',
      expertise: ['Computer Vision', 'PhD Applications', 'Research Writing', 'NLP'],
      bio: 'Researcher at MIT CSAIL focusing on computer vision. Guides alumni through PhD applications, research methodology, and academic publishing.',
      initials: 'NH',
      color: 'bg-cyan-600',
      mentees: 7,
      rating: 5.0,
    },
  ];

  readonly steps = [
    {
      icon: 'fa-file-signature',
      title: 'Apply',
      desc: 'Fill in the mentorship request form with your goals, area of interest, and preferred format.',
    },
    {
      icon: 'fa-user-check',
      title: 'Get Matched',
      desc: 'Our team reviews your application and matches you with the most suitable mentor within 5–7 days.',
    },
    {
      icon: 'fa-handshake',
      title: 'Connect',
      desc: 'Receive an introduction email. Schedule your first session and kick off the mentorship journey.',
    },
    {
      icon: 'fa-chart-line',
      title: 'Grow',
      desc: 'Engage in regular sessions at your chosen cadence. Track progress and reach your goals.',
    },
  ];

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
    setTimeout(() => {
      this.submitting.set(false);
      this.submitted.set(true);
    }, 900);
  }

  stars(): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }
}
