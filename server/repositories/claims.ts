import { eq, desc, and } from 'drizzle-orm';
import { db } from '../db';
import { claims, reports } from '../db/schema';

export type ClaimInsert = typeof claims.$inferInsert;
export type ClaimSelect = typeof claims.$inferSelect;

export async function createClaim(data: ClaimInsert): Promise<ClaimSelect> {
  const result = await db.insert(claims).values(data).returning();
  return result[0];
}

export async function getClaimById(id: string): Promise<ClaimSelect | null> {
  const result = await db.select().from(claims).where(eq(claims.id, id)).limit(1);
  return result[0] || null;
}

export async function getUserClaims(userId: string): Promise<any[]> {
  const result = await db
    .select({
      id: claims.id,
      status: claims.status,
      createdAt: claims.createdAt,
      reportTitle: reports.title,
      reportId: reports.id,
    })
    .from(claims)
    .innerJoin(reports, eq(claims.foundReportId, reports.id))
    .where(eq(claims.claimantId, userId))
    .orderBy(desc(claims.createdAt));
    
  return result;
}

export async function updateClaimStatus(id: string, status: 'APPROVED' | 'REJECTED', adminId: string): Promise<ClaimSelect | null> {
  const result = await db
    .update(claims)
    .set({ status, reviewedBy: adminId, reviewedAt: new Date(), updatedAt: new Date() })
    .where(eq(claims.id, id))
    .returning();
    
  return result[0] || null;
}
