import {
  Component,
  inject,
  Input,
  Output,
  EventEmitter,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { EventsService, GuestRegistrationResponse } from '../../core/events.service';
import type { ApiEvent, TShirtSize } from '../../core/admin.service';

export interface RegistrationSuccess {
  registrationId: string;
  invoiceId?: string;
  isNewUser: boolean;
  autoLoggedIn: boolean;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const RELIGIONS = ['Islam', 'Christianity', 'Hinduism', 'Buddhism', 'Other'];
const T_SHIRT_SIZES: TShirtSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

const T_SHIRT_SIZE_OPTIONS: { size: TShirtSize; chest: string; fit: string }[] = [
  { size: 'XS',   chest: '34–35', fit: 'XS Slim'  },
  { size: 'S',    chest: '36–37', fit: 'Slim'      },
  { size: 'M',    chest: '38–39', fit: 'Regular'   },
  { size: 'L',    chest: '40–41', fit: 'Regular'   },
  { size: 'XL',   chest: '42–43', fit: 'Relaxed'   },
  { size: 'XXL',  chest: '44–46', fit: 'Relaxed'   },
  { size: 'XXXL', chest: '47–49', fit: 'Loose'     },
];

interface LocalExp { id: string; title: string; company: string; from: string; to: string; }
interface LocalEdu { id: string; degree: string; institution: string; year: number | null; }

@Component({
  selector: 'app-event-registration-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './event-registration-form.component.html',
})
export class EventRegistrationFormComponent implements OnInit {
  @Input() event!: ApiEvent;
  @Output() registered = new EventEmitter<RegistrationSuccess>();

  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly eventsService = inject(EventsService);

  readonly bloodGroups = BLOOD_GROUPS;
  readonly religions = RELIGIONS;
  readonly tShirtSizes = T_SHIRT_SIZES;
  readonly tShirtSizeOptions = T_SHIRT_SIZE_OPTIONS;

  form!: FormGroup;
  loginForm!: FormGroup;

  step = signal<'profile' | 'options' | 'confirm'>('profile');
  emailStatus = signal<'idle' | 'checking' | 'new' | 'guest' | 'exists'>('idle');
  showInlineLogin = signal(false);
  loginError = signal<string | null>(null);
  loginLoading = signal(false);
  submitting = signal(false);
  submitError = signal<string | null>(null);

  familyCount = signal(0);
  donationAmount = signal(0);

  // ── Experience ──────────────────────────────────────────────
  experiences = signal<LocalExp[]>([]);
  expDraft = signal<Omit<LocalExp, 'id'> | null>(null);
  editingExpId = signal<string | null>(null);

  // ── Education ───────────────────────────────────────────────
  educations = signal<LocalEdu[]>([]);
  eduDraft = signal<Omit<LocalEdu, 'id'> | null>(null);
  editingEduId = signal<string | null>(null);

  /** True when user is already logged in */
  isLoggedIn = computed(() => this.auth.isLoggedIn());

  totalFee = computed(() => {
    const ticket = this.event?.ticketPrice ?? 0;
    const family = this.familyCount() * (this.event?.familyMemberFee ?? this.event?.ticketPrice ?? 0);
    return ticket + family + this.donationAmount();
  });

  emailStatusMessage = computed(() => {
    switch (this.emailStatus()) {
      case 'new': return '✨ A new guest account will be created for you automatically.';
      case 'guest': return '✅ Welcome back! Your profile will be updated with the provided information.';
      case 'exists': return '⚠️ This email is already registered. Please log in to continue.';
      default: return '';
    }
  });

  ngOnInit(): void {
    const user = this.auth.currentUser();
    const profile = user?.profile;

    this.form = this.fb.group({
      // Profile
      fullName: [profile?.displayName ?? '', Validators.required],
      email: [user?.email ?? '', [Validators.required, Validators.email]],
      phone: [profile?.phone ?? '', Validators.required],
      gender: [profile?.gender ?? null, Validators.required],
      birthday: [profile?.birthday ?? null],
      bloodGroup: [profile?.bloodGroup ?? null],
      nationality: [profile?.nationality ?? 'Bangladeshi'],
      religion: [profile?.religion ?? null],
      presentAddress: [profile?.presentAddress ?? ''],
      permanentAddress: [profile?.permanentAddress ?? ''],
      // Options
      tShirtSize: ['L'],
    });

    this.loginForm = this.fb.group({
      loginPassword: ['', Validators.required],
    });

    if (this.isLoggedIn()) {
      this.emailStatus.set('guest');
      // Fetch fresh profile from API and patch the form
      this.auth.loadProfile().subscribe({
        next: (data) => {
          this.form.patchValue({
            fullName: data.displayName ?? '',
            email: user?.email ?? '',
            phone: data.phone ?? '',
            gender: data.gender ?? null,
            birthday: data.birthday ?? null,
            bloodGroup: data.bloodGroup ?? null,
            nationality: data.nationality ?? 'Bangladeshi',
            religion: data.religion ?? null,
            presentAddress: data.presentAddress ?? '',
            permanentAddress: data.permanentAddress ?? '',
          });
          if (data.experiences?.length) {
            this.experiences.set(data.experiences.map((e: LocalExp) => ({ ...e, id: e.id ?? Date.now().toString() })));
          }
          if (data.educations?.length) {
            this.educations.set(data.educations.map((e: LocalEdu) => ({ ...e, id: e.id ?? Date.now().toString() })));
          }
        },
        error: () => {
          // Fall back to cached data already set above
          if (profile?.experiences) this.experiences.set((profile.experiences as LocalExp[]).map(e => ({ ...e, id: e.id ?? Date.now().toString() })));
          if (profile?.educations) this.educations.set((profile.educations as LocalEdu[]).map(e => ({ ...e, id: e.id ?? Date.now().toString() })));
        },
      });
    }
  }

  checkEmail(): void {
    const email = this.form.get('email')?.value?.trim();
    if (!email || this.isLoggedIn()) return;
    this.emailStatus.set('checking');
    this.eventsService.checkEmail(email).subscribe({
      next: ({ exists, isGuest }) => {
        if (!exists) this.emailStatus.set('new');
        else if (isGuest) this.emailStatus.set('guest');
        else {
          this.emailStatus.set('exists');
          this.showInlineLogin.set(true);
        }
      },
      error: () => this.emailStatus.set('new'),
    });
  }

  doInlineLogin(): void {
    if (this.loginLoading()) return;
    const email = this.form.get('email')?.value;
    const password = this.loginForm.get('loginPassword')?.value;
    if (!email || !password) return;

    this.loginLoading.set(true);
    this.loginError.set(null);
    this.auth.login(email, password).subscribe({
      next: () => {
        this.loginLoading.set(false);
        this.showInlineLogin.set(false);
        this.emailStatus.set('guest');
        const profile = this.auth.currentUser()?.profile;
        if (profile) {
          this.form.patchValue({
            fullName: profile.displayName ?? this.form.value.fullName,
            phone: profile.phone ?? this.form.value.phone,
            gender: profile.gender ?? this.form.value.gender,
            birthday: profile.birthday ?? this.form.value.birthday,
          });
        }
      },
      error: (err) => {
        this.loginError.set(err?.error?.message ?? 'Login failed. Check your credentials.');
        this.loginLoading.set(false);
      },
    });
  }

  nextStep(): void {
    if (this.step() === 'profile') this.step.set('options');
    else if (this.step() === 'options') this.step.set('confirm');
  }

  prevStep(): void {
    if (this.step() === 'options') this.step.set('profile');
    else if (this.step() === 'confirm') this.step.set('options');
  }

  setFamilyCount(n: number): void {
    this.familyCount.set(Math.max(0, n));
  }

  // ── Experience helpers ──────────────────────────────────────
  openAddExp() { this.expDraft.set({ title: '', company: '', from: '', to: 'Present' }); this.editingExpId.set(null); }
  cancelExp() { this.expDraft.set(null); this.editingExpId.set(null); }
  openEditExp(exp: LocalExp) {
    this.editingExpId.set(exp.id);
    this.expDraft.set({ title: exp.title, company: exp.company, from: exp.from, to: exp.to });
  }
  setExpField(field: keyof Omit<LocalExp, 'id'>, value: string) {
    const d = this.expDraft();
    if (d) this.expDraft.set({ ...d, [field]: value });
  }
  saveExp() {
    const d = this.expDraft();
    if (!d || !d.title || !d.company || !d.from) return;
    const eid = this.editingExpId();
    if (eid) {
      this.experiences.update(list => list.map(e => e.id === eid ? { ...d, id: eid } : e));
    } else {
      this.experiences.update(list => [...list, { ...d, id: Date.now().toString() }]);
    }
    this.expDraft.set(null);
    this.editingExpId.set(null);
  }
  removeExp(id: string) { this.experiences.update(list => list.filter(e => e.id !== id)); }

  // ── Education helpers ───────────────────────────────────────
  openAddEdu() { this.eduDraft.set({ degree: '', institution: '', year: null }); this.editingEduId.set(null); }
  cancelEdu() { this.eduDraft.set(null); this.editingEduId.set(null); }
  openEditEdu(edu: LocalEdu) {
    this.editingEduId.set(edu.id);
    this.eduDraft.set({ degree: edu.degree, institution: edu.institution, year: edu.year });
  }
  setEduField(field: keyof Omit<LocalEdu, 'id'>, value: string | number | null) {
    const d = this.eduDraft();
    if (d) this.eduDraft.set({ ...d, [field]: value });
  }
  saveEdu() {
    const d = this.eduDraft();
    if (!d || !d.degree || !d.institution) return;
    const eid = this.editingEduId();
    if (eid) {
      this.educations.update(list => list.map(e => e.id === eid ? { ...d, id: eid } : e));
    } else {
      this.educations.update(list => [...list, { ...d, id: Date.now().toString() }]);
    }
    this.eduDraft.set(null);
    this.editingEduId.set(null);
  }
  removeEdu(id: string) { this.educations.update(list => list.filter(e => e.id !== id)); }

  submit(): void {
    if (this.submitting()) return;
    if (this.emailStatus() === 'exists' && !this.isLoggedIn()) {
      this.submitError.set('Please log in first to register with this email.');
      return;
    }

    this.submitting.set(true);
    this.submitError.set(null);

    const v = this.form.value;

    // ── Logged-in path: update profile then register ───────────────────────
    if (this.isLoggedIn()) {
      // Update profile in background (best-effort)
      this.auth.updateProfile({
        displayName: v.fullName,
        phone: v.phone,
        gender: v.gender as 'male' | 'female',
        birthday: v.birthday || undefined,
        bloodGroup: v.bloodGroup || undefined,
        nationality: v.nationality || undefined,
        religion: v.religion || undefined,
        presentAddress: v.presentAddress || undefined,
        permanentAddress: v.permanentAddress || undefined,
      }).subscribe();

      this.eventsService.registerLoggedIn(this.event.id, {
        tShirtSize: v.tShirtSize,
        familyMembersCount: this.familyCount(),
        donationAmount: this.donationAmount(),
      }).subscribe({
        next: (res) => {
          this.submitting.set(false);
          this.registered.emit({
            registrationId: res.registration.id,
            invoiceId: (res.registration as any).invoiceId,
            isNewUser: false,
            autoLoggedIn: false,
          });
        },
        error: (err) => {
          this.submitting.set(false);
          this.submitError.set(err?.error?.message ?? 'Registration failed. Please try again.');
        },
      });
      return;
    }

    // ── Guest path ─────────────────────────────────────────────────────────
    const dto = {
      profile: {
        fullName: v.fullName,
        email: v.email,
        phone: v.phone,
        gender: v.gender,
        birthday: v.birthday || undefined,
        bloodGroup: v.bloodGroup || undefined,
        nationality: v.nationality || undefined,
        religion: v.religion || undefined,
        presentAddress: v.presentAddress || undefined,
        permanentAddress: v.permanentAddress || undefined,
        experiences: this.experiences().map(e => ({ title: e.title, company: e.company, from: e.from, to: e.to })),
        educations: this.educations().map(e => ({ degree: e.degree, institution: e.institution, ...(e.year != null ? { year: e.year } : {}) })),
      },
      tShirtSize: v.tShirtSize,
      familyMembersCount: this.familyCount(),
      donationAmount: this.donationAmount(),
    };

    this.eventsService.registerWithProfile(this.event.id, dto).subscribe({
      next: (res: GuestRegistrationResponse) => {
        this.submitting.set(false);
        const autoLoggedIn = !this.isLoggedIn() && !!res.accessToken;
        if (res.accessToken && !this.isLoggedIn()) {
          this.auth.persistTokenAndLoadProfile(res.accessToken).subscribe(() => {
            this.registered.emit({
              registrationId: res.registration.id,
              invoiceId: res.registration.invoiceId,
              isNewUser: res.isNewUser,
              autoLoggedIn,
            });
          });
        } else {
          this.registered.emit({
            registrationId: res.registration.id,
            invoiceId: res.registration.invoiceId,
            isNewUser: res.isNewUser,
            autoLoggedIn: false,
          });
        }
      },
      error: (err) => {
        this.submitting.set(false);
        try {
          const body = typeof err?.error?.message === 'string'
            ? JSON.parse(err.error.message)
            : err?.error;
          if (body?.requiresLogin) {
            this.emailStatus.set('exists');
            this.showInlineLogin.set(true);
            this.submitError.set('This email is already registered. Please log in first.');
          } else {
            this.submitError.set(body?.message ?? err?.error?.message ?? 'Registration failed.');
          }
        } catch {
          this.submitError.set(err?.error?.message ?? 'Registration failed. Please try again.');
        }
      },
    });
  }
}
