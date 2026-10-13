import { NextRequest } from 'next/server';
import { db } from '@/server/db';
import { reports, claims } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { generateClaimId } from '@/server/utils/helpers';
import { z } from 'zod';

const FoundSubmissionSchema = z.object({
  finderName: z.string().min(2, 'Name is required'),
  finderContact: z.string().min(5, 'Contact number is required'),
  foundLocation: z.string().min(2, 'Current item location is required'),
  additionalNotes: z.string().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = FoundSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check report
    const [report] = await db
      .select()
      .from(reports)
      .where(eq(reports.id, id))
      .limit(1);

    if (!report) {
      return Response.json({ error: 'Report not found' }, { status: 404 });
    }

    const note = `[ITEM RECOVERED/FOUND] Found by: ${data.finderName} (${data.finderContact}). Kept at: ${data.foundLocation}.${data.additionalNotes ? ` Note: ${data.additionalNotes}` : ''}`;

    // Update report status to VERIFICATION / MATCHED
    const [updatedReport] = await db
      .update(reports)
      .set({
        status: 'VERIFICATION',
        adminNotes: report.adminNotes ? `${report.adminNotes}\n${note}` : note,
        updatedAt: new Date(),
      })
      .where(eq(reports.id, id))
      .returning();

    // Also record this recovery event
    try {
      const claimId = await generateClaimId();
      await db.insert(claims).values({
        claimId,
        foundReportId: report.id,
        lostReportId: report.id,
        claimantName: data.finderName,
        claimantUsn: 'FINDER',
        claimantContact: data.finderContact,
        ownershipEvidence: `Item found and deposited at: ${data.foundLocation}. Notes: ${data.additionalNotes || 'N/A'}`,
        status: 'APPROVED',
        adminNotes: 'Auto-recorded from home page "I Found This Item" action.',
        reviewedAt: new Date(),
      });
    } catch (e) {
      console.warn('Could not create claim log:', e);
    }

    return Response.json({
      success: true,
      message: 'Thank you! The report status is now updated to Verification, and the owner will be notified.',
      data: updatedReport,
    });
  } catch (err) {
    console.error('Error submitting found item confirmation:', err);
    return Response.json({ error: 'Failed to submit found item confirmation' }, { status: 500 });
  }
}
