import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

// Log for debugging purposes
console.log("Initializing database connection");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not defined");
  throw new Error('DATABASE_URL is not defined');
}

let db;

try {
  console.log("Creating database connection with URL:", process.env.DATABASE_URL.substring(0, 15) + '...');

  // Create a SQL query executor
  const sql = neon(process.env.DATABASE_URL);

  // Create a drizzle instance
  db = drizzle(sql);

  console.log("Database connection initialized successfully");
} catch (error) {
  console.error("Failed to initialize database connection:", error);
  throw error;
}

export { db };
