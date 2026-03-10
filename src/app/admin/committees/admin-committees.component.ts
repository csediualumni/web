import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AdminService,
  Committee,
  CommitteeEntry,
  AdminUser,
  DesignationMapping,
} from '../../core/admin.service';
import { AuthService } from '../../core/auth.service';
import { colorFor, initialsFor } from '../../committee/committee.component';

type View = 'list' | 'create' | 'edit' | 'members' | 'designations';

const DESIGNATIONS = [
  'President',
  'Vice President',
  'General Secretary',
  'Joint Secretary',
  'Treasurer',
  'Assistant Treasurer',
  'Executive Member',
  'Adviser',
];

@Component({
  selector: 'app-admin-committees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-committees.component.html',
})
export class AdminCommitteesComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  public readonly auth = inject(AuthService);

  view = signal<View>('list');
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  success = signal('');

  committees = signal<Committee[]>([]);
  allUsers = signal<AdminUser[]>([]);
  deleting = signal<Set<string>>(new Set());

  // selected committee for edit / members view
  selected = signal<Committee | null>(null);

  // Committee form
  formTerm = signal('');
  formSessionLabel = signal('');
  formTheme = signal('');
  formIsCurrent = signal(false);
  formSortOrder = signal(0);

  // Member form
  addMemberUserId = signal('');
  addMemberDesignation = signal('President');
  addMemberSortOrder = signal(0);
  addingMember = signal(false);
  removingMemberIds = signal<Set<string>>(new Set());
  userSearch = signal('');

  // Designation → Role mappings view
  mappings = signal<DesignationMapping[]>([]);
  allRoles = signal<{ id: string; name: string; description: string | null }[]>([]);
  loadingMappings = signal(false);
  newMapDesignation = signal('');
  newMapRoleId = signal('');
  addingMapping = signal(false);
  deletingMappingIds = signal<Set<string>>(new Set());

  filteredUsers = computed(() => {
    const q = this.userSearch().toLowerCase();
    if (!q) return this.allUsers().slice(0, 50);
    return this.allUsers()
      .filter((u) => (u.displayName ?? u.email).toLowerCase().includes(q))
      .slice(0, 30);
  });

  currentMembers = computed(() => {
    const sel = this.selected();
    return sel ? [...sel.members].sort((a, b) => a.sortOrder - b.sortOrder) : [];
  });

  designations = DESIGNATIONS;
  colorFor = colorFor;
  initialsFor = initialsFor;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.adminService.adminListCommittees().subscribe({
      next: (data) => {
        this.committees.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          err?.status === 403
            ? "You don't have permission to view this."
            : 'Failed to load committees.',
        );
        this.loading.set(false);
      },
    });
    this.adminService.listUsers().subscribe({
      next: (u) => this.allUsers.set(u),
    });
  }

  openCreate(): void {
    this.formTerm.set('');
    this.formSessionLabel.set('');
    this.formTheme.set('');
    this.formIsCurrent.set(false);
    this.formSortOrder.set(this.committees().length);
    this.error.set('');
    this.success.set('');
    this.view.set('create');
  }

  openEdit(c: Committee): void {
    this.selected.set(c);
    this.formTerm.set(c.term);
    this.formSessionLabel.set(c.sessionLabel);
    this.formTheme.set(c.theme ?? '');
    this.formIsCurrent.set(c.isCurrent);
    this.formSortOrder.set(c.sortOrder);
    this.error.set('');
    this.success.set('');
    this.view.set('edit');
  }

  openMembers(c: Committee): void {
    this.selected.set(c);
    this.addMemberUserId.set('');
    this.addMemberDesignation.set('President');
    this.addMemberSortOrder.set(c.members.length);
    this.userSearch.set('');
    this.error.set('');
    this.success.set('');
    this.view.set('members');
  }

  cancelForm(): void {
    this.view.set('list');
    this.selected.set(null);
    this.error.set('');
    this.success.set('');
  }

  saveCommittee(): void {
    const term = this.formTerm().trim();
    const sessionLabel = this.formSessionLabel().trim();
    if (!term || !sessionLabel) {
      this.error.set('Term and session label are required.');
      return;
    }

    this.saving.set(true);
    this.error.set('');

    const payload = {
      term,
      sessionLabel,
      theme: this.formTheme().trim() || undefined,
      isCurrent: this.formIsCurrent(),
      sortOrder: this.formSortOrder(),
    };

    const id = this.selected()?.id;
    const req = id
      ? this.adminService.adminUpdateCommittee(id, payload)
      : this.adminService.adminCreateCommittee(payload);

    req.subscribe({
      next: (saved) => {
        if (id) {
          this.committees.update((list) => list.map((c) => (c.id === id ? saved : c)));
          this.success.set('Committee updated.');
        } else {
          this.committees.update((list) => [...list, saved]);
          this.success.set('Committee created.');
        }
        this.saving.set(false);
        this.view.set('list');
      },
      error: (err) => {
        this.error.set(
          err?.status === 403
            ? "You don't have permission."
            : (err.error?.message ?? 'Failed to save.'),
        );
        this.saving.set(false);
      },
    });
  }

  deleteCommittee(c: Committee): void {
    if (!confirm(`Delete committee "${c.sessionLabel}"? This will also remove all members.`))
      return;
    this.deleting.update((s) => new Set([...s, c.id]));
    this.adminService.adminDeleteCommittee(c.id).subscribe({
      next: () => {
        this.committees.update((list) => list.filter((x) => x.id !== c.id));
        this.deleting.update((s) => {
          const n = new Set(s);
          n.delete(c.id);
          return n;
        });
        this.success.set('Committee deleted.');
      },
      error: (err) => {
        this.error.set(err?.status === 403 ? "You don't have permission." : 'Failed to delete.');
        this.deleting.update((s) => {
          const n = new Set(s);
          n.delete(c.id);
          return n;
        });
      },
    });
  }

  isDeleting(id: string): boolean {
    return this.deleting().has(id);
  }

  addMember(): void {
    const userId = this.addMemberUserId();
    const designation = this.addMemberDesignation();
    if (!userId) {
      this.error.set('Select a user first.');
      return;
    }

    const committeeId = this.selected()!.id;
    this.addingMember.set(true);
    this.error.set('');

    this.adminService
      .adminAddCommitteeMember(committeeId, {
        userId,
        designation,
        sortOrder: this.addMemberSortOrder(),
      })
      .subscribe({
        next: (newEntry) => {
          this.committees.update((list) =>
            list.map((c) =>
              c.id === committeeId ? { ...c, members: [...c.members, newEntry] } : c,
            ),
          );
          this.selected.update((c) => (c ? { ...c, members: [...c.members, newEntry] } : c));
          this.addMemberUserId.set('');
          this.userSearch.set('');
          this.success.set('Member added.');
          this.addingMember.set(false);
        },
        error: (err) => {
          this.error.set(
            err?.status === 403
              ? "You don't have permission."
              : (err.error?.message ?? 'Failed to add member.'),
          );
          this.addingMember.set(false);
        },
      });
  }

  removeMember(entry: CommitteeEntry): void {
    if (!confirm(`Remove ${entry.user.displayName || entry.user.email} from this committee?`))
      return;
    const committeeId = this.selected()!.id;
    this.removingMemberIds.update((s) => new Set([...s, entry.id]));

    this.adminService.adminRemoveCommitteeMember(entry.id).subscribe({
      next: () => {
        const remove = (list: CommitteeEntry[]) => list.filter((m) => m.id !== entry.id);
        this.committees.update((list) =>
          list.map((c) => (c.id === committeeId ? { ...c, members: remove(c.members) } : c)),
        );
        this.selected.update((c) => (c ? { ...c, members: remove(c.members) } : c));
        this.removingMemberIds.update((s) => {
          const n = new Set(s);
          n.delete(entry.id);
          return n;
        });
        this.success.set('Member removed.');
      },
      error: (err) => {
        this.error.set(
          err?.status === 403 ? "You don't have permission." : 'Failed to remove member.',
        );
        this.removingMemberIds.update((s) => {
          const n = new Set(s);
          n.delete(entry.id);
          return n;
        });
      },
    });
  }

  isRemovingMember(id: string): boolean {
    return this.removingMemberIds().has(id);
  }

  selectUser(userId: string): void {
    this.addMemberUserId.set(userId);
    this.userSearch.set(this.allUsers().find((u) => u.id === userId)?.displayName ?? userId);
  }

  // ── Designation → Role Mappings ──────────────────────────────────────────

  openDesignations(): void {
    this.error.set('');
    this.success.set('');
    this.newMapDesignation.set('');
    this.newMapRoleId.set('');
    this.loadingMappings.set(true);
    this.view.set('designations');

    this.adminService.adminListDesignationMappings().subscribe({
      next: (m) => {
        this.mappings.set(m);
        this.loadingMappings.set(false);
      },
      error: () => {
        this.error.set('Failed to load designation mappings.');
        this.loadingMappings.set(false);
      },
    });
    this.adminService.listRoles().subscribe({
      next: (r) => this.allRoles.set(r),
    });
  }

  addMapping(): void {
    const designation = this.newMapDesignation().trim();
    const roleId = this.newMapRoleId();
    if (!designation || !roleId) {
      this.error.set('Designation and role are required.');
      return;
    }
    this.addingMapping.set(true);
    this.error.set('');
    this.adminService.adminSetDesignationMapping(designation, roleId).subscribe({
      next: (m) => {
        this.mappings.update((list) => {
          const idx = list.findIndex((x) => x.id === m.id);
          return idx >= 0 ? list.map((x) => (x.id === m.id ? m : x)) : [...list, m];
        });
        this.newMapDesignation.set('');
        this.newMapRoleId.set('');
        this.success.set('Mapping saved.');
        this.addingMapping.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to save mapping.');
        this.addingMapping.set(false);
      },
    });
  }

  updateMappingRole(m: DesignationMapping, roleId: string): void {
    this.adminService.adminUpdateDesignationMapping(m.id, roleId).subscribe({
      next: (updated) => {
        this.mappings.update((list) => list.map((x) => (x.id === updated.id ? updated : x)));
        this.success.set('Mapping updated.');
      },
      error: (err) => this.error.set(err?.error?.message ?? 'Failed to update mapping.'),
    });
  }

  removeMapping(m: DesignationMapping): void {
    if (!confirm(`Remove mapping for "${m.designation}"?`)) return;
    this.deletingMappingIds.update((s) => new Set([...s, m.id]));
    this.adminService.adminRemoveDesignationMapping(m.id).subscribe({
      next: () => {
        this.mappings.update((list) => list.filter((x) => x.id !== m.id));
        this.deletingMappingIds.update((s) => {
          const n = new Set(s);
          n.delete(m.id);
          return n;
        });
        this.success.set('Mapping removed.');
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to remove mapping.');
        this.deletingMappingIds.update((s) => {
          const n = new Set(s);
          n.delete(m.id);
          return n;
        });
      },
    });
  }

  isDeletingMapping(id: string): boolean {
    return this.deletingMappingIds().has(id);
  }
}
