ALTER TABLE "flashcard_decks" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "flashcard_decks" CASCADE;--> statement-breakpoint
ALTER TABLE "flashcards" DROP CONSTRAINT "flashcards_deck_id_flashcard_decks_deck_id_fk";
--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcards" DROP COLUMN "deck_id";--> statement-breakpoint
ALTER TABLE "flashcards" DROP COLUMN "hint";--> statement-breakpoint
ALTER TABLE "flashcards" DROP COLUMN "explanation";--> statement-breakpoint
ALTER TABLE "flashcards" DROP COLUMN "difficulty";--> statement-breakpoint
ALTER TABLE "flashcards" DROP COLUMN "order_index";--> statement-breakpoint
ALTER TABLE "flashcards" DROP COLUMN "content_source";--> statement-breakpoint
ALTER TABLE "flashcards" DROP COLUMN "ai_confidence_score";--> statement-breakpoint
ALTER TABLE "flashcards" DROP COLUMN "user_rating";--> statement-breakpoint
ALTER TABLE "flashcards" DROP COLUMN "times_reviewed";--> statement-breakpoint
ALTER TABLE "flashcards" DROP COLUMN "correct_answers";--> statement-breakpoint
ALTER TABLE "flashcards" DROP COLUMN "last_reviewed";--> statement-breakpoint
ALTER TABLE "flashcards" DROP COLUMN "needs_review";