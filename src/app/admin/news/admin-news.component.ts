import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AdminService,
  AdminNewsArticle,
  SaveNewsArticleDto,
  NewsCategory,
} from '../../core/admin.service';
import { AuthService } from '../../core/auth.service';
import { RichTextEditorComponent } from '../../shared/rich-text-editor/rich-text-editor.component';
import { convertToHtml } from '../../shared/content.utils';

type Mode = 'list' | 'create' | 'edit';

@Component({
  selector: 'app-admin-news',
  standalone: true,
  imports: [CommonModule, FormsModule, RichTextEditorComponent],
  templateUrl: './admin-news.component.html',
})
export class AdminNewsComponent implements OnInit {
  mode = signal<Mode>('list');
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  success = signal('');

  articles = signal<AdminNewsArticle[]>([]);
  deleting = signal<Set<string>>(new Set());

  // ── Form fields ────────────────────────────────────────────────
  editingId = signal<string | null>(null);
  formTitle = signal('');
  formSummary = signal('');
  formSummaryFormat = signal<'html' | 'markdown'>('html');
  formBody = signal('');
  formBodyFormat = signal<'html' | 'markdown'>('html');
  formCategory = signal<NewsCategory>('Announcement');
  formAuthor = signal('');
  formDate = signal('');
  formReadTime = signal('');
  formIcon = signal('fa-newspaper');
  formColor = signal('bg-violet-100');
  formPinned = signal(false);
  formFeatured = signal(false);

  readonly categoryOptions: NewsCategory[] = [
    'Announcement',
    'Achievement',
    'Events',
    'Research',
    'Career',
    'Community',
  ];

  readonly colorOptions = [
    { value: 'bg-violet-100', label: 'Violet' },
    { value: 'bg-amber-100', label: 'Amber' },
    { value: 'bg-emerald-100', label: 'Emerald' },
    { value: 'bg-sky-100', label: 'Sky' },
    { value: 'bg-rose-100', label: 'Rose' },
    { value: 'bg-pink-100', label: 'Pink' },
    { value: 'bg-teal-100', label: 'Teal' },
    { value: 'bg-indigo-100', label: 'Indigo' },
    { value: 'bg-orange-100', label: 'Orange' },
    { value: 'bg-zinc-100', label: 'Zinc' },
  ];

  readonly auth = inject(AuthService);
  private readonly adminSvc = inject(AdminService);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.adminSvc.listNewsArticles().subscribe({
      next: (data) => {
        this.articles.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          err?.status === 403
            ? "You don't have sufficient permissions to view this."
            : 'Failed to load news articles.',
        );
        this.loading.set(false);
      },
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.formTitle.set('');
    this.formSummary.set('');
    this.formSummaryFormat.set('html');
    this.formBody.set('');
    this.formBodyFormat.set('html');
    this.formCategory.set('Announcement');
    this.formAuthor.set('');
    this.formDate.set('');
    this.formReadTime.set('');
    this.formIcon.set('fa-newspaper');
    this.formColor.set('bg-violet-100');
    this.formPinned.set(false);
    this.formFeatured.set(false);
    this.error.set('');
    this.success.set('');
    this.mode.set('create');
  }

  openEdit(a: AdminNewsArticle): void {
    this.editingId.set(a.id);
    this.formTitle.set(a.title);
    this.formSummary.set(a.summary);
    this.formSummaryFormat.set('html');
    this.formBody.set(a.body);
    this.formBodyFormat.set('html');
    this.formCategory.set(a.category);
    this.formAuthor.set(a.author);
    this.formDate.set(a.date);
    this.formReadTime.set(a.readTime);
    this.formIcon.set(a.icon);
    this.formColor.set(a.color);
    this.formPinned.set(a.pinned);
    this.formFeatured.set(a.featured);
    this.error.set('');
    this.success.set('');
    this.mode.set('edit');
  }

  cancelForm(): void {
    this.mode.set('list');
    this.error.set('');
    this.success.set('');
  }

  save(): void {
    const title = this.formTitle().trim();
    const summary = convertToHtml(this.formSummary().trim(), this.formSummaryFormat());
    const body = convertToHtml(this.formBody().trim(), this.formBodyFormat());
    const author = this.formAuthor().trim();
    const date = this.formDate().trim();
    const readTime = this.formReadTime().trim();
    const icon = this.formIcon().trim();
    const color = this.formColor().trim();

    if (!title || !summary || !body || !author || !date || !readTime || !icon || !color) {
      this.error.set(
        'Title, summary, body, author, date, read time, icon and colour are required.',
      );
      return;
    }

    const dto: SaveNewsArticleDto = {
      title,
      summary,
      body,
      category: this.formCategory(),
      author,
      date,
      readTime,
      icon,
      color,
      pinned: this.formPinned(),
      featured: this.formFeatured(),
    };

    this.saving.set(true);
    this.error.set('');

    const id = this.editingId();
    const req =
      id === null
        ? this.adminSvc.adminCreateNewsArticle(dto)
        : this.adminSvc.adminUpdateNewsArticle(id, dto);

    req.subscribe({
      next: (saved) => {
        if (id === null) {
          this.articles.update((list) => [saved, ...list]);
          this.success.set('Article created.');
        } else {
          this.articles.update((list) => list.map((a) => (a.id === id ? saved : a)));
          this.success.set('Article updated.');
        }
        this.saving.set(false);
        this.mode.set('list');
      },
      error: (err) => {
        this.error.set(
          err?.status === 403
            ? "You don't have sufficient permissions."
            : (err?.error?.message ?? 'Failed to save article.'),
        );
        this.saving.set(false);
      },
    });
  }

  delete(a: AdminNewsArticle): void {
    if (!confirm(`Delete article "${a.title}"? This cannot be undone.`)) return;

    this.deleting.update((s) => new Set([...s, a.id]));
    this.error.set('');

    this.adminSvc.adminDeleteNewsArticle(a.id).subscribe({
      next: () => {
        this.articles.update((list) => list.filter((x) => x.id !== a.id));
        this.deleting.update((s) => {
          const n = new Set(s);
          n.delete(a.id);
          return n;
        });
        this.success.set(`Article "${a.title}" deleted.`);
      },
      error: (err) => {
        this.deleting.update((s) => {
          const n = new Set(s);
          n.delete(a.id);
          return n;
        });
        this.error.set(
          err?.status === 403
            ? "You don't have permission to delete articles."
            : 'Failed to delete article.',
        );
      },
    });
  }

  isDeleting(id: string): boolean {
    return this.deleting().has(id);
  }

  categoryBadgeClass(cat: NewsCategory): string {
    const map: Record<string, string> = {
      Announcement: 'bg-violet-100 text-violet-700 border border-violet-200',
      Achievement: 'bg-amber-100 text-amber-700 border border-amber-200',
      Events: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      Research: 'bg-sky-100 text-sky-700 border border-sky-200',
      Career: 'bg-rose-100 text-rose-700 border border-rose-200',
      Community: 'bg-pink-100 text-pink-700 border border-pink-200',
    };
    return map[cat] ?? 'bg-zinc-100 text-zinc-600 border border-zinc-200';
  }
}
