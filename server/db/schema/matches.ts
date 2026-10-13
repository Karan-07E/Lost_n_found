import { pgTable, timestamp, pgEnum, uuid, integer } from 'drizzle-orm/pg-core';
import { reports } from './reports';

export const matchStatusEnum = pgEnum('match_status', ['PENDING', 'CONFIRMED', 'REJECTED']);

export const matches = pgTable('matches', {
  id: uuid('id').defaultRandom().primaryKey(),
  lostReportId: uuid('lost_report_id').references(() => reports.id, { onDelete: 'cascade' }).notNull(),
  foundReportId: uuid('found_report_id').references(() => reports.id, { onDelete: 'cascade' }).notNull(),
  score: integer('score').notNull(), // 0-100 match confidence
  status: matchStatusEnum('status').default('PENDING').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
