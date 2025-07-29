ALTER TABLE "study_group_messages" ALTER COLUMN "content" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "study_group_messages" ADD COLUMN "file_url" text;--> statement-breakpoint
ALTER TABLE "study_group_messages" ADD COLUMN "file_name" varchar(255);--> statement-breakpoint
ALTER TABLE "study_group_messages" ADD COLUMN "file_type" varchar(100);--> statement-breakpoint
ALTER TABLE "study_group_messages" ADD COLUMN "file_size" bigint;