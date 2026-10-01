import { pgTable, text, timestamp, pgEnum, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';
import { reports } from './reports';

export const claimStatusEnum = pgEnum('claim_status', ['PENDING', 'APPROVED', 'REJECTED']);

export const claims = pgTable('claims', {
  id: uuid('id').defaultRandom().primaryKey(),
  foundReportId: uuid('found_report_id').references(() => reports.id, { onDelete: 'cascade' }).notNull(),
  claimantId: uuid('claimant_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  justification: text('justification').notNull(),
  proofImagePath: text('proof_image_path'),
  status: claimStatusEnum('status').default('PENDING').notNull(),
  reviewedBy: uuid('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
