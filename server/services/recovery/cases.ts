import { db } from '../../db';
import { recoveryCases, recoveryAuditLogs, recoveryNotifications, reports, matches } from '../../db/schema';
import { eq, and, or, count, desc, ne } from 'drizzle-orm';
import { generateSecureOtp, hashOtp, verifyOtpHash, validateOtpState, OTP_EXPIRY_MS } from './otp';
import { sendOtpEmail, sendMatchNotificationEmail, sendReceiptCompletedEmail } from '../email';

export async function generateCaseNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const result = await db.select({ value: count() }).from(recoveryCases);
  const total = Number(result[0]?.value ?? 0);
  const seq = String(total + 1).padStart(5, '0');
  return `RC-${year}-${seq}`;
}

export interface CreateCaseParams {
  lostReportId: string;
  foundReportId: string;
  matchId?: string;
  actorRole: 'OWNER' | 'FINDER';
  actorIdentifier: string;
  ipAddress?: string;
}

/**
 * Establish a recovery case once an owner or finder confirms the match.
 * Prevents duplicate recovery cases and verifies eligible reports.
 */
export async function createRecoveryCase(params: CreateCaseParams) {
  // 1. Fetch both reports
  const [lostReport] = await db.select().from(reports).where(eq(reports.id, params.lostReportId)).limit(1);
  const [foundReport] = await db.select().from(reports).where(eq(reports.id, params.foundReportId)).limit(1);

  if (!lostReport || lostReport.reportType !== 'LOST') {
    throw new Error('Valid Lost item report not found.');
  }
  if (!foundReport || foundReport.reportType !== 'FOUND') {
    throw new Error('Valid Found item report not found.');
  }

  if (['RETURNED', 'CLOSED'].includes(lostReport.status)) {
    throw new Error('The lost item report is already marked as returned or closed.');
  }
  if (['RETURNED', 'CLOSED'].includes(foundReport.status)) {
    throw new Error('The found item report is already marked as returned or closed.');
  }

  // 2. Prevent duplicate active recovery cases
  const existingActive = await db
    .select()
    .from(recoveryCases)
    .where(
      and(
        or(
          eq(recoveryCases.lostReportId, params.lostReportId),
          eq(recoveryCases.foundReportId, params.foundReportId)
        ),
        ne(recoveryCases.status, 'CANCELLED')
      )
    )
    .limit(1);

  if (existingActive.length > 0) {
    return existingActive[0];
  }

  // 3. Create recovery case
  const caseNumber = await generateCaseNumber();

  const [newCase] = await db
    .insert(recoveryCases)
    .values({
      caseNumber,
      lostReportId: params.lostReportId,
      foundReportId: params.foundReportId,
      matchId: params.matchId || null,
      status: 'MATCH_CONFIRMED',
      meetingLocation: foundReport.location || 'Campus Main Security Post',
    })
    .returning();

  // 4. Update reports status to MATCHED
  await db
    .update(reports)
    .set({ status: 'MATCHED', updatedAt: new Date() })
    .where(or(eq(reports.id, params.lostReportId), eq(reports.id, params.foundReportId)));

  // 5. Update match status to CONFIRMED if matchId provided
  if (params.matchId) {
    await db
      .update(matches)
      .set({ status: 'CONFIRMED', updatedAt: new Date() })
      .where(eq(matches.id, params.matchId));
  }

  // 6. Record immutable audit log
  await db.insert(recoveryAuditLogs).values({
    recoveryCaseId: newCase.id,
    actorRole: params.actorRole,
    actorIdentifier: params.actorIdentifier,
    action: 'CASE_CREATED',
    details: JSON.stringify({
      lostReportId: lostReport.reportId,
      foundReportId: foundReport.reportId,
      matchId: params.matchId || null,
    }),
    ipAddress: params.ipAddress || null,
  });

  // 7. Dispatch notifications safely
  if (lostReport.reporterEmail) {
    await sendMatchNotificationEmail(
      lostReport.reporterEmail,
      lostReport.reporterName,
      lostReport.title,
      foundReport.title,
      `/recovery/${newCase.id}`
    );
  }

  return newCase;
}

/**
 * Fetch a recovery case with joined details.
 */
export async function getRecoveryCase(caseIdOrNumber: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(caseIdOrNumber);

  const [caseRecord] = await db
    .select()
    .from(recoveryCases)
    .where(isUuid ? eq(recoveryCases.id, caseIdOrNumber) : eq(recoveryCases.caseNumber, caseIdOrNumber))
    .limit(1);

  if (!caseRecord) return null;

  const [lostReport] = await db.select().from(reports).where(eq(reports.id, caseRecord.lostReportId)).limit(1);
  const [foundReport] = await db.select().from(reports).where(eq(reports.id, caseRecord.foundReportId)).limit(1);
  const auditLogs = await db
    .select()
    .from(recoveryAuditLogs)
    .where(eq(recoveryAuditLogs.recoveryCaseId, caseRecord.id))
    .orderBy(desc(recoveryAuditLogs.createdAt));

  return {
    ...caseRecord,
    lostReport: lostReport || null,
    foundReport: foundReport || null,
    auditLogs,
  };
}

/**
 * Authenticated finder initiates handover verification.
 * Generates secure OTP, stores hash only, sends email to owner.
 */
export async function initiateHandoverVerification(params: {
  caseId: string;
  actorRole: 'FINDER';
  actorIdentifier: string;
  ipAddress?: string;
}) {
  const caseRecord = await getRecoveryCase(params.caseId);
  if (!caseRecord) {
    throw new Error('Recovery case not found.');
  }

  if (['RECEIVED_CONFIRMED', 'CANCELLED', 'DISPUTED'].includes(caseRecord.status)) {
    throw new Error(`Cannot initiate handover. Recovery case is already ${caseRecord.status}.`);
  }

  // Validate resend cooldown
  const timingCheck = validateOtpState(
    caseRecord.otpExpiresAt,
    caseRecord.otpAttempts,
    caseRecord.otpLastSentAt,
    true // isResendRequest
  );
  if (!timingCheck.valid) {
    throw new Error(timingCheck.error);
  }

  const lostReport = caseRecord.lostReport;
  if (!lostReport || !lostReport.reporterEmail) {
    throw new Error('Lost item owner does not have a verified email address on file.');
  }

  // Generate secure unpredictable OTP and hash it
  const otpCode = generateSecureOtp();
  const hashed = hashOtp(otpCode);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
  const now = new Date();

  // Atomically update recovery case with hash, expiry, and attempts reset
  await db
    .update(recoveryCases)
    .set({
      otpHash: hashed,
      otpExpiresAt: expiresAt,
      otpAttempts: 0,
      otpLastSentAt: now,
      otpResendCount: (caseRecord.otpResendCount || 0) + 1,
      status: 'OTP_SENT',
      updatedAt: now,
    })
    .where(eq(recoveryCases.id, caseRecord.id));

  // Immutable audit log (never logs plaintext code)
  await db.insert(recoveryAuditLogs).values({
    recoveryCaseId: caseRecord.id,
    actorRole: 'FINDER',
    actorIdentifier: params.actorIdentifier,
    action: 'OTP_REQUESTED',
    details: JSON.stringify({
      recipientEmail: lostReport.reporterEmail,
      expiresAt: expiresAt.toISOString(),
      resendCount: (caseRecord.otpResendCount || 0) + 1,
    }),
    ipAddress: params.ipAddress || null,
  });

  // Dispatch OTP email to the owner
  const emailResult = await sendOtpEmail(
    lostReport.reporterEmail,
    lostReport.reporterName,
    otpCode,
    lostReport.title
  );

  // Log notification entry
  await db.insert(recoveryNotifications).values({
    recoveryCaseId: caseRecord.id,
    recipientEmail: lostReport.reporterEmail,
    recipientRole: 'OWNER',
    notificationType: 'OTP_CODE',
    subject: `Handover Verification Code for: ${lostReport.title}`,
    deliveryStatus: emailResult.success ? (emailResult.simulated ? 'SIMULATED' : 'SENT') : 'FAILED',
    errorMessage: emailResult.error || null,
  });

  return {
    success: true,
    message: `Verification code sent to owner's verified email (${lostReport.reporterEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3')}).`,
    expiresAt,
    simulated: emailResult.simulated,
  };
}

/**
 * Finder submits OTP provided in-person by the owner.
 * Validates hash, expiry, and maximum attempt limits exclusively on backend.
 */
export async function verifyHandoverOtp(params: {
  caseId: string;
  code: string;
  actorRole: 'FINDER';
  actorIdentifier: string;
  ipAddress?: string;
}) {
  const caseRecord = await getRecoveryCase(params.caseId);
  if (!caseRecord) {
    throw new Error('Recovery case not found.');
  }

  if (caseRecord.status !== 'OTP_SENT') {
    if (caseRecord.status === 'OTP_VERIFIED' || caseRecord.status === 'RECEIVED_CONFIRMED') {
      return { success: true, message: 'Handover is already verified.' };
    }
    throw new Error(`Cannot verify OTP. Current case status is ${caseRecord.status}.`);
  }

  // Validate timing and attempt counts
  const stateCheck = validateOtpState(caseRecord.otpExpiresAt, caseRecord.otpAttempts, caseRecord.otpLastSentAt);
  if (!stateCheck.valid) {
    throw new Error(stateCheck.error);
  }

  // Constant-time hash verification
  const isValid = verifyOtpHash(params.code, caseRecord.otpHash || '');

  if (!isValid) {
    const newAttempts = caseRecord.otpAttempts + 1;
    await db
      .update(recoveryCases)
      .set({
        otpAttempts: newAttempts,
        updatedAt: new Date(),
      })
      .where(eq(recoveryCases.id, caseRecord.id));

    // Audit failed attempt
    await db.insert(recoveryAuditLogs).values({
      recoveryCaseId: caseRecord.id,
      actorRole: 'FINDER',
      actorIdentifier: params.actorIdentifier,
      action: 'OTP_ATTEMPT_FAILED',
      details: JSON.stringify({ attempts: newAttempts, maxAttempts: 5 }),
      ipAddress: params.ipAddress || null,
    });

    const remaining = Math.max(0, 5 - newAttempts);
    throw new Error(`Incorrect verification code. ${remaining} attempts remaining.`);
  }

  // Mark OTP Verified
  const now = new Date();
  await db
    .update(recoveryCases)
    .set({
      status: 'OTP_VERIFIED',
      otpVerifiedAt: now,
      updatedAt: now,
    })
    .where(eq(recoveryCases.id, caseRecord.id));

  // Audit verified action
  await db.insert(recoveryAuditLogs).values({
    recoveryCaseId: caseRecord.id,
    actorRole: 'FINDER',
    actorIdentifier: params.actorIdentifier,
    action: 'OTP_VERIFIED',
    details: JSON.stringify({ verifiedAt: now.toISOString() }),
    ipAddress: params.ipAddress || null,
  });

  return {
    success: true,
    message: 'Handover successfully verified! The owner can now inspect the item and confirm receipt.',
  };
}

/**
 * Authenticated owner confirms physical receipt of the item.
 * Atomically transitions reports to RETURNED and closes recovery case.
 */
export async function confirmItemReceived(params: {
  caseId: string;
  actorRole: 'OWNER';
  actorIdentifier: string;
  acknowledgment: boolean;
  acknowledgmentText?: string;
  remarks?: string;
  ipAddress?: string;
}) {
  if (!params.acknowledgment) {
    throw new Error('Explicit acknowledgment of item receipt is required.');
  }

  const caseRecord = await getRecoveryCase(params.caseId);
  if (!caseRecord) {
    throw new Error('Recovery case not found.');
  }

  if (caseRecord.status !== 'OTP_VERIFIED') {
    if (caseRecord.status === 'RECEIVED_CONFIRMED') {
      return { success: true, message: 'Item receipt has already been confirmed.' };
    }
    throw new Error(`Item receipt cannot be confirmed yet. Current state is: ${caseRecord.status}. Please complete OTP verification first.`);
  }

  const now = new Date();
  const ackText = params.acknowledgmentText || 'I explicitly confirm that I have physically received and inspected my lost item in good condition.';

  // Atomically update recovery case and both reports
  await db.transaction(async (tx) => {
    // 1. Update recovery case
    await tx
      .update(recoveryCases)
      .set({
        status: 'RECEIVED_CONFIRMED',
        receivedConfirmedAt: now,
        ownerAcknowledgment: true,
        ownerAcknowledgmentText: ackText,
        ownerAcknowledgmentVersion: 'v1.0',
        ownerRemarks: params.remarks || null,
        updatedAt: now,
      })
      .where(eq(recoveryCases.id, caseRecord.id));

    // 2. Update lost and found reports to RETURNED
    await tx
      .update(reports)
      .set({ status: 'RETURNED', updatedAt: now })
      .where(or(eq(reports.id, caseRecord.lostReportId), eq(reports.id, caseRecord.foundReportId)));

    // 3. Update match record
    if (caseRecord.matchId) {
      await tx
        .update(matches)
        .set({ status: 'CONFIRMED', updatedAt: now })
        .where(eq(matches.id, caseRecord.matchId));
    }

    // 4. Record audit log
    await tx.insert(recoveryAuditLogs).values({
      recoveryCaseId: caseRecord.id,
      actorRole: 'OWNER',
      actorIdentifier: params.actorIdentifier,
      action: 'RECEIPT_CONFIRMED',
      details: JSON.stringify({
        confirmedAt: now.toISOString(),
        acknowledgmentVersion: 'v1.0',
        remarks: params.remarks || null,
      }),
      ipAddress: params.ipAddress || null,
    });
  });

  // Dispatch final completion emails
  if (caseRecord.lostReport?.reporterEmail) {
    await sendReceiptCompletedEmail(
      caseRecord.lostReport.reporterEmail,
      caseRecord.lostReport.reporterName,
      caseRecord.lostReport.title,
      'OWNER'
    );
  }
  if (caseRecord.foundReport?.reporterEmail) {
    await sendReceiptCompletedEmail(
      caseRecord.foundReport.reporterEmail,
      caseRecord.foundReport.reporterName,
      caseRecord.foundReport.title,
      'FINDER'
    );
  }

  return {
    success: true,
    message: 'Item receipt confirmed! The recovery case and reports are now officially closed as RETURNED.',
  };
}

/**
 * Report handover dispute or failed physical exchange.
 */
export async function reportRecoveryDispute(params: {
  caseId: string;
  actorRole: 'OWNER' | 'FINDER';
  actorIdentifier: string;
  reason: string;
  ipAddress?: string;
}) {
  const caseRecord = await getRecoveryCase(params.caseId);
  if (!caseRecord) {
    throw new Error('Recovery case not found.');
  }

  if (caseRecord.status === 'RECEIVED_CONFIRMED') {
    throw new Error('Cannot dispute a recovery that has already been confirmed as received.');
  }

  const now = new Date();

  await db
    .update(recoveryCases)
    .set({
      status: 'DISPUTED',
      disputeReason: params.reason,
      disputedBy: params.actorRole,
      disputedAt: now,
      updatedAt: now,
    })
    .where(eq(recoveryCases.id, caseRecord.id));

  await db.insert(recoveryAuditLogs).values({
    recoveryCaseId: caseRecord.id,
    actorRole: params.actorRole,
    actorIdentifier: params.actorIdentifier,
    action: 'DISPUTED',
    details: JSON.stringify({ reason: params.reason }),
    ipAddress: params.ipAddress || null,
  });

  return {
    success: true,
    message: 'The issue has been flagged as Disputed and routed to campus security for resolution.',
  };
}
