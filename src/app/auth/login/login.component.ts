import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });
  loading = signal(false);
  currentYear = new Date().getFullYear();
  serverError = signal('');
  showPassword = signal(false);

  // Forgot password
  forgotMode = signal(false);
  forgotEmail = signal('');
  forgotLoading = signal(false);
  forgotSuccess = signal('');
  forgotError = signal('');

  get email() {
    return this.form.get('email')!;
  }
  get password() {
    return this.form.get('password')!;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.serverError.set('');

    const { email, password } = this.form.value;
    this.auth.login(email!, password!).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.loading.set(false);
        this.serverError.set(err.error?.message ?? 'Invalid email or password. Please try again.');
      },
    });
  }

  signInWithGoogle(): void {
    this.auth.redirectToGoogle();
  }

  sendRecovery(): void {
    const email = this.forgotEmail().trim();
    if (!email) {
      this.forgotError.set('Please enter your email address.');
      return;
    }
    this.forgotLoading.set(true);
    this.forgotError.set('');
    this.forgotSuccess.set('');
    this.auth.forgotPassword(email).subscribe({
      next: (res) => {
        this.forgotLoading.set(false);
        this.forgotSuccess.set(res.message);
      },
      error: () => {
        this.forgotLoading.set(false);
        this.forgotError.set('Something went wrong. Please try again.');
      },
    });
  }
}
