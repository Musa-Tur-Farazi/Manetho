ALTER TABLE "direct_messages" ADD COLUMN "file_url" text;--> statement-breakpoint
ALTER TABLE "direct_messages" ADD COLUMN "file_name" varchar(255);--> statement-breakpoint
ALTER TABLE "direct_messages" ADD COLUMN "file_type" varchar(100);--> statement-breakpoint
ALTER TABLE "direct_messages" ADD COLUMN "file_size" bigint;