import { Injectable, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';

export interface SeoMetadata {
  title: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
}

const SITE_NAME = 'CSE DIU Alumni';
const DEFAULT_DESCRIPTION =
  'The official alumni network of the Computer Science & Engineering department at Daffodil International University. Connect with graduates, explore jobs, events, mentorship, scholarships, and research.';
const DEFAULT_OG_IMAGE = 'https://alumni.csediu.com/og-image.png';
const SITE_URL = 'https://alumni.csediu.com';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly meta = inject(Meta);

  update(data: SeoMetadata): void {
    const fullTitle =
      data.title && data.title !== SITE_NAME ? `${data.title} | ${SITE_NAME}` : SITE_NAME;
    const description = data.description ?? DEFAULT_DESCRIPTION;
    const ogImage = data.ogImage ?? DEFAULT_OG_IMAGE;
    const ogUrl = data.ogUrl ? `${SITE_URL}${data.ogUrl}` : SITE_URL;

    // Standard meta
    this.meta.updateTag({ name: 'description', content: description });
    if (data.keywords) {
      this.meta.updateTag({ name: 'keywords', content: data.keywords });
    }

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: ogImage });
    this.meta.updateTag({ property: 'og:url', content: ogUrl });

    // Twitter Card
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: ogImage });
  }
}
