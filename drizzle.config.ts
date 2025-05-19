import { defineConfig } from "drizzle-kit";
import * as dotenv from 'dotenv'; // ADDED THIS

dotenv.config(); // ADDED THIS (this loads your .env file)

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Ensure it's in your .env file and the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true, // This will give you more detailed output
  strict: true,  // This enables stricter schema checks
});