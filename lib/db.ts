import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const dbUrl = process.env.TURSO_DATABASE_URL;

if (!dbUrl && process.env.VERCEL) {
  console.warn("WARNING: TURSO_DATABASE_URL is not set in Vercel Environment Variables.");
}

const client = createClient({
  url: dbUrl || 'file:./local.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
