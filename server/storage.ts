import { 
  users, type User, type InsertUser,
  games, type Game, type InsertGame,
  predictions, type Prediction, type InsertPrediction,
  news, type News, type InsertNews,
  subscriptionPlans, type SubscriptionPlan, type InsertSubscriptionPlan
} from "@shared/schema";

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
  createNews(news: InsertNews): Promise<News>;
  
  // Subscription plan operations
  getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined>;
  getSubscriptionPlanByName(name: string): Promise<SubscriptionPlan | undefined>;
  getAllSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
}

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
    
    // Initialize with default subscription plans
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
      stripePriceId: 'price_basic'
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
      stripePriceId: 'price_pro'
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
      stripePriceId: 'price_elite'
    };
    
    this.createSubscriptionPlan(basicPlan);
    this.createSubscriptionPlan(proPlan);
    this.createSubscriptionPlan(elitePlan);
  }
  
  // User methods
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
    };
    this.users.set(id, newUser);
    return newUser;
  }
  
  async updateUserSubscriptionTier(userId: number, tier: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedUser = {
      ...user,
      subscriptionTier: tier
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async updateUserStripeCustomerId(userId: number, customerId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedUser = {
      ...user,
      stripeCustomerId: customerId
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async updateUserStripeSubscriptionId(userId: number, subscriptionId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedUser = {
      ...user,
      stripeSubscriptionId: subscriptionId
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  // Game methods
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
    const newGame: Game = {
      id,
      ...game
    };
    this.games.set(id, newGame);
    return newGame;
  }
  
  // Prediction methods
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
    const newPrediction: Prediction = {
      id,
      ...prediction,
      createdAt: now
    };
    this.predictions.set(id, newPrediction);
    return newPrediction;
  }
  
  // News methods
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
  
  async createNews(news: InsertNews): Promise<News> {
    const id = this.newsIdCounter++;
    const now = new Date();
    const newNews: News = {
      id,
      ...news,
      publishDate: news.publishDate || now
    };
    this.newsItems.set(id, newNews);
    return newNews;
  }
  
  // Subscription plan methods
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
    const newPlan: SubscriptionPlan = {
      id,
      ...plan
    };
    this.subscriptionPlans.set(id, newPlan);
    return newPlan;
  }
}

// Export storage instance
export const storage = new MemStorage();
