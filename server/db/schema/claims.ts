import { pgTable, text, timestamp, pgEnum, uuid } from 'drizzle-orm/pg-core';
import { reports } from './reports';

export const claimStatusEnum = pgEnum('claim_status', ['PENDING', 'APPROVED', 'REJECTED', 'MORE_INFO_NEEDED']);

export const claims = pgTable('claims', {
  id: uuid('id').defaultRandom().primaryKey(),
  claimId: text('claim_id').notNull().unique(), // e.g. CLM-2026-00042

  foundReportId: uuid('found_report_id').references(() => reports.id, { onDelete: 'cascade' }).notNull(),
  lostReportId: uuid('lost_report_id').references(() => reports.id, { onDelete: 'set null' }), // optional link

  // Claimant info
  claimantName: text('claimant_name').notNull(),
  claimantUsn: text('claimant_usn').notNull(),
  claimantDept: text('claimant_dept'),
  claimantContact: text('claimant_contact').notNull(),
  claimantEmail: text('claimant_email'),

  // Ownership evidence — user describes private details not publicly shown
  ownershipEvidence: text('ownership_evidence').notNull(),
  additionalInfo: text('additional_info'),

  status: claimStatusEnum('status').default('PENDING').notNull(),
  adminNotes: text('admin_notes'),
  reviewedAt: timestamp('reviewed_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
