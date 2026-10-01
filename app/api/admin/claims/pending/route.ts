import { NextResponse } from 'next/server';
import { requireRole } from '../../../../../server/auth/session';
import { db } from '../../../../../server/db';
import { claims, reports, users } from '../../../../../server/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    await requireRole(['ADMIN']);
    
    const pendingClaims = await db
      .select({
        id: claims.id,
        justification: claims.justification,
        status: claims.status,
        createdAt: claims.createdAt,
        claimant: { name: users.name, email: users.email },
        report: { id: reports.id, title: reports.title, reportType: reports.reportType }
      })
      .from(claims)
      .innerJoin(users, eq(claims.claimantId, users.id))
      .innerJoin(reports, eq(claims.foundReportId, reports.id))
      .where(eq(claims.status, 'PENDING'))
      .orderBy(desc(claims.createdAt));
      
    return NextResponse.json({ success: true, data: pendingClaims });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
      { status: 403 }
    );
  }
}
