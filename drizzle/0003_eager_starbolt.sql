CREATE TABLE "doubt_solving_files" (
	"file_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"message_id" uuid,
	"file_name" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"file_url" text NOT NULL,
	"file_size" bigint,
	"mime_type" varchar(100),
	"base64_data" text,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doubt_solving_messages" (
	"message_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"role" "message_role" NOT NULL,
	"content" text NOT NULL,
	"attachment_url" text,
	"attachment_type" varchar(50),
	"attachment_name" varchar(255),
	"token_count" integer,
	"processing_time" integer,
	"model_used" varchar(100),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doubt_solving_sessions" (
	"session_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"subject_id" uuid,
	"topic_id" uuid,
	"message_count" integer DEFAULT 0 NOT NULL,
	"last_message_at" timestamp DEFAULT now() NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "doubt_solving_files" ADD CONSTRAINT "doubt_solving_files_session_id_doubt_solving_sessions_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."doubt_solving_sessions"("session_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doubt_solving_files" ADD CONSTRAINT "doubt_solving_files_message_id_doubt_solving_messages_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."doubt_solving_messages"("message_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doubt_solving_messages" ADD CONSTRAINT "doubt_solving_messages_session_id_doubt_solving_sessions_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."doubt_solving_sessions"("session_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doubt_solving_sessions" ADD CONSTRAINT "doubt_solving_sessions_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doubt_solving_sessions" ADD CONSTRAINT "doubt_solving_sessions_subject_id_subjects_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("subject_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doubt_solving_sessions" ADD CONSTRAINT "doubt_solving_sessions_topic_id_topics_topic_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("topic_id") ON DELETE set null ON UPDATE no action;