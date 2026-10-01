import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// This is required to make sure we do not fail in environments without DB, like initial build
const connectionString = process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/db';
const sql = neon(connectionString);
export const db = drizzle({ client: sql, schema });
