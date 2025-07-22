CREATE TABLE "mind_map_connections" (
	"connection_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mindmap_id" uuid NOT NULL,
	"from_node_id" uuid NOT NULL,
	"to_node_id" uuid NOT NULL,
	"label" varchar(255),
	"connection_type" varchar(50) DEFAULT 'straight' NOT NULL,
	"color" varchar(7) DEFAULT '#6b7280',
	"thickness" integer DEFAULT 2 NOT NULL,
	"style" varchar(20) DEFAULT 'solid' NOT NULL,
	"arrow_type" varchar(20) DEFAULT 'none' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mind_map_nodes" (
	"node_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mindmap_id" uuid NOT NULL,
	"parent_node_id" uuid,
	"text" text NOT NULL,
	"level" integer DEFAULT 0 NOT NULL,
	"position_x" numeric(10, 2) DEFAULT '0',
	"position_y" numeric(10, 2) DEFAULT '0',
	"width" numeric(10, 2) DEFAULT '100',
	"height" numeric(10, 2) DEFAULT '50',
	"color" varchar(7) DEFAULT '#3B82F6',
	"background_color" varchar(7) DEFAULT '#ffffff',
	"font_size" integer DEFAULT 14 NOT NULL,
	"font_weight" varchar(20) DEFAULT 'normal',
	"border_radius" integer DEFAULT 8 NOT NULL,
	"border_width" integer DEFAULT 1 NOT NULL,
	"border_color" varchar(7) DEFAULT '#e5e7eb',
	"icon" varchar(100),
	"image_url" text,
	"notes" text,
	"is_collapsed" boolean DEFAULT false NOT NULL,
	"is_root" boolean DEFAULT false NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mind_map_templates" (
	"template_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100) NOT NULL,
	"thumbnail_url" text,
	"template_data" jsonb NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"rating" numeric(2, 1) DEFAULT '0.0',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mind_maps" ADD COLUMN "prompt" text;--> statement-breakpoint
ALTER TABLE "mind_maps" ADD COLUMN "layout" varchar(50) DEFAULT 'tree' NOT NULL;--> statement-breakpoint
ALTER TABLE "mind_maps" ADD COLUMN "theme" varchar(50) DEFAULT 'default' NOT NULL;--> statement-breakpoint
ALTER TABLE "mind_maps" ADD COLUMN "background_color" varchar(7) DEFAULT '#ffffff';--> statement-breakpoint
ALTER TABLE "mind_maps" ADD COLUMN "content_source" "content_source" DEFAULT 'user_created' NOT NULL;--> statement-breakpoint
ALTER TABLE "mind_maps" ADD COLUMN "ai_confidence_score" numeric(3, 2);--> statement-breakpoint
ALTER TABLE "mind_maps" ADD COLUMN "node_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "mind_maps" ADD COLUMN "connection_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "mind_maps" ADD COLUMN "last_edited_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "mind_map_connections" ADD CONSTRAINT "mind_map_connections_mindmap_id_mind_maps_mindmap_id_fk" FOREIGN KEY ("mindmap_id") REFERENCES "public"."mind_maps"("mindmap_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mind_map_connections" ADD CONSTRAINT "mind_map_connections_from_node_id_mind_map_nodes_node_id_fk" FOREIGN KEY ("from_node_id") REFERENCES "public"."mind_map_nodes"("node_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mind_map_connections" ADD CONSTRAINT "mind_map_connections_to_node_id_mind_map_nodes_node_id_fk" FOREIGN KEY ("to_node_id") REFERENCES "public"."mind_map_nodes"("node_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mind_map_nodes" ADD CONSTRAINT "mind_map_nodes_mindmap_id_mind_maps_mindmap_id_fk" FOREIGN KEY ("mindmap_id") REFERENCES "public"."mind_maps"("mindmap_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mind_map_nodes" ADD CONSTRAINT "mind_map_nodes_parent_node_id_mind_map_nodes_node_id_fk" FOREIGN KEY ("parent_node_id") REFERENCES "public"."mind_map_nodes"("node_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mind_map_templates" ADD CONSTRAINT "mind_map_templates_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mind_maps" DROP COLUMN "file_url";--> statement-breakpoint
ALTER TABLE "mind_maps" DROP COLUMN "thumbnail_url";