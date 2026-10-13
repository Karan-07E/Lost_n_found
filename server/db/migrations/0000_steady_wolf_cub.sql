CREATE TYPE "public"."report_status" AS ENUM('SUBMITTED', 'UNDER_REVIEW', 'MATCHED', 'VERIFICATION', 'RETURNED', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."report_type" AS ENUM('LOST', 'FOUND');--> statement-breakpoint
CREATE TYPE "public"."match_status" AS ENUM('PENDING', 'CONFIRMED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."claim_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'MORE_INFO_NEEDED');--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" text NOT NULL,
	"report_type" "report_type" NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"location" text NOT NULL,
	"event_date" date NOT NULL,
	"event_time" time,
	"identifying_features" text,
	"image_path" text,
	"additional_details" text,
	"reporter_name" text NOT NULL,
	"reporter_usn" text,
	"reporter_dept" text,
	"reporter_semester" text,
	"reporter_contact" text NOT NULL,
	"reporter_email" text,
	"status" "report_status" DEFAULT 'SUBMITTED' NOT NULL,
	"admin_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reports_report_id_unique" UNIQUE("report_id")
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lost_report_id" uuid NOT NULL,
	"found_report_id" uuid NOT NULL,
	"score" integer NOT NULL,
	"status" "match_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"claim_id" text NOT NULL,
	"found_report_id" uuid NOT NULL,
	"lost_report_id" uuid,
	"claimant_name" text NOT NULL,
	"claimant_usn" text NOT NULL,
	"claimant_dept" text,
	"claimant_contact" text NOT NULL,
	"claimant_email" text,
	"ownership_evidence" text NOT NULL,
	"additional_info" text,
	"status" "claim_status" DEFAULT 'PENDING' NOT NULL,
	"admin_notes" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "claims_claim_id_unique" UNIQUE("claim_id")
);
--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_lost_report_id_reports_id_fk" FOREIGN KEY ("lost_report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_found_report_id_reports_id_fk" FOREIGN KEY ("found_report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_found_report_id_reports_id_fk" FOREIGN KEY ("found_report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_lost_report_id_reports_id_fk" FOREIGN KEY ("lost_report_id") REFERENCES "public"."reports"("id") ON DELETE set null ON UPDATE no action;