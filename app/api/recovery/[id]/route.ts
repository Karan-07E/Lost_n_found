import { NextRequest } from 'next/server';
import { getRecoveryCase } from '@/server/services/recovery/cases';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const caseRecord = await getRecoveryCase(id);

    if (!caseRecord) {
      return Response.json({ error: 'Recovery case not found' }, { status: 404 });
    }

    // Mask sensitive contact details for privacy
    const maskContact = (str?: string | null) => {
      if (!str) return 'N/A';
      if (str.length <= 4) return '***';
      return str.slice(0, 2) + '****' + str.slice(-2);
    };

    const maskEmail = (email?: string | null) => {
      if (!email) return 'N/A';
      return email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
    };

    const responseData = {
      id: caseRecord.id,
      caseNumber: caseRecord.caseNumber,
      status: caseRecord.status,
      meetingLocation: caseRecord.meetingLocation,
      meetingNotes: caseRecord.meetingNotes,
      otpVerifiedAt: caseRecord.otpVerifiedAt,
      receivedConfirmedAt: caseRecord.receivedConfirmedAt,
      ownerAcknowledgment: caseRecord.ownerAcknowledgment,
      ownerAcknowledgmentText: caseRecord.ownerAcknowledgmentText,
      ownerRemarks: caseRecord.ownerRemarks,
      disputeReason: caseRecord.disputeReason,
      disputedBy: caseRecord.disputedBy,
      disputedAt: caseRecord.disputedAt,
      createdAt: caseRecord.createdAt,
      updatedAt: caseRecord.updatedAt,
      lostReport: caseRecord.lostReport ? {
        id: caseRecord.lostReport.id,
        reportId: caseRecord.lostReport.reportId,
        title: caseRecord.lostReport.title,
        description: caseRecord.lostReport.description,
        category: caseRecord.lostReport.category,
        location: caseRecord.lostReport.location,
        eventDate: caseRecord.lostReport.eventDate,
        reporterName: caseRecord.lostReport.reporterName,
        reporterDept: caseRecord.lostReport.reporterDept,
        reporterUsn: caseRecord.lostReport.reporterUsn,
        reporterContact: caseRecord.lostReport.reporterContact,
        reporterEmailMasked: maskEmail(caseRecord.lostReport.reporterEmail),
        status: caseRecord.lostReport.status,
      } : null,
      foundReport: caseRecord.foundReport ? {
        id: caseRecord.foundReport.id,
        reportId: caseRecord.foundReport.reportId,
        title: caseRecord.foundReport.title,
        description: caseRecord.foundReport.description,
        category: caseRecord.foundReport.category,
        location: caseRecord.foundReport.location,
        eventDate: caseRecord.foundReport.eventDate,
        imagePath: caseRecord.foundReport.imagePath,
        reporterName: caseRecord.foundReport.reporterName,
        reporterContact: caseRecord.foundReport.reporterContact,
        status: caseRecord.foundReport.status,
      } : null,
      auditTrail: (caseRecord.auditLogs || []).map((log) => ({
        id: log.id,
        action: log.action,
        actorRole: log.actorRole,
        details: log.details,
        createdAt: log.createdAt,
      })),
    };

    return Response.json({ data: responseData });
  } catch (err: any) {
    console.error('Error fetching recovery case:', err);
    return Response.json({ error: 'Failed to fetch recovery case' }, { status: 500 });
  }
}
