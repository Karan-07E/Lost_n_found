import { NextRequest } from 'next/server';
import { getRecoveryCase, confirmItemReceived } from '@/server/services/recovery/cases';
import { z } from 'zod';

const ConfirmReceiptSchema = z.object({
  ownerContact: z.string().min(3, 'Owner contact or USN verification is required'),
  acknowledgment: z.literal(true, {
    error: 'Explicit physical receipt acknowledgment must be checked.',
  }),
  acknowledgmentText: z.string().optional(),
  remarks: z.string().optional(),
  accessToken: z.string().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = ConfirmReceiptSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    const caseRecord = await getRecoveryCase(id);
    if (!caseRecord || !caseRecord.lostReport) {
      return Response.json({ error: 'Recovery case not found' }, { status: 404 });
    }

    // Backend Authorization: Validate owner identity
    const lostReport = caseRecord.lostReport;
    const cleanOwnerContact = parsed.data.ownerContact.trim().toLowerCase();
    const matchesPhone = lostReport.reporterContact.toLowerCase().includes(cleanOwnerContact);
    const matchesEmail = lostReport.reporterEmail && lostReport.reporterEmail.toLowerCase() === cleanOwnerContact;
    const matchesUsn = lostReport.reporterUsn && lostReport.reporterUsn.toLowerCase() === cleanOwnerContact;
    const matchesToken = parsed.data.accessToken && lostReport.accessToken && parsed.data.accessToken === lostReport.accessToken;

    if (!matchesPhone && !matchesEmail && !matchesUsn && !matchesToken) {
      return Response.json(
        { error: 'Unauthorized: You are not authorized as the owner of this lost item.' },
        { status: 403 }
      );
    }

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const result = await confirmItemReceived({
      caseId: caseRecord.id,
      actorRole: 'OWNER',
      actorIdentifier: cleanOwnerContact,
      acknowledgment: parsed.data.acknowledgment,
      acknowledgmentText: parsed.data.acknowledgmentText,
      remarks: parsed.data.remarks,
      ipAddress: ip,
    });

    return Response.json({
      success: true,
      message: result.message,
    });
  } catch (err: any) {
    console.error('Error confirming item receipt:', err);
    return Response.json({ error: err.message || 'Receipt confirmation failed' }, { status: 400 });
  }
}
