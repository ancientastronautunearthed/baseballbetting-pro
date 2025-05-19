CREATE TABLE "games" (
	"id" serial PRIMARY KEY NOT NULL,
	"mlb_id" varchar(255) NOT NULL,
	"home_team" varchar(255) NOT NULL,
	"away_team" varchar(255) NOT NULL,
	"home_team_abbreviation" varchar(10) NOT NULL,
	"away_team_abbreviation" varchar(10) NOT NULL,
	"home_team_record" varchar(10),
	"away_team_record" varchar(10),
	"home_team_moneyline" integer,
	"away_team_moneyline" integer,
	"start_time" timestamp NOT NULL,
	"status" text DEFAULT 'scheduled',
	"game_date" text NOT NULL,
	CONSTRAINT "games_mlb_id_unique" UNIQUE("mlb_id")
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"excerpt" varchar(500) NOT NULL,
	"content" text NOT NULL,
	"category" varchar(100) NOT NULL,
	"image_url" varchar(255),
	"publish_date" timestamp DEFAULT now(),
	"teams" text[],
	"impact" text DEFAULT 'medium'
);
--> statement-breakpoint
CREATE TABLE "predictions" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"home_team_win_probability" double precision DEFAULT 0.5 NOT NULL,
	"away_team_win_probability" double precision DEFAULT 0.5 NOT NULL,
	"recommended_bet" varchar(255) NOT NULL,
	"confidence_level" double precision NOT NULL,
	"analysis" text NOT NULL,
	"tier" varchar(50) DEFAULT 'basic' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"price" integer NOT NULL,
	"description" text NOT NULL,
	"features" text[] NOT NULL,
	"stripe_price_id" varchar(255),
	CONSTRAINT "subscription_plans_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text NOT NULL,
	"subscription_tier" text DEFAULT 'free',
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE cascade;