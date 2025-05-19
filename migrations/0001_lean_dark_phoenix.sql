CREATE TABLE "bankroll_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"date" timestamp NOT NULL,
	"balance" double precision NOT NULL,
	"deposits" double precision DEFAULT 0,
	"withdrawals" double precision DEFAULT 0,
	"betting_profit_loss" double precision DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "feature_store" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" varchar(255) NOT NULL,
	"feature_set" varchar(100) NOT NULL,
	"features" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "game_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"venue" varchar(255),
	"venue_surface" varchar(100),
	"venue_capacity" integer,
	"temperature" integer,
	"humidity" integer,
	"wind_speed" integer,
	"wind_direction" varchar(50),
	"precipitation" varchar(50),
	"home_team_rest_days" integer,
	"away_team_rest_days" integer,
	"home_team_travel_distance" integer,
	"away_team_travel_distance" integer,
	"is_double_header" boolean DEFAULT false,
	"double_header_game" integer,
	"home_plate_umpire" varchar(255),
	"umpire_strike_zone_size" varchar(50),
	"run_line" double precision,
	"home_team_run_line_odds" integer,
	"away_team_run_line_odds" integer,
	"over_under_total" double precision,
	"over_odds" integer,
	"under_odds" integer,
	"opening_home_moneyline" integer,
	"opening_away_moneyline" integer,
	"opening_run_line" double precision,
	"opening_over_under_total" double precision,
	"home_moneyline_percentage" integer,
	"away_moneyline_percentage" integer,
	"over_percentage" integer,
	"under_percentage" integer,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "game_pitchers" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"home_pitcher_id" integer,
	"away_pitcher_id" integer,
	"home_pitcher_name" varchar(255),
	"away_pitcher_name" varchar(255),
	"home_pitcher_wins" integer,
	"home_pitcher_losses" integer,
	"home_pitcher_era" double precision,
	"home_pitcher_whip" double precision,
	"home_pitcher_innings_pitched" double precision,
	"home_pitcher_strikeouts" integer,
	"home_pitcher_walks" integer,
	"away_pitcher_wins" integer,
	"away_pitcher_losses" integer,
	"away_pitcher_era" double precision,
	"away_pitcher_whip" double precision,
	"away_pitcher_innings_pitched" double precision,
	"away_pitcher_strikeouts" integer,
	"away_pitcher_walks" integer,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "game_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"home_team_score" integer,
	"away_team_score" integer,
	"home_team_hits" integer,
	"away_team_hits" integer,
	"home_team_errors" integer,
	"away_team_errors" integer,
	"winner" varchar(255),
	"run_differential" integer,
	"innings" integer,
	"was_extra_innings" boolean DEFAULT false,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "model_performance" (
	"id" serial PRIMARY KEY NOT NULL,
	"model_version_id" integer NOT NULL,
	"date" timestamp NOT NULL,
	"predictions_count" integer NOT NULL,
	"correct_predictions" integer NOT NULL,
	"accuracy" double precision NOT NULL,
	"bets_count" integer,
	"winning_bets" integer,
	"losing_bets" integer,
	"push_bets" integer,
	"total_stake" double precision,
	"total_return" double precision,
	"profit_loss" double precision,
	"roi" double precision,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "model_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"model_name" varchar(255) NOT NULL,
	"version" varchar(50) NOT NULL,
	"model_type" varchar(100) NOT NULL,
	"bet_type" varchar(100) NOT NULL,
	"description" text,
	"parameters" text,
	"feature_importance" text,
	"accuracy" double precision,
	"precision" double precision,
	"recall" double precision,
	"f1_score" double precision,
	"train_start_date" timestamp,
	"train_end_date" timestamp,
	"is_active" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "parlay_legs" (
	"id" serial PRIMARY KEY NOT NULL,
	"parlay_id" integer NOT NULL,
	"user_bet_id" integer NOT NULL,
	"result" varchar(50),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "parlays" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(255),
	"odds" integer NOT NULL,
	"stake" double precision NOT NULL,
	"to_win" double precision NOT NULL,
	"result" varchar(50),
	"profit_loss" double precision,
	"is_recommended_parlay" boolean DEFAULT false,
	"confidence_level" double precision,
	"created_at" timestamp DEFAULT now(),
	"settled_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "player_matchups" (
	"id" serial PRIMARY KEY NOT NULL,
	"batter_id" integer NOT NULL,
	"pitcher_id" integer NOT NULL,
	"at_bats" integer NOT NULL,
	"hits" integer NOT NULL,
	"doubles" integer NOT NULL,
	"triples" integer NOT NULL,
	"home_runs" integer NOT NULL,
	"rbi" integer NOT NULL,
	"walks" integer NOT NULL,
	"strikeouts" integer NOT NULL,
	"batting_avg" double precision NOT NULL,
	"on_base_pct" double precision NOT NULL,
	"slugging_pct" double precision NOT NULL,
	"ops" double precision NOT NULL,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "player_recent_form" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"date" timestamp NOT NULL,
	"window_size" integer NOT NULL,
	"at_bats" integer,
	"hits" integer,
	"home_runs" integer,
	"rbi" integer,
	"strikeouts" integer,
	"walks" integer,
	"batting_avg" double precision,
	"on_base_pct" double precision,
	"slugging_pct" double precision,
	"ops" double precision,
	"woba" double precision,
	"innings_pitched" double precision,
	"earned_runs" integer,
	"strikeouts_pitched" integer,
	"walks_pitched" integer,
	"era" double precision,
	"whip" double precision,
	"exit_velocity" double precision,
	"hard_hit_pct" double precision,
	"barrel_pct" double precision,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "player_season_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"season" integer NOT NULL,
	"team" varchar(255) NOT NULL,
	"games" integer,
	"at_bats" integer,
	"runs" integer,
	"hits" integer,
	"doubles" integer,
	"triples" integer,
	"home_runs" integer,
	"rbi" integer,
	"stolen_bases" integer,
	"caught_stealing" integer,
	"walks" integer,
	"strikeouts" integer,
	"batting_avg" double precision,
	"on_base_pct" double precision,
	"slugging_pct" double precision,
	"ops" double precision,
	"woba" double precision,
	"wrc" double precision,
	"wrc_plus" double precision,
	"barrel_pct" double precision,
	"exit_velocity" double precision,
	"launch_angle" double precision,
	"wins" integer,
	"losses" integer,
	"era" double precision,
	"games_pitched" integer,
	"games_started" integer,
	"saves" integer,
	"innings_pitched" double precision,
	"hits_allowed" integer,
	"runs_allowed" integer,
	"earned_runs" integer,
	"walks_pitched" integer,
	"strikeouts_pitched" integer,
	"home_runs_allowed" integer,
	"whip" double precision,
	"k_per_9" double precision,
	"bb_per_9" double precision,
	"fip" double precision,
	"x_fip" double precision,
	"war" double precision,
	"babip" double precision,
	"ground_ball_pct" double precision,
	"fly_ball_pct" double precision,
	"line_drive_pct" double precision,
	"soft_contact_pct" double precision,
	"medium_contact_pct" double precision,
	"hard_contact_pct" double precision,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" serial PRIMARY KEY NOT NULL,
	"mlb_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"team" varchar(255) NOT NULL,
	"position" varchar(50) NOT NULL,
	"bat_side" varchar(10),
	"throw_hand" varchar(10),
	"status" varchar(50) DEFAULT 'active',
	"jersey_number" varchar(10),
	"height" varchar(10),
	"weight" integer,
	"birth_date" timestamp,
	"mlb_debut_date" timestamp,
	"image_url" varchar(255),
	"last_updated" timestamp DEFAULT now(),
	CONSTRAINT "players_mlb_id_unique" UNIQUE("mlb_id")
);
--> statement-breakpoint
CREATE TABLE "team_matchups" (
	"id" serial PRIMARY KEY NOT NULL,
	"team1" varchar(255) NOT NULL,
	"team2" varchar(255) NOT NULL,
	"season" integer NOT NULL,
	"team1_wins" integer NOT NULL,
	"team2_wins" integer NOT NULL,
	"team1_home_wins" integer NOT NULL,
	"team2_home_wins" integer NOT NULL,
	"team1_runs_scored" integer NOT NULL,
	"team2_runs_scored" integer NOT NULL,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "team_recent_form" (
	"id" serial PRIMARY KEY NOT NULL,
	"team" varchar(255) NOT NULL,
	"date" timestamp NOT NULL,
	"window_size" integer NOT NULL,
	"games" integer NOT NULL,
	"wins" integer NOT NULL,
	"losses" integer NOT NULL,
	"win_pct" double precision NOT NULL,
	"runs_scored" double precision NOT NULL,
	"runs_allowed" double precision NOT NULL,
	"run_differential" double precision NOT NULL,
	"batting_avg" double precision NOT NULL,
	"on_base_pct" double precision NOT NULL,
	"slugging_pct" double precision NOT NULL,
	"ops" double precision NOT NULL,
	"era" double precision NOT NULL,
	"whip" double precision NOT NULL,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "team_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"team" varchar(255) NOT NULL,
	"team_abbreviation" varchar(10) NOT NULL,
	"season" integer NOT NULL,
	"wins" integer NOT NULL,
	"losses" integer NOT NULL,
	"win_pct" double precision NOT NULL,
	"home_wins" integer NOT NULL,
	"home_losses" integer NOT NULL,
	"home_win_pct" double precision NOT NULL,
	"away_wins" integer NOT NULL,
	"away_losses" integer NOT NULL,
	"away_win_pct" double precision NOT NULL,
	"runs" integer NOT NULL,
	"hits" integer NOT NULL,
	"doubles" integer NOT NULL,
	"triples" integer NOT NULL,
	"home_runs" integer NOT NULL,
	"rbi" integer NOT NULL,
	"stolen_bases" integer NOT NULL,
	"walks" integer NOT NULL,
	"strikeouts" integer NOT NULL,
	"batting_avg" double precision NOT NULL,
	"on_base_pct" double precision NOT NULL,
	"slugging_pct" double precision NOT NULL,
	"ops" double precision NOT NULL,
	"woba" double precision,
	"wrc" double precision,
	"era" double precision NOT NULL,
	"quality_starts" integer,
	"saves" integer NOT NULL,
	"innings_pitched" double precision NOT NULL,
	"hits_allowed" integer NOT NULL,
	"runs_allowed" integer NOT NULL,
	"earned_runs" integer NOT NULL,
	"walks_pitched" integer NOT NULL,
	"strikeouts_pitched" integer NOT NULL,
	"home_runs_allowed" integer NOT NULL,
	"whip" double precision NOT NULL,
	"run_differential" integer NOT NULL,
	"pyth_win_pct" double precision,
	"base_runs_for" double precision,
	"base_runs_against" double precision,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_bets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"game_id" integer,
	"prediction_id" integer,
	"bet_type" varchar(50) NOT NULL,
	"bet_details" text NOT NULL,
	"odds" integer NOT NULL,
	"stake" double precision NOT NULL,
	"to_win" double precision NOT NULL,
	"result" varchar(50),
	"profit_loss" double precision,
	"is_recommended_bet" boolean DEFAULT false,
	"confidence_level" double precision,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"settled_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"prediction_id" integer NOT NULL,
	"rating" integer,
	"comments" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "game_date" TYPE date USING "game_date"::date;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "home_team_score" integer;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "away_team_score" integer;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "game_result" varchar(50);--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "total_score" integer;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "run_line" double precision;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "over_under_line" double precision;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "venue_name" varchar(255);--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "venue_location" varchar(255);--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "weather" text;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "attendance" integer;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "game_notes" text;--> statement-breakpoint
ALTER TABLE "predictions" ADD COLUMN "model_version_id" integer;--> statement-breakpoint
ALTER TABLE "predictions" ADD COLUMN "prediction_type" varchar(50) DEFAULT 'game' NOT NULL;--> statement-breakpoint
ALTER TABLE "predictions" ADD COLUMN "actual_result" varchar(50);--> statement-breakpoint
ALTER TABLE "predictions" ADD COLUMN "was_correct" boolean;--> statement-breakpoint
ALTER TABLE "predictions" ADD COLUMN "prediction_details" text;--> statement-breakpoint
ALTER TABLE "predictions" ADD COLUMN "feature_importance" text;--> statement-breakpoint
ALTER TABLE "predictions" ADD COLUMN "expected_value" double precision;--> statement-breakpoint
ALTER TABLE "predictions" ADD COLUMN "kelly_stake" double precision;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bankroll_amount" double precision DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "risk_tolerance" varchar(50) DEFAULT 'medium';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bet_preferences" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "notification_preferences" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp;--> statement-breakpoint
ALTER TABLE "bankroll_history" ADD CONSTRAINT "bankroll_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_details" ADD CONSTRAINT "game_details_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_pitchers" ADD CONSTRAINT "game_pitchers_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_pitchers" ADD CONSTRAINT "game_pitchers_home_pitcher_id_players_id_fk" FOREIGN KEY ("home_pitcher_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_pitchers" ADD CONSTRAINT "game_pitchers_away_pitcher_id_players_id_fk" FOREIGN KEY ("away_pitcher_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_results" ADD CONSTRAINT "game_results_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_performance" ADD CONSTRAINT "model_performance_model_version_id_model_versions_id_fk" FOREIGN KEY ("model_version_id") REFERENCES "public"."model_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parlay_legs" ADD CONSTRAINT "parlay_legs_parlay_id_parlays_id_fk" FOREIGN KEY ("parlay_id") REFERENCES "public"."parlays"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parlay_legs" ADD CONSTRAINT "parlay_legs_user_bet_id_user_bets_id_fk" FOREIGN KEY ("user_bet_id") REFERENCES "public"."user_bets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parlays" ADD CONSTRAINT "parlays_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_matchups" ADD CONSTRAINT "player_matchups_batter_id_players_id_fk" FOREIGN KEY ("batter_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_matchups" ADD CONSTRAINT "player_matchups_pitcher_id_players_id_fk" FOREIGN KEY ("pitcher_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_recent_form" ADD CONSTRAINT "player_recent_form_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_season_stats" ADD CONSTRAINT "player_season_stats_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_bets" ADD CONSTRAINT "user_bets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_bets" ADD CONSTRAINT "user_bets_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_bets" ADD CONSTRAINT "user_bets_prediction_id_predictions_id_fk" FOREIGN KEY ("prediction_id") REFERENCES "public"."predictions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_feedback" ADD CONSTRAINT "user_feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_feedback" ADD CONSTRAINT "user_feedback_prediction_id_predictions_id_fk" FOREIGN KEY ("prediction_id") REFERENCES "public"."predictions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "entity_features_idx" ON "feature_store" USING btree ("entity_type","entity_id","feature_set");--> statement-breakpoint
CREATE UNIQUE INDEX "model_date_idx" ON "model_performance" USING btree ("model_version_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "model_version_idx" ON "model_versions" USING btree ("model_name","version");--> statement-breakpoint
CREATE UNIQUE INDEX "batter_pitcher_idx" ON "player_matchups" USING btree ("batter_id","pitcher_id");--> statement-breakpoint
CREATE UNIQUE INDEX "player_form_window_idx" ON "player_recent_form" USING btree ("player_id","date","window_size");--> statement-breakpoint
CREATE UNIQUE INDEX "player_season_team_idx" ON "player_season_stats" USING btree ("player_id","season","team");--> statement-breakpoint
CREATE UNIQUE INDEX "teams_season_idx" ON "team_matchups" USING btree ("team1","team2","season");--> statement-breakpoint
CREATE UNIQUE INDEX "team_form_window_idx" ON "team_recent_form" USING btree ("team","date","window_size");--> statement-breakpoint
CREATE UNIQUE INDEX "team_season_idx" ON "team_stats" USING btree ("team","season");--> statement-breakpoint
CREATE UNIQUE INDEX "user_prediction_idx" ON "user_feedback" USING btree ("user_id","prediction_id");--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_model_version_id_model_versions_id_fk" FOREIGN KEY ("model_version_id") REFERENCES "public"."model_versions"("id") ON DELETE no action ON UPDATE no action;