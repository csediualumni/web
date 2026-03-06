import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../core/auth.service';

const INDUSTRIES = [
  'Software Engineering',
  'Data Science & AI',
  'Cloud & DevOps',
  'Cybersecurity',
  'Product Management',
  'UI/UX Design',
  'Mobile Development',
  'Embedded Systems',
  'Networking & Infrastructure',
  'Research & Academia',
  'Entrepreneurship',
  'Finance & Fintech',
  'Healthcare & MedTech',
  'Consulting',
  'Other',
];

const COUNTRIES = [
  'Bangladesh',
  'Australia',
  'Canada',
  'Germany',
  'India',
  'Japan',
  'Malaysia',
  'Singapore',
  'UAE',
  'UK',
  'USA',
  'Other',
];

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile-edit.component.html',
})
export class ProfileEditComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly industries = INDUSTRIES;
  readonly countries = COUNTRIES;

  loading = signal(true);
  saving = signal(false);
  saveSuccess = signal(false);
  saveError = signal<string | null>(null);

  form!: FormGroup;

  // Skills managed as a separate tag list for UX
  skillInput = signal('');
  skills = signal<string[]>([]);

  get user() {
    return this.auth.currentUser();
  }

  ngOnInit() {
    this.form = this.fb.group({
      displayName: ['', [Validators.maxLength(100)]],
      phone: ['', [Validators.maxLength(30)]],
      batch: [null as number | null],
      bio: ['', [Validators.maxLength(1000)]],
      jobTitle: ['', [Validators.maxLength(100)]],
      company: ['', [Validators.maxLength(100)]],
      industry: [''],
      city: ['', [Validators.maxLength(100)]],
      country: [''],
      linkedin: ['', [Validators.maxLength(255)]],
      github: ['', [Validators.maxLength(255)]],
      twitter: ['', [Validators.maxLength(255)]],
      website: ['', [Validators.maxLength(255)]],
      openToMentoring: [false],
    });

    // Load latest profile from API
    this.auth.loadProfile().subscribe({
      next: (data) => {
        this.form.patchValue({
          displayName: data.displayName ?? '',
          phone: data.phone ?? '',
          batch: data.batch ?? null,
          bio: data.bio ?? '',
          jobTitle: data.jobTitle ?? '',
          company: data.company ?? '',
          industry: data.industry ?? '',
          city: data.city ?? '',
          country: data.country ?? '',
          linkedin: data.linkedin ?? '',
          github: data.github ?? '',
          twitter: data.twitter ?? '',
          website: data.website ?? '',
          openToMentoring: data.openToMentoring ?? false,
        });
        this.skills.set(data.skills ?? []);
        this.loading.set(false);
      },
      error: () => {
        // Fall back to cached profile if API fails
        const cached = this.user?.profile;
        if (cached) {
          this.form.patchValue({ ...cached });
          this.skills.set(cached.skills ?? []);
        }
        this.loading.set(false);
      },
    });
  }

  // ── Skills tag management ─────────────────────────────────────

  addSkill() {
    const raw = this.skillInput().trim();
    if (!raw) return;
    // Support comma-separated input
    const parts = raw.split(',').map((s) => s.trim()).filter(Boolean);
    const current = this.skills();
    const merged = [...new Set([...current, ...parts])];
    this.skills.set(merged);
    this.skillInput.set('');
  }

  removeSkill(skill: string) {
    this.skills.update((s) => s.filter((x) => x !== skill));
  }

  onSkillKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addSkill();
    }
  }

  // ── Submission ──────────────────────────────────────────────

  save() {
    if (this.form.invalid || this.saving()) return;

    this.saving.set(true);
    this.saveSuccess.set(false);
    this.saveError.set(null);

    const value = this.form.getRawValue();
    const dto = {
      ...value,
      batch: value.batch ? Number(value.batch) : null,
      skills: this.skills(),
    };

    this.auth.updateProfile(dto).subscribe({
      next: () => {
        this.saving.set(false);
        this.saveSuccess.set(true);
        setTimeout(() => this.saveSuccess.set(false), 4000);
      },
      error: (err) => {
        this.saving.set(false);
        this.saveError.set(
          err?.error?.message ?? 'Failed to save profile. Please try again.',
        );
      },
    });
  }

  // ── Helpers ──────────────────────────────────────────────────

  get email() {
    return this.user?.email ?? '';
  }

  get profileCompletion(): number {
    const v = this.form.getRawValue();
    const fields = [
      v.displayName,
      v.batch,
      v.bio,
      v.jobTitle,
      v.company,
      v.city,
      v.country,
      v.industry,
      v.linkedin || v.github,
      this.skills().length > 0,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }
}
