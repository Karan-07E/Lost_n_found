import { eq, desc } from 'drizzle-orm';
import { db } from '../db';
import { claims, reports } from '../db/schema';

export type ClaimInsert = typeof claims.$inferInsert;
export type ClaimSelect = typeof claims.$inferSelect;
export type ClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'MORE_INFO_NEEDED';

export async function createClaim(data: ClaimInsert): Promise<ClaimSelect> {
  const result = await db.insert(claims).values(data).returning();
  return result[0];
}

export async function getClaimById(id: string): Promise<ClaimSelect | null> {
  const result = await db.select().from(claims).where(eq(claims.id, id)).limit(1);
  return result[0] || null;
}

export async function getClaimsByReportId(foundReportId: string): Promise<ClaimSelect[]> {
  return await db
    .select()
    .from(claims)
    .where(eq(claims.foundReportId, foundReportId))
    .orderBy(desc(claims.createdAt));
}

export async function updateClaimStatus(id: string, status: ClaimStatus, adminNotes?: string): Promise<ClaimSelect | null> {
  const result = await db
    .update(claims)
    .set({
      status,
      adminNotes: adminNotes || null,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(claims.id, id))
    .returning();
    
  return result[0] || null;
}
