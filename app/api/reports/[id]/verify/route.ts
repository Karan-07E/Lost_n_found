import { NextRequest } from 'next/server';
import { db } from '@/server/db';
import { reports, claims } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { generateClaimId } from '@/server/utils/helpers';
import { z } from 'zod';

const VerifySubmissionSchema = z.object({
  ownerName: z.string().min(2, 'Name is required'),
  ownerUsn: z.string().min(3, 'USN or Student ID is required'),
  ownerContact: z.string().min(5, 'Contact number is required'),
  action: z.enum(['COLLECTED', 'CLAIM']).default('COLLECTED'),
  verificationNotes: z.string().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = VerifySubmissionSchema.safeParse(body);

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

    if (report.status === 'RETURNED' || report.status === 'CLOSED') {
      return Response.json({ error: 'This report is already closed.' }, { status: 400 });
    }

    // CLAIM action: owner submits ownership proof, status stays at VERIFICATION for admin review
    const newStatus = 'VERIFICATION';
    const note = `[OWNER VERIFICATION SUBMITTED] By: ${data.ownerName} (USN: ${data.ownerUsn}, Phone: ${data.ownerContact}). ${data.verificationNotes ? `Notes: ${data.verificationNotes}` : ''}`;

    const [updatedReport] = await db
      .update(reports)
      .set({
        status: newStatus,
        adminNotes: report.adminNotes ? `${report.adminNotes}\n${note}` : note,
        updatedAt: new Date(),
      })
      .where(eq(reports.id, id))
      .returning();

    // Log a pending claim for admin review
    try {
      const claimId = await generateClaimId();
      await db.insert(claims).values({
        claimId,
        foundReportId: report.id,
        lostReportId: report.id,
        claimantName: data.ownerName,
        claimantUsn: data.ownerUsn,
        claimantContact: data.ownerContact,
        ownershipEvidence: data.verificationNotes || `Ownership claim submitted by ${data.ownerName}`,
        status: 'PENDING',
        adminNotes: `Submitted via verify form on ${new Date().toLocaleString()}. Awaiting admin review.`,
      });
    } catch (e) {
      console.warn('Could not create claim log:', e);
    }

    return Response.json({
      success: true,
      message: 'Ownership proof submitted! Admin will review your claim.',
      data: updatedReport,
    });
  } catch (err) {
    console.error('Error submitting verification:', err);
    return Response.json({ error: 'Failed to process verification' }, { status: 500 });
  }
}
