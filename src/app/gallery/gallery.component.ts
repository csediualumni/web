import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { GalleryService, GalleryAlbum, GalleryItem } from '../core/gallery.service';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './gallery.component.html',
})
export class GalleryComponent implements OnInit {
  private readonly gallerySvc = inject(GalleryService);
  readonly auth = inject(AuthService);
  private readonly sanitizer = inject(DomSanitizer);

  loading = signal(true);
  error = signal('');
  albums = signal<GalleryAlbum[]>([]);

  activeCategory = signal('All');
  lightboxItem = signal<GalleryItem | null>(null);
  lightboxAlbum = signal<GalleryAlbum | null>(null);

  readonly categories = computed(() => {
    const cats = [...new Set(this.albums().map((a) => a.category))].sort();
    return ['All', ...cats];
  });

  readonly filteredAlbums = computed(() => {
    const cat = this.activeCategory();
    return cat === 'All' ? this.albums() : this.albums().filter((a) => a.category === cat);
  });

  private readonly flatItems = computed(() => this.filteredAlbums().flatMap((a) => a.items));

  ngOnInit(): void {
    this.gallerySvc.getAlbums().subscribe({
      next: (data) => {
        this.albums.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load gallery. Please try again later.');
        this.loading.set(false);
      },
    });
  }

  setCategory(cat: string): void {
    this.activeCategory.set(cat);
  }

  openLightbox(item: GalleryItem, album: GalleryAlbum): void {
    this.lightboxItem.set(item);
    this.lightboxAlbum.set(album);
  }

  closeLightbox(): void {
    this.lightboxItem.set(null);
    this.lightboxAlbum.set(null);
  }

  navigateLightbox(dir: 1 | -1): void {
    const current = this.lightboxItem();
    if (!current) return;
    const list = this.flatItems();
    const idx = list.findIndex((i) => i.id === current.id);
    const next = list[(idx + dir + list.length) % list.length];
    this.lightboxItem.set(next);
    const album = this.filteredAlbums().find((a) => a.id === next.albumId) ?? null;
    this.lightboxAlbum.set(album);
  }

  readonly totalItems = computed(() =>
    this.filteredAlbums().reduce((sum, a) => sum + a.items.length, 0),
  );

  readonly allItemsCount = computed(() =>
    this.albums().reduce((sum, a) => sum + a.items.length, 0),
  );

  isYoutube(url: string): boolean {
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  isVimeo(url: string): boolean {
    return url.includes('vimeo.com');
  }

  getYoutubeEmbedUrl(url: string): SafeResourceUrl {
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    );
    const embedUrl = match ? `https://www.youtube.com/embed/${match[1]}` : url;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  getVimeoEmbedUrl(url: string): SafeResourceUrl {
    const match = url.match(/vimeo\.com\/(\d+)/);
    const embedUrl = match ? `https://player.vimeo.com/video/${match[1]}` : url;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  getAlbumCover(album: GalleryAlbum): string | null {
    if (album.coverImageUrl) return album.coverImageUrl;
    const first = album.items.find((i) => i.type === 'image');
    return first?.url ?? null;
  }

  getVideoThumb(item: GalleryItem): string | null {
    if (item.thumbnailUrl) return item.thumbnailUrl;
    if (this.isYoutube(item.url)) {
      const match = item.url.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      );
      return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
    }
    return null;
  }

  canManage(): boolean {
    return this.auth.hasPermission('gallery:write');
  }
}
