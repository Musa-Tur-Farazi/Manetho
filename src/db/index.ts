import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Lazy connection reference
let _db: ReturnType<typeof drizzle> | null = null;

function createDatabase() {
  if (!process.env.DATABASE_URL) {
    // Provide a stub during build or when env variables are missing.
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[db] DATABASE_URL not available – returning stub proxy.');
    }
    return new Proxy({}, {
      get() {
        throw new Error('DATABASE_URL environment variable is not defined – attempted to access the database before it was configured.');
      },
    }) as unknown as ReturnType<typeof drizzle>;
  }

  const sql = neon(process.env.DATABASE_URL);
  return drizzle(sql, { schema });
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    if (!_db) {
      _db = createDatabase();
    }
    // @ts-ignore – dynamic property access
    return (_db as any)[prop];
  },
});

export function isDatabaseAvailable(): boolean {
  return !!process.env.DATABASE_URL;
}
