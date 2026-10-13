import { db } from '@/server/db';
import { reports } from '@/server/db/schema';
import { count } from 'drizzle-orm';

export * from '@/lib/constants';

/**
 * Generate a unique Report ID in the format LF-YYYY-NNNNN
 * e.g. LF-2026-00124
 */
export async function generateReportId(): Promise<string> {
  const year = new Date().getFullYear();
  const result = await db.select({ value: count() }).from(reports);
  const total = Number(result[0]?.value ?? 0);
  const seq = String(total + 1).padStart(5, '0');
  return `LF-${year}-${seq}`;
}

/**
 * Generate a unique Claim ID in the format CLM-YYYY-NNNNN
 */
export async function generateClaimId(): Promise<string> {
  const year = new Date().getFullYear();
  const seq = String(Date.now()).slice(-5);
  return `CLM-${year}-${seq}`;
}
