import { pgTable, text, serial, integer, timestamp, doublePrecision, boolean, varchar, date, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from "zod";

// ==========================================
// User-related tables
// ==========================================

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  subscriptionTier: text("subscription_tier").default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  
  // Enhanced user fields
  bankrollAmount: doublePrecision("bankroll_amount").default(0),
  riskTolerance: varchar("risk_tolerance", { length: 50 }).default("medium"), // low, medium, high
  betPreferences: text("bet_preferences"), // JSON string with betting preferences
  notificationPreferences: text("notification_preferences"), // JSON string with notification settings
  lastLoginAt: timestamp("last_login_at"),
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export type User = z.infer<typeof selectUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

// SubscriptionPlan model
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  price: integer("price").notNull(), // Price in cents
  description: text("description").notNull(),
  features: text("features").array().notNull(), // List of features for the plan
  stripePriceId: varchar("stripe_price_id", { length: 255 }),
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans);
export const selectSubscriptionPlanSchema = createSelectSchema(subscriptionPlans);

export type SubscriptionPlan = z.infer<typeof selectSubscriptionPlanSchema>;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;

// ==========================================
// Game-related tables
// ==========================================

// Game model
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  mlbId: varchar("mlb_id", { length: 255 }).notNull().unique(),
  homeTeam: varchar("home_team", { length: 255 }).notNull(),
  awayTeam: varchar("away_team", { length: 255 }).notNull(),
  homeTeamAbbreviation: varchar("home_team_abbreviation", { length: 10 }).notNull(),
  awayTeamAbbreviation: varchar("away_team_abbreviation", { length: 10 }).notNull(),
  homeTeamRecord: varchar("home_team_record", { length: 10 }),
  awayTeamRecord: varchar("away_team_record", { length: 10 }),
  homeTeamMoneyline: integer("home_team_moneyline"),
  awayTeamMoneyline: integer("away_team_moneyline"),
  startTime: timestamp("start_time").notNull(),
  status: text("status").default("scheduled"), // scheduled, live, final
  gameDate: date("game_date").notNull(),
  
  // Enhanced game fields
  homeTeamScore: integer("home_team_score"),
  awayTeamScore: integer("away_team_score"),
  gameResult: varchar("game_result", { length: 50 }), // home_win, away_win, postponed
  totalScore: integer("total_score"),
  runLine: doublePrecision("run_line"),
  overUnderLine: doublePrecision("over_under_line"),
  venueName: varchar("venue_name", { length: 255 }),
  venueLocation: varchar("venue_location", { length: 255 }),
  weather: text("weather"), // JSON string with weather details
  attendance: integer("attendance"),
  gameNotes: text("game_notes"),
});

export const insertGameSchema = createInsertSchema(games);
export const selectGameSchema = createSelectSchema(games);

export type Game = z.infer<typeof selectGameSchema>;
export type InsertGame = z.infer<typeof insertGameSchema>;

