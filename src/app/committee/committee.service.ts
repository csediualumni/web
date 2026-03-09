/**
 * Re-exports shared Committee types from admin.service so committee
 * components and admin components share the same interfaces.
 */
export type { Committee, CommitteeEntry, CommitteeMemberUser } from '../core/admin.service';
