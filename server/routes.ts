import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { storage } from "./storage";
import { fetchMLBGames, fetchTeamNews } from "./mlbApi";
import { generatePredictions } from "./prediction";
import { comparePassword, hashPassword } from "./auth";
import Stripe from "stripe";
import { format } from "date-fns";
import { User } from "@shared/schema";

// Initialize session store
const SessionStore = MemoryStore(session);

// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_dummy";
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16" as any,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(
    session({
      cookie: { maxAge: 86400000 }, // 24 hours
      store: new SessionStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      }),
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || "mlb-edge-secret"
    })
  );

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }

        const isValid = await comparePassword(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Incorrect password" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Development test login route - ONLY FOR DEVELOPMENT TESTING
  app.get("/api/auth/dev-login", async (req, res) => {
    if (process.env.NODE_ENV !== "development") {
      return res.status(404).json({ message: "Not found" });
    }
    
    try {
      // Check if test user exists
      let user = await storage.getUserByUsername("testuser");
      
      // Create test user if it doesn't exist
      if (!user) {
        const hashedPassword = await hashPassword("password123");
        user = await storage.createUser({
          username: "testuser",
          password: hashedPassword,
          email: "test@example.com"
        });
        
        // Update to pro subscription for testing
        user = await storage.updateUserSubscriptionTier(user.id, "pro");
      }
      
      // Log the user in
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging in" });
        }
        return res.json({ 
          id: user.id, 
          username: user.username, 
          email: user.email,
          subscriptionTier: user.subscriptionTier,
          message: "Development test user logged in successfully"
        });
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, email } = req.body;
      
      // Check if user exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Create user
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email
      });

      res.status(201).json({ id: user.id, username: user.username, email: user.email });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: Error, user: User, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message || "Authentication failed" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({ 
          id: user.id, 
          username: user.username, 
          email: user.email,
          subscriptionTier: user.subscriptionTier
        });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = req.user as User;
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      subscriptionTier: user.subscriptionTier,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      createdAt: user.createdAt
    });
  });

  // Game and prediction routes
  app.get("/api/picks/today", async (req, res) => {
    try {
      // Check user subscription level to determine what data to return
      let subscriptionTier = "free";
      if (req.isAuthenticated()) {
        const user = req.user as User;
        subscriptionTier = user.subscriptionTier || "free";
      }

      // Get today's date in YYYY-MM-DD format
      const today = format(new Date(), "yyyy-MM-dd");
      
      // Get games for today
      let games = await storage.getGamesByDate(today);
      
      // If no games in storage, fetch from API and store
      if (games.length === 0) {
        const mlbGames = await fetchMLBGames(today);
        if (mlbGames.length > 0) {
          games = await Promise.all(
            mlbGames.map(game => storage.createGame(game))
          );
        }
      }

      // Get predictions for these games
      let gamesWithPredictions = [];
      for (const game of games) {
        const prediction = await storage.getPredictionByGameId(game.id);
        
        // If no prediction exists, generate one
        if (!prediction) {
          const generatedPrediction = await generatePredictions([game]);
          if (generatedPrediction.length > 0) {
            await storage.createPrediction(generatedPrediction[0]);
            gamesWithPredictions.push({
              ...game,
              prediction: generatedPrediction[0]
            });
          } else {
            gamesWithPredictions.push(game);
          }
        } else {
          // Filter prediction data based on subscription tier
          if (subscriptionTier === "free" && prediction.tier !== "basic") {
            // For free users, only show basic predictions
            gamesWithPredictions.push(game);
          } else if (subscriptionTier === "basic" && prediction.tier === "elite") {
            // For basic users, don't show elite predictions
            gamesWithPredictions.push({
              ...game,
              prediction: {
                ...prediction,
                analysis: prediction.analysis.substring(0, 100) + "... Upgrade for full analysis"
              }
            });
          } else {
            // For pro and elite users, show all predictions
            gamesWithPredictions.push({
              ...game,
              prediction
            });
          }
        }
      }

      res.json(gamesWithPredictions);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/picks", async (req, res) => {
    try {
      const date = req.query.date as string;
      if (!date) {
        return res.status(400).json({ message: "Date parameter is required" });
      }

      // Check user subscription
      let subscriptionTier = "free";
      if (req.isAuthenticated()) {
        const user = req.user as User;
        subscriptionTier = user.subscriptionTier || "free";
      }

      // Get games for the date
      let games = await storage.getGamesByDate(date);
      
      // If no games in storage, fetch from API and store
      if (games.length === 0) {
        const mlbGames = await fetchMLBGames(date);
        if (mlbGames.length > 0) {
          games = await Promise.all(
            mlbGames.map(game => storage.createGame(game))
          );
        }
      }

      // Get predictions for these games with subscription filtering
      let gamesWithPredictions = [];
      for (const game of games) {
        const prediction = await storage.getPredictionByGameId(game.id);
        
        if (!prediction) {
          gamesWithPredictions.push(game);
        } else {
          // Filter based on subscription tier
          if (subscriptionTier === "free" && prediction.tier !== "basic") {
            gamesWithPredictions.push(game);
          } else if (subscriptionTier === "basic" && prediction.tier === "elite") {
            gamesWithPredictions.push({
              ...game,
              prediction: {
                ...prediction,
                analysis: prediction.analysis.substring(0, 100) + "... Upgrade for full analysis"
              }
            });
          } else {
            gamesWithPredictions.push({
              ...game,
              prediction
            });
          }
        }
      }

      res.json(gamesWithPredictions);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/games/:id", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const game = await storage.getGame(gameId);
      
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      // Check user subscription
      let subscriptionTier = "free";
      if (req.isAuthenticated()) {
        const user = req.user as User;
        subscriptionTier = user.subscriptionTier || "free";
      }

      // Get prediction if available
      const prediction = await storage.getPredictionByGameId(gameId);
      
      // Return game with prediction based on subscription
      if (!prediction) {
        res.json(game);
      } else if (subscriptionTier === "free" && prediction.tier !== "basic") {
        res.json(game);
      } else if (subscriptionTier === "basic" && prediction.tier === "elite") {
        res.json({
          ...game,
          prediction: {
            ...prediction,
            analysis: prediction.analysis.substring(0, 100) + "... Upgrade for full analysis"
          }
        });
      } else {
        res.json({
          ...game,
          prediction
        });
      }
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // News routes
  app.get("/api/news/latest", async (req, res) => {
    try {
      let news = await storage.getLatestNews(5);
      
      // If no news in storage, fetch from API and store
      if (news.length === 0) {
        const teamNews = await fetchTeamNews();
        if (teamNews.length > 0) {
          news = await Promise.all(
            teamNews.map(item => storage.createNews(item))
          );
        }
      }

      res.json(news);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/news", async (req, res) => {
    try {
      const news = await storage.getAllNews();
      res.json(news);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/news/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const news = await storage.getNewsByCategory(category);
      res.json(news);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Subscription plans routes
  app.get("/api/subscription-plans", async (req, res) => {
    try {
      const plans = await storage.getAllSubscriptionPlans();
      res.json(plans);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Stripe subscription route
  app.post("/api/create-subscription", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = req.user as User;
    const { plan } = req.body;

    if (!plan) {
      return res.status(400).json({ message: "Plan is required" });
    }

    try {
      // Get the selected plan
      const subscriptionPlan = await storage.getSubscriptionPlanByName(plan);
      
      if (!subscriptionPlan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      // Check if user already has a Stripe customer ID
      let customerId = user.stripeCustomerId;

      if (!customerId) {
        // Create a new customer
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.username,
        });

        customerId = customer.id;
        await storage.updateUserStripeCustomerId(user.id, customerId);
      }

      // Create a payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: subscriptionPlan.price * 100, // Convert to cents
        currency: "usd",
        customer: customerId,
        metadata: {
          userId: user.id.toString(),
          plan: subscriptionPlan.name
        }
      });

      // Update user subscription tier
      await storage.updateUserSubscriptionTier(user.id, subscriptionPlan.name.toLowerCase());

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        subscriptionPlan
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Analytics endpoint
  app.get("/api/analytics", (req, res) => {
    // This would typically return analytics data
    // For demonstration, return mock analytics
    res.json({
      overallWinRate: 68.5,
      highConfidenceWinRate: 82.3,
      totalPicksAnalyzed: 387
    });
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
