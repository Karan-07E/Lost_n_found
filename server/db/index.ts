import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/db';

// Disable prepared statements for Supabase transaction pooler (port 6543)
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
