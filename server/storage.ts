// server/storage.ts

import {
  users, type User, type InsertUser,
  games, type Game, type InsertGame,
  predictions, type Prediction, type InsertPrediction,
  news, type News, type InsertNews,
  subscriptionPlans, type SubscriptionPlan, type InsertSubscriptionPlan
} from "@shared/schema";

// === Drizzle ORM Imports ===
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq, desc, sql } from 'drizzle-orm'; // Common Drizzle operators

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserSubscriptionTier(userId: number, tier: string): Promise<User>;
  updateUserStripeCustomerId(userId: number, customerId: string): Promise<User>;
  updateUserStripeSubscriptionId(userId: number, subscriptionId: string): Promise<User>;

  // Game operations
  getGame(id: number): Promise<Game | undefined>;
  getGamesByDate(date: string): Promise<Game[]>;
  createGame(game: InsertGame): Promise<Game>;

  // Prediction operations
  getPrediction(id: number): Promise<Prediction | undefined>;
  getPredictionByGameId(gameId: number): Promise<Prediction | undefined>;
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;

  // News operations
  getNews(id: number): Promise<News | undefined>;
  getAllNews(): Promise<News[]>;
  getLatestNews(limit: number): Promise<News[]>;
  getNewsByCategory(category: string): Promise<News[]>;
  createNews(newsItem: InsertNews): Promise<News>;

  // Subscription plan operations
  getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined>;
  getSubscriptionPlanByName(name: string): Promise<SubscriptionPlan | undefined>;
  getAllSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
}

// ==================================================================================
// DrizzleStorage Implementation
// ==================================================================================
// Define a type for the schema object we pass to Drizzle by re-using the imported table variables
const fullSchema = { users, games, predictions, news, subscriptionPlans };

export class DrizzleStorage implements IStorage {
  private db: NodePgDatabase<typeof fullSchema>; // Typed Drizzle instance based on the actual schema passed
  private schema = fullSchema; // Use the well-defined schema object for queries

