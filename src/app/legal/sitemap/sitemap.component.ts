import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sitemap',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './sitemap.component.html',
})
export class SitemapComponent {
  readonly sections = [
    {
      title: 'Main Pages',
      icon: 'fa-house',
      links: [
        { label: 'Home', path: '/' },
        { label: 'About Us', path: '/about' },
        { label: 'Contact', path: '/contact' },
      ],
    },
    {
      title: 'Alumni',
      icon: 'fa-users',
      links: [
        { label: 'Alumni Directory', path: '/alumni' },
        { label: 'Mentorship Program', path: '/mentorship' },
        { label: 'Gallery', path: '/gallery' },
      ],
    },
    {
      title: 'Authentication',
      icon: 'fa-lock',
      links: [
        { label: 'Login', path: '/auth/login' },
        { label: 'Register', path: '/auth/register' },
        { label: 'Dashboard', path: '/dashboard' },
      ],
    },
    {
      title: 'Resources',
      icon: 'fa-folder-open',
      links: [
        { label: 'Job Board', path: '/jobs' },
        { label: 'Scholarships', path: '/scholarships' },
        { label: 'Research Papers', path: '/research' },
        { label: 'News & Announcements', path: '/news' },
        { label: 'Events', path: '/events' },
        { label: 'Audit Reports', path: '/accounting/reports' },
        { label: 'GitHub Issues', path: '/issues' },
        { label: 'Contributors', path: '/contributors' },
      ],
    },
    {
      title: 'Legal',
      icon: 'fa-scale-balanced',
      links: [
        { label: 'Privacy Policy', path: '/privacy-policy' },
        { label: 'Terms & Conditions', path: '/terms' },
        { label: 'Accessibility', path: '/accessibility' },
        { label: 'Cookie Policy', path: '/cookie-policy' },
        { label: 'Sitemap', path: '/sitemap' },
      ],
    },
  ];
}
