import crypto from 'crypto';

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds

export interface OtpGenerationResult {
  code: string;
  hash: string;
  expiresAt: Date;
}

/**
 * Generate a cryptographically secure, unpredictable 6-digit numeric OTP.
 */
export function generateSecureOtp(): string {
  // crypto.randomInt is cryptographically secure
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Generate a SHA-256 hash of the OTP combined with a secret salt.
 * Ensures the plaintext OTP is never persisted to the database.
 */
export function hashOtp(code: string, salt: string = process.env.JWT_SECRET || 'recovery-salt-vtu'): string {
  return crypto.createHash('sha256').update(`${code}:${salt}`).digest('hex');
}

/**
 * Verify a submitted OTP code against the stored hash.
 */
export function verifyOtpHash(code: string, storedHash: string, salt: string = process.env.JWT_SECRET || 'recovery-salt-vtu'): boolean {
  if (!code || !storedHash) return false;
  const computedHash = hashOtp(code.trim(), salt);
  // Constant-time comparison to prevent timing attacks
  const bufA = Buffer.from(computedHash);
  const bufB = Buffer.from(storedHash);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Helper to check OTP timing and attempt limits.
 */
export function validateOtpState(
  expiresAt: Date | null,
  attempts: number,
  lastSentAt: Date | null,
  isResendRequest: boolean = false
): { valid: boolean; error?: string } {
  const now = Date.now();

  if (isResendRequest) {
    if (lastSentAt && now - new Date(lastSentAt).getTime() < RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - (now - new Date(lastSentAt).getTime())) / 1000);
      return { valid: false, error: `Please wait ${waitSeconds}s before requesting a new code.` };
    }
    return { valid: true };
  }

  if (!expiresAt) {
    return { valid: false, error: 'No active OTP found. Please request a new verification code.' };
  }

  if (now > new Date(expiresAt).getTime()) {
    return { valid: false, error: 'Verification code has expired (5-minute limit exceeded). Please request a new code.' };
  }

  if (attempts >= MAX_ATTEMPTS) {
    return { valid: false, error: 'Maximum verification attempts (5) exceeded. Handover locked for security.' };
  }

  return { valid: true };
}

export { OTP_EXPIRY_MS, MAX_ATTEMPTS, RESEND_COOLDOWN_MS };
