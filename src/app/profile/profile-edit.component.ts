import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AuthService,
  ExperienceEntry,
  EducationEntry,
  AchievementEntry,
} from '../core/auth.service';

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
  readonly auth = inject(AuthService);
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

  // ── Experience ─────────────────────────────────────────────
  experiences = signal<ExperienceEntry[]>([]);
  expDraft = signal<Omit<ExperienceEntry, 'id'> | null>(null);
  editingExpId = signal<string | null>(null);
  expSaving = signal(false);
  expError = signal<string | null>(null);

  // ── Education ──────────────────────────────────────────────
  educations = signal<EducationEntry[]>([]);
  eduDraft = signal<Omit<EducationEntry, 'id'> | null>(null);
  editingEduId = signal<string | null>(null);
  eduSaving = signal(false);
  eduError = signal<string | null>(null);

  // ── Achievements ───────────────────────────────────────────
  achievements = signal<AchievementEntry[]>([]);
  achDraft = signal<Omit<AchievementEntry, 'id'> | null>(null);
  editingAchId = signal<string | null>(null);
  achSaving = signal(false);
  achError = signal<string | null>(null);

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
        this.experiences.set(data.experiences ?? []);
        this.educations.set(data.educations ?? []);
        this.achievements.set(data.achievements ?? []);
        this.loading.set(false);
      },
      error: () => {
        // Fall back to cached profile if API fails
        const cached = this.user?.profile;
        if (cached) {
          this.form.patchValue({ ...cached });
          this.skills.set(cached.skills ?? []);
          this.experiences.set(cached.experiences ?? []);
          this.educations.set(cached.educations ?? []);
          this.achievements.set(cached.achievements ?? []);
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
    const parts = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
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

  // ── Experience CRUD ────────────────────────────────────────────

  openAddExp() {
    this.editingExpId.set(null);
    this.expDraft.set({
      title: '',
      company: '',
      from: '',
      to: 'Present',
      sortOrder: this.experiences().length,
    });
    this.expError.set(null);
  }

  openEditExp(entry: ExperienceEntry) {
    this.editingExpId.set(entry.id);
    this.expDraft.set({
      title: entry.title,
      company: entry.company,
      from: entry.from,
      to: entry.to,
      sortOrder: entry.sortOrder,
    });
    this.expError.set(null);
  }

  cancelExp() {
    this.expDraft.set(null);
    this.editingExpId.set(null);
  }

  saveExp() {
    const draft = this.expDraft();
    if (!draft || !draft.title.trim() || !draft.company.trim() || !draft.from.trim()) return;
    this.expSaving.set(true);
    this.expError.set(null);
    const editId = this.editingExpId();
    const obs = editId ? this.auth.updateExperience(editId, draft) : this.auth.addExperience(draft);
    obs.subscribe({
      next: (saved) => {
        this.experiences.update((list) =>
          editId ? list.map((e) => (e.id === editId ? saved : e)) : [...list, saved],
        );
        this.expDraft.set(null);
        this.editingExpId.set(null);
        this.expSaving.set(false);
      },
      error: () => {
        this.expError.set('Failed to save. Try again.');
        this.expSaving.set(false);
      },
    });
  }

  deleteExp(id: string) {
    this.auth.deleteExperience(id).subscribe({
      next: () => this.experiences.update((l) => l.filter((e) => e.id !== id)),
      error: () => this.expError.set('Failed to delete. Try again.'),
    });
  }

  // ── Education CRUD ─────────────────────────────────────────────

  openAddEdu() {
    this.editingEduId.set(null);
    this.eduDraft.set({
      degree: '',
      institution: '',
      year: null,
      sortOrder: this.educations().length,
    });
    this.eduError.set(null);
  }

  openEditEdu(entry: EducationEntry) {
    this.editingEduId.set(entry.id);
    this.eduDraft.set({
      degree: entry.degree,
      institution: entry.institution,
      year: entry.year,
      sortOrder: entry.sortOrder,
    });
    this.eduError.set(null);
  }

  cancelEdu() {
    this.eduDraft.set(null);
    this.editingEduId.set(null);
  }

  saveEdu() {
    const draft = this.eduDraft();
    if (!draft || !draft.degree.trim() || !draft.institution.trim()) return;
    this.eduSaving.set(true);
    this.eduError.set(null);
    const editId = this.editingEduId();
    const obs = editId ? this.auth.updateEducation(editId, draft) : this.auth.addEducation(draft);
    obs.subscribe({
      next: (saved) => {
        this.educations.update((list) =>
          editId ? list.map((e) => (e.id === editId ? saved : e)) : [...list, saved],
        );
        this.eduDraft.set(null);
        this.editingEduId.set(null);
        this.eduSaving.set(false);
      },
      error: () => {
        this.eduError.set('Failed to save. Try again.');
        this.eduSaving.set(false);
      },
    });
  }

  deleteEdu(id: string) {
    this.auth.deleteEducation(id).subscribe({
      next: () => this.educations.update((l) => l.filter((e) => e.id !== id)),
      error: () => this.eduError.set('Failed to delete. Try again.'),
    });
  }

  // ── Achievement CRUD ───────────────────────────────────────────

  openAddAch() {
    this.editingAchId.set(null);
    this.achDraft.set({ title: '', sortOrder: this.achievements().length });
    this.achError.set(null);
  }

  openEditAch(entry: AchievementEntry) {
    this.editingAchId.set(entry.id);
    this.achDraft.set({ title: entry.title, sortOrder: entry.sortOrder });
    this.achError.set(null);
  }

  cancelAch() {
    this.achDraft.set(null);
    this.editingAchId.set(null);
  }

  saveAch() {
    const draft = this.achDraft();
    if (!draft || !draft.title.trim()) return;
    this.achSaving.set(true);
    this.achError.set(null);
    const editId = this.editingAchId();
    const obs = editId
      ? this.auth.updateAchievement(editId, draft)
      : this.auth.addAchievement(draft);
    obs.subscribe({
      next: (saved) => {
        this.achievements.update((list) =>
          editId ? list.map((a) => (a.id === editId ? saved : a)) : [...list, saved],
        );
        this.achDraft.set(null);
        this.editingAchId.set(null);
        this.achSaving.set(false);
      },
      error: () => {
        this.achError.set('Failed to save. Try again.');
        this.achSaving.set(false);
      },
    });
  }

  deleteAch(id: string) {
    this.auth.deleteAchievement(id).subscribe({
      next: () => this.achievements.update((l) => l.filter((a) => a.id !== id)),
      error: () => this.achError.set('Failed to delete. Try again.'),
    });
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
        this.saveError.set(err?.error?.message ?? 'Failed to save profile. Please try again.');
      },
    });
  }

  // ── Helpers ──────────────────────────────────────────────────

  setExpField(field: keyof Omit<ExperienceEntry, 'id'>, value: string) {
    const d = this.expDraft();
    if (d) this.expDraft.set({ ...d, [field]: value });
  }

  setEduField(field: keyof Omit<EducationEntry, 'id'>, value: string | number | null) {
    const d = this.eduDraft();
    if (d) this.eduDraft.set({ ...d, [field]: value });
  }

  setAchField(field: keyof Omit<AchievementEntry, 'id'>, value: string) {
    const d = this.achDraft();
    if (d) this.achDraft.set({ ...d, [field]: value });
  }

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
