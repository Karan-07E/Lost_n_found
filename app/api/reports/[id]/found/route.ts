import { NextRequest } from 'next/server';
import { db } from '@/server/db';
import { reports, claims } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { generateClaimId } from '@/server/utils/helpers';
import { sendEmail } from '@/server/services/email';
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

    // Check report exists
    const [report] = await db
      .select()
      .from(reports)
      .where(eq(reports.id, id))
      .limit(1);

    if (!report) {
      return Response.json({ error: 'Report not found' }, { status: 404 });
    }

    // Only allow this action on LOST reports that are active
    if (report.reportType !== 'LOST') {
      return Response.json(
        { error: 'This action is only valid for lost item reports.' },
        { status: 400 }
      );
    }

    if (report.status === 'RETURNED' || report.status === 'CLOSED') {
      return Response.json(
        { error: 'This report is already closed.' },
        { status: 400 }
      );
    }

    const note = `[ITEM LOCATED BY FINDER] Found by: ${data.finderName} (${data.finderContact}). Currently kept at: ${data.foundLocation}.${data.additionalNotes ? ` Note: ${data.additionalNotes}` : ''}`;

    // Update report status to VERIFICATION
    const [updatedReport] = await db
      .update(reports)
      .set({
        status: 'VERIFICATION',
        adminNotes: report.adminNotes ? `${report.adminNotes}\n${note}` : note,
        updatedAt: new Date(),
      })
      .where(eq(reports.id, id))
      .returning();

    // Log the finder action as a claim record
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
        status: 'PENDING',
        adminNotes: 'Auto-recorded from "I Found This Item" action. Awaiting owner OTP verification.',
      });
    } catch (e) {
      console.warn('Could not create claim log:', e);
    }

    // ✉️ Send notification email to owner if they have an email on file
    if (report.reporterEmail) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const trackUrl = `${baseUrl}/track`;

        const subject = `[ACTION REQUIRED] Someone found your item: "${report.title}"`;
        const text = `Hello ${report.reporterName},

Great news! Someone on campus has reported finding an item matching your lost report for "${report.title}".

Finder Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Name: ${data.finderName}
• Contact: ${data.finderContact}
• Item is currently kept at: ${data.foundLocation}
${data.additionalNotes ? `• Additional note: ${data.additionalNotes}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NEXT STEPS:
1. Go to ${trackUrl} and enter your Report ID: ${report.reportId}
2. Review the potential match and confirm it is your item.
3. Start the secure OTP-based handover process to retrieve your item.

IMPORTANT: Do NOT hand over any personal documents or payment to anyone. The item will only be verified through our secure OTP system — the finder will NOT be able to mark the item as returned without your confirmation.

Your Report ID: ${report.reportId}

— Campus Lost & Found Team
Vidyavardhaka College of Engineering`;

        const html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
  <div style="border-bottom: 2px solid #16a34a; padding-bottom: 12px; margin-bottom: 20px;">
    <h2 style="color: #0f172a; margin: 0; font-size: 20px;">🎉 Your Item May Have Been Found!</h2>
    <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Campus Lost & Found · VVCE</p>
  </div>

  <p style="font-size: 15px; color: #334155;">Hello <strong>${report.reporterName}</strong>,</p>
  <p style="font-size: 14px; color: #334155; line-height: 1.5;">
    Someone on campus has reported finding an item that matches your lost report for <strong>"${report.title}"</strong>.
  </p>

  <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin: 20px 0;">
    <p style="font-size: 13px; font-weight: 700; color: #15803d; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px;">Finder Information</p>
    <table style="width: 100%; font-size: 13px; color: #1e293b; border-collapse: collapse;">
      <tr><td style="padding: 4px 0; color: #64748b; width: 140px;">Finder Name</td><td style="font-weight: 600;">${data.finderName}</td></tr>
      <tr><td style="padding: 4px 0; color: #64748b;">Contact</td><td style="font-weight: 600;">${data.finderContact}</td></tr>
      <tr><td style="padding: 4px 0; color: #64748b;">Item kept at</td><td style="font-weight: 600;">${data.foundLocation}</td></tr>
      ${data.additionalNotes ? `<tr><td style="padding: 4px 0; color: #64748b; vertical-align: top;">Note</td><td style="font-weight: 600;">${data.additionalNotes}</td></tr>` : ''}
    </table>
  </div>

  <div style="background: #fff7ed; border-left: 4px solid #f97316; padding: 12px 16px; border-radius: 4px; margin-bottom: 20px;">
    <strong style="color: #9a3412; font-size: 13px; display: block; margin-bottom: 6px;">⚠️ Security Notice</strong>
    <p style="font-size: 13px; color: #7c2d12; margin: 0; line-height: 1.5;">
      The finder <strong>cannot</strong> mark your item as returned without your confirmation. 
      Our system requires a one-time OTP (sent to your email) that only you can provide in person. 
      Never share this code over phone, chat, or email.
    </p>
  </div>

  <div style="text-align: center; margin: 24px 0;">
    <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/track" style="display: inline-block; background: #16a34a; color: white; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none;">
      Track My Report & Confirm →
    </a>
    <p style="font-size: 11px; color: #94a3b8; margin-top: 8px;">Report ID: <strong>${report.reportId}</strong></p>
  </div>

  <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px;">
    If you did not report a lost item or this message is unexpected, please ignore it or contact campus administration.
  </p>
</div>`;

        await sendEmail({ to: report.reporterEmail, subject, text, html });
      } catch (emailErr) {
        console.error('[EMAIL ERROR] Failed to notify owner of found item:', emailErr);
        // Non-fatal: do not fail the request because of email
      }
    }

    return Response.json({
      success: true,
      message: report.reporterEmail
        ? `Thank you! The owner has been notified via email. Your contact details and item location have been sent to them. The item can only be marked as returned after the owner verifies with an OTP.`
        : `Thank you! The report status is now updated to Verification. The item can only be marked as returned after the owner completes OTP verification.`,
      data: updatedReport,
    });
  } catch (err) {
    console.error('Error submitting found item confirmation:', err);
    return Response.json({ error: 'Failed to submit found item confirmation' }, { status: 500 });
  }
}
