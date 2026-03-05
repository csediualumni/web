import { Component, OnInit } from '@angular/core';
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

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      const userId = params['userId'];
      const email = params['email'] ?? '';

      if (token && userId) {
        this.auth.handleGoogleCallback(token, userId, email);
        this.router.navigate(['/dashboard']);
      } else {
        this.error = 'Sign-in failed. Please try again.';
        setTimeout(() => this.router.navigate(['/auth/register']), 2000);
      }
    });
  }
}