// Game details with additional information
export const gameDetails = pgTable("game_details", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id, { onDelete: 'cascade' }),
  
  // Venue information
  venue: varchar("venue", { length: 255 }),
  venueSurface: varchar("venue_surface", { length: 100 }),
  venueCapacity: integer("venue_capacity"),
  
  // Weather conditions
  temperature: integer("temperature"),
  humidity: integer("humidity"),
  windSpeed: integer("wind_speed"),
  windDirection: varchar("wind_direction", { length: 50 }),
  precipitation: varchar("precipitation", { length: 50 }),
  
  // Game context
  homeTeamRestDays: integer("home_team_rest_days"),
  awayTeamRestDays: integer("away_team_rest_days"),
  homeTeamTravelDistance: integer("home_team_travel_distance"),
  awayTeamTravelDistance: integer("away_team_travel_distance"),
  isDoubleHeader: boolean("is_double_header").default(false),
  doubleHeaderGame: integer("double_header_game"),
  
  // Umpire information
  homePlateUmpire: varchar("home_plate_umpire", { length: 255 }),
  umpireStrikeZoneSize: varchar("umpire_strike_zone_size", { length: 50 }), // tight, average, large
  
  // Betting information
  runLine: doublePrecision("run_line"),
  homeTeamRunLineOdds: integer("home_team_run_line_odds"),
  awayTeamRunLineOdds: integer("away_team_run_line_odds"),
  overUnderTotal: doublePrecision("over_under_total"),
  overOdds: integer("over_odds"),
  underOdds: integer("under_odds"),
  
  // Opening lines (for line movement tracking)
  openingHomeMoneyline: integer("opening_home_moneyline"),
  openingAwayMoneyline: integer("opening_away_moneyline"),
  openingRunLine: doublePrecision("opening_run_line"),
  openingOverUnderTotal: doublePrecision("opening_over_under_total"),
  
  // Public betting percentages
  homeMoneylinePercentage: integer("home_moneyline_percentage"),
  awayMoneylinePercentage: integer("away_moneyline_percentage"),
  overPercentage: integer("over_percentage"),
  underPercentage: integer("under_percentage"),
  
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertGameDetailsSchema = createInsertSchema(gameDetails);
export const selectGameDetailsSchema = createSelectSchema(gameDetails);

export type GameDetails = z.infer<typeof selectGameDetailsSchema>;
export type InsertGameDetails = z.infer<typeof insertGameDetailsSchema>;

// Game results
export const gameResults = pgTable("game_results", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id, { onDelete: 'cascade' }),
  
  homeTeamScore: integer("home_team_score"),
  awayTeamScore: integer("away_team_score"),
  
  homeTeamHits: integer("home_team_hits"),
  awayTeamHits: integer("away_team_hits"),
  
  homeTeamErrors: integer("home_team_errors"),
  awayTeamErrors: integer("away_team_errors"),
  
  winner: varchar("winner", { length: 255 }),
  runDifferential: integer("run_differential"),
  
  innings: integer("innings"),
  wasExtraInnings: boolean("was_extra_innings").default(false),
  
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertGameResultsSchema = createInsertSchema(gameResults);
export const selectGameResultsSchema = createSelectSchema(gameResults);

export type GameResults = z.infer<typeof selectGameResultsSchema>;
export type InsertGameResults = z.infer<typeof insertGameResultsSchema>;

// ==========================================
// Player-related tables
// ==========================================

// Players table for individual player information
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  mlbId: varchar("mlb_id", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  team: varchar("team", { length: 255 }).notNull(),
  position: varchar("position", { length: 50 }).notNull(),
  batSide: varchar("bat_side", { length: 10 }), // L, R, or S for switch
  throwHand: varchar("throw_hand", { length: 10 }), // L or R
  status: varchar("status", { length: 50 }).default("active"), // active, injured, etc.
  jerseyNumber: varchar("jersey_number", { length: 10 }),
  height: varchar("height", { length: 10 }),
  weight: integer("weight"),
  birthDate: timestamp("birth_date"),
  mlbDebutDate: timestamp("mlb_debut_date"),
  imageUrl: varchar("image_url", { length: 255 }),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertPlayerSchema = createInsertSchema(players);
export const selectPlayerSchema = createSelectSchema(players);

export type Player = z.infer<typeof selectPlayerSchema>;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;

// Player season statistics
export const playerSeasonStats = pgTable("player_season_stats", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => players.id, { onDelete: 'cascade' }),
  season: integer("season").notNull(),
  team: varchar("team", { length: 255 }).notNull(),
  
  // Batting stats
  games: integer("games"),
  atBats: integer("at_bats"),
  runs: integer("runs"),
  hits: integer("hits"),
  doubles: integer("doubles"),
  triples: integer("triples"),
  homeRuns: integer("home_runs"),
  rbi: integer("rbi"),
  stolenBases: integer("stolen_bases"),
  caughtStealing: integer("caught_stealing"),
  walks: integer("walks"),
  strikeouts: integer("strikeouts"),
  battingAvg: doublePrecision("batting_avg"),
  onBasePct: doublePrecision("on_base_pct"),
  sluggingPct: doublePrecision("slugging_pct"),
  ops: doublePrecision("ops"),
  wOBA: doublePrecision("woba"),
  wRC: doublePrecision("wrc"),
  wRCPlus: doublePrecision("wrc_plus"),
  barrelPct: doublePrecision("barrel_pct"),
  exitVelocity: doublePrecision("exit_velocity"),
  launchAngle: doublePrecision("launch_angle"),
  
  // Pitching stats
  wins: integer("wins"),
  losses: integer("losses"),
  era: doublePrecision("era"),
  gamesPitched: integer("games_pitched"),
  gamesStarted: integer("games_started"),
  saves: integer("saves"),
  inningsPitched: doublePrecision("innings_pitched"),
  hitsAllowed: integer("hits_allowed"),
  runsAllowed: integer("runs_allowed"),
  earnedRuns: integer("earned_runs"),
  walksPitched: integer("walks_pitched"),
  strikeoutsPitched: integer("strikeouts_pitched"),
  homeRunsAllowed: integer("home_runs_allowed"),
  whip: doublePrecision("whip"),
  kPer9: doublePrecision("k_per_9"),
  bbPer9: doublePrecision("bb_per_9"),
  fip: doublePrecision("fip"),
  xFIP: doublePrecision("x_fip"),
  war: doublePrecision("war"),
  
  // Advanced metrics
  babip: doublePrecision("babip"),
  groundBallPct: doublePrecision("ground_ball_pct"),
  flyBallPct: doublePrecision("fly_ball_pct"),
  lineDrivePct: doublePrecision("line_drive_pct"),
  softContactPct: doublePrecision("soft_contact_pct"),
  mediumContactPct: doublePrecision("medium_contact_pct"),
  hardContactPct: doublePrecision("hard_contact_pct"),
  
  lastUpdated: timestamp("last_updated").defaultNow(),
}, (table) => {
  return {
    playerSeasonTeamIdx: uniqueIndex("player_season_team_idx").on(table.playerId, table.season, table.team),
  };
});

export const insertPlayerSeasonStatsSchema = createInsertSchema(playerSeasonStats);
export const selectPlayerSeasonStatsSchema = createSelectSchema(playerSeasonStats);

export type PlayerSeasonStats = z.infer<typeof selectPlayerSeasonStatsSchema>;
export type InsertPlayerSeasonStats = z.infer<typeof insertPlayerSeasonStatsSchema>;

// Player recent form (rolling window stats)
export const playerRecentForm = pgTable("player_recent_form", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => players.id, { onDelete: 'cascade' }),
  date: timestamp("date").notNull(),
  windowSize: integer("window_size").notNull(), // 7, 14, 30 days
  
  // Batting metrics
  atBats: integer("at_bats"),
  hits: integer("hits"),
  homeRuns: integer("home_runs"),
  rbi: integer("rbi"),
  strikeouts: integer("strikeouts"),
  walks: integer("walks"),
  battingAvg: doublePrecision("batting_avg"),
  onBasePct: doublePrecision("on_base_pct"),
  sluggingPct: doublePrecision("slugging_pct"),
  ops: doublePrecision("ops"),
  wOBA: doublePrecision("woba"),
  
  // Pitching metrics
  inningsPitched: doublePrecision("innings_pitched"),
  earnedRuns: integer("earned_runs"),
  strikeoutsPitched: integer("strikeouts_pitched"),
  walksPitched: integer("walks_pitched"),
  era: doublePrecision("era"),
  whip: doublePrecision("whip"),
  
  // Advanced metrics
  exitVelocity: doublePrecision("exit_velocity"),
  hardHitPct: doublePrecision("hard_hit_pct"),
  barrelPct: doublePrecision("barrel_pct"),
  
  lastUpdated: timestamp("last_updated").defaultNow(),
}, (table) => {
  return {
    playerFormWindowIdx: uniqueIndex("player_form_window_idx").on(table.playerId, table.date, table.windowSize),
  };
});

export const insertPlayerRecentFormSchema = createInsertSchema(playerRecentForm);
export const selectPlayerRecentFormSchema = createSelectSchema(playerRecentForm);

export type PlayerRecentForm = z.infer<typeof selectPlayerRecentFormSchema>;
export type InsertPlayerRecentForm = z.infer<typeof insertPlayerRecentFormSchema>;

// Player vs. pitcher matchup stats
export const playerMatchups = pgTable("player_matchups", {
  id: serial("id").primaryKey(),
  batterId: integer("batter_id").notNull().references(() => players.id, { onDelete: 'cascade' }),
  pitcherId: integer("pitcher_id").notNull().references(() => players.id, { onDelete: 'cascade' }),
  
  atBats: integer("at_bats").notNull(),
  hits: integer("hits").notNull(),
  doubles: integer("doubles").notNull(),
  triples: integer("triples").notNull(),
  homeRuns: integer("home_runs").notNull(),
  rbi: integer("rbi").notNull(),
  walks: integer("walks").notNull(),
  strikeouts: integer("strikeouts").notNull(),
  battingAvg: doublePrecision("batting_avg").notNull(),
  onBasePct: doublePrecision("on_base_pct").notNull(),
  sluggingPct: doublePrecision("slugging_pct").notNull(),
  ops: doublePrecision("ops").notNull(),
  
  lastUpdated: timestamp("last_updated").defaultNow(),
}, (table) => {
  return {
    batterPitcherIdx: uniqueIndex("batter_pitcher_idx").on(table.batterId, table.pitcherId),
  };
});

export const insertPlayerMatchupsSchema = createInsertSchema(playerMatchups);
export const selectPlayerMatchupsSchema = createSelectSchema(playerMatchups);

export type PlayerMatchups = z.infer<typeof selectPlayerMatchupsSchema>;
export type InsertPlayerMatchups = z.infer<typeof insertPlayerMatchupsSchema>;

// Starting pitchers for games
export const gamePitchers = pgTable("game_pitchers", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id, { onDelete: 'cascade' }),
  homePitcherId: integer("home_pitcher_id").references(() => players.id),
  awayPitcherId: integer("away_pitcher_id").references(() => players.id),
  
  homePitcherName: varchar("home_pitcher_name", { length: 255 }),
  awayPitcherName: varchar("away_pitcher_name", { length: 255 }),
  
  // Home pitcher season stats
  homePitcherWins: integer("home_pitcher_wins"),
  homePitcherLosses: integer("home_pitcher_losses"),
  homePitcherEra: doublePrecision("home_pitcher_era"),
  homePitcherWhip: doublePrecision("home_pitcher_whip"),
  homePitcherInningsPitched: doublePrecision("home_pitcher_innings_pitched"),
  homePitcherStrikeouts: integer("home_pitcher_strikeouts"),
  homePitcherWalks: integer("home_pitcher_walks"),
  
  // Away pitcher season stats
  awayPitcherWins: integer("away_pitcher_wins"),
  awayPitcherLosses: integer("away_pitcher_losses"),
  awayPitcherEra: doublePrecision("away_pitcher_era"),
  awayPitcherWhip: doublePrecision("away_pitcher_whip"),
  awayPitcherInningsPitched: doublePrecision("away_pitcher_innings_pitched"),
  awayPitcherStrikeouts: integer("away_pitcher_strikeouts"),
  awayPitcherWalks: integer("away_pitcher_walks"),
  
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertGamePitchersSchema = createInsertSchema(gamePitchers);
export const selectGamePitchersSchema = createSelectSchema(gamePitchers);

export type GamePitchers = z.infer<typeof selectGamePitchersSchema>;
export type InsertGamePitchers = z.infer<typeof insertGamePitchersSchema>;

// ==========================================
// Team-related tables
// ==========================================

// Team season statistics
export const teamStats = pgTable("team_stats", {
  id: serial("id").primaryKey(),
  team: varchar("team", { length: 255 }).notNull(),
  teamAbbreviation: varchar("team_abbreviation", { length: 10 }).notNull(),
  season: integer("season").notNull(),
  
  // Win/Loss record
  wins: integer("wins").notNull(),
  losses: integer("losses").notNull(),
  winPct: doublePrecision("win_pct").notNull(),
  homeWins: integer("home_wins").notNull(),
  homeLosses: integer("home_losses").notNull(),
  homeWinPct: doublePrecision("home_win_pct").notNull(),
  awayWins: integer("away_wins").notNull(),
  awayLosses: integer("away_losses").notNull(),
  awayWinPct: doublePrecision("away_win_pct").notNull(),
  
  // Team batting stats
  runs: integer("runs").notNull(),
  hits: integer("hits").notNull(),
  doubles: integer("doubles").notNull(),
  triples: integer("triples").notNull(),
  homeRuns: integer("home_runs").notNull(),
  rbi: integer("rbi").notNull(),
  stolenBases: integer("stolen_bases").notNull(),
  walks: integer("walks").notNull(),
  strikeouts: integer("strikeouts").notNull(),
  battingAvg: doublePrecision("batting_avg").notNull(),
  onBasePct: doublePrecision("on_base_pct").notNull(),
  sluggingPct: doublePrecision("slugging_pct").notNull(),
  ops: doublePrecision("ops").notNull(),
  wOBA: doublePrecision("woba"),
  wRC: doublePrecision("wrc"),
  
  // Team pitching stats
  era: doublePrecision("era").notNull(),
  qualityStarts: integer("quality_starts"),
  saves: integer("saves").notNull(),
  inningsPitched: doublePrecision("innings_pitched").notNull(),
  hitsAllowed: integer("hits_allowed").notNull(),
  runsAllowed: integer("runs_allowed").notNull(),
  earnedRuns: integer("earned_runs").notNull(),
  walksPitched: integer("walks_pitched").notNull(),
  strikeoutsPitched: integer("strikeouts_pitched").notNull(),
  homeRunsAllowed: integer("home_runs_allowed").notNull(),
  whip: doublePrecision("whip").notNull(),
  
  // Advanced metrics
  runDifferential: integer("run_differential").notNull(),
  pythWinPct: doublePrecision("pyth_win_pct"), // Pythagorean win percentage
  baseRunsFor: doublePrecision("base_runs_for"),
  baseRunsAgainst: doublePrecision("base_runs_against"),
  
  lastUpdated: timestamp("last_updated").defaultNow(),
}, (table) => {
  return {
    teamSeasonIdx: uniqueIndex("team_season_idx").on(table.team, table.season),
  };
});

export const insertTeamStatsSchema = createInsertSchema(teamStats);
export const selectTeamStatsSchema = createSelectSchema(teamStats);

export type TeamStats = z.infer<typeof selectTeamStatsSchema>;
export type InsertTeamStats = z.infer<typeof insertTeamStatsSchema>;

// Team recent form (rolling window stats)
export const teamRecentForm = pgTable("team_recent_form", {
  id: serial("id").primaryKey(),
  team: varchar("team", { length: 255 }).notNull(),
  date: timestamp("date").notNull(),
  windowSize: integer("window_size").notNull(), // 7, 14, 30 days
  
  games: integer("games").notNull(),
  wins: integer("wins").notNull(),
  losses: integer("losses").notNull(),
  winPct: doublePrecision("win_pct").notNull(),
  
  runsScored: doublePrecision("runs_scored").notNull(),
  runsAllowed: doublePrecision("runs_allowed").notNull(),
  runDifferential: doublePrecision("run_differential").notNull(),
  
  battingAvg: doublePrecision("batting_avg").notNull(),
  onBasePct: doublePrecision("on_base_pct").notNull(),
  sluggingPct: doublePrecision("slugging_pct").notNull(),
  ops: doublePrecision("ops").notNull(),
  
  era: doublePrecision("era").notNull(),
  whip: doublePrecision("whip").notNull(),
  
  lastUpdated: timestamp("last_updated").defaultNow(),
}, (table) => {
  return {
    teamFormWindowIdx: uniqueIndex("team_form_window_idx").on(table.team, table.date, table.windowSize),
  };
});

export const insertTeamRecentFormSchema = createInsertSchema(teamRecentForm);
export const selectTeamRecentFormSchema = createSelectSchema(teamRecentForm);

export type TeamRecentForm = z.infer<typeof selectTeamRecentFormSchema>;
export type InsertTeamRecentForm = z.infer<typeof insertTeamRecentFormSchema>;

// Team vs. team matchup history
export const teamMatchups = pgTable("team_matchups", {
  id: serial("id").primaryKey(),
  team1: varchar("team1", { length: 255 }).notNull(),
  team2: varchar("team2", { length: 255 }).notNull(),
  season: integer("season").notNull(),
  
  team1Wins: integer("team1_wins").notNull(),
  team2Wins: integer("team2_wins").notNull(),
  
  team1HomeWins: integer("team1_home_wins").notNull(),
  team2HomeWins: integer("team2_home_wins").notNull(),
  
  team1RunsScored: integer("team1_runs_scored").notNull(),
  team2RunsScored: integer("team2_runs_scored").notNull(),
  
  lastUpdated: timestamp("last_updated").defaultNow(),
}, (table) => {
  return {
    teamsSeasonIdx: uniqueIndex("teams_season_idx").on(table.team1, table.team2, table.season),
  };
});

export const insertTeamMatchupsSchema = createInsertSchema(teamMatchups);
export const selectTeamMatchupsSchema = createSelectSchema(teamMatchups);

export type TeamMatchups = z.infer<typeof selectTeamMatchupsSchema>;
export type InsertTeamMatchups = z.infer<typeof insertTeamMatchupsSchema>;

// ==========================================
// Prediction-related tables
// ==========================================

// Prediction model
export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  homeTeamWinProbability: doublePrecision("home_team_win_probability").notNull().default(0.5),
  awayTeamWinProbability: doublePrecision("away_team_win_probability").notNull().default(0.5),
  recommendedBet: varchar("recommended_bet", { length: 255 }).notNull(),
  confidenceLevel: doublePrecision("confidence_level").notNull(),
  analysis: text("analysis").notNull(),
  tier: varchar("tier", { length: 50 }).default("basic").notNull(), // basic, pro, elite
  createdAt: timestamp("created_at").defaultNow(),
  
  // Enhanced prediction fields
  modelVersionId: integer("model_version_id").references(() => modelVersions.id),
  predictionType: varchar("prediction_type", { length: 50 }).notNull().default("game"), // game, player_prop, etc.
  actualResult: varchar("actual_result", { length: 50 }), // What actually happened
  wasCorrect: boolean("was_correct"), // Whether prediction was correct
  predictionDetails: text("prediction_details"), // JSON string with detailed prediction data
  featureImportance: text("feature_importance"), // JSON string with feature importance for this prediction
  expectedValue: doublePrecision("expected_value"), // Expected value of bet
  kellyStake: doublePrecision("kelly_stake"), // Recommended stake using Kelly Criterion
});

export const insertPredictionSchema = createInsertSchema(predictions);
export const selectPredictionSchema = createSelectSchema(predictions);

export type Prediction = z.infer<typeof selectPredictionSchema>;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;

// Model versions
export const modelVersions = pgTable("model_versions", {
  id: serial("id").primaryKey(),
  modelName: varchar("model_name", { length: 255 }).notNull(),
  version: varchar("version", { length: 50 }).notNull(),
  modelType: varchar("model_type", { length: 100 }).notNull(), // straight, prop, parlay
  betType: varchar("bet_type", { length: 100 }).notNull(), // moneyline, runline, over/under, etc.
  
  description: text("description"),
  parameters: text("parameters"), // JSON string of model parameters
  featureImportance: text("feature_importance"), // JSON string of feature importance
  
  accuracy: doublePrecision("accuracy"),
  precision: doublePrecision("precision"),
  recall: doublePrecision("recall"),
  f1Score: doublePrecision("f1_score"),
  
  trainStartDate: timestamp("train_start_date"),
  trainEndDate: timestamp("train_end_date"),
  
  isActive: boolean("is_active").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    modelVersionIdx: uniqueIndex("model_version_idx").on(table.modelName, table.version),
  };
});

export const insertModelVersionsSchema = createInsertSchema(modelVersions);
export const selectModelVersionsSchema = createSelectSchema(modelVersions);

export type ModelVersion = z.infer<typeof selectModelVersionsSchema>;
export type InsertModelVersion = z.infer<typeof insertModelVersionsSchema>;

// Model performance tracking
export const modelPerformance = pgTable("model_performance", {
  id: serial("id").primaryKey(),
  modelVersionId: integer("model_version_id").notNull().references(() => modelVersions.id, { onDelete: 'cascade' }),
  
  date: timestamp("date").notNull(),
  
  predictionsCount: integer("predictions_count").notNull(),
  correctPredictions: integer("correct_predictions").notNull(),
  accuracy: doublePrecision("accuracy").notNull(),
  
  betsCount: integer("bets_count"),
  winningBets: integer("winning_bets"),
  losingBets: integer("losing_bets"),
  pushBets: integer("push_bets"),
  
  totalStake: doublePrecision("total_stake"),
  totalReturn: doublePrecision("total_return"),
  profitLoss: doublePrecision("profit_loss"),
  roi: doublePrecision("roi"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    modelDateIdx: uniqueIndex("model_date_idx").on(table.modelVersionId, table.date),
  };
});

export const insertModelPerformanceSchema = createInsertSchema(modelPerformance);
export const selectModelPerformanceSchema = createSelectSchema(modelPerformance);

export type ModelPerformance = z.infer<typeof selectModelPerformanceSchema>;
export type InsertModelPerformance = z.infer<typeof insertModelPerformanceSchema>;

// Feature store for caching engineered features
export const featureStore = pgTable("feature_store", {
  id: serial("id").primaryKey(),
  entityType: varchar("entity_type", { length: 50 }).notNull(), // game, team, player
  entityId: varchar("entity_id", { length: 255 }).notNull(), // ID of the entity
  featureSet: varchar("feature_set", { length: 100 }).notNull(), // Name of the feature set
  
  features: text("features").notNull(), // JSON string of features
  
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // When these features should be recalculated
}, (table) => {
  return {
    entityFeaturesIdx: uniqueIndex("entity_features_idx").on(table.entityType, table.entityId, table.featureSet),
  };
});

export const insertFeatureStoreSchema = createInsertSchema(featureStore);
export const selectFeatureStoreSchema = createSelectSchema(featureStore);

export type FeatureStore = z.infer<typeof selectFeatureStoreSchema>;
export type InsertFeatureStore = z.infer<typeof insertFeatureStoreSchema>;

// ==========================================
// Bet tracking and user feedback tables
// ==========================================

// User bets
export const userBets = pgTable("user_bets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  gameId: integer("game_id").references(() => games.id),
  predictionId: integer("prediction_id").references(() => predictions.id),
  
  betType: varchar("bet_type", { length: 50 }).notNull(), // moneyline, runline, over/under, prop, parlay
  betDetails: text("bet_details").notNull(), // JSON string with bet details
  
  odds: integer("odds").notNull(), // American odds format
  stake: doublePrecision("stake").notNull(), // Amount wagered
  toWin: doublePrecision("to_win").notNull(), // Potential winnings
  
  result: varchar("result", { length: 50 }), // win, loss, push, void, pending
  profitLoss: doublePrecision("profit_loss"), // Actual profit/loss
  
  isRecommendedBet: boolean("is_recommended_bet").default(false), // Whether this bet was recommended by the system
  confidenceLevel: doublePrecision("confidence_level"), // System confidence in this bet
  
  notes: text("notes"), // User notes about the bet
  
  createdAt: timestamp("created_at").defaultNow(),
  settledAt: timestamp("settled_at"),
});

