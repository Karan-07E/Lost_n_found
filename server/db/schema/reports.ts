import { pgTable, text, timestamp, pgEnum, uuid, date, time } from 'drizzle-orm/pg-core';
import { users } from './users';

export const reportTypeEnum = pgEnum('report_type', ['LOST', 'FOUND']);
export const reportStatusEnum = pgEnum('report_status', ['ACTIVE', 'MATCHED', 'CLAIMED', 'RECOVERED', 'CLOSED']);

export const reports = pgTable('reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  reportType: reportTypeEnum('report_type').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  location: text('location').notNull(),
  eventDate: date('event_date').notNull(),
  eventTime: time('event_time'),
  contactInfo: text('contact_info'),
  imagePath: text('image_path'),
  additionalDetails: text('additional_details'),
  status: reportStatusEnum('status').default('ACTIVE').notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
