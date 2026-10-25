import { NextRequest } from 'next/server';
import { getRecoveryCase, initiateHandoverVerification } from '@/server/services/recovery/cases';
import { z } from 'zod';

const VerifyHandoverSchema = z.object({
  finderContact: z.string().min(3, 'Finder contact verification is required'),
  accessToken: z.string().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = VerifyHandoverSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    const caseRecord = await getRecoveryCase(id);
    if (!caseRecord || !caseRecord.foundReport) {
      return Response.json({ error: 'Recovery case not found' }, { status: 404 });
    }

    // Backend Authorization: Validate finder identity
    const foundReport = caseRecord.foundReport;
    const cleanFinderContact = parsed.data.finderContact.trim().toLowerCase();
    const matchesPhone = foundReport.reporterContact.toLowerCase().includes(cleanFinderContact);
    const matchesEmail = foundReport.reporterEmail && foundReport.reporterEmail.toLowerCase() === cleanFinderContact;
    const matchesToken = parsed.data.accessToken && foundReport.accessToken && parsed.data.accessToken === foundReport.accessToken;

    if (!matchesPhone && !matchesEmail && !matchesToken) {
      return Response.json(
        { error: 'Unauthorized: You are not authorized as the finder for this recovery case.' },
        { status: 403 }
      );
    }

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const result = await initiateHandoverVerification({
      caseId: caseRecord.id,
      actorRole: 'FINDER',
      actorIdentifier: cleanFinderContact,
      ipAddress: ip,
    });

    return Response.json({
      success: true,
      message: result.message,
      data: {
        expiresAt: result.expiresAt,
        simulated: result.simulated,
      },
    });
  } catch (err: any) {
    console.error('Error initiating handover verification:', err);
    return Response.json({ error: err.message || 'Failed to initiate handover' }, { status: 500 });
  }
}
