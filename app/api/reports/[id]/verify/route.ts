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

    const isCollected = data.action === 'COLLECTED';
    const newStatus = isCollected ? 'RETURNED' : 'VERIFICATION';
    const note = `[${isCollected ? 'ITEM RETURNED & COLLECTED' : 'OWNER VERIFICATION SUBMITTED'}] By owner: ${data.ownerName} (USN: ${data.ownerUsn}, Phone: ${data.ownerContact}). ${data.verificationNotes ? `Notes: ${data.verificationNotes}` : ''}`;

    // Update report status
    const [updatedReport] = await db
      .update(reports)
      .set({
        status: newStatus,
        adminNotes: report.adminNotes ? `${report.adminNotes}\n${note}` : note,
        updatedAt: new Date(),
      })
      .where(eq(reports.id, id))
      .returning();

    // Log the claim/handover record
    try {
      const claimId = await generateClaimId();
      await db.insert(claims).values({
        claimId,
        foundReportId: report.id,
        lostReportId: report.id,
        claimantName: data.ownerName,
        claimantUsn: data.ownerUsn,
        claimantContact: data.ownerContact,
        ownershipEvidence: data.verificationNotes || `Direct handover confirmation by ${data.ownerName}`,
        status: isCollected ? 'APPROVED' : 'PENDING',
        adminNotes: `Verified on ${new Date().toLocaleString()}`,
        reviewedAt: new Date(),
      });
    } catch (e) {
      console.warn('Could not create claim log:', e);
    }

    return Response.json({
      success: true,
      message: isCollected
        ? 'Great! The item has been marked as Returned & Closed.'
        : 'Ownership verification submitted successfully!',
      data: updatedReport,
    });
  } catch (err) {
    console.error('Error submitting verification:', err);
    return Response.json({ error: 'Failed to process verification' }, { status: 500 });
  }
}
