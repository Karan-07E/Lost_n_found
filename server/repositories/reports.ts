import { eq, desc, and } from 'drizzle-orm';
import { db } from '../db';
import { reports } from '../db/schema';

export type ReportInsert = typeof reports.$inferInsert;
export type ReportSelect = typeof reports.$inferSelect;

export async function createReport(data: ReportInsert): Promise<ReportSelect> {
  const result = await db.insert(reports).values(data).returning();
  return result[0];
}

export async function getReportById(id: string): Promise<ReportSelect | null> {
  const result = await db.select().from(reports).where(eq(reports.id, id)).limit(1);
  return result[0] || null;
}

export async function getReportsByType(type: 'LOST' | 'FOUND', page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;
  const result = await db
    .select()
    .from(reports)
    .where(eq(reports.reportType, type))
    .orderBy(desc(reports.createdAt))
    .limit(limit)
    .offset(offset);
  
  return result;
}

export async function updateReportStatus(id: string, status: 'ACTIVE' | 'MATCHED' | 'CLAIMED' | 'RECOVERED' | 'CLOSED', userId: string): Promise<ReportSelect | null> {
  const result = await db
    .update(reports)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(reports.id, id), eq(reports.userId, userId)))
    .returning();
  return result[0] || null;
}

export async function deleteReport(id: string, userId: string): Promise<boolean> {
  const result = await db
    .delete(reports)
    .where(and(eq(reports.id, id), eq(reports.userId, userId)))
    .returning();
  return result.length > 0;
}
