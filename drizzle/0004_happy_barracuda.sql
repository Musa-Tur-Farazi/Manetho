CREATE TABLE "study_group_members" (
	"membership_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(20) DEFAULT 'member' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_group_messages" (
	"message_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"content" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_groups" (
	"group_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"subject_id" uuid,
	"created_by" uuid NOT NULL,
	"meeting_type" varchar(20) NOT NULL,
	"location" text,
	"meeting_link" text,
	"next_meeting" timestamp,
	"meeting_time" varchar(50),
	"max_participants" integer DEFAULT 10 NOT NULL,
	"current_participants" integer DEFAULT 1 NOT NULL,
	"tags" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_follows" (
	"follow_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"follower_id" uuid NOT NULL,
	"following_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "study_group_members" ADD CONSTRAINT "study_group_members_group_id_study_groups_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."study_groups"("group_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_group_members" ADD CONSTRAINT "study_group_members_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_group_messages" ADD CONSTRAINT "study_group_messages_group_id_study_groups_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."study_groups"("group_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_group_messages" ADD CONSTRAINT "study_group_messages_sender_id_users_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_groups" ADD CONSTRAINT "study_groups_subject_id_subjects_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("subject_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_groups" ADD CONSTRAINT "study_groups_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_follower_id_users_user_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_following_id_users_user_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;