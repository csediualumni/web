import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export type EventStatus = 'upcoming' | 'ongoing' | 'past';
export type EventMode = 'In-Person' | 'Online' | 'Hybrid';

export interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  date: string; // display string
  time: string;
  location: string;
  city: string;
  mode: EventMode;
  category: string;
  status: EventStatus;
  seats?: number;
  seatsLeft?: number;
  image: string; // fa icon
  color: string; // bg for placeholder
  featured?: boolean;
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './events.component.html',
})
export class EventsComponent {
  readonly categories = ['All', 'Reunion', 'Workshop', 'Seminar', 'Sports', 'Cultural', 'Webinar'];
  readonly tabs: EventStatus[] = ['upcoming', 'past'];

  activeTab = signal<EventStatus>('upcoming');
  activeCategory = signal('All');

  readonly events: CalendarEvent[] = [
    // ── Upcoming ──────────────────────────────────────────
    {
      id: 1,
      title: 'Grand Alumni Reunion 2026',
      description:
        'The biggest annual gathering of CSE DIU alumni from every batch and every corner of the globe. Dinner, awards, and networking.',
      date: 'April 12, 2026',
      time: '5:00 PM – 10:00 PM',
      location: 'DIU Permanent Campus, Birulia',
      city: 'Dhaka',
      mode: 'In-Person',
      category: 'Reunion',
      status: 'upcoming',
      seats: 500,
      seatsLeft: 148,
      image: 'fa-people-group',
      color: 'bg-zinc-200',
      featured: true,
    },
    {
      id: 2,
      title: 'AI & Machine Learning Bootcamp',
      description:
        'A two-day intensive bootcamp on modern AI/ML techniques, LLMs, and deployment — co-facilitated by alumni engineers from Google and Microsoft.',
      date: 'March 22–23, 2026',
      time: '9:00 AM – 5:00 PM',
      location: 'DIU Innovation Lab',
      city: 'Dhaka',
      mode: 'Hybrid',
      category: 'Workshop',
      status: 'upcoming',
      seats: 80,
      seatsLeft: 12,
      image: 'fa-brain',
      color: 'bg-violet-100',
    },
    {
      id: 3,
      title: 'Career Fair: Tech Edition 2026',
      description:
        'Connect with leading tech companies actively hiring CSE graduates. CV review stations, mock interviews, and on-the-spot offers.',
      date: 'March 28, 2026',
      time: '10:00 AM – 4:00 PM',
      location: 'DIU Auditorium',
      city: 'Dhaka',
      mode: 'In-Person',
      category: 'Seminar',
      status: 'upcoming',
      seats: 300,
      seatsLeft: 87,
      image: 'fa-briefcase',
      color: 'bg-sky-100',
    },
    {
      id: 4,
      title: 'Open Source Sprint Weekend',
      description:
        'A 48-hour collaborative sprint where alumni and students contribute to open-source projects together. Prizes for top contributors.',
      date: 'April 5–6, 2026',
      time: '10:00 AM (starts)',
      location: 'Online — Discord + GitHub',
      city: 'Remote',
      mode: 'Online',
      category: 'Workshop',
      status: 'upcoming',
      seats: 200,
      seatsLeft: 134,
      image: 'fa-code-branch',
      color: 'bg-emerald-100',
    },
    {
      id: 5,
      title: 'Batch 2020 Mini-Reunion',
      description:
        'Class of 2020 getting back together 6 years on — dinner, memories, and a look at where we all ended up.',
      date: 'April 19, 2026',
      time: '7:00 PM – 11:00 PM',
      location: 'The Westin Dhaka',
      city: 'Dhaka',
      mode: 'In-Person',
      category: 'Reunion',
      status: 'upcoming',
      seats: 120,
      seatsLeft: 44,
      image: 'fa-users',
      color: 'bg-amber-100',
    },
    {
      id: 6,
      title: 'Cloud Careers Webinar',
      description:
        'Alumni cloud engineers from AWS, Azure, and GCP share how they broke into cloud roles — paths, certs, and lessons learned.',
      date: 'March 15, 2026',
      time: '8:00 PM – 9:30 PM',
      location: 'Zoom (link sent on registration)',
      city: 'Remote',
      mode: 'Online',
      category: 'Webinar',
      status: 'upcoming',
      seats: 500,
      seatsLeft: 263,
      image: 'fa-cloud',
      color: 'bg-cyan-100',
    },
    {
      id: 7,
      title: 'Inter-Alumni Cricket League',
      description:
        'Batch vs batch cricket tournament running over three weekends. Register your team of 11 by March 10.',
      date: 'March 21, April 4, April 18',
      time: '8:00 AM – 6:00 PM',
      location: 'DIU Sports Ground',
      city: 'Dhaka',
      mode: 'In-Person',
      category: 'Sports',
      status: 'upcoming',
      seats: 160,
      seatsLeft: 32,
      image: 'fa-baseball-bat-ball',
      color: 'bg-lime-100',
    },
    {
      id: 8,
      title: 'Baishakhi Cultural Evening',
      description:
        'A celebration of Bangla New Year with music, food, and performances by alumni — open to all members and families.',
      date: 'April 14, 2026',
      time: '4:00 PM – 9:00 PM',
      location: 'DIU Campus Lawn',
      city: 'Dhaka',
      mode: 'In-Person',
      category: 'Cultural',
      status: 'upcoming',
      seats: 400,
      seatsLeft: 218,
      image: 'fa-music',
      color: 'bg-rose-100',
    },

    // ── Past ──────────────────────────────────────────────
    {
      id: 9,
      title: 'Grand Alumni Reunion 2025',
      description:
        "Over 800 alumni came together for the biggest reunion in the network's history with live performances, awards, and dinner.",
      date: 'April 10, 2025',
      time: '5:00 PM – 10:00 PM',
      location: 'DIU Permanent Campus',
      city: 'Dhaka',
      mode: 'In-Person',
      category: 'Reunion',
      status: 'past',
      image: 'fa-people-group',
      color: 'bg-zinc-200',
    },
    {
      id: 10,
      title: 'Cybersecurity Workshop 2025',
      description:
        'Hands-on penetration testing and ethical hacking sessions led by alumni security experts from KPMG and PwC.',
      date: 'February 15, 2025',
      time: '9:00 AM – 6:00 PM',
      location: 'DIU Innovation Lab',
      city: 'Dhaka',
      mode: 'In-Person',
      category: 'Workshop',
      status: 'past',
      image: 'fa-shield-halved',
      color: 'bg-red-100',
    },
    {
      id: 11,
      title: 'Convocation Ceremony 2025',
      description:
        'Celebrating the graduating class of 2025 with an official university convocation ceremony attended by 1,200+ guests.',
      date: 'January 20, 2025',
      time: '10:00 AM – 2:00 PM',
      location: 'DIU Auditorium',
      city: 'Dhaka',
      mode: 'In-Person',
      category: 'Seminar',
      status: 'past',
      image: 'fa-graduation-cap',
      color: 'bg-yellow-100',
    },
    {
      id: 12,
      title: 'Web Dev Hackathon 2024',
      description:
        '24-hour hackathon with 300+ participants solving real-world problems — judged by a panel of 12 senior alumni engineers.',
      date: 'November 8–9, 2024',
      time: '10:00 AM (48 hrs)',
      location: 'Online',
      city: 'Remote',
      mode: 'Online',
      category: 'Workshop',
      status: 'past',
      image: 'fa-code',
      color: 'bg-indigo-100',
    },
    {
      id: 13,
      title: 'Cultural Fest 2024',
      description:
        'A full-day cultural festival with drama, music, art, and food stalls, bringing together 600+ alumni and families.',
      date: 'October 5, 2024',
      time: '11:00 AM – 9:00 PM',
      location: 'DIU Campus Lawn',
      city: 'Dhaka',
      mode: 'In-Person',
      category: 'Cultural',
      status: 'past',
      image: 'fa-masks-theater',
      color: 'bg-pink-100',
    },
    {
      id: 14,
      title: 'Football Tournament 2024',
      description:
        'Eight teams of alumni and students competed across two days in a tournament final watched by 400+ spectators.',
      date: 'September 20–21, 2024',
      time: '8:00 AM – 6:00 PM',
      location: 'DIU Sports Ground',
      city: 'Dhaka',
      mode: 'In-Person',
      category: 'Sports',
      status: 'past',
      image: 'fa-futbol',
      color: 'bg-lime-100',
    },
  ];

