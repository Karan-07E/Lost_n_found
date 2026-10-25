import { pgTable, text, timestamp, pgEnum, uuid, integer, boolean } from 'drizzle-orm/pg-core';
import { reports } from './reports';
import { matches } from './matches';

export const recoveryCaseStatusEnum = pgEnum('recovery_case_status', [
  'MATCH_CONFIRMED',
  'HANDOVER_PENDING',
  'OTP_SENT',
  'OTP_VERIFIED',
  'RECEIVED_CONFIRMED',
  'CANCELLED',
  'DISPUTED',
]);

export const recoveryActorRoleEnum = pgEnum('recovery_actor_role', [
  'OWNER',
  'FINDER',
  'SYSTEM',
  'ADMIN',
]);

export const recoveryAuditActionEnum = pgEnum('recovery_audit_action', [
  'CASE_CREATED',
  'HANDOVER_SCHEDULED',
  'OTP_REQUESTED',
  'OTP_ATTEMPT_FAILED',
  'OTP_VERIFIED',
  'RECEIPT_CONFIRMED',
  'DISPUTED',
  'CANCELLED',
]);

export const recoveryCases = pgTable('recovery_cases', {
  id: uuid('id').defaultRandom().primaryKey(),
  caseNumber: text('case_number').notNull().unique(), // e.g. RC-2026-00042
  
  lostReportId: uuid('lost_report_id').references(() => reports.id, { onDelete: 'cascade' }).notNull(),
  foundReportId: uuid('found_report_id').references(() => reports.id, { onDelete: 'cascade' }).notNull(),
  matchId: uuid('match_id').references(() => matches.id, { onDelete: 'set null' }),

  status: recoveryCaseStatusEnum('status').default('MATCH_CONFIRMED').notNull(),

  // Handover Meeting Coordination
  meetingLocation: text('meeting_location'),
  meetingNotes: text('meeting_notes'),

  // OTP Verification Security Fields (Backend exclusive, hash only)
  otpHash: text('otp_hash'),
  otpExpiresAt: timestamp('otp_expires_at'),
  otpAttempts: integer('otp_attempts').default(0).notNull(),
  otpLastSentAt: timestamp('otp_last_sent_at'),
  otpResendCount: integer('otp_resend_count').default(0).notNull(),
  otpVerifiedAt: timestamp('otp_verified_at'),

  // Owner Receipt Confirmation Fields
  ownerAcknowledgment: boolean('owner_acknowledgment').default(false).notNull(),
  ownerAcknowledgmentText: text('owner_acknowledgment_text'),
  ownerAcknowledgmentVersion: text('owner_acknowledgment_version').default('v1.0'),
  ownerRemarks: text('owner_remarks'),
  receivedConfirmedAt: timestamp('received_confirmed_at'),

  // Disputes & Cancellations
  disputeReason: text('dispute_reason'),
  disputedBy: recoveryActorRoleEnum('disputed_by'),
  disputedAt: timestamp('disputed_at'),

  cancelledReason: text('cancelled_reason'),
  cancelledBy: recoveryActorRoleEnum('cancelled_by'),
  cancelledAt: timestamp('cancelled_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const recoveryAuditLogs = pgTable('recovery_audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  recoveryCaseId: uuid('recovery_case_id').references(() => recoveryCases.id, { onDelete: 'cascade' }).notNull(),
  actorRole: recoveryActorRoleEnum('actor_role').notNull(),
  actorIdentifier: text('actor_identifier').notNull(),
  action: recoveryAuditActionEnum('action').notNull(),
  details: text('details'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const recoveryNotifications = pgTable('recovery_notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  recoveryCaseId: uuid('recovery_case_id').references(() => recoveryCases.id, { onDelete: 'cascade' }),
  recipientEmail: text('recipient_email').notNull(),
  recipientRole: recoveryActorRoleEnum('recipient_role').notNull(),
  notificationType: text('notification_type').notNull(),
  subject: text('subject').notNull(),
  deliveryStatus: text('delivery_status').notNull(), // 'SENT', 'FAILED', 'SIMULATED'
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
