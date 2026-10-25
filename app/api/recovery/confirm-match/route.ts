import { NextRequest } from 'next/server';
import { db } from '@/server/db';
import { reports } from '@/server/db/schema';
import { eq, or } from 'drizzle-orm';
import { createRecoveryCase } from '@/server/services/recovery/cases';
import { z } from 'zod';

const ConfirmMatchSchema = z.object({
  lostReportId: z.string().min(1),
  foundReportId: z.string().min(1),
  matchId: z.string().uuid().optional(),
  actorRole: z.enum(['OWNER', 'FINDER']).default('OWNER'),
  contactVerification: z.string().optional(),
  accessToken: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ConfirmMatchSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    const { lostReportId, foundReportId, matchId, actorRole, contactVerification, accessToken } = parsed.data;

    // Resolve reports (supports UUID or reportId e.g. LF-2026-00007)
    const isLostUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lostReportId);
    const [lostReport] = await db
      .select()
      .from(reports)
      .where(isLostUuid ? or(eq(reports.id, lostReportId), eq(reports.reportId, lostReportId)) : eq(reports.reportId, lostReportId))
      .limit(1);

    const isFoundUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(foundReportId);
    const [foundReport] = await db
      .select()
      .from(reports)
      .where(isFoundUuid ? or(eq(reports.id, foundReportId), eq(reports.reportId, foundReportId)) : eq(reports.reportId, foundReportId))
      .limit(1);

    if (!lostReport || lostReport.reportType !== 'LOST') {
      return Response.json({ error: 'Valid Lost report not found' }, { status: 404 });
    }
    if (!foundReport || foundReport.reportType !== 'FOUND') {
      return Response.json({ error: 'Valid Found report not found' }, { status: 404 });
    }

    // Backend Authorization: Validate owner identity before allowing match confirmation
    if (actorRole === 'OWNER' && (contactVerification || accessToken)) {
      const tokenMatches = accessToken && lostReport.accessToken && accessToken === lostReport.accessToken;
      const contactClean = (contactVerification || '').trim().toLowerCase();
      const phoneMatches = contactClean && lostReport.reporterContact.toLowerCase().includes(contactClean);
      const emailMatches = contactClean && lostReport.reporterEmail && lostReport.reporterEmail.toLowerCase() === contactClean;
      const usnMatches = contactClean && lostReport.reporterUsn && lostReport.reporterUsn.toLowerCase() === contactClean;

      if (!tokenMatches && !phoneMatches && !emailMatches && !usnMatches) {
        return Response.json({ error: 'Unauthorized: The provided contact or credentials do not match the lost item owner.' }, { status: 403 });
      }
    }

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const recoveryCase = await createRecoveryCase({
      lostReportId: lostReport.id,
      foundReportId: foundReport.id,
      matchId,
      actorRole,
      actorIdentifier: contactVerification || accessToken || lostReport.reporterEmail || 'authenticated-owner',
      ipAddress: ip,
    });

    return Response.json({
      success: true,
      message: 'Recovery case established. You can now coordinate handover.',
      data: {
        caseId: recoveryCase.id,
        caseNumber: recoveryCase.caseNumber,
        status: recoveryCase.status,
      },
    }, { status: 201 });
  } catch (err: any) {
    console.error('Error confirming match:', err);
    return Response.json({ error: err.message || 'Failed to confirm match' }, { status: 500 });
  }
}
