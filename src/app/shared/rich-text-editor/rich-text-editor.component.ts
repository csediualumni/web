import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  computed,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { convertToHtml } from '../content.utils';

type EditorTab = 'html' | 'markdown' | 'preview';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rich-text-editor.component.html',
})
export class RichTextEditorComponent implements OnChanges {
  /** Raw content value (html or markdown string). */
  @Input() content = '';
  /** Current format being edited. */
  @Input() format: 'html' | 'markdown' = 'html';
  /** Label shown above the editor. */
  @Input() label = 'Content';
  /** Whether the field is required (shows red asterisk). */
  @Input() required = false;
  /** Textarea rows (for html/markdown tabs). */
  @Input() rows = 6;
  /** Optional id base for the label/textarea pair. */
  @Input() inputId = 'rte';
  /** Placeholder text. */
  @Input() placeholder = 'Write your content here…';

  @Output() contentChange = new EventEmitter<string>();
  @Output() formatChange = new EventEmitter<'html' | 'markdown'>();

  activeTab = signal<EditorTab>('html');

  private readonly sanitizer = inject(DomSanitizer);

  ngOnChanges(changes: SimpleChanges): void {
    // Sync the active tab to the format input when the format changes externally
    if (changes['format']) {
      const f = changes['format'].currentValue as 'html' | 'markdown';
      if (this.activeTab() !== 'preview') {
        this.activeTab.set(f);
      }
    }
  }

  setTab(tab: EditorTab): void {
    this.activeTab.set(tab);
    if (tab !== 'preview') {
      this.formatChange.emit(tab as 'html' | 'markdown');
    }
  }

  onContentChange(value: string): void {
    this.contentChange.emit(value);
  }

  get previewHtml(): SafeHtml {
    const html = convertToHtml(this.content, this.format);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
