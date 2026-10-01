import crypto from 'crypto';
import { getDb } from '../database.js';
import config from '../config.js';

/**
 * Validate password strength against security policy:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special symbol
 */
export function validatePasswordStrength(password) {
  const pwd = String(password || '');
  const issues = [];

  if (pwd.length < 8) {
    issues.push('At least 8 characters long');
  }
  if (!/[A-Z]/.test(pwd)) {
    issues.push('At least one uppercase letter (A-Z)');
  }
  if (!/[a-z]/.test(pwd)) {
    issues.push('At least one lowercase letter (a-z)');
  }
  if (!/[0-9]/.test(pwd)) {
    issues.push('At least one number (0-9)');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
    issues.push('At least one special character (!@#$%^&*...)');
  }

  const score = 5 - issues.length; // 0 to 5

  return {
    isValid: issues.length === 0,
    score, // 0 = very weak, 1-2 = weak, 3-4 = moderate/good, 5 = strong
    issues,
    message: issues.length === 0 ? 'Strong password' : `Password must contain: ${issues.join(', ')}`,
  };
}

/**
 * Generate a cryptographically secure 6-digit numeric OTP.
 */
export function generateOTPCode() {
  return String(crypto.randomInt(100000, 1000000));
}

/**
 * Create and persist an OTP in the database.
 * Invalidates any prior active OTPs for the same email and purpose.
 */
export function createAndStoreOTP(email, purpose) {
  const db = getDb();
  const cleanEmail = String(email).trim().toLowerCase();
  const code = generateOTPCode();

  // Invalidate old OTPs for this email and purpose
  db.run('DELETE FROM otps WHERE LOWER(email) = ? AND purpose = ?', cleanEmail, purpose);

  // Expiry date (default 10 minutes from now)
  const expiryDate = new Date(Date.now() + config.security.otpExpiresMinutes * 60 * 1000);
  const expiresAtStr = expiryDate.toISOString();

  db.run(
    'INSERT INTO otps (email, code, purpose, expires_at, attempts) VALUES (?, ?, ?, ?, 0)',
    cleanEmail, code, purpose, expiresAtStr
  );

  return { code, expiresAt: expiryDate };
}

/**
 * Verify an OTP entered by the user.
 * Prevents brute-forcing the code by capping attempts at 5.
 */
export function verifyStoredOTP(email, purpose, inputCode) {
  const db = getDb();
  const cleanEmail = String(email).trim().toLowerCase();
  const cleanCode = String(inputCode || '').trim();

  const record = db.get(
    'SELECT * FROM otps WHERE LOWER(email) = ? AND purpose = ? ORDER BY id DESC LIMIT 1',
    cleanEmail, purpose
  );

  if (!record) {
    return { valid: false, error: 'No verification code found. Please request a new code.' };
  }

  const now = new Date();
  const expiresAt = new Date(record.expires_at);

  if (now > expiresAt) {
    db.run('DELETE FROM otps WHERE id = ?', record.id);
    return { valid: false, error: 'Verification code has expired. Please request a new one.' };
  }

  if (record.attempts >= config.security.otpMaxVerifyAttempts) {
    db.run('DELETE FROM otps WHERE id = ?', record.id);
    return { valid: false, error: 'Too many incorrect attempts. Please request a fresh verification code.' };
  }

  if (record.code !== cleanCode) {
    const newAttempts = record.attempts + 1;
    db.run('UPDATE otps SET attempts = ? WHERE id = ?', newAttempts, record.id);
    const remaining = config.security.otpMaxVerifyAttempts - newAttempts;
    return {
      valid: false,
      error: `Invalid verification code. ${remaining > 0 ? `${remaining} attempts remaining.` : 'Code revoked.'}`,
    };
  }

  // Code is valid! Consume and delete so it cannot be reused.
  db.run('DELETE FROM otps WHERE id = ?', record.id);
  return { valid: true };
}

/**
 * Check if an email or IP address is currently in cooldown/lockout.
 */
