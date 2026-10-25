CREATE TYPE "public"."recovery_actor_role" AS ENUM('OWNER', 'FINDER', 'SYSTEM', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."recovery_audit_action" AS ENUM('CASE_CREATED', 'HANDOVER_SCHEDULED', 'OTP_REQUESTED', 'OTP_ATTEMPT_FAILED', 'OTP_VERIFIED', 'RECEIPT_CONFIRMED', 'DISPUTED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."recovery_case_status" AS ENUM('MATCH_CONFIRMED', 'HANDOVER_PENDING', 'OTP_SENT', 'OTP_VERIFIED', 'RECEIVED_CONFIRMED', 'CANCELLED', 'DISPUTED');--> statement-breakpoint
CREATE TABLE "recovery_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recovery_case_id" uuid NOT NULL,
	"actor_role" "recovery_actor_role" NOT NULL,
	"actor_identifier" text NOT NULL,
	"action" "recovery_audit_action" NOT NULL,
	"details" text,
	"ip_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recovery_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_number" text NOT NULL,
	"lost_report_id" uuid NOT NULL,
	"found_report_id" uuid NOT NULL,
	"match_id" uuid,
	"status" "recovery_case_status" DEFAULT 'MATCH_CONFIRMED' NOT NULL,
	"meeting_location" text,
	"meeting_notes" text,
	"otp_hash" text,
	"otp_expires_at" timestamp,
	"otp_attempts" integer DEFAULT 0 NOT NULL,
	"otp_last_sent_at" timestamp,
	"otp_resend_count" integer DEFAULT 0 NOT NULL,
	"otp_verified_at" timestamp,
	"owner_acknowledgment" boolean DEFAULT false NOT NULL,
	"owner_acknowledgment_text" text,
	"owner_acknowledgment_version" text DEFAULT 'v1.0',
	"owner_remarks" text,
	"received_confirmed_at" timestamp,
	"dispute_reason" text,
	"disputed_by" "recovery_actor_role",
	"disputed_at" timestamp,
	"cancelled_reason" text,
	"cancelled_by" "recovery_actor_role",
	"cancelled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "recovery_cases_case_number_unique" UNIQUE("case_number")
);
--> statement-breakpoint
CREATE TABLE "recovery_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recovery_case_id" uuid,
	"recipient_email" text NOT NULL,
	"recipient_role" "recovery_actor_role" NOT NULL,
	"notification_type" text NOT NULL,
	"subject" text NOT NULL,
	"delivery_status" text NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "access_token" text;--> statement-breakpoint
ALTER TABLE "recovery_audit_logs" ADD CONSTRAINT "recovery_audit_logs_recovery_case_id_recovery_cases_id_fk" FOREIGN KEY ("recovery_case_id") REFERENCES "public"."recovery_cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recovery_cases" ADD CONSTRAINT "recovery_cases_lost_report_id_reports_id_fk" FOREIGN KEY ("lost_report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recovery_cases" ADD CONSTRAINT "recovery_cases_found_report_id_reports_id_fk" FOREIGN KEY ("found_report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recovery_cases" ADD CONSTRAINT "recovery_cases_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recovery_notifications" ADD CONSTRAINT "recovery_notifications_recovery_case_id_recovery_cases_id_fk" FOREIGN KEY ("recovery_case_id") REFERENCES "public"."recovery_cases"("id") ON DELETE cascade ON UPDATE no action;