import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  subscriptionTier: text("subscription_tier").default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

// Game model
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  mlbId: text("mlb_id").notNull().unique(),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  homeTeamAbbreviation: text("home_team_abbreviation").notNull(),
  awayTeamAbbreviation: text("away_team_abbreviation").notNull(),
  homeTeamRecord: text("home_team_record"),
  awayTeamRecord: text("away_team_record"),
  homeTeamMoneyline: integer("home_team_moneyline"),
  awayTeamMoneyline: integer("away_team_moneyline"),
  startTime: timestamp("start_time").notNull(),
  status: text("status").default("scheduled"),
  gameDate: text("game_date").notNull(),
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
});

// Prediction model
export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  homeTeamWinProbability: doublePrecision("home_team_win_probability").notNull(),
  awayTeamWinProbability: doublePrecision("away_team_win_probability").notNull(),
  recommendedBet: text("recommended_bet").notNull(),
  confidenceLevel: doublePrecision("confidence_level").notNull(),
  analysis: text("analysis").notNull(),
  tier: text("tier").default("basic"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPredictionSchema = createInsertSchema(predictions).omit({
  id: true,
});

// News model
export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  publishDate: timestamp("publish_date").defaultNow(),
  teams: text("teams").array(),
  impact: text("impact").default("medium"),
});

export const insertNewsSchema = createInsertSchema(news).omit({
  id: true,
});

// Subscription model
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  price: integer("price").notNull(),
  description: text("description").notNull(),
  features: text("features").array().notNull(),
  stripePriceId: text("stripe_price_id"),
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
export type News = typeof news.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
