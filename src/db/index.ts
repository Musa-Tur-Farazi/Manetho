import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
<<<<<<< HEAD
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in .env.local');
=======

// Environment variables are automatically available in Docker containers
// No need to explicitly load .env.local in production

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not defined');
>>>>>>> bb7e448 (Initial commit with CI/CD setup)
}

// Configure Neon client
const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, { schema });
