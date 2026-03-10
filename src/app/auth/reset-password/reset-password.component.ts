import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  form = this.fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm: ['', [Validators.required]],
    },
    { validators: this.passwordsMatch },
  );
  token = signal('');
  loading = signal(false);
  showPassword = signal(false);
  showConfirm = signal(false);
  success = signal('');
  error = signal('');

  ngOnInit(): void {
    const t = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!t) {
      this.error.set('Invalid reset link. Please request a new one.');
    }
    this.token.set(t);
  }

  private passwordsMatch(group: FormGroup) {
    return group.get('password')?.value === group.get('confirm')?.value ? null : { mismatch: true };
  }

  get password() {
    return this.form.get('password')!;
  }
  get confirm() {
    return this.form.get('confirm')!;
  }

  onSubmit(): void {
    if (this.form.invalid || !this.token()) return;
    this.loading.set(true);
    this.error.set('');

    this.auth.resetPassword(this.token(), this.form.value.password).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.success.set(res.message);
        setTimeout(() => this.router.navigate(['/auth/login']), 3000);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Something went wrong. Please request a new link.');
      },
    });
  }
}
