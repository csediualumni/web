import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface GalleryItem {
  id: number;
  title: string;
  category: string;
  year: number;
  placeholder: string; // icon fallback
  color: string;       // bg color for placeholder tile
  description: string;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './gallery.component.html',
})
export class GalleryComponent {
  readonly categories = ['All', 'Reunion', 'Convocation', 'Workshop', 'Sports', 'Cultural'];

  activeCategory = signal('All');
  lightboxItem = signal<GalleryItem | null>(null);

  readonly items: GalleryItem[] = [
    { id: 1,  title: 'Grand Reunion 2023',         category: 'Reunion',      year: 2023, placeholder: 'fa-people-group',      color: 'bg-zinc-200', description: 'Annual grand reunion of CSE DIU alumni gathered from across the country and abroad.' },
    { id: 2,  title: 'Convocation Ceremony 2023',  category: 'Convocation',  year: 2023, placeholder: 'fa-graduation-cap',    color: 'bg-sky-100',  description: 'Proud graduates receiving their degrees at the 2023 Daffodil International University convocation.' },
    { id: 3,  title: 'AI/ML Workshop 2023',         category: 'Workshop',     year: 2023, placeholder: 'fa-brain',             color: 'bg-violet-100', description: 'Hands-on machine learning workshop co-organised by alumni from top tech firms.' },
    { id: 4,  title: 'Cricket League 2023',         category: 'Sports',       year: 2023, placeholder: 'fa-baseball-bat-ball', color: 'bg-emerald-100', description: 'Alumni vs students cricket match as part of the annual sports day festivities.' },
    { id: 5,  title: 'Cultural Night 2022',         category: 'Cultural',     year: 2022, placeholder: 'fa-music',             color: 'bg-rose-100', description: 'A vibrant evening of performances, music, and celebration by CSE DIU alumni.' },
    { id: 6,  title: 'Batch 2018 Mini-Reunion',     category: 'Reunion',      year: 2022, placeholder: 'fa-users',             color: 'bg-amber-100', description: 'Batch 2018 celebrated their 4-year post-graduation milestone with a mini reunion.' },
    { id: 7,  title: 'Cloud Computing Bootcamp',    category: 'Workshop',     year: 2022, placeholder: 'fa-cloud',             color: 'bg-cyan-100', description: 'Three-day AWS cloud computing bootcamp delivered by alumni engineers.' },
    { id: 8,  title: 'Convocation Ceremony 2022',  category: 'Convocation',  year: 2022, placeholder: 'fa-award',             color: 'bg-yellow-100', description: 'Class of 2022 collects their degrees in a grand ceremony at the DIU auditorium.' },
    { id: 9,  title: 'Football Tournament 2022',    category: 'Sports',       year: 2022, placeholder: 'fa-futbol',            color: 'bg-lime-100', description: 'Inter-batch football tournament with 8 teams competing across two weekends.' },
    { id: 10, title: 'Eid Reunion Gathering',       category: 'Reunion',      year: 2021, placeholder: 'fa-star-and-crescent', color: 'bg-orange-100', description: 'Post-Eid reunion dinner bringing alumni together from all over Dhaka.' },
    { id: 11, title: 'Web Dev Hackathon 2021',      category: 'Workshop',     year: 2021, placeholder: 'fa-code',             color: 'bg-indigo-100', description: '24-hour hackathon focused on web technologies with 30+ alumni mentors.' },
    { id: 12, title: 'Cultural Fest 2021',          category: 'Cultural',     year: 2021, placeholder: 'fa-masks-theater',    color: 'bg-pink-100', description: 'Drama, art, and music showcased by current students with alumni judges.' },
  ];

  filteredItems = computed(() => {
    const cat = this.activeCategory();
    return cat === 'All' ? this.items : this.items.filter((i) => i.category === cat);
  });

  setCategory(cat: string) {
    this.activeCategory.set(cat);
  }

  openLightbox(item: GalleryItem) {
    this.lightboxItem.set(item);
  }

  closeLightbox() {
    this.lightboxItem.set(null);
  }

  navigateLightbox(dir: 1 | -1) {
    const current = this.lightboxItem();
    if (!current) return;
    const list = this.filteredItems();
    const idx = list.findIndex((i) => i.id === current.id);
    const next = list[(idx + dir + list.length) % list.length];
    this.lightboxItem.set(next);
  }
}
