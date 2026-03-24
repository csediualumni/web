import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './callback.component.html',
  styleUrl: './callback.component.css',
})
export class AuthCallbackComponent implements OnInit {
  error = '';

  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    // Token is stored in localStorage — only process on the browser
    if (!isPlatformBrowser(this.platformId)) return;

    this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      const userId = params['userId'];
      const email = params['email'] ?? '';

      if (token && userId) {
        this.auth.handleGoogleCallback(token, userId, email);
        this.router.navigate(['/dashboard']);
      } else {
        this.error = 'Sign-in failed. Please try again.';
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      }
    });
  }
}