  filteredEvents = computed(() => {
    const tab = this.activeTab();
    const cat = this.activeCategory();
    return this.events.filter((e) => e.status === tab && (cat === 'All' || e.category === cat));
  });

  featuredEvent = computed(() => this.events.find((e) => e.featured && e.status === 'upcoming'));

  upcomingCount = computed(() => this.events.filter((e) => e.status === 'upcoming').length);
  pastCount = computed(() => this.events.filter((e) => e.status === 'past').length);

  setTab(tab: EventStatus) {
    this.activeTab.set(tab);
    this.activeCategory.set('All');
  }

  setCategory(cat: string) {
    this.activeCategory.set(cat);
  }

  occupancyPercent(e: CalendarEvent): number {
    if (!e.seats || e.seatsLeft === undefined) return 0;
    return Math.round(((e.seats - e.seatsLeft) / e.seats) * 100);
  }

  modeIcon(mode: EventMode): string {
    return mode === 'Online' ? 'fa-wifi' : mode === 'Hybrid' ? 'fa-layer-group' : 'fa-location-dot';
  }

  statusBadge(e: CalendarEvent): { label: string; classes: string } {
    if (e.seatsLeft !== undefined && e.seatsLeft <= 20) {
      return { label: 'Almost Full', classes: 'bg-red-100 text-red-700' };
    }
    if (e.status === 'upcoming') {
      return { label: 'Open', classes: 'bg-emerald-100 text-emerald-700' };
    }
    return { label: 'Completed', classes: 'bg-zinc-100 text-zinc-500' };
  }
}
