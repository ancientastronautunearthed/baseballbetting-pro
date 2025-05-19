import * as dotenv from 'dotenv';
import { DrizzleStorage } from './storage'; // Assumes storage.ts is in the same server/ directory
import type { InsertSubscriptionPlan } from '../shared/schema'; // Relative path to shared/schema.ts

// Load environment variables from .env file located in the project root
dotenv.config();

const seedDatabase = async () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('🔴 DATABASE_URL is not set. Please check your .env file in the project root.');
    process.exit(1);
  }

  console.log('⚪️ Connecting to database to seed subscription plans...');
  const storage = new DrizzleStorage(databaseUrl);
  console.log('🟢 Connected to database.');

  const plansToSeed: InsertSubscriptionPlan[] = [
    {
      name: 'Basic',
      price: 2900, // Price in cents (e.g., $29.00)
      description: 'Perfect for casual bettors',
      features: [
        'Daily top 3 high-confidence picks',
        'Basic game analysis',
        'Daily MLB news digest',
        'Email delivery of picks'
      ],
      stripePriceId: 'price_placeholder_basic' // IMPORTANT: Replace with actual Stripe Price ID later
    },
    {
      name: 'Pro',
      price: 5900, // Price in cents (e.g., $59.00)
      description: 'Most popular choice for serious bettors',
      features: [
        'All daily picks with confidence ratings',
        'Detailed game analysis & explanations',
        'Full access to MLB news & insights',
        'Mobile app access',
        'Basic analytics dashboard'
      ],
      stripePriceId: 'price_placeholder_pro' // IMPORTANT: Replace with actual Stripe Price ID later
    },
    {
      name: 'Elite',
      price: 9900, // Price in cents (e.g., $99.00)
      description: 'The ultimate MLB wagering experience',
      features: [
        'Everything in Pro plan',
        'Advanced analytics dashboard access',
        'Historical model performance tracking',
        'Customizable alerts & notifications',
        'Weekly expert consultation',
        'Early access to picks (8 hrs advantage)'
      ],
      stripePriceId: 'price_placeholder_elite' // IMPORTANT: Replace with actual Stripe Price ID later
    }
  ];

  console.log('⚪️ Starting to seed subscription plans...');
  for (const planData of plansToSeed) {
    try {
      // Check if plan already exists to make seeding idempotent
      const existingPlan = await storage.getSubscriptionPlanByName(planData.name);
      if (existingPlan) {
        console.log(`🟡 Plan "${planData.name}" already exists. Skipping.`);
      } else {
        await storage.createSubscriptionPlan(planData);
        console.log(`🟢 Created subscription plan: ${planData.name}`);
      }
    } catch (error) {
      console.error(`🔴 Error creating plan ${planData.name}:`, error);
    }
  }

  console.log('✅ Database seeding process complete.');
  // The Node.js process should exit automatically after asynchronous operations complete.
  // If it hangs, you might need to investigate if the database pool is keeping it alive
  // and explicitly close it, but this is uncommon for simple scripts.
};

seedDatabase()
  .then(() => {
    console.log('🌱 Seeding finished successfully.');
    // process.exit(0); // Usually not needed
  })
  .catch((error) => {
    console.error('🔴 Top-level error during database seeding:', error);
    process.exit(1);
  });
