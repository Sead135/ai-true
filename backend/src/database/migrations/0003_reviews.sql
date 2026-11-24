CREATE TYPE "public"."review_status" AS ENUM('new', 'processed');--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"text" text NOT NULL,
	"author_name" varchar(120) NOT NULL,
	"status" "review_status" DEFAULT 'new' NOT NULL,
	"reviewed_on" timestamp with time zone NOT NULL,
	"mock_key" varchar(32) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_branch_mock_key_uq" UNIQUE("branch_id","mock_key")
);
--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;