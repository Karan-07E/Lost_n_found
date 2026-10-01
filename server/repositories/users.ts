import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';

export type UserInsert = typeof users.$inferInsert;
export type UserSelect = typeof users.$inferSelect;

export async function getUserByEmail(email: string): Promise<UserSelect | null> {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] || null;
}

export async function getUserById(id: string): Promise<UserSelect | null> {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] || null;
}

export async function createUser(data: UserInsert): Promise<UserSelect> {
  const result = await db.insert(users).values(data).returning();
  return result[0];
}
