import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl: string | null;
  caption: string | null;
  sortOrder: number;
  albumId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  category: string;
  year: number;
  isPublished: boolean;
  sortOrder: number;
  items: GalleryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAlbumDto {
  title: string;
  description?: string;
  coverImageUrl?: string;
  category?: string;
  year?: number;
  isPublished?: boolean;
  sortOrder?: number;
}

export type UpdateAlbumDto = Partial<CreateAlbumDto>;

export interface AddItemDto {
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  sortOrder?: number;
}

export type UpdateItemDto = Partial<AddItemDto>;

@Injectable({ providedIn: 'root' })
export class GalleryService {
  private readonly base = `${environment.apiUrl}/gallery`;
  private readonly http = inject(HttpClient);

  // ── Public ─────────────────────────────────────────────────────

  getAlbums(): Observable<GalleryAlbum[]> {
    return this.http.get<GalleryAlbum[]>(`${this.base}/albums`);
  }

  getAlbum(id: string): Observable<GalleryAlbum> {
    return this.http.get<GalleryAlbum>(`${this.base}/albums/${id}`);
  }

  // ── Admin ──────────────────────────────────────────────────────

  adminGetAlbums(): Observable<GalleryAlbum[]> {
    return this.http.get<GalleryAlbum[]>(`${this.base}/admin/albums`);
  }

  createAlbum(dto: CreateAlbumDto): Observable<GalleryAlbum> {
    return this.http.post<GalleryAlbum>(`${this.base}/albums`, dto);
  }

  updateAlbum(id: string, dto: UpdateAlbumDto): Observable<GalleryAlbum> {
    return this.http.patch<GalleryAlbum>(`${this.base}/albums/${id}`, dto);
  }

  deleteAlbum(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/albums/${id}`);
  }

  addItem(albumId: string, dto: AddItemDto): Observable<GalleryItem> {
    return this.http.post<GalleryItem>(`${this.base}/albums/${albumId}/items`, dto);
  }

  uploadImage(albumId: string, file: File): Observable<GalleryItem> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<GalleryItem>(`${this.base}/albums/${albumId}/items/upload`, formData);
  }

  updateItem(albumId: string, itemId: string, dto: UpdateItemDto): Observable<GalleryItem> {
    return this.http.patch<GalleryItem>(`${this.base}/albums/${albumId}/items/${itemId}`, dto);
  }

  deleteItem(albumId: string, itemId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/albums/${albumId}/items/${itemId}`);
  }
}