export function checkLoginStatus(email, ip) {
  const db = getDb();
  const cleanEmail = String(email || '').trim().toLowerCase();

  const record = db.get(
    `SELECT * FROM login_attempts 
     WHERE (LOWER(email) = ? OR ip_address = ?) 
     ORDER BY locked_until DESC LIMIT 1`,
    cleanEmail, ip
  );

  if (!record || !record.locked_until) {
    return { isLocked: false, attemptCount: record?.attempt_count || 0 };
  }

  const now = new Date();
  const lockedUntil = new Date(record.locked_until);

  if (now < lockedUntil) {
    const remainingSeconds = Math.ceil((lockedUntil.getTime() - now.getTime()) / 1000);
    return {
      isLocked: true,
      remainingSeconds,
      lockedUntil: lockedUntil.toISOString(),
      attemptCount: record.attempt_count,
    };
  }

  // Lock expired -> clean up
  db.run('DELETE FROM login_attempts WHERE id = ?', record.id);
  return { isLocked: false, attemptCount: 0 };
}

/**
 * Record a failed login attempt.
 * If attempt count reaches threshold (5), initiates cooldown lockout (15 minutes).
 */
export function recordFailedLoginAttempt(email, ip, userAgent = '') {
  const db = getDb();
  const cleanEmail = String(email || '').trim().toLowerCase();

  const existing = db.get(
    `SELECT * FROM login_attempts WHERE LOWER(email) = ? LIMIT 1`,
    cleanEmail
  );

  const now = new Date();
  let attemptCount = 1;
  let lockedUntil = null;
  let isLocked = false;
  let remainingSeconds = 0;

  if (existing) {
    attemptCount = existing.attempt_count + 1;
    if (attemptCount >= config.security.maxLoginAttempts) {
      isLocked = true;
      const lockExpiry = new Date(now.getTime() + config.security.lockoutDurationMinutes * 60 * 1000);
      lockedUntil = lockExpiry.toISOString();
      remainingSeconds = config.security.lockoutDurationMinutes * 60;

      db.run(
        `UPDATE login_attempts 
         SET attempt_count = ?, locked_until = ?, ip_address = ?, last_attempt = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        attemptCount, lockedUntil, ip, existing.id
      );

      logSecurityEvent({
        userId: null,
        email: cleanEmail,
        action: 'ACCOUNT_LOCKED',
        ip,
        userAgent,
        details: `Account temporarily locked for ${config.security.lockoutDurationMinutes}m after ${attemptCount} failed login attempts`,
      });
    } else {
      db.run(
        `UPDATE login_attempts 
         SET attempt_count = ?, ip_address = ?, last_attempt = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        attemptCount, ip, existing.id
      );
    }
  } else {
    db.run(
      `INSERT INTO login_attempts (email, ip_address, attempt_count, locked_until) 
       VALUES (?, ?, 1, NULL)`,
      cleanEmail, ip
    );
  }

  if (!isLocked) {
    logSecurityEvent({
      userId: null,
      email: cleanEmail,
      action: 'LOGIN_FAILED',
      ip,
      userAgent,
      details: `Failed attempt ${attemptCount}/${config.security.maxLoginAttempts}`,
    });
  }

  const remainingAttempts = Math.max(0, config.security.maxLoginAttempts - attemptCount);

  return {
    isLocked,
    attemptCount,
    remainingAttempts,
    remainingSeconds,
    lockedUntil,
  };
}

/**
 * Clear failed login attempts after successful authentication and record success.
 */
export function recordSuccessfulLogin(userId, email, ip, userAgent = '') {
  const db = getDb();
  const cleanEmail = String(email || '').trim().toLowerCase();

  db.run('DELETE FROM login_attempts WHERE LOWER(email) = ? OR ip_address = ?', cleanEmail, ip);

  logSecurityEvent({
    userId,
    email: cleanEmail,
    action: 'LOGIN_SUCCESS',
    ip,
    userAgent,
    details: 'User authenticated successfully',
  });
}

/**
 * Log a security event to the audit trail.
 */
export function logSecurityEvent({ userId = null, email = '', action, ip = '', userAgent = '', details = '' }) {
  try {
    const db = getDb();
    db.run(
      `INSERT INTO security_logs (user_id, email, action, ip_address, user_agent, details) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      userId, email, action, ip, userAgent, details
    );
  } catch (err) {
    console.error('Failed to log security event:', err.message);
  }
}

/**
 * Retrieve recent security logs for an authenticated user.
 */
export function getUserSecurityLogs(userId, limit = 20) {
  try {
    const db = getDb();
    return db.all(
      `SELECT id, action, ip_address, user_agent, details, created_at 
       FROM security_logs 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ?`,
      userId, limit
    );
  } catch (err) {
    console.error('Failed to get security logs:', err.message);
    return [];
  }
}
