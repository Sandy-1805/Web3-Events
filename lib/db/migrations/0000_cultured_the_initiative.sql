CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"location" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"author_name" text,
	"upvotes" integer DEFAULT 0,
	"session_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "session_speakers" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"speaker_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"room" text NOT NULL,
	"capacity" integer,
	"event_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "speakers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"photo" text,
	"bio" text,
	"social_links" text,
	"created_at" timestamp DEFAULT now()
);
