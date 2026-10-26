import { NextRequest } from 'next/server';
import { db } from '@/server/db';
import { reports, claims } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { verifyOtpHash } from '@/server/services/recovery/otp';
import { sendReceiptCompletedEmail } from '@/server/services/email';
import { z } from 'zod';

const Schema = z.object({
  code: z.string().min(4, 'OTP code is required'),
  finderContact: z.string().min(3, 'Finder contact is required'),
  finderName: z.string().min(2, 'Finder name is required'),
});

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/reports/[id]/complete-collection-otp
 * Verifies the OTP entered by the finder (told by owner in person).
 * On success: marks report as RETURNED and sends confirmation emails.
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = Schema.safeParse(body);

    if (!parsed.success) {
      return Response.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    const { code, finderContact, finderName } = parsed.data;

    const [report] = await db
      .select()
      .from(reports)
      .where(eq(reports.id, id))
      .limit(1);

    if (!report) {
      return Response.json({ error: 'Report not found' }, { status: 404 });
    }

    if (report.status === 'RETURNED' || report.status === 'CLOSED') {
      return Response.json({ success: true, message: 'This item has already been marked as returned.' });
    }

    // Parse the OTP state stored in accessToken field
    if (!report.accessToken) {
      return Response.json(
        { error: 'No OTP has been requested for this item. Please click "Send OTP" first.' },
        { status: 400 }
      );
    }

    let otpState: { hash: string; expiry: string };
    try {
      otpState = JSON.parse(report.accessToken);
    } catch {
      return Response.json(
        { error: 'Invalid OTP state. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date(otpState.expiry) < new Date()) {
      return Response.json(
        { error: 'This OTP has expired (valid for 5 minutes). Please click "Send OTP" again to get a new code.' },
        { status: 400 }
      );
    }

    // Verify the code using constant-time comparison
    const isValid = verifyOtpHash(code.trim(), otpState.hash);
    if (!isValid) {
      return Response.json(
        { error: 'Incorrect verification code. Please double-check the code with the owner and try again.' },
        { status: 400 }
      );
    }

    // OTP verified — atomically mark report as RETURNED and clear OTP state
    const note = `[ITEM RETURNED & COLLECTED] OTP verified. Collected by: ${finderName} (${finderContact}) on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}.`;

    const [updatedReport] = await db
      .update(reports)
      .set({
        status: 'RETURNED',
        accessToken: null, // Clear OTP state
        adminNotes: report.adminNotes ? `${report.adminNotes}\n${note}` : note,
        updatedAt: new Date(),
      })
      .where(eq(reports.id, id))
      .returning();

    // Log as a completed claim record
    try {
      const { generateClaimId } = await import('@/server/utils/helpers');
      const claimId = await generateClaimId();
      await db.insert(claims).values({
        claimId,
        foundReportId: report.id,
        lostReportId: report.id,
        claimantName: finderName,
        claimantUsn: 'FINDER',
        claimantContact: finderContact,
        ownershipEvidence: `OTP-verified handover. Item returned on ${new Date().toLocaleString()}.`,
        status: 'APPROVED',
        adminNotes: 'Completed via OTP-verified collection flow.',
        reviewedAt: new Date(),
      });
    } catch (e) {
      console.warn('Could not create claim log:', e);
    }

    // Send confirmation email to owner
    if (report.reporterEmail) {
      try {
        await sendReceiptCompletedEmail(
          report.reporterEmail,
          report.reporterName,
          report.title,
          'OWNER'
        );
      } catch (emailErr) {
        console.error('[EMAIL ERROR] Failed to send receipt confirmation:', emailErr);
      }
    }

    return Response.json({
      success: true,
      message: `✅ Item verified and marked as Returned! "${report.title}" has been successfully recovered. A confirmation email has been sent to the owner.`,
      data: updatedReport,
    });
  } catch (err) {
    console.error('[OTP VERIFY ERROR]', err);
    return Response.json({ error: 'Failed to verify OTP. Please try again.' }, { status: 500 });
  }
}
