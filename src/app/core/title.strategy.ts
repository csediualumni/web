import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { SeoService } from './seo.service';

const SITE_NAME = 'CSE DIU Alumni';

@Injectable({ providedIn: 'root' })
export class AppTitleStrategy extends TitleStrategy {
  private readonly seo = inject(SeoService);

  constructor(private readonly title: Title) {
    super();
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const routeTitle = this.buildTitle(snapshot);
    this.title.setTitle(routeTitle ? `${routeTitle} | ${SITE_NAME}` : SITE_NAME);

    const routeData = this.getDeepestRouteData(snapshot.root);
    this.seo.update({
      title: routeTitle ?? SITE_NAME,
      description: routeData?.['description'],
      keywords: routeData?.['keywords'],
      ogUrl: snapshot.url,
    });
  }

  private getDeepestRouteData(
    route: ActivatedRouteSnapshot,
  ): Record<string, string | undefined> | null {
    let current: ActivatedRouteSnapshot | null = route;
    let data: Record<string, string | undefined> | null = null;
    while (current) {
      if (current.data && Object.keys(current.data).length > 0) {
        const safeData: Record<string, string | undefined> = {};
        for (const key of Object.keys(current.data)) {
          const val = current.data[key];
          safeData[key] = typeof val === 'string' ? val : undefined;
        }
        data = safeData;
      }
      current = current.firstChild;
    }
    return data;
  }
}
