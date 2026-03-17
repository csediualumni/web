import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  GalleryService,
  GalleryAlbum,
  GalleryItem,
} from '../../core/gallery.service';
import { AuthService } from '../../core/auth.service';
import { RichTextEditorComponent } from '../../shared/rich-text-editor/rich-text-editor.component';
import { convertToHtml } from '../../shared/content.utils';

type Mode = 'albums' | 'album-form' | 'album-detail';

@Component({
  selector: 'app-admin-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule, RichTextEditorComponent],
  templateUrl: './admin-gallery.component.html',
})
export class AdminGalleryComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly gallerySvc = inject(GalleryService);
  private readonly sanitizer = inject(DomSanitizer);

  // ── State ────────────────────────────────────────────────────
  mode = signal<Mode>('albums');
  loading = signal(true);
  saving = signal(false);
  deleting = signal<Set<string>>(new Set());
  error = signal('');
  success = signal('');

  albums = signal<GalleryAlbum[]>([]);
  activeAlbum = signal<GalleryAlbum | null>(null);
  editingAlbumId = signal<string | null>(null);

  // Item state
  itemLoading = signal(false);
  itemError = signal('');
  uploadingFile = signal(false);

  // ── Album form fields ─────────────────────────────────────────
  formTitle = signal('');
  formDescription = signal('');
  formDescriptionFormat = signal<'html' | 'markdown'>('html');
  formCategory = signal('General');
  formYear = signal(new Date().getFullYear());
  formIsPublished = signal(true);
  formSortOrder = signal(0);

  // ── Add item form ─────────────────────────────────────────────
  showAddItem = signal(false);
  itemType = signal<'image' | 'video'>('image');
  itemUrl = signal('');
  itemThumbnailUrl = signal('');
  itemCaption = signal('');

  readonly categoryOptions = [
    'General', 'Reunion', 'Convocation', 'Workshop', 'Sports', 'Cultural',
    'Seminar', 'Award', 'Trip', 'Other',
  ];

  ngOnInit(): void {
    this.loadAlbums();
  }

  // ── Albums ────────────────────────────────────────────────────

  loadAlbums(): void {
    this.loading.set(true);
    this.error.set('');
    this.gallerySvc.adminGetAlbums().subscribe({
      next: (data) => {
        this.albums.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          err?.status === 403
            ? "You don't have permission to manage the gallery."
            : 'Failed to load albums.',
        );
        this.loading.set(false);
      },
    });
  }

  openCreate(): void {
    this.editingAlbumId.set(null);
    this.formTitle.set('');
    this.formDescription.set('');
    this.formDescriptionFormat.set('html');
    this.formCategory.set('General');
    this.formYear.set(new Date().getFullYear());
    this.formIsPublished.set(true);
    this.formSortOrder.set(0);
    this.error.set('');
    this.success.set('');
    this.mode.set('album-form');
  }

  openEdit(album: GalleryAlbum): void {
    this.editingAlbumId.set(album.id);
    this.formTitle.set(album.title);
    this.formDescription.set(album.description ?? '');
    this.formDescriptionFormat.set('html');
    this.formCategory.set(album.category);
    this.formYear.set(album.year);
    this.formIsPublished.set(album.isPublished);
    this.formSortOrder.set(album.sortOrder);
    this.error.set('');
    this.success.set('');
    this.mode.set('album-form');
  }

  openDetail(album: GalleryAlbum): void {
    this.activeAlbum.set({ ...album });
    this.showAddItem.set(false);
    this.itemType.set('image');
    this.itemUrl.set('');
    this.itemThumbnailUrl.set('');
    this.itemCaption.set('');
    this.itemError.set('');
    this.mode.set('album-detail');
  }

  cancelForm(): void {
    this.mode.set('albums');
    this.editingAlbumId.set(null);
    this.error.set('');
    this.success.set('');
  }

  saveAlbum(): void {
    if (!this.formTitle().trim()) {
      this.error.set('Album title is required.');
      return;
    }
    this.saving.set(true);
    this.error.set('');
    this.success.set('');

    const dto = {
      title: this.formTitle().trim(),
      description: convertToHtml(this.formDescription().trim(), this.formDescriptionFormat()) || undefined,
      category: this.formCategory(),
      year: Number(this.formYear()),
      isPublished: this.formIsPublished(),
      sortOrder: Number(this.formSortOrder()),
    };

    const id = this.editingAlbumId();
    const req = id
      ? this.gallerySvc.updateAlbum(id, dto)
      : this.gallerySvc.createAlbum(dto);

    req.subscribe({
      next: () => {
        this.success.set(id ? 'Album updated.' : 'Album created.');
        this.saving.set(false);
        this.loadAlbums();
        setTimeout(() => this.mode.set('albums'), 800);
      },
      error: () => {
        this.error.set('Failed to save album.');
        this.saving.set(false);
      },
    });
  }

  deleteAlbum(album: GalleryAlbum): void {
    if (!confirm(`Delete album "${album.title}" and all its media? This cannot be undone.`)) return;
    this.deleting.update((s) => new Set(s).add(album.id));
    this.gallerySvc.deleteAlbum(album.id).subscribe({
      next: () => {
        this.deleting.update((s) => { const n = new Set(s); n.delete(album.id); return n; });
        this.loadAlbums();
      },
      error: () => {
        this.deleting.update((s) => { const n = new Set(s); n.delete(album.id); return n; });
        this.error.set('Failed to delete album.');
      },
    });
  }

  // ── Items ─────────────────────────────────────────────────────

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const album = this.activeAlbum();
    if (!album) return;

    this.uploadingFile.set(true);
    this.itemError.set('');
    this.gallerySvc.uploadImage(album.id, file).subscribe({
      next: (item) => {
        this.uploadingFile.set(false);
        this.refreshActiveAlbum(album.id, item, 'add');
        input.value = '';
      },
      error: () => {
        this.uploadingFile.set(false);
        this.itemError.set('Upload failed. Check file type and size.');
        input.value = '';
      },
    });
  }

  addVideoItem(): void {
    if (!this.itemUrl().trim()) {
      this.itemError.set('Video URL is required.');
      return;
    }
    const album = this.activeAlbum();
    if (!album) return;

    this.itemLoading.set(true);
    this.itemError.set('');
    this.gallerySvc
      .addItem(album.id, {
        type: 'video',
        url: this.itemUrl().trim(),
        thumbnailUrl: this.itemThumbnailUrl().trim() || undefined,
        caption: this.itemCaption().trim() || undefined,
      })
      .subscribe({
        next: (item) => {
          this.itemLoading.set(false);
          this.showAddItem.set(false);
          this.itemUrl.set('');
          this.itemThumbnailUrl.set('');
          this.itemCaption.set('');
          this.refreshActiveAlbum(album.id, item, 'add');
        },
        error: () => {
          this.itemLoading.set(false);
          this.itemError.set('Failed to add video item.');
        },
      });
  }

  deleteItem(item: GalleryItem): void {
    if (!confirm('Remove this media item?')) return;
    const album = this.activeAlbum();
    if (!album) return;
    this.deleting.update((s) => new Set(s).add(item.id));
    this.gallerySvc.deleteItem(album.id, item.id).subscribe({
      next: () => {
        this.deleting.update((s) => { const n = new Set(s); n.delete(item.id); return n; });
        this.refreshActiveAlbum(album.id, item, 'remove');
      },
      error: () => {
        this.deleting.update((s) => { const n = new Set(s); n.delete(item.id); return n; });
        this.itemError.set('Failed to delete item.');
      },
    });
  }

  private refreshActiveAlbum(
    albumId: string,
    changedItem: GalleryItem,
    action: 'add' | 'remove',
  ): void {
    const album = this.activeAlbum();
    if (!album) return;
    const updatedItems =
      action === 'add'
        ? [...album.items, changedItem]
        : album.items.filter((i) => i.id !== changedItem.id);

    const updated = { ...album, items: updatedItems };
    this.activeAlbum.set(updated);

    // Also update the albums list
    this.albums.update((list) =>
      list.map((a) => (a.id === albumId ? updated : a)),
    );
  }

  isYoutube(url: string): boolean {
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  isVimeo(url: string): boolean {
    return url.includes('vimeo.com');
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

  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
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
}
