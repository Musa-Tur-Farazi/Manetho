ALTER TABLE "flashcards" ADD COLUMN "question" text NOT NULL;--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN "answer" text NOT NULL;--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN "hint" text;--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN "explanation" text;--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN "difficulty" "difficulty" DEFAULT 'beginner' NOT NULL;--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN "order_index" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN "content_source" "content_source" DEFAULT 'user_created' NOT NULL;--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN "ai_confidence_score" numeric(3, 2);--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN "user_rating" integer;--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN "times_reviewed" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN "correct_answers" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN "last_reviewed" timestamp;--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN "needs_review" boolean DEFAULT false NOT NULL;