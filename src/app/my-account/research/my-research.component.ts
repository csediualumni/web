import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AdminService,
  AdminResearchPaper,
  SaveResearchPaperDto,
  VenueType,
} from '../../core/admin.service';
import { RichTextEditorComponent } from '../../shared/rich-text-editor/rich-text-editor.component';
import { convertToHtml } from '../../shared/content.utils';

type Mode = 'list' | 'create' | 'edit';

@Component({
  selector: 'app-my-research',
  standalone: true,
  imports: [CommonModule, FormsModule, RichTextEditorComponent],
  templateUrl: './my-research.component.html',
})
export class MyResearchComponent implements OnInit {
  mode = signal<Mode>('list');
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  success = signal('');

  papers = signal<AdminResearchPaper[]>([]);
  deleting = signal<Set<string>>(new Set());

  // ── Form fields ────────────────────────────────────────────────
  editingId = signal<string | null>(null);
  formTitle = signal('');
  formAuthors = signal('');
  formAbstract = signal('');
  formAbstractFormat = signal<'html' | 'markdown'>('html');
  formYear = signal<number>(new Date().getFullYear());
  formVenue = signal('');
  formVenueType = signal<VenueType>('conference');
  formTags = signal('');
  formDoi = signal('');
  formLink = signal('');
  formCitations = signal(0);

  readonly venueTypes: VenueType[] = ['journal', 'conference', 'preprint'];

  private readonly adminSvc = inject(AdminService);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.adminSvc.getMyResearchPapers().subscribe({
      next: (data) => {
        this.papers.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load your research papers. Please try again.');
        this.loading.set(false);
      },
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.formTitle.set('');
    this.formAuthors.set('');
    this.formAbstract.set('');
    this.formAbstractFormat.set('html');
    this.formYear.set(new Date().getFullYear());
    this.formVenue.set('');
    this.formVenueType.set('conference');
    this.formTags.set('');
    this.formDoi.set('');
    this.formLink.set('');
    this.formCitations.set(0);
    this.error.set('');
    this.success.set('');
    this.mode.set('create');
  }

  openEdit(p: AdminResearchPaper): void {
    this.editingId.set(p.id);
    this.formTitle.set(p.title);
    this.formAuthors.set((p.authors ?? []).join(', '));
    this.formAbstract.set(p.abstract);
    this.formAbstractFormat.set('html');
    this.formYear.set(p.year);
    this.formVenue.set(p.venue);
    this.formVenueType.set(p.venueType);
    this.formTags.set((p.tags ?? []).join(', '));
    this.formDoi.set(p.doi ?? '');
    this.formLink.set(p.link);
    this.formCitations.set(p.citations);
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
    const abstract = convertToHtml(this.formAbstract().trim(), this.formAbstractFormat());
    const venue = this.formVenue().trim();
    const link = this.formLink().trim();
    const authors = this.formAuthors()
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (!title || !abstract || !venue || !link || authors.length === 0) {
      this.error.set('Title, authors, abstract, venue and link are required.');
      return;
    }

    const rawTags = this.formTags().trim();
    const tags = rawTags
      ? rawTags
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const dto: SaveResearchPaperDto = {
      title,
      authors,
      abstract,
      year: this.formYear(),
      venue,
      venueType: this.formVenueType(),
      tags,
      doi: this.formDoi().trim() || undefined,
      link,
      citations: this.formCitations(),
    };

    this.saving.set(true);
    this.error.set('');

    const id = this.editingId();
    const req =
      id === null
        ? this.adminSvc.submitMyResearchPaper(dto)
        : this.adminSvc.updateMyResearchPaper(id, dto);

    req.subscribe({
      next: (saved) => {
        if (id === null) {
          this.papers.update((list) => [saved, ...list]);
          this.success.set('Research paper submitted successfully.');
        } else {
          this.papers.update((list) => list.map((p) => (p.id === id ? saved : p)));
          this.success.set('Research paper updated.');
        }
        this.saving.set(false);
        this.mode.set('list');
      },
      error: (err: { error?: { message?: string } }) => {
        this.error.set(err?.error?.message ?? 'Failed to save research paper.');
        this.saving.set(false);
      },
    });
  }

  delete(p: AdminResearchPaper): void {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;

    this.deleting.update((s) => new Set([...s, p.id]));
    this.error.set('');

    this.adminSvc.deleteMyResearchPaper(p.id).subscribe({
      next: () => {
        this.papers.update((list) => list.filter((x) => x.id !== p.id));
        this.deleting.update((s) => {
          const n = new Set(s);
          n.delete(p.id);
          return n;
        });
        this.success.set(`"${p.title}" deleted.`);
      },
      error: (err: { status?: number }) => {
        this.deleting.update((s) => {
          const n = new Set(s);
          n.delete(p.id);
          return n;
        });
        this.error.set(
          err?.status === 403
            ? 'You do not have permission to delete this paper.'
            : 'Failed to delete paper.',
        );
      },
    });
  }

  isDeleting(id: string): boolean {
    return this.deleting().has(id);
  }

  venueBadgeClass(type: VenueType): string {
    const map: Record<string, string> = {
      journal: 'bg-sky-100 text-sky-700 border border-sky-200',
      conference: 'bg-violet-100 text-violet-700 border border-violet-200',
      preprint: 'bg-amber-100 text-amber-700 border border-amber-200',
    };
    return map[type] ?? 'bg-zinc-100 text-zinc-600 border border-zinc-200';
  }
}
