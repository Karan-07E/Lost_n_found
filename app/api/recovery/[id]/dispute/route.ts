import { NextRequest } from 'next/server';
import { getRecoveryCase, reportRecoveryDispute } from '@/server/services/recovery/cases';
import { z } from 'zod';

const DisputeSchema = z.object({
  actorRole: z.enum(['OWNER', 'FINDER']),
  contactVerification: z.string().min(3, 'Contact verification is required'),
  reason: z.string().min(10, 'Please describe the reason for dispute or failed handover in detail'),
  accessToken: z.string().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = DisputeSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    const caseRecord = await getRecoveryCase(id);
    if (!caseRecord) {
      return Response.json({ error: 'Recovery case not found' }, { status: 404 });
    }

    const { actorRole, contactVerification, reason, accessToken } = parsed.data;
    const cleanContact = contactVerification.trim().toLowerCase();

    // Validate authorization
    if (actorRole === 'OWNER') {
      const lostReport = caseRecord.lostReport;
      if (!lostReport) return Response.json({ error: 'Lost report not found' }, { status: 404 });
      const matchesContact = lostReport.reporterContact.toLowerCase().includes(cleanContact) ||
        (lostReport.reporterEmail && lostReport.reporterEmail.toLowerCase() === cleanContact) ||
        (lostReport.reporterUsn && lostReport.reporterUsn.toLowerCase() === cleanContact) ||
        (accessToken && lostReport.accessToken === accessToken);
      if (!matchesContact) {
        return Response.json({ error: 'Unauthorized: Credentials do not match lost item owner.' }, { status: 403 });
      }
    } else {
      const foundReport = caseRecord.foundReport;
      if (!foundReport) return Response.json({ error: 'Found report not found' }, { status: 404 });
      const matchesContact = foundReport.reporterContact.toLowerCase().includes(cleanContact) ||
        (foundReport.reporterEmail && foundReport.reporterEmail.toLowerCase() === cleanContact) ||
        (accessToken && foundReport.accessToken === accessToken);
      if (!matchesContact) {
        return Response.json({ error: 'Unauthorized: Credentials do not match found item finder.' }, { status: 403 });
      }
    }

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const result = await reportRecoveryDispute({
      caseId: caseRecord.id,
      actorRole,
      actorIdentifier: cleanContact,
      reason,
      ipAddress: ip,
    });

    return Response.json({
      success: true,
      message: result.message,
    });
  } catch (err: any) {
    console.error('Error reporting recovery dispute:', err);
    return Response.json({ error: err.message || 'Failed to report dispute' }, { status: 500 });
  }
}
