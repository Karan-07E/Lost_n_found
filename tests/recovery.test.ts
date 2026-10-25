import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { db } from '../server/db';
import { reports, matches, recoveryCases, recoveryAuditLogs } from '../server/db/schema';
import { eq, or } from 'drizzle-orm';
import {
  generateSecureOtp,
  hashOtp,
  verifyOtpHash,
  validateOtpState,
  OTP_EXPIRY_MS,
  MAX_ATTEMPTS,
  RESEND_COOLDOWN_MS,
} from '../server/services/recovery/otp';
import {
  createRecoveryCase,
  getRecoveryCase,
  initiateHandoverVerification,
  verifyHandoverOtp,
  confirmItemReceived,
  reportRecoveryDispute,
} from '../server/services/recovery/cases';
import { triggerMatching } from '../server/services/matching/engine';
import { sendEmail, sendOtpEmail } from '../server/services/email';

describe('Automated Item Recovery Workflow Tests', () => {
  let testLostReportId: string;
  let testFoundReportId: string;
  let testCaseId: string;
  const ownerEmail = 'test.owner@vvce.ac.in';
  const ownerPhone = '9876543210';
  const ownerUsn = '4VV23CS001';
  const finderEmail = 'test.finder@vvce.ac.in';
  const finderPhone = '9123456780';

  before(async () => {
    // Setup test lost report
    const [lost] = await db
      .insert(reports)
      .values({
        reportId: `LF-TEST-${Date.now().toString().slice(-5)}`,
        reportType: 'LOST',
        title: 'Sony WH-1000XM4 Noise Canceling Headphones',
        description: 'Black Sony over-ear headphones left in study cube 4 with black carrying case.',
        category: 'Mobile / Electronics',
        location: 'Central Library 2nd Floor',
        eventDate: '2026-10-25',
        reporterName: 'Arjun Gowda',
        reporterUsn: ownerUsn,
        reporterContact: ownerPhone,
        reporterEmail: ownerEmail,
        status: 'SUBMITTED',
        accessToken: 'sec_test_owner_token',
      })
      .returning();
    testLostReportId = lost.id;

    // Setup test found report
    const [found] = await db
      .insert(reports)
      .values({
        reportId: `LF-TEST-${(Date.now() + 1).toString().slice(-5)}`,
        reportType: 'FOUND',
        title: 'Sony Noise Canceling Headphones in Black Case',
        description: 'Found black Sony headphones inside black zipped case in library study area.',
        category: 'Mobile / Electronics',
        location: 'Central Library',
        eventDate: '2026-10-25',
        reporterName: 'Kavya S',
        reporterContact: finderPhone,
        reporterEmail: finderEmail,
        status: 'SUBMITTED',
        accessToken: 'sec_test_finder_token',
      })
      .returning();
    testFoundReportId = found.id;
  });

  after(async () => {
    // Cleanup created test records
    try {
      if (testCaseId) {
        await db.delete(recoveryCases).where(eq(recoveryCases.id, testCaseId));
      }
      if (testLostReportId || testFoundReportId) {
        await db.delete(reports).where(or(eq(reports.id, testLostReportId), eq(reports.id, testFoundReportId)));
      }
    } catch (e) {
      // Ignore cleanup error
    }
  });

  // 1. Matching Engine Test
  it('1. Automated matching engine scores reports without prematurely marking as MATCHED', async () => {
    await triggerMatching(testLostReportId);

    const matchRows = await db
      .select()
      .from(matches)
      .where(eq(matches.lostReportId, testLostReportId));

    assert.ok(matchRows.length > 0, 'Matching engine should have created a match');
    assert.ok(matchRows[0].score >= 40, `Match score should be >= 40, got ${matchRows[0].score}`);
    assert.equal(matchRows[0].status, 'PENDING', 'Match status should remain PENDING until confirmed by owner');

    // Verify report is in UNDER_REVIEW, NOT prematurely marked MATCHED
    const [refreshedLost] = await db.select().from(reports).where(eq(reports.id, testLostReportId));
    assert.equal(refreshedLost.status, 'UNDER_REVIEW', 'Report should transition to UNDER_REVIEW, not final MATCHED');
  });

  // 2. Recovery Case Establishment & Duplicate Prevention
  it('2. Establishing recovery case links reports and prevents duplicate cases', async () => {
    const recoveryCase = await createRecoveryCase({
      lostReportId: testLostReportId,
      foundReportId: testFoundReportId,
      actorRole: 'OWNER',
      actorIdentifier: ownerEmail,
    });

    testCaseId = recoveryCase.id;
    assert.ok(recoveryCase.id, 'Case ID should be generated');
    assert.ok(recoveryCase.caseNumber.startsWith('RC-'), 'Case number should match RC-YYYY-NNNNN');
    assert.equal(recoveryCase.status, 'MATCH_CONFIRMED');

    // Duplicate check: Requesting another case for same reports returns existing case
    const dupCase = await createRecoveryCase({
      lostReportId: testLostReportId,
      foundReportId: testFoundReportId,
      actorRole: 'OWNER',
      actorIdentifier: ownerEmail,
    });

    assert.equal(dupCase.id, recoveryCase.id, 'Duplicate case creation should return existing active case');
  });

  // 3. Cryptographic OTP Generation & Storage (Zero Plaintext)
  it('3. OTP generation is cryptographically secure and plaintext is never stored in DB', async () => {
    const code = generateSecureOtp();
    assert.equal(code.length, 6, 'OTP must be 6 digits');
    assert.match(code, /^\d{6}$/, 'OTP must be strictly numeric');

    const hashed = hashOtp(code);
    assert.notEqual(hashed, code, 'Hash must differ from plaintext');
    assert.ok(verifyOtpHash(code, hashed), 'Constant-time verification must succeed');
    assert.ok(!verifyOtpHash('000000', hashed), 'Incorrect code must fail verification');
  });

  // 4. Handover Initiation & OTP Dispatch
  it('4. Finder initiates handover and dispatches OTP to owner email', async () => {
    const initResult = await initiateHandoverVerification({
      caseId: testCaseId,
      actorRole: 'FINDER',
      actorIdentifier: finderPhone,
    });

    assert.ok(initResult.success);
    assert.ok(initResult.expiresAt);

    const caseData = await getRecoveryCase(testCaseId);
    assert.equal(caseData?.status, 'OTP_SENT');
    assert.ok(caseData?.otpHash, 'otpHash must be set');
    assert.notEqual(caseData?.otpHash.length, 6, 'otpHash must be a secure hash, never 6 plaintext digits');
    assert.equal(caseData?.otpAttempts, 0);

    // Verify audit log
    const auditLogs = caseData?.auditLogs || [];
    const otpLog = auditLogs.find((l) => l.action === 'OTP_REQUESTED');
    assert.ok(otpLog, 'OTP_REQUESTED must be recorded in audit log');
    assert.ok(!otpLog?.details?.includes('"code"'), 'Plaintext OTP must NEVER appear in audit log details');
  });

  // 5. OTP Expiry, Resend Cooldown, and Attempt Limits
  it('5. Enforces resend cooldown and attempt limit guards', async () => {
    // Resend cooldown should reject immediate duplicate requests (< 60s)
    await assert.rejects(
      async () => {
        await initiateHandoverVerification({
          caseId: testCaseId,
          actorRole: 'FINDER',
          actorIdentifier: finderPhone,
        });
      },
      /Please wait \d+s before requesting a new code/,
      'Resend cooldown must be enforced within 60 seconds'
    );

    // Verify incorrect OTP attempts
    await assert.rejects(
      async () => {
        await verifyHandoverOtp({
          caseId: testCaseId,
          code: '999999',
          actorRole: 'FINDER',
          actorIdentifier: finderPhone,
        });
      },
      /Incorrect verification code\. 4 attempts remaining\./
    );

    const caseAfterFailed = await getRecoveryCase(testCaseId);
    assert.equal(caseAfterFailed?.otpAttempts, 1, 'Attempts counter must increment on failure');
  });

  // 6. Valid OTP Verification
  it('6. Valid OTP authorizes handover without prematurely closing reports', async () => {
    // Generate known test OTP and inject hash
    const testCode = '482910';
    const testHash = hashOtp(testCode);
    await db
      .update(recoveryCases)
      .set({
        otpHash: testHash,
        otpExpiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
      })
      .where(eq(recoveryCases.id, testCaseId));

    const verifyResult = await verifyHandoverOtp({
      caseId: testCaseId,
      code: testCode,
      actorRole: 'FINDER',
      actorIdentifier: finderPhone,
    });

    assert.ok(verifyResult.success);

    const caseData = await getRecoveryCase(testCaseId);
    assert.equal(caseData?.status, 'OTP_VERIFIED');
    assert.ok(caseData?.otpVerifiedAt, 'otpVerifiedAt must be timestamped');

    // Reports must NOT be RETURNED yet (physical possession is separate)
    assert.equal(caseData?.lostReport?.status, 'MATCHED', 'Lost report must not be closed on OTP alone');
    assert.equal(caseData?.foundReport?.status, 'MATCHED', 'Found report must not be closed on OTP alone');
  });

  // 7. Owner Receipt Confirmation & Atomic Closure
  it('7. Owner explicitly confirms physical possession, atomically closing recovery and reports', async () => {
    // Acknowledgment false should be rejected
    await assert.rejects(
      async () => {
        await confirmItemReceived({
          caseId: testCaseId,
          actorRole: 'OWNER',
          actorIdentifier: ownerPhone,
          acknowledgment: false,
        });
      },
      /Explicit acknowledgment of item receipt is required/
    );

    // Valid confirmation
    const confirmResult = await confirmItemReceived({
      caseId: testCaseId,
      actorRole: 'OWNER',
      actorIdentifier: ownerPhone,
      acknowledgment: true,
      acknowledgmentText: 'I explicitly confirm that I have physically received and inspected my lost headphones.',
      remarks: 'Received in perfect working order. Thank you!',
    });

    assert.ok(confirmResult.success);

    // Verify recovery case state
    const caseData = await getRecoveryCase(testCaseId);
    assert.equal(caseData?.status, 'RECEIVED_CONFIRMED');
    assert.equal(caseData?.ownerAcknowledgment, true);
    assert.ok(caseData?.receivedConfirmedAt);

    // Verify both reports are atomically transitioned to RETURNED
    const [lostReport] = await db.select().from(reports).where(eq(reports.id, testLostReportId));
    const [foundReport] = await db.select().from(reports).where(eq(reports.id, testFoundReportId));
    assert.equal(lostReport.status, 'RETURNED', 'Lost report must be RETURNED');
    assert.equal(foundReport.status, 'RETURNED', 'Found report must be RETURNED');

    // Verify immutable audit log
    const receiptLog = caseData?.auditLogs?.find((l) => l.action === 'RECEIPT_CONFIRMED');
    assert.ok(receiptLog, 'RECEIPT_CONFIRMED must be recorded in audit log');
  });

  // 8. Dispute Handling
  it('8. Reporting dispute correctly updates state and records audit log', async () => {
    // Create dedicated open reports for dispute test
    const [dLost] = await db.insert(reports).values({
      reportId: `LF-DISP-${Date.now().toString().slice(-5)}`,
      reportType: 'LOST',
      title: 'Dispute Test Item',
      description: 'Test item for dispute verification',
      category: 'Cards & IDs',
      location: 'Canteen',
      eventDate: '2026-10-25',
      reporterName: 'Dispute Owner',
      reporterContact: ownerPhone,
      reporterEmail: ownerEmail,
      status: 'SUBMITTED',
    }).returning();

    const [dFound] = await db.insert(reports).values({
      reportId: `LF-DISP-${(Date.now() + 1).toString().slice(-5)}`,
      reportType: 'FOUND',
      title: 'Dispute Found Item',
      description: 'Test item for dispute verification',
      category: 'Cards & IDs',
      location: 'Canteen',
      eventDate: '2026-10-25',
      reporterName: 'Dispute Finder',
      reporterContact: finderPhone,
      reporterEmail: finderEmail,
      status: 'SUBMITTED',
    }).returning();

    const disputeCase = await createRecoveryCase({
      lostReportId: dLost.id,
      foundReportId: dFound.id,
      actorRole: 'FINDER',
      actorIdentifier: finderPhone,
    });

    const disputeResult = await reportRecoveryDispute({
      caseId: disputeCase.id,
      actorRole: 'FINDER',
      actorIdentifier: finderPhone,
      reason: 'Claimant appeared without matching student identification card.',
    });

    assert.ok(disputeResult.success);
    const caseData = await getRecoveryCase(disputeCase.id);
    assert.equal(caseData?.status, 'DISPUTED');
    assert.equal(caseData?.disputedBy, 'FINDER');

    // Cleanup dispute case and reports
    await db.delete(recoveryCases).where(eq(recoveryCases.id, disputeCase.id));
    await db.delete(reports).where(or(eq(reports.id, dLost.id), eq(reports.id, dFound.id)));
  });

  // 9. Email Service Safe Fallback
  it('9. Email service handles delivery safely without unhandled crashes', async () => {
    const res = await sendOtpEmail(ownerEmail, 'Arjun Gowda', '123456', 'Sony Headphones');
    assert.ok(res.success, 'Email sending should succeed or simulate without crash');
    assert.ok(res.messageId, 'Email messageId must be returned');
  });
});
