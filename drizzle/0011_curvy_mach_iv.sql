CREATE TABLE "meeting_links" (
	"link_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"platform" varchar(50) NOT NULL,
	"url" text NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "meeting_links" ADD CONSTRAINT "meeting_links_group_id_study_groups_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."study_groups"("group_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_links" ADD CONSTRAINT "meeting_links_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcards" DROP COLUMN "question";--> statement-breakpoint
ALTER TABLE "flashcards" DROP COLUMN "answer";