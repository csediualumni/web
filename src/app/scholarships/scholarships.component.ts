import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface Scholarship {
  id: number;
  title: string;
  provider: string;
  amount: string;
  currency: string;
  deadline: string;
  eligibility: string;
  level: string;
  country: string;
  type: string;
  description: string;
  tags: string[];
  link: string;
  featured?: boolean;
  urgent?: boolean;
}

@Component({
  selector: 'app-scholarships',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './scholarships.component.html',
})
export class ScholarshipsComponent {
  readonly levels = ['All', 'Undergraduate', 'Postgraduate', 'PhD', 'Short Course'];
  readonly countries = [
    'All',
    'Bangladesh',
    'USA',
    'UK',
    'Canada',
    'Australia',
    'Japan',
    'Germany',
  ];

  activeLevel = signal('All');
  activeCountry = signal('All');

  readonly scholarships: Scholarship[] = [
    {
      id: 1,
      title: 'ICT Division Merit Scholarship 2026',
      provider: 'Bangladesh ICT Division',
      amount: '36,000',
      currency: 'BDT/year',
      deadline: 'March 31, 2026',
      eligibility: 'CSE graduates with CGPA 3.5+',
      level: 'Undergraduate',
      country: 'Bangladesh',
      type: 'Merit-based',
      description:
        'Annual merit scholarship awarded by the Bangladesh ICT Division to outstanding CSE students and recent graduates pursuing higher studies or research.',
      tags: ['Merit-based', 'Government', 'STEM'],
      link: '#',
      featured: true,
      urgent: true,
    },
    {
      id: 2,
      title: 'Fulbright Foreign Student Program',
      provider: 'U.S. Department of State',
      amount: 'Full Funding',
      currency: 'incl. tuition, living, airfare',
      deadline: 'May 15, 2026',
      eligibility: "Bangladeshi nationals with a bachelor's degree",
      level: 'Postgraduate',
      country: 'USA',
      type: 'Government / Full',
      description:
        "Prestigious U.S. government scholarship for Bangladeshi students to pursue a master's or PhD at leading American universities. Includes full tuition, stipend, and airfare.",
      tags: ['Full Funding', 'USA', 'Government'],
      link: '#',
      featured: true,
    },
    {
      id: 3,
      title: 'Commonwealth Scholarship (UK)',
      provider: 'Commonwealth Scholarship Commission',
      amount: 'Full Funding',
      currency: 'incl. tuition + stipend',
      deadline: 'October 15, 2026',
      eligibility: 'Citizens of Commonwealth countries with a first-class degree',
      level: 'PhD',
      country: 'UK',
      type: 'Government / Full',
      description:
        'Fully funded scholarships for citizens of Commonwealth countries to pursue a PhD at top UK universities. Covers tuition, living allowance, and travel.',
      tags: ['Full Funding', 'UK', 'PhD'],
      link: '#',
    },
    {
      id: 4,
      title: 'MEXT Japanese Government Scholarship',
      provider: 'Japanese Ministry of Education',
      amount: 'Full Funding',
      currency: '¥117,000/month + tuition',
      deadline: 'April 30, 2026',
      eligibility: 'Applicants under 35 with strong academic record',
      level: 'Postgraduate',
      country: 'Japan',
      type: 'Government / Full',
      description:
        "Japan's flagship government scholarship covering research students, undergraduate, and technical college students. Includes monthly stipend, tuition, and travel.",
      tags: ['Full Funding', 'Japan', 'Research'],
      link: '#',
    },
    {
      id: 5,
      title: 'DAAD Scholarship (Germany)',
      provider: 'DAAD – German Academic Exchange',
      amount: '934 EUR/month',
      currency: '+ tuition waiver',
      deadline: 'June 30, 2026',
      eligibility: 'Graduates with 2+ years work experience',
      level: 'Postgraduate',
      country: 'Germany',
      type: 'International / Full',
      description:
        "DAAD offers scholarships for master's study and research in Germany. Excellent for CSE graduates looking to study at TU Munich, KIT, or other top German universities.",
      tags: ['DAAD', 'Germany', 'Research'],
      link: '#',
    },
    {
      id: 6,
      title: 'Ontario Graduate Scholarship (Canada)',
      provider: 'Government of Ontario',
      amount: 'CAD 15,000/year',
      currency: '',
      deadline: 'Varies by university',
      eligibility: 'International graduate students enrolled in Ontario universities',
      level: 'Postgraduate',
      country: 'Canada',
      type: 'Provincial',
      description:
        'Merit-based scholarship for graduate students at publicly assisted universities in Ontario, Canada. Amounts vary by institution.',
      tags: ['Canada', 'Graduate', 'Merit'],
      link: '#',
    },
    {
      id: 7,
      title: 'Australia Awards Scholarship',
      provider: 'Australian Government (DFAT)',
      amount: 'Full Funding',
      currency: 'incl. tuition, living, airfare',
      deadline: 'April 30, 2026',
      eligibility: 'Bangladeshi citizens not holding permanent residency in Australia',
      level: 'Postgraduate',
      country: 'Australia',
      type: 'Government / Full',
      description:
        'Prestigious Australian government scholarships supporting individuals from Bangladesh to undertake full-time study or research in Australia.',
      tags: ['Full Funding', 'Australia', 'Government'],
      link: '#',
    },
    {
      id: 8,
      title: 'CSE DIU Alumni Endowment Scholarship',
      provider: 'CSE DIU Alumni Network',
      amount: 'BDT 50,000/year',
      currency: '',
      deadline: 'August 1, 2026',
      eligibility: 'Current CSE DIU students with financial need and CGPA 3.0+',
      level: 'Undergraduate',
      country: 'Bangladesh',
      type: 'Alumni-funded',
      description:
        'A scholarship funded by our own alumni community to support deserving current CSE DIU students who demonstrate both financial need and academic merit.',
      tags: ['Alumni-funded', 'Need-based', 'DIU'],
      link: '#',
    },
    {
      id: 9,
      title: 'Google Generation Scholarship (APAC)',
      provider: 'Google',
      amount: 'USD 1,000',
      currency: '+ Google retreat',
      deadline: 'March 1, 2026',
      eligibility: 'Computer science students in APAC demonstrating leadership',
      level: 'Undergraduate',
      country: 'USA',
      type: 'Corporate',
      description:
        "Google's scholarship for aspiring computer scientists in the APAC region who demonstrate a strong academic record and leadership in their community.",
      tags: ['Google', 'Corporate', 'APAC'],
      link: '#',
    },
  ];

  filteredScholarships = computed(() => {
    const level = this.activeLevel();
    const country = this.activeCountry();
    return this.scholarships.filter(
      (s) => (level === 'All' || s.level === level) && (country === 'All' || s.country === country),
    );
  });

  setLevel(l: string) {
    this.activeLevel.set(l);
  }
  setCountry(c: string) {
    this.activeCountry.set(c);
  }

  readonly stats = [
    { value: '9+', label: 'Active Scholarships', icon: 'fa-medal' },
    { value: '6', label: 'Countries', icon: 'fa-globe' },
    { value: '3', label: 'Fully Funded', icon: 'fa-star' },
    { value: '1', label: 'Alumni-Funded', icon: 'fa-heart' },
  ];
}
