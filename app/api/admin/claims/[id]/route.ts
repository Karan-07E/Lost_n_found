import { NextResponse } from 'next/server';
import { requireRole } from '../../../../../server/auth/session';
import { db } from '../../../../../server/db';
import { claims, reports, notifications, users } from '../../../../../server/db/schema';
import { eq, desc, and, ne } from 'drizzle-orm';
import { updateClaimStatus } from '../../../../../server/repositories/claims';
import { updateReportStatus } from '../../../../../server/repositories/reports';

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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requireRole(['ADMIN']);
    const { status } = await req.json();
    
    if (status !== 'APPROVED' && status !== 'REJECTED') {
      return NextResponse.json({ success: false, error: { message: 'Invalid status' } }, { status: 400 });
    }
    
    // Use transaction for approval
    const updatedClaim = await db.transaction(async (tx) => {
      const [claim] = await tx
        .update(claims)
        .set({ status, reviewedBy: session.userId, reviewedAt: new Date() })
        .where(eq(claims.id, id))
        .returning();
        
      if (status === 'APPROVED') {
        await tx
          .update(reports)
          .set({ status: 'RECOVERED' }) 
          .where(eq(reports.id, claim.foundReportId));
          
        // reject all other pending claims for this report
        await tx
          .update(claims)
          .set({ status: 'REJECTED', reviewedBy: session.userId, reviewedAt: new Date() })
          .where(and(eq(claims.foundReportId, claim.foundReportId), eq(claims.status, 'PENDING'), ne(claims.id, claim.id)));
      }
      
      return claim;
    });
    
    // Notify claimant
    await db.insert(notifications).values({
      userId: updatedClaim.claimantId,
      type: `CLAIM_${status}`,
      message: `Your claim has been ${status.toLowerCase()}.`,
      relatedClaimId: updatedClaim.id,
    });
    
    return NextResponse.json({ success: true, data: updatedClaim });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 403 }
    );
  }
}
