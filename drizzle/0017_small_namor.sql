ALTER TYPE "public"."notification_type" ADD VALUE 'study_group_invitation';--> statement-breakpoint
CREATE TABLE "direct_chat_meeting_links" (
	"link_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user1_id" uuid NOT NULL,
	"user2_id" uuid NOT NULL,
	"platform" varchar(50) NOT NULL,
	"url" text NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mind_map_nodes" DROP CONSTRAINT "mind_map_nodes_parent_node_id_mind_map_nodes_node_id_fk";
--> statement-breakpoint
ALTER TABLE "direct_chat_meeting_links" ADD CONSTRAINT "direct_chat_meeting_links_user1_id_users_user_id_fk" FOREIGN KEY ("user1_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "direct_chat_meeting_links" ADD CONSTRAINT "direct_chat_meeting_links_user2_id_users_user_id_fk" FOREIGN KEY ("user2_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "direct_chat_meeting_links" ADD CONSTRAINT "direct_chat_meeting_links_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;