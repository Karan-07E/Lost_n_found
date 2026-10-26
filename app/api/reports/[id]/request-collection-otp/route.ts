import { NextRequest } from 'next/server';
import { db } from '@/server/db';
import { reports } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { generateSecureOtp, hashOtp, OTP_EXPIRY_MS } from '@/server/services/recovery/otp';
import { sendOtpEmail } from '@/server/services/email';

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/reports/[id]/request-collection-otp
 * Called when finder clicks "Item Collected" in the verify modal.
 * Generates a secure OTP, hashes it, stores in the report row,
 * and sends the plaintext code to the owner's email.
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

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

    if (!report.reporterEmail) {
      return Response.json(
        { error: 'No email address on file for this report. Cannot send OTP.' },
        { status: 400 }
      );
    }

    // Generate secure OTP and hash it
    const otpCode = generateSecureOtp();
    const otpHash = hashOtp(otpCode);
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MS).toISOString();

    // Store OTP hash and expiry in access_token field as JSON (temporary, cleared on verify)
    const otpState = JSON.stringify({ hash: otpHash, expiry: otpExpiry });

    await db
      .update(reports)
      .set({ accessToken: otpState, updatedAt: new Date() })
      .where(eq(reports.id, id));

    // Send OTP to owner's email
    const emailResult = await sendOtpEmail(
      report.reporterEmail,
      report.reporterName,
      otpCode,
      report.title
    );

    const maskedEmail = report.reporterEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3');

    return Response.json({
      success: true,
      maskedEmail,
      expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1000),
      simulated: emailResult.simulated,
      message: `A 6-digit verification code has been sent to the owner's email (${maskedEmail}). Ask the owner to check their inbox and tell you the code.`,
    });
  } catch (err) {
    console.error('[OTP REQUEST ERROR]', err);
    return Response.json({ error: 'Failed to generate OTP. Please try again.' }, { status: 500 });
  }
}
