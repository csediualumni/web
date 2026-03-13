import { Component, computed, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { SiteConfigService } from './core/site-config.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('web');

  readonly currentUrl = signal('');

  /** Hide nav/footer on auth flow pages */
  readonly showShell = computed(() => {
    const url = this.currentUrl();
    return !url.startsWith('/auth/');
  });

  private readonly router = inject(Router);
  private readonly siteConfig = inject(SiteConfigService);
  private readonly document = inject(DOCUMENT);

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.currentUrl.set(e.urlAfterRedirects));

    effect(() => {
      const url = this.siteConfig.favicon();
      const link = this.document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (link && url) link.href = url;
    });
  }
}
