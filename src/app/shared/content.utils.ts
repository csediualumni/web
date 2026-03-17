import { marked } from 'marked';
import DOMPurify from 'dompurify';

/**
 * Convert content to HTML. If format is 'markdown', converts via marked.
 * If format is 'html', passes through as-is. Always sanitizes with DOMPurify.
 */
export function convertToHtml(content: string, format: 'html' | 'markdown'): string {
  if (!content) return '';
  let html: string;
  if (format === 'markdown') {
    // marked.parse returns string | Promise<string>; synchronous when no async extensions
    html = marked.parse(content, { async: false }) as string;
  } else {
    html = content;
  }
  return DOMPurify.sanitize(html);
}

/**
 * Sanitize raw HTML with DOMPurify to prevent XSS.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(html);
}

/**
 * Detect whether a string contains HTML tags.
 * Used to choose between innerHTML and whitespace-pre-line rendering
 * for backward compatibility with pre-existing plain-text content.
 */
export function hasHtmlTags(content: string): boolean {
  if (!content) return false;
  return /<[a-z][\s\S]*>/i.test(content);
}
