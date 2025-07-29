CREATE TABLE "quiz_categories" (
	"category_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"icon_url" text,
	"color" varchar(7) DEFAULT '#3B82F6',
	"difficulty" "difficulty" DEFAULT 'beginner' NOT NULL,
	"subject_id" uuid,
	"topic_id" uuid,
	"total_questions" integer DEFAULT 0 NOT NULL,
	"average_rating" numeric(2, 1) DEFAULT '0.0',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_quiz_history" (
	"history_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"test_id" uuid NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"accuracy_rate" numeric(5, 2) DEFAULT '0.00',
	"time_spent" integer DEFAULT 0 NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	"submission_data" jsonb
);
--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN "ai_generated" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "practice_tests" ADD COLUMN "total_points" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "practice_tests" ADD COLUMN "tags" jsonb;--> statement-breakpoint
ALTER TABLE "practice_tests" ADD COLUMN "ai_generated" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "practice_tests" ADD COLUMN "generation_prompt" text;--> statement-breakpoint
ALTER TABLE "test_questions" ADD COLUMN "ai_generated" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz_categories" ADD CONSTRAINT "quiz_categories_subject_id_subjects_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("subject_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_categories" ADD CONSTRAINT "quiz_categories_topic_id_topics_topic_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("topic_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_quiz_history" ADD CONSTRAINT "user_quiz_history_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_quiz_history" ADD CONSTRAINT "user_quiz_history_test_id_practice_tests_test_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."practice_tests"("test_id") ON DELETE cascade ON UPDATE no action;