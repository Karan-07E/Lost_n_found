import { notFound } from 'next/navigation';
import { getRecoveryCase } from '@/server/services/recovery/cases';
import { RecoveryView } from './recovery-view';
import type { Metadata } from 'next';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const caseRecord = await getRecoveryCase(id);
  if (!caseRecord) return { title: 'Recovery Case Not Found' };

  return {
    title: `Recovery Case ${caseRecord.caseNumber} — Campus Lost & Found`,
    description: `Automated item recovery portal for ${caseRecord.caseNumber}`,
  };
}

export default async function RecoveryPage({ params }: Props) {
  const { id } = await params;
  const caseRecord = await getRecoveryCase(id);

  if (!caseRecord) {
    notFound();
  }

  // Sanitize for initial render
  const sanitized = {
    id: caseRecord.id,
    caseNumber: caseRecord.caseNumber,
    status: caseRecord.status,
    meetingLocation: caseRecord.meetingLocation,
    meetingNotes: caseRecord.meetingNotes,
    otpVerifiedAt: caseRecord.otpVerifiedAt?.toISOString() || null,
    receivedConfirmedAt: caseRecord.receivedConfirmedAt?.toISOString() || null,
    ownerAcknowledgment: caseRecord.ownerAcknowledgment,
    ownerAcknowledgmentText: caseRecord.ownerAcknowledgmentText,
    ownerRemarks: caseRecord.ownerRemarks,
    disputeReason: caseRecord.disputeReason,
    disputedBy: caseRecord.disputedBy,
    disputedAt: caseRecord.disputedAt?.toISOString() || null,
    createdAt: caseRecord.createdAt.toISOString(),
    updatedAt: caseRecord.updatedAt.toISOString(),
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
      reporterEmailMasked: caseRecord.lostReport.reporterEmail
        ? caseRecord.lostReport.reporterEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3')
        : 'N/A',
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
      createdAt: log.createdAt.toISOString(),
    })),
  };

  return (
    <div className="section min-h-[calc(100vh-140px)] bg-neutral-50/50 py-10">
      <div className="page-container max-w-4xl">
        <RecoveryView caseId={caseRecord.id} initialData={sanitized} />
      </div>
    </div>
  );
}
