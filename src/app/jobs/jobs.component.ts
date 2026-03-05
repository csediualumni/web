import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

export type JobType = 'Full-time' | 'Part-time' | 'Internship' | 'Remote' | 'Contract';

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  country: string;
  type: JobType;
  industry: string;
  experience: string;
  salary: string;
  posted: string;
  deadline: string;
  description: string;
  skills: string[];
  postedBy: string;
  featured?: boolean;
}

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './jobs.component.html',
})
export class JobsComponent {
  searchQuery = signal('');
  selectedType = signal('');
  selectedIndustry = signal('');
  selectedExperience = signal('');

  readonly types: JobType[] = ['Full-time', 'Part-time', 'Internship', 'Remote', 'Contract'];

  readonly industries = [
    'Software Engineering', 'Data Science & AI', 'Cybersecurity', 'Cloud & DevOps',
    'Product Management', 'Finance & Fintech', 'Game Development', 'Academia',
  ];

  readonly experienceLevels = ['Entry Level (0–2 yrs)', 'Mid Level (2–5 yrs)', 'Senior (5–10 yrs)', 'Lead / Principal (10+ yrs)'];

  readonly jobs: Job[] = [
    {
      id: 1, title: 'Senior Software Engineer (Backend)', company: 'Samsung R&D Bangladesh',
      location: 'Dhaka', country: 'Bangladesh', type: 'Full-time', industry: 'Software Engineering',
      experience: 'Senior (5–10 yrs)', salary: 'BDT 1.5L – 2.5L/month',
      posted: 'Mar 4, 2026', deadline: 'Mar 31, 2026',
      description: 'Lead the design and development of scalable back-end services for Samsung\'s global product ecosystem. You will work with a team of international engineers on high-impact projects.',
      skills: ['Java', 'Spring Boot', 'Microservices', 'Kafka', 'AWS'],
      postedBy: 'Ariful Islam (Batch \'18)', featured: true,
    },
    {
      id: 2, title: 'Machine Learning Engineer', company: 'Pathao',
      location: 'Dhaka', country: 'Bangladesh', type: 'Full-time', industry: 'Data Science & AI',
      experience: 'Mid Level (2–5 yrs)', salary: 'BDT 80K – 1.2L/month',
      posted: 'Mar 1, 2026', deadline: 'Mar 25, 2026',
      description: 'Build and maintain ML models powering Pathao\'s recommendation, pricing, and fraud-detection systems. Strong Python and MLOps background required.',
      skills: ['Python', 'TensorFlow', 'MLOps', 'Spark', 'PostgreSQL'],
      postedBy: 'Nusrat Jahan (Batch \'19)',
    },
    {
      id: 3, title: 'Full-Stack Developer (React + Node)', company: 'bKash Limited',
      location: 'Dhaka', country: 'Bangladesh', type: 'Full-time', industry: 'Finance & Fintech',
      experience: 'Mid Level (2–5 yrs)', salary: 'BDT 70K – 1L/month',
      posted: 'Feb 28, 2026', deadline: 'Mar 20, 2026',
      description: 'Develop and maintain consumer-facing features for Bangladesh\'s largest mobile financial service platform. Collaborate with product, design, and QA teams.',
      skills: ['React', 'Node.js', 'TypeScript', 'MySQL', 'Redis'],
      postedBy: 'Fariha Begum (Batch \'21)',
    },
    {
      id: 4, title: 'Cloud Infrastructure Engineer', company: 'Microsoft (Remote)',
      location: 'Remote', country: 'Remote', type: 'Remote', industry: 'Cloud & DevOps',
      experience: 'Senior (5–10 yrs)', salary: 'USD 90K – 130K/yr',
      posted: 'Mar 3, 2026', deadline: 'Apr 5, 2026',
      description: 'Manage and scale Azure cloud infrastructure for enterprise clients across Southeast Asia. Candidates based in Bangladesh and the region are strongly encouraged to apply.',
      skills: ['Azure', 'Kubernetes', 'Terraform', 'CI/CD', 'Ansible'],
      postedBy: 'Sabbir Hassan (Batch \'18)',
    },
    {
      id: 5, title: 'Software Engineering Intern', company: 'Chaldal',
      location: 'Dhaka', country: 'Bangladesh', type: 'Internship', industry: 'Software Engineering',
      experience: 'Entry Level (0–2 yrs)', salary: 'BDT 15K – 20K/month',
      posted: 'Mar 5, 2026', deadline: 'Mar 28, 2026',
      description: 'Work alongside senior engineers on real product features for Bangladesh\'s leading e-commerce grocery platform. Open to final-year CSE students and recent graduates.',
      skills: ['Python', 'Django', 'JavaScript', 'Git'],
      postedBy: 'Rakibul Islam (Batch \'15)',
    },
    {
      id: 6, title: 'Product Manager – Fintech', company: 'Nagad',
      location: 'Dhaka', country: 'Bangladesh', type: 'Full-time', industry: 'Product Management',
      experience: 'Mid Level (2–5 yrs)', salary: 'BDT 1L – 1.5L/month',
      posted: 'Feb 25, 2026', deadline: 'Mar 18, 2026',
      description: 'Own the product roadmap for Nagad\'s consumer wallet and payment features. Collaborate with engineering, design, and regulatory teams to ship impactful products.',
      skills: ['Agile', 'Figma', 'SQL', 'Stakeholder Management'],
      postedBy: 'Sadia Rahman (Batch \'20)',
    },
    {
      id: 7, title: 'Cybersecurity Analyst', company: 'Grameenphone',
      location: 'Dhaka', country: 'Bangladesh', type: 'Full-time', industry: 'Cybersecurity',
      experience: 'Mid Level (2–5 yrs)', salary: 'BDT 80K – 1.1L/month',
      posted: 'Mar 2, 2026', deadline: 'Mar 30, 2026',
      description: 'Monitor, detect, and respond to security threats across Grameenphone\'s infrastructure. Perform vulnerability assessments and champion security awareness.',
      skills: ['SIEM', 'Penetration Testing', 'ISO 27001', 'Wireshark'],
      postedBy: 'Tanvir Ahmed (Batch \'17)',
    },
    {
      id: 8, title: 'Junior Frontend Developer', company: 'Shajgoj',
      location: 'Dhaka', country: 'Bangladesh', type: 'Full-time', industry: 'Software Engineering',
      experience: 'Entry Level (0–2 yrs)', salary: 'BDT 35K – 50K/month',
      posted: 'Mar 5, 2026', deadline: 'Apr 2, 2026',
      description: 'Build and maintain the frontend for Bangladesh\'s leading beauty and lifestyle e-commerce platform. Great opportunity for recent graduates to grow fast.',
      skills: ['Vue.js', 'HTML/CSS', 'Tailwind', 'REST APIs'],
      postedBy: 'Mehnaz Karim (Batch \'23)',
    },
  ];

  filteredJobs = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const type = this.selectedType();
    const industry = this.selectedIndustry();
    const exp = this.selectedExperience();
    return this.jobs.filter((j) => {
      const matchQ = !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.skills.some((s) => s.toLowerCase().includes(q));
      const matchType = !type || j.type === type;
      const matchIndustry = !industry || j.industry === industry;
      const matchExp = !exp || j.experience === exp;
      return matchQ && matchType && matchIndustry && matchExp;
    });
  });

  hasFilters = computed(() => !!this.searchQuery() || !!this.selectedType() || !!this.selectedIndustry() || !!this.selectedExperience());

  clearFilters() {
    this.searchQuery.set('');
    this.selectedType.set('');
    this.selectedIndustry.set('');
    this.selectedExperience.set('');
  }

  typeColor(type: JobType): string {
    const map: Record<JobType, string> = {
      'Full-time': 'bg-emerald-100 text-emerald-700',
      'Part-time': 'bg-sky-100 text-sky-700',
      'Internship': 'bg-violet-100 text-violet-700',
      'Remote': 'bg-amber-100 text-amber-700',
      'Contract': 'bg-rose-100 text-rose-700',
    };
    return map[type] ?? 'bg-zinc-100 text-zinc-600';
  }
}
