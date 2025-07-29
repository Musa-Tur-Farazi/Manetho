ALTER TABLE "threads" ADD COLUMN "post_type" varchar(20) DEFAULT 'post' NOT NULL;--> statement-breakpoint
ALTER TABLE "threads" ADD COLUMN "images" jsonb;--> statement-breakpoint
ALTER TABLE "threads" ADD COLUMN "poll_options" jsonb;--> statement-breakpoint
ALTER TABLE "threads" ADD COLUMN "poll_votes" jsonb;