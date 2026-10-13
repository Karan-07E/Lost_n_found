import { pgTable, text, timestamp, pgEnum, uuid, date, time, serial } from 'drizzle-orm/pg-core';

export const reportTypeEnum = pgEnum('report_type', ['LOST', 'FOUND']);
export const reportStatusEnum = pgEnum('report_status', ['SUBMITTED', 'UNDER_REVIEW', 'MATCHED', 'VERIFICATION', 'RETURNED', 'CLOSED']);

export const reports = pgTable('reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  reportId: text('report_id').notNull().unique(), // e.g. LF-2026-00124
  reportType: reportTypeEnum('report_type').notNull(),

  // Item details
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  location: text('location').notNull(),
  specificLocation: text('specific_location'),
  eventDate: date('event_date').notNull(),
  eventTime: time('event_time'),
  identifyingFeatures: text('identifying_features'),
  imagePath: text('image_path'),
  additionalDetails: text('additional_details'),

  // Reporter info (stored directly — no login required)
  reporterName: text('reporter_name').notNull(),
  reporterUsn: text('reporter_usn'),         // Only for LOST reports (student USN)
  reporterDept: text('reporter_dept'),
  reporterSemester: text('reporter_semester'),
  reporterContact: text('reporter_contact').notNull(),
  reporterEmail: text('reporter_email'),

  status: reportStatusEnum('status').default('SUBMITTED').notNull(),
  adminNotes: text('admin_notes'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