  constructor(databaseUrl: string) {
    const pool = new Pool({
      connectionString: databaseUrl,
    });
    // Pass the schema directly to Drizzle for better type inference and query building
    this.db = drizzle(pool, { schema: this.schema, logger: process.env.NODE_ENV === 'development' });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(this.schema.users).where(eq(this.schema.users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(this.schema.users)
      .where(eq(sql`lower(${this.schema.users.username})`, username.toLowerCase())).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(this.schema.users)
      .where(eq(sql`lower(${this.schema.users.email})`, email.toLowerCase())).limit(1);
    return result[0];
  }

  async createUser(userData: InsertUser): Promise<User> {
    const result = await this.db.insert(this.schema.users).values(userData).returning();
    if (result.length === 0) {
      throw new Error("User creation failed, no data returned.");
    }
    return result[0];
  }

  // If your 'users' table in shared/schema.ts has an 'updatedAt' column,
  // you can uncomment the 'updatedAt: new Date()' parts below.
  async updateUserSubscriptionTier(userId: number, tier: string): Promise<User> {
    const result = await this.db.update(this.schema.users)
      .set({ subscriptionTier: tier /* , updatedAt: new Date() */ })
      .where(eq(this.schema.users.id, userId))
      .returning();
    if (result.length === 0) {
      throw new Error(`User with ID ${userId} not found for update.`);
    }
    return result[0];
  }

  async updateUserStripeCustomerId(userId: number, customerId: string): Promise<User> {
    const result = await this.db.update(this.schema.users)
      .set({ stripeCustomerId: customerId /* , updatedAt: new Date() */ })
      .where(eq(this.schema.users.id, userId))
      .returning();
    if (result.length === 0) {
      throw new Error(`User with ID ${userId} not found for update.`);
    }
    return result[0];
  }

  async updateUserStripeSubscriptionId(userId: number, subscriptionId: string): Promise<User> {
    const result = await this.db.update(this.schema.users)
      .set({ stripeSubscriptionId: subscriptionId /* , updatedAt: new Date() */ })
      .where(eq(this.schema.users.id, userId))
      .returning();
    if (result.length === 0) {
      throw new Error(`User with ID ${userId} not found for update.`);
    }
    return result[0];
  }

  // Game operations
  async getGame(id: number): Promise<Game | undefined> {
    const result = await this.db.select().from(this.schema.games).where(eq(this.schema.games.id, id)).limit(1);
    return result[0];
  }

  async getGamesByDate(date: string): Promise<Game[]> {
    return this.db.select().from(this.schema.games).where(eq(this.schema.games.gameDate, date));
  }

  async createGame(gameData: InsertGame): Promise<Game> {
    const result = await this.db.insert(this.schema.games).values(gameData).returning();
    if (result.length === 0) {
      throw new Error("Game creation failed, no data returned.");
    }
    return result[0];
  }

  // Prediction operations
  async getPrediction(id: number): Promise<Prediction | undefined> {
    const result = await this.db.select().from(this.schema.predictions).where(eq(this.schema.predictions.id, id)).limit(1);
    return result[0];
  }

  async getPredictionByGameId(gameId: number): Promise<Prediction | undefined> {
    const result = await this.db.select().from(this.schema.predictions).where(eq(this.schema.predictions.gameId, gameId)).limit(1);
    return result[0];
  }

  async createPrediction(predictionData: InsertPrediction): Promise<Prediction> {
    const result = await this.db.insert(this.schema.predictions).values(predictionData).returning();
    if (result.length === 0) {
      throw new Error("Prediction creation failed, no data returned.");
    }
    return result[0];
  }

  // News operations
  async getNews(id: number): Promise<News | undefined> {
    const result = await this.db.select().from(this.schema.news).where(eq(this.schema.news.id, id)).limit(1);
    return result[0];
  }

  async getAllNews(): Promise<News[]> {
    return this.db.select().from(this.schema.news).orderBy(desc(this.schema.news.publishDate));
  }

  async getLatestNews(limit: number): Promise<News[]> {
    return this.db.select().from(this.schema.news).orderBy(desc(this.schema.news.publishDate)).limit(limit);
  }

  async getNewsByCategory(category: string): Promise<News[]> {
    return this.db.select().from(this.schema.news)
      .where(eq(sql`lower(${this.schema.news.category})`, category.toLowerCase()))
      .orderBy(desc(this.schema.news.publishDate));
  }

  async createNews(newsItemData: InsertNews): Promise<News> {
    // Explicitly handle publishDate to ensure it's a Date object for Drizzle
    // if the input type InsertNews allows publishDate to be string/null/undefined.
    const dataToInsert: typeof import("@shared/schema").news.$inferInsert = {
      ...newsItemData,
      publishDate: newsItemData.publishDate instanceof Date
        ? newsItemData.publishDate
        : (newsItemData.publishDate ? new Date(newsItemData.publishDate) : new Date()),
    };

    const result = await this.db.insert(this.schema.news).values(dataToInsert).returning();
    if (result.length === 0) {
      throw new Error("News item creation failed, no data returned.");
    }
    return result[0];
  }

  // Subscription plan operations
  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    const result = await this.db.select().from(this.schema.subscriptionPlans).where(eq(this.schema.subscriptionPlans.id, id)).limit(1);
    return result[0];
  }

  async getSubscriptionPlanByName(name: string): Promise<SubscriptionPlan | undefined> {
    const result = await this.db.select().from(this.schema.subscriptionPlans)
      .where(eq(sql`lower(${this.schema.subscriptionPlans.name})`, name.toLowerCase())).limit(1);
    return result[0];
  }

  async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return this.db.select().from(this.schema.subscriptionPlans);
  }

  async createSubscriptionPlan(planData: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    // If InsertSubscriptionPlan has optional Date fields that might be null/undefined
    // and the DB columns are NOT NULL without defaults, handle them similarly to publishDate in createNews.
    const result = await this.db.insert(this.schema.subscriptionPlans).values(planData).returning();
    if (result.length === 0) {
      throw new Error("Subscription plan creation failed, no data returned.");
    }
    return result[0];
  }
}

