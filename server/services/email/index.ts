import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  simulated?: boolean;
}

/**
 * Configure email transporter if SMTP credentials are provided in environment.
 * Supported variables:
 * - SMTP_HOST
 * - SMTP_PORT
 * - SMTP_USER
 * - SMTP_PASS
 * - SMTP_FROM (default: 'Campus Lost & Found <lostandfound@vtucollege.edu.in>')
 */
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  return null;
}

/**
 * Send an email using SMTP or simulated dev environment.
 */
export async function sendEmail(options: EmailOptions): Promise<SendEmailResult> {
  const from = process.env.SMTP_FROM || 'Campus Lost & Found <lostandfound@vtucollege.edu.in>';
  const transporter = getTransporter();

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html || options.text,
      });

      return {
        success: true,
        messageId: info.messageId,
        simulated: false,
      };
    } catch (err: any) {
      console.error('[EMAIL ERROR] Failed to send email via SMTP:', err);
      return {
        success: false,
        error: err.message || 'SMTP delivery failed',
        simulated: false,
      };
    }
  }

  // Simulated delivery for local development & automated test suites
  console.log(`\n================== [EMAIL SIMULATION] ==================`);
  console.log(`To: ${options.to}`);
  console.log(`From: ${from}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Body: \n${options.text}`);
  console.log(`========================================================\n`);

  return {
    success: true,
    messageId: `simulated-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    simulated: true,
  };
}

/**
 * Send OTP verification email to the lost item owner.
 */
export async function sendOtpEmail(ownerEmail: string, ownerName: string, otpCode: string, itemTitle: string): Promise<SendEmailResult> {
  const subject = `[ACTION REQUIRED] Handover Verification Code for: ${itemTitle}`;
  const text = `Hello ${ownerName},

Your found item "${itemTitle}" is ready for physical handover on campus.

Your single-use Handover Verification Code (OTP) is:
${otpCode}

IMPORTANT SECURITY INSTRUCTIONS:
- This code expires in 5 minutes.
- ONLY disclose this code to the finder in-person at the campus handover location when you are face-to-face and can see your item.
- Never share this code over phone, chat, or social media.
- After the finder verifies this code, you MUST inspect your item and click "Confirm Item Received" on your recovery page.

If you are not currently meeting the finder to collect your item, report this immediately.

— Campus Lost & Found Team
Vidyavardhaka College of Engineering`;

  const html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
  <div style="border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px;">
    <h2 style="color: #0f172a; margin: 0; font-size: 20px;">Campus Lost &amp; Found — Handover Verification</h2>
    <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Vidyavardhaka College of Engineering</p>
  </div>

  <p style="font-size: 15px; color: #334155;">Hello <strong>${ownerName}</strong>,</p>
  <p style="font-size: 14px; color: #334155; line-height: 1.5;">
    The finder of your item <strong>"${itemTitle}"</strong> is ready for physical handover at the campus location.
  </p>

  <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;">
    <div style="font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Single-Use Handover Code (OTP)</div>
    <div style="font-size: 36px; font-weight: 800; color: #1e40af; letter-spacing: 6px; margin: 10px 0; font-family: monospace;">${otpCode}</div>
    <div style="font-size: 12px; color: #ef4444; font-weight: 500;">Valid for 5 minutes only</div>
  </div>

  <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; margin-bottom: 20px; border-radius: 4px;">
    <strong style="color: #92400e; font-size: 13px; display: block; margin-bottom: 4px;">Security Notice:</strong>
    <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #78350f; line-height: 1.4;">
      <li>Only tell this code to the finder in-person when you are face-to-face and have inspected your item.</li>
      <li>Never share this code via WhatsApp, call, or email.</li>
      <li>Once the finder enters the code, you will need to click <strong>"Confirm Item Received"</strong> to complete the return.</li>
    </ul>
  </div>

  <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px;">
    If you did not request this handover, please contact Campus Security / Admin immediately.
  </p>
</div>
`;

  return sendEmail({ to: ownerEmail, subject, text, html });
}

/**
 * Send match notification email to owner.
 */
export async function sendMatchNotificationEmail(ownerEmail: string, ownerName: string, lostTitle: string, foundTitle: string, recoveryUrl: string): Promise<SendEmailResult> {
  const subject = `[Potential Match Found] Your lost item: ${lostTitle}`;
  const text = `Hello ${ownerName},

A found item reported on campus might match your lost item "${lostTitle}".

Found Item: "${foundTitle}"

Review and confirm the match on your recovery portal:
${recoveryUrl}

— Campus Lost & Found Team`;

  return sendEmail({ to: ownerEmail, subject, text });
}

/**
 * Send receipt confirmation email to both participants.
 */
export async function sendReceiptCompletedEmail(recipientEmail: string, recipientName: string, itemTitle: string, role: 'OWNER' | 'FINDER'): Promise<SendEmailResult> {
  const subject = `[Recovery Completed] "${itemTitle}" successfully returned`;
  const text = `Hello ${recipientName},

The recovery process for "${itemTitle}" has been officially completed and verified!
Thank you for using the VVCE Campus Lost & Found recovery platform.

— Campus Lost & Found Team`;

  return sendEmail({ to: recipientEmail, subject, text });
}
