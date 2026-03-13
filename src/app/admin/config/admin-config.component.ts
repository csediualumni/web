import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SiteConfigService } from '../../core/site-config.service';

@Component({
  selector: 'app-admin-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-config.component.html',
})
export class AdminConfigComponent implements OnInit {
  private readonly siteConfig = inject(SiteConfigService);

  saving = signal(false);
  uploadingLogo = signal(false);
  uploadingFavicon = signal(false);
  error = signal('');
  success = signal('');

  // Contact info
  supportEmail = signal('');
  supportPhone = signal('');
  bkashNumber = signal('');
  location = signal('');

  // Social links
  facebookUrl = signal('');
  twitterUrl = signal('');
  linkedinUrl = signal('');
  instagramUrl = signal('');
  youtubeUrl = signal('');
  githubUrl = signal('');

  // Logo / favicon previews
  logoPreview = signal<string | null>(null);
  faviconPreview = signal<string | null>(null);

  ngOnInit(): void {
    const cfg = this.siteConfig.config();
    this.supportEmail.set(cfg['supportEmail'] ?? '');
    this.supportPhone.set(cfg['supportPhone'] ?? '');
    this.bkashNumber.set(cfg['bkashNumber'] ?? '');
    this.location.set(cfg['location'] ?? '');
    this.facebookUrl.set(cfg['facebookUrl'] ?? '');
    this.twitterUrl.set(cfg['twitterUrl'] ?? '');
    this.linkedinUrl.set(cfg['linkedinUrl'] ?? '');
    this.instagramUrl.set(cfg['instagramUrl'] ?? '');
    this.youtubeUrl.set(cfg['youtubeUrl'] ?? '');
    this.githubUrl.set(cfg['githubUrl'] ?? '');
    this.logoPreview.set(cfg['logoUrl'] ?? null);
    this.faviconPreview.set(cfg['faviconUrl'] ?? null);
  }

  saveTextConfig(): void {
    this.saving.set(true);
    this.error.set('');
    this.success.set('');

    const payload: Record<string, string | null> = {
      supportEmail: this.supportEmail().trim() || null,
      supportPhone: this.supportPhone().trim() || null,
      bkashNumber: this.bkashNumber().trim() || null,
      location: this.location().trim() || null,
      facebookUrl: this.facebookUrl().trim() || null,
      twitterUrl: this.twitterUrl().trim() || null,
      linkedinUrl: this.linkedinUrl().trim() || null,
      instagramUrl: this.instagramUrl().trim() || null,
      youtubeUrl: this.youtubeUrl().trim() || null,
      githubUrl: this.githubUrl().trim() || null,
    };

    this.siteConfig.update(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.success.set('Configuration saved successfully.');
      },
      error: (err) => {
        this.saving.set(false);
        const msg = err?.error?.message ?? 'Failed to save configuration.';
        this.error.set(Array.isArray(msg) ? msg[0] : msg);
      },
    });
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploadingLogo.set(true);
    this.error.set('');
    this.success.set('');
    this.siteConfig.uploadLogo(file).subscribe({
      next: ({ logoUrl }) => {
        this.uploadingLogo.set(false);
        this.logoPreview.set(logoUrl);
        this.success.set('Logo updated successfully.');
      },
      error: (err) => {
        this.uploadingLogo.set(false);
        this.error.set(err?.error?.message ?? 'Failed to upload logo.');
      },
    });
    input.value = '';
  }

  onFaviconSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploadingFavicon.set(true);
    this.error.set('');
    this.success.set('');
    this.siteConfig.uploadFavicon(file).subscribe({
      next: ({ faviconUrl }) => {
        this.uploadingFavicon.set(false);
        this.faviconPreview.set(faviconUrl);
        this.success.set('Favicon updated successfully.');
      },
      error: (err) => {
        this.uploadingFavicon.set(false);
        this.error.set(err?.error?.message ?? 'Failed to upload favicon.');
      },
    });
    input.value = '';
  }
}
