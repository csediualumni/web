import { Component, Input, inject, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { hasHtmlTags, sanitizeHtml } from '../content.utils';

@Component({
  selector: 'app-content-renderer',
  standalone: true,
  imports: [],
  templateUrl: './content-renderer.component.html',
})
export class ContentRendererComponent implements OnChanges {
  /** The raw content string (HTML, Markdown-converted HTML, or plain text). */
  @Input() content = '';
  /** Extra CSS classes to add to the wrapper element. */
  @Input() class = '';

  private readonly sanitizer = inject(DomSanitizer);

  isHtml = false;
  safeHtml: SafeHtml = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['content']) {
      this.isHtml = hasHtmlTags(this.content);
      if (this.isHtml) {
        this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(sanitizeHtml(this.content));
      }
    }
  }
}