export const insertUserBetsSchema = createInsertSchema(userBets);
export const selectUserBetsSchema = createSelectSchema(userBets);

export type UserBet = z.infer<typeof selectUserBetsSchema>;
export type InsertUserBet = z.infer<typeof insertUserBetsSchema>;

// Parlays
export const parlays = pgTable("parlays", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  name: varchar("name", { length: 255 }),
  odds: integer("odds").notNull(), // Combined odds
  stake: doublePrecision("stake").notNull(),
  toWin: doublePrecision("to_win").notNull(),
  
  result: varchar("result", { length: 50 }), // win, loss, push, void, pending
  profitLoss: doublePrecision("profit_loss"),
  
  isRecommendedParlay: boolean("is_recommended_parlay").default(false),
  confidenceLevel: doublePrecision("confidence_level"),
  
  createdAt: timestamp("created_at").defaultNow(),
  settledAt: timestamp("settled_at"),
});

export const insertParlaysSchema = createInsertSchema(parlays);
export const selectParlaysSchema = createSelectSchema(parlays);

export type Parlay = z.infer<typeof selectParlaysSchema>;
export type InsertParlay = z.infer<typeof insertParlaysSchema>;

// Parlay legs
export const parlayLegs = pgTable("parlay_legs", {
  id: serial("id").primaryKey(),
  parlayId: integer("parlay_id").notNull().references(() => parlays.id, { onDelete: 'cascade' }),
  userBetId: integer("user_bet_id").notNull().references(() => userBets.id, { onDelete: 'cascade' }),
  
  result: varchar("result", { length: 50 }), // win, loss, push, void, pending
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertParlayLegsSchema = createInsertSchema(parlayLegs);
export const selectParlayLegsSchema = createSelectSchema(parlayLegs);

export type ParlayLeg = z.infer<typeof selectParlayLegsSchema>;
export type InsertParlayLeg = z.infer<typeof insertParlayLegsSchema>;

// User feedback on predictions
export const userFeedback = pgTable("user_feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  predictionId: integer("prediction_id").notNull().references(() => predictions.id, { onDelete: 'cascade' }),
  
  rating: integer("rating"), // 1-5 star rating
  comments: text("comments"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    userPredictionIdx: uniqueIndex("user_prediction_idx").on(table.userId, table.predictionId),
  };
});

export const insertUserFeedbackSchema = createInsertSchema(userFeedback);
export const selectUserFeedbackSchema = createSelectSchema(userFeedback);

export type UserFeedback = z.infer<typeof selectUserFeedbackSchema>;
export type InsertUserFeedback = z.infer<typeof insertUserFeedbackSchema>;

// Bankroll management
export const bankrollHistory = pgTable("bankroll_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  date: timestamp("date").notNull(),
  balance: doublePrecision("balance").notNull(),
  
  deposits: doublePrecision("deposits").default(0),
  withdrawals: doublePrecision("withdrawals").default(0),
  bettingProfitLoss: doublePrecision("betting_profit_loss").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBankrollHistorySchema = createInsertSchema(bankrollHistory);
export const selectBankrollHistorySchema = createSelectSchema(bankrollHistory);

export type BankrollHistory = z.infer<typeof selectBankrollHistorySchema>;
export type InsertBankrollHistory = z.infer<typeof insertBankrollHistorySchema>;

// ==========================================
// News and content tables
// ==========================================

// News model
export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  excerpt: varchar("excerpt", { length: 500 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  imageUrl: varchar("image_url", { length: 255 }), // Optional image URL
  publishDate: timestamp("publish_date").defaultNow(),
  teams: text("teams").array(), // Array of team names/IDs relevant to the news
  impact: text("impact").default("medium"), // low, medium, high
});

export const insertNewsSchema = createInsertSchema(news);
export const selectNewsSchema = createSelectSchema(news);

export type News = z.infer<typeof selectNewsSchema>;
export type InsertNews = z.infer<typeof insertNewsSchema>;
