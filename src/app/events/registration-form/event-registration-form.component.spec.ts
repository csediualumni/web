import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { EventRegistrationFormComponent } from './event-registration-form.component';
import { AuthService } from '../../core/auth.service';
import { EventsService } from '../../core/events.service';
import type { ApiEvent } from '../../core/admin.service';

const EVENT = {
  id: 'event-1',
  ticketPrice: 500,
  allowFamilyMembers: false,
  donationEnabled: false,
} as unknown as ApiEvent;

describe('EventRegistrationFormComponent', () => {
  it('sends photo URL in guest registration payload', async () => {
    const authMock = {
      isLoggedIn: vi.fn(() => false),
      currentUser: vi.fn(() => null),
      login: vi.fn(),
      loadProfile: vi.fn(),
      updateProfile: vi.fn(),
      uploadAvatar: vi.fn(),
      persistTokenAndLoadProfile: vi.fn(),
    };
    const eventsMock = {
      checkEmail: vi.fn(),
      registerLoggedIn: vi.fn(),
      registerWithProfile: vi.fn(() => of({ registration: { id: 'r1', status: 'pending' }, isNewUser: true })),
    };

    await TestBed.configureTestingModule({
      imports: [EventRegistrationFormComponent],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: EventsService, useValue: eventsMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(EventRegistrationFormComponent);
    fixture.componentRef.setInput('event', EVENT);
    fixture.detectChanges();

    fixture.componentInstance.form.patchValue({
      fullName: 'Guest User',
      email: 'guest@example.com',
      phone: '01700000000',
      gender: 'male',
      photo: 'https://example.com/photo.jpg',
    });

    fixture.componentInstance.submit();

    expect(eventsMock.registerWithProfile).toHaveBeenCalledOnce();
    const payload = (eventsMock.registerWithProfile as any).mock.calls[0][1];
    expect(payload.profile.photo).toBe('https://example.com/photo.jpg');
  });

  it('uploads selected avatar file for logged-in registrations', async () => {
    const authMock = {
      isLoggedIn: vi.fn(() => true),
      currentUser: vi.fn(() => ({
        email: 'user@example.com',
        profile: { displayName: 'User Name', phone: '01700000000', gender: 'male', avatar: null },
      })),
      login: vi.fn(),
      loadProfile: vi.fn(() => of({
        id: 'u1',
        email: 'user@example.com',
        displayName: 'User Name',
        phone: '01700000000',
        gender: 'male',
        avatar: null,
        birthday: null,
        bloodGroup: null,
        nationality: null,
        religion: null,
        presentAddress: null,
        permanentAddress: null,
        experiences: [],
        educations: [],
        achievements: [],
        batch: null,
        bio: null,
        jobTitle: null,
        company: null,
        industry: null,
        city: null,
        country: null,
        linkedin: null,
        github: null,
        twitter: null,
        website: null,
        skills: null,
        openToMentoring: false,
        profileVisibility: true,
        profession: null,
        organization: null,
        designation: null,
        isGuest: false,
      })),
      updateProfile: vi.fn(() => of({})),
      uploadAvatar: vi.fn(() => of({ avatar: 'https://example.com/new.jpg' })),
      persistTokenAndLoadProfile: vi.fn(),
    };
    const eventsMock = {
      checkEmail: vi.fn(),
      registerLoggedIn: vi.fn(() => of({ message: 'ok', registration: { id: 'r1', status: 'pending' } })),
      registerWithProfile: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [EventRegistrationFormComponent],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: EventsService, useValue: eventsMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(EventRegistrationFormComponent);
    fixture.componentRef.setInput('event', EVENT);
    fixture.detectChanges();

    fixture.componentInstance.selectedAvatarFile.set(new File(['x'], 'avatar.png', { type: 'image/png' }));
    fixture.componentInstance.submit();

    expect(authMock.uploadAvatar).toHaveBeenCalledOnce();
    expect(eventsMock.registerLoggedIn).toHaveBeenCalledOnce();
  });
});