// ==================================================================================
// MemStorage Implementation (Existing code - UNCHANGED as per previous discussions)
// ==================================================================================
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private games: Map<number, Game>;
  private predictions: Map<number, Prediction>;
  private newsItems: Map<number, News>;
  private subscriptionPlans: Map<number, SubscriptionPlan>;

  private userIdCounter: number;
  private gameIdCounter: number;
  private predictionIdCounter: number;
  private newsIdCounter: number;
  private subscriptionPlanIdCounter: number;

  constructor() {
    this.users = new Map();
    this.games = new Map();
    this.predictions = new Map();
    this.newsItems = new Map();
    this.subscriptionPlans = new Map();

    this.userIdCounter = 1;
    this.gameIdCounter = 1;
    this.predictionIdCounter = 1;
    this.newsIdCounter = 1;
    this.subscriptionPlanIdCounter = 1;

    this.initializeSubscriptionPlans();
  }

  private initializeSubscriptionPlans() {
    const basicPlan: InsertSubscriptionPlan = {
      name: 'Basic',
      price: 29,
      description: 'Perfect for casual bettors',
      features: [
        'Daily top 3 high-confidence picks',
        'Basic game analysis',
        'Daily MLB news digest',
        'Email delivery of picks'
      ],
      stripePriceId: 'price_basic' // Assuming this is in your schema
    };

    const proPlan: InsertSubscriptionPlan = {
      name: 'Pro',
      price: 59,
      description: 'Most popular choice for serious bettors',
      features: [
        'All daily picks with confidence ratings',
        'Detailed game analysis & explanations',
        'Full access to MLB news & insights',
        'Mobile app access',
        'Basic analytics dashboard'
      ],
      stripePriceId: 'price_pro' // Assuming this is in your schema
    };

    const elitePlan: InsertSubscriptionPlan = {
      name: 'Elite',
      price: 99,
      description: 'The ultimate MLB wagering experience',
      features: [
        'Everything in Pro plan',
        'Advanced analytics dashboard access',
        'Historical model performance tracking',
        'Customizable alerts & notifications',
        'Weekly expert consultation',
        'Early access to picks (8 hrs advantage)'
      ],
      stripePriceId: 'price_elite' // Assuming this is in your schema
    };

    // These will call the MemStorage version of createSubscriptionPlan
    this.createSubscriptionPlan(basicPlan);
    this.createSubscriptionPlan(proPlan);
    this.createSubscriptionPlan(elitePlan);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const newUser: User = {
      id,
      ...user,
      subscriptionTier: "free",
      stripeCustomerId: undefined,
      stripeSubscriptionId: undefined,
      createdAt: now
      // Add updatedAt: now if your User schema expects it and MemStorage should set it
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUserSubscriptionTier(userId: number, tier: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    const updatedUser = { ...user, subscriptionTier: tier /*, updatedAt: new Date() */ };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserStripeCustomerId(userId: number, customerId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    const updatedUser = { ...user, stripeCustomerId: customerId /*, updatedAt: new Date() */ };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserStripeSubscriptionId(userId: number, subscriptionId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    const updatedUser = { ...user, stripeSubscriptionId: subscriptionId /*, updatedAt: new Date() */ };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getGame(id: number): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async getGamesByDate(date: string): Promise<Game[]> {
    return Array.from(this.games.values()).filter(
      (game) => game.gameDate === date
    );
  }

  async createGame(game: InsertGame): Promise<Game> {
    const id = this.gameIdCounter++;
    const newGame: Game = { id, ...game };
    this.games.set(id, newGame);
    return newGame;
  }

  async getPrediction(id: number): Promise<Prediction | undefined> {
    return this.predictions.get(id);
  }

  async getPredictionByGameId(gameId: number): Promise<Prediction | undefined> {
    return Array.from(this.predictions.values()).find(
      (prediction) => prediction.gameId === gameId
    );
  }

  async createPrediction(prediction: InsertPrediction): Promise<Prediction> {
    const id = this.predictionIdCounter++;
    const now = new Date();
    const newPrediction: Prediction = { id, ...prediction, createdAt: now };
    this.predictions.set(id, newPrediction);
    return newPrediction;
  }

  async getNews(id: number): Promise<News | undefined> {
    return this.newsItems.get(id);
  }

  async getAllNews(): Promise<News[]> {
    return Array.from(this.newsItems.values()).sort(
      (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );
  }

  async getLatestNews(limit: number): Promise<News[]> {
    return Array.from(this.newsItems.values())
      .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
      .slice(0, limit);
  }

  async getNewsByCategory(category: string): Promise<News[]> {
    return Array.from(this.newsItems.values())
      .filter((news) => news.category.toLowerCase() === category.toLowerCase())
      .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  }

  async createNews(newsItemData: InsertNews): Promise<News> {
    const id = this.newsIdCounter++;
    const newNewsItem: News = {
      id,
      ...newsItemData,
      publishDate: newsItemData.publishDate || new Date()
    };
    this.newsItems.set(id, newNewsItem);
    return newNewsItem;
  }

  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    return this.subscriptionPlans.get(id);
  }

  async getSubscriptionPlanByName(name: string): Promise<SubscriptionPlan | undefined> {
    return Array.from(this.subscriptionPlans.values()).find(
      (plan) => plan.name.toLowerCase() === name.toLowerCase()
    );
  }

  async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return Array.from(this.subscriptionPlans.values());
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const id = this.subscriptionPlanIdCounter++;
    const newPlan: SubscriptionPlan = { id, ...plan };
    this.subscriptionPlans.set(id, newPlan);
    return newPlan;
  }
}

// Export storage instance (Still exports MemStorage for now, as requested during development)
// To use DrizzleStorage, you will later change this or use environment variables/DI
// to instantiate and export DrizzleStorage with the DATABASE_URL.
export const storage = new MemStorage();