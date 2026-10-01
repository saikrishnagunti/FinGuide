import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../database.js';
import { generateToken, authenticate } from '../middleware/auth.js';
import { authLimiter, otpVerifyLimiter } from '../middleware/rate-limiter.js';
import {
  sendRegistrationOTP,
  sendPasswordResetOTP,
  sendPasswordChangeOTP,
} from '../services/email.js';
import {
  validatePasswordStrength,
  createAndStoreOTP,
  verifyStoredOTP,
  checkLoginStatus,
  recordFailedLoginAttempt,
  recordSuccessfulLogin,
  logSecurityEvent,
  getUserSecurityLogs,
} from '../services/security.js';

const router = Router();

// Helper to extract client IP and user agent
function getClientMeta(req) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.socket?.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown';
  return { ip, userAgent };
}

// ──────────────────────────────────────────
// Registration with Email OTP
// ──────────────────────────────────────────

/**
 * POST /api/auth/register/request-otp
 * Step 1: Validate email & password policy, generate and dispatch email OTP.
 */
router.post('/register/request-otp', authLimiter, async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    // Check existing account
    const db = getDb();
    const existing = db.get('SELECT id FROM users WHERE LOWER(email) = ?', cleanEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // Validate password policy
    const pwdValidation = validatePasswordStrength(password);
    if (!pwdValidation.isValid) {
      return res.status(400).json({
        error: pwdValidation.message,
        issues: pwdValidation.issues,
      });
    }

    // Generate & store OTP
    const { code } = createAndStoreOTP(cleanEmail, 'registration');

    // Send email
    const emailResult = await sendRegistrationOTP(cleanEmail, cleanName, code);

    const { ip, userAgent } = getClientMeta(req);
    logSecurityEvent({
      userId: null,
      email: cleanEmail,
      action: 'OTP_SENT_REGISTRATION',
      ip,
      userAgent,
      details: 'Registration verification code requested',
    });

    res.json({
      message: `A 6-digit verification code has been sent to ${cleanEmail}.`,
      email: cleanEmail,
      devOtp: emailResult.devOtp, // Available in non-production for frictionless testing
    });
  } catch (err) {
    console.error('Register request-otp error:', err);
    res.status(500).json({ error: 'Failed to send registration verification code' });
  }
});

/**
 * POST /api/auth/register/verify
 * Step 2: Verify OTP, create account, and issue JWT.
 */
router.post('/register/verify', otpVerifyLimiter, async (req, res) => {
  try {
    const { email, name, password, otp } = req.body;

    if (!email || !name || !password || !otp) {
      return res.status(400).json({ error: 'Email, name, password, and verification code are required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();

    // Verify OTP
    const otpResult = verifyStoredOTP(cleanEmail, 'registration', otp);
    if (!otpResult.valid) {
      return res.status(400).json({ error: otpResult.error });
    }

    // Verify password policy
    const pwdValidation = validatePasswordStrength(password);
    if (!pwdValidation.isValid) {
      return res.status(400).json({ error: pwdValidation.message, issues: pwdValidation.issues });
    }

    const db = getDb();
    const existing = db.get('SELECT id FROM users WHERE LOWER(email) = ?', cleanEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(String(password).trim(), 12);
    const result = db.run(
      'INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)',
      cleanEmail, cleanName, passwordHash
    );

    const user = { id: result.lastInsertRowid, email: cleanEmail, name: cleanName };
    const token = generateToken(user);

    const { ip, userAgent } = getClientMeta(req);
    recordSuccessfulLogin(user.id, cleanEmail, ip, userAgent);
    logSecurityEvent({
      userId: user.id,
      email: cleanEmail,
      action: 'ACCOUNT_CREATED',
      ip,
      userAgent,
      details: 'Account successfully registered and email verified',
    });

    res.status(201).json({
      message: 'Account verified and created successfully',
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  } catch (err) {
    console.error('Register verify error:', err);
    res.status(500).json({ error: 'Failed to verify account creation' });
  }
});

/**
 * Legacy POST /api/auth/register fallback (supports direct registration with password strength check)
 */
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Email, name, and password are required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();

    const pwdValidation = validatePasswordStrength(password);
    if (!pwdValidation.isValid) {
      return res.status(400).json({ error: pwdValidation.message, issues: pwdValidation.issues });
    }

    const db = getDb();
    const existing = db.get('SELECT id FROM users WHERE LOWER(email) = ?', cleanEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(String(password).trim(), 12);
    const result = db.run(
      'INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)',
      cleanEmail, cleanName, passwordHash
    );

    const user = { id: result.lastInsertRowid, email: cleanEmail, name: cleanName };
    const token = generateToken(user);

    const { ip, userAgent } = getClientMeta(req);
    logSecurityEvent({
      userId: user.id,
      email: cleanEmail,
      action: 'ACCOUNT_CREATED_DIRECT',
      ip,
      userAgent,
      details: 'Account created via direct endpoint',
    });

    res.status(201).json({
      message: 'Account created successfully',
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// ──────────────────────────────────────────
// Login with Cooldown Period & Retry Limits
// ──────────────────────────────────────────

/**
 * GET /api/auth/login-status
 * Check if the user's email or IP address is currently locked out.
 */
router.get('/login-status', (req, res) => {
  const email = req.query.email ? String(req.query.email).trim().toLowerCase() : '';
  const { ip } = getClientMeta(req);
  const status = checkLoginStatus(email, ip);
  res.json(status);
});

/**
 * POST /api/auth/login
 * Handles authentication with failed attempt tracking & lockout cooldowns.
 */
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();
    const { ip, userAgent } = getClientMeta(req);

    // 1. Check if account/IP is locked out
    const lockStatus = checkLoginStatus(cleanEmail, ip);
    if (lockStatus.isLocked) {
      const minutes = Math.ceil(lockStatus.remainingSeconds / 60);
      return res.status(429).json({
        error: `Account is temporarily locked due to multiple failed login attempts. Please wait ${minutes} minute${minutes > 1 ? 's' : ''} (${lockStatus.remainingSeconds}s) before trying again.`,
        isLocked: true,
        remainingSeconds: lockStatus.remainingSeconds,
        lockedUntil: lockStatus.lockedUntil,
      });
    }

    // 2. Query user
    const db = getDb();
    const user = db.get('SELECT * FROM users WHERE LOWER(TRIM(email)) = ?', cleanEmail);

    if (!user) {
      const attemptInfo = recordFailedLoginAttempt(cleanEmail, ip, userAgent);
      if (attemptInfo.isLocked) {
        return res.status(429).json({
          error: `Too many failed login attempts. Account temporarily locked for 15 minutes.`,
          isLocked: true,
          remainingSeconds: attemptInfo.remainingSeconds,
          lockedUntil: attemptInfo.lockedUntil,
        });
      }
      return res.status(401).json({
        error: `Invalid email or password. ${attemptInfo.remainingAttempts} attempt${attemptInfo.remainingAttempts === 1 ? '' : 's'} remaining before temporary lockout.`,
        remainingAttempts: attemptInfo.remainingAttempts,
        isLocked: false,
      });
    }

    // 3. Verify password
    const isValid = await bcrypt.compare(cleanPassword, user.password_hash);
    if (!isValid) {
      const attemptInfo = recordFailedLoginAttempt(cleanEmail, ip, userAgent);
      if (attemptInfo.isLocked) {
        return res.status(429).json({
          error: `Too many failed login attempts. Account temporarily locked for 15 minutes.`,
          isLocked: true,
          remainingSeconds: attemptInfo.remainingSeconds,
          lockedUntil: attemptInfo.lockedUntil,
        });
      }
      return res.status(401).json({
        error: `Invalid email or password. ${attemptInfo.remainingAttempts} attempt${attemptInfo.remainingAttempts === 1 ? '' : 's'} remaining before temporary lockout.`,
        remainingAttempts: attemptInfo.remainingAttempts,
        isLocked: false,
      });
    }

    // 4. Successful login: reset failed attempts & audit log
    recordSuccessfulLogin(user.id, cleanEmail, ip, userAgent);
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ──────────────────────────────────────────
// Password Reset with Email OTP
// ──────────────────────────────────────────

/**
 * POST /api/auth/password-reset/request-otp
 * Step 1: Send OTP to email for forgotten password.
 */
router.post('/password-reset/request-otp', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const db = getDb();
    const user = db.get('SELECT id FROM users WHERE LOWER(email) = ?', cleanEmail);

    if (!user) {
      return res.status(404).json({ error: `No FinGuide account found with email "${email}"` });
    }

    const { code } = createAndStoreOTP(cleanEmail, 'reset_password');
    const emailResult = await sendPasswordResetOTP(cleanEmail, code);

    const { ip, userAgent } = getClientMeta(req);
    logSecurityEvent({
      userId: user.id,
      email: cleanEmail,
      action: 'OTP_SENT_PASSWORD_RESET',
      ip,
      userAgent,
      details: 'Password reset code requested',
    });

    res.json({
      message: `Password reset code sent to ${cleanEmail}. Check your inbox.`,
      email: cleanEmail,
      devOtp: emailResult.devOtp,
    });
  } catch (err) {
    console.error('Password reset request-otp error:', err);
    res.status(500).json({ error: 'Failed to send password reset code' });
  }
});

/**
 * POST /api/auth/password-reset/verify
 * Step 2: Verify OTP and set new password.
 */
router.post('/password-reset/verify', otpVerifyLimiter, async (req, res) => {
  try {
    const { email, otp, new_password } = req.body;

    if (!email || !otp || !new_password) {
      return res.status(400).json({ error: 'Email, verification code, and new password are required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Verify OTP
    const otpResult = verifyStoredOTP(cleanEmail, 'reset_password', otp);
    if (!otpResult.valid) {
      return res.status(400).json({ error: otpResult.error });
    }

    // Validate password policy
    const pwdValidation = validatePasswordStrength(new_password);
    if (!pwdValidation.isValid) {
      return res.status(400).json({ error: pwdValidation.message, issues: pwdValidation.issues });
    }

    const db = getDb();
    const user = db.get('SELECT id FROM users WHERE LOWER(email) = ?', cleanEmail);
    if (!user) {
      return res.status(404).json({ error: 'User account not found' });
    }

    const passwordHash = await bcrypt.hash(String(new_password).trim(), 12);
    db.run(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      passwordHash, user.id
    );

    const { ip, userAgent } = getClientMeta(req);
    logSecurityEvent({
      userId: user.id,
      email: cleanEmail,
      action: 'PASSWORD_RESET_COMPLETED',
      ip,
      userAgent,
      details: 'Password was successfully reset via email OTP',
    });

    res.json({ message: 'Password reset successfully! You can now sign in with your new password.' });
  } catch (err) {
    console.error('Password reset verify error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

/**
 * Legacy reset password fallback
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, new_password } = req.body;
    if (!email || !new_password) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const db = getDb();
    const user = db.get('SELECT * FROM users WHERE LOWER(TRIM(email)) = ?', cleanEmail);

    if (!user) {
      return res.status(404).json({ error: `No account found with email "${email}"` });
    }

    const pwdValidation = validatePasswordStrength(new_password);
    if (!pwdValidation.isValid) {
      return res.status(400).json({ error: pwdValidation.message, issues: pwdValidation.issues });
    }

    const passwordHash = await bcrypt.hash(String(new_password).trim(), 12);
    db.run('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', passwordHash, user.id);

    res.json({ message: 'Password updated successfully. You can now sign in with your new password.' });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// ──────────────────────────────────────────
// Password Change with Email OTP (Settings)
// ──────────────────────────────────────────

/**
 * POST /api/auth/password-change/request-otp
 * Step 1: Verify current password, then send OTP to user's registered email.
 */
router.post('/password-change/request-otp', authenticate, async (req, res) => {
  try {
    const { current_password } = req.body;
    if (!current_password) {
      return res.status(400).json({ error: 'Current password is required to request authorization' });
    }

    const db = getDb();
    const user = db.get('SELECT * FROM users WHERE id = ?', req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(String(current_password).trim(), user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    const { code } = createAndStoreOTP(user.email, 'change_password');
    const emailResult = await sendPasswordChangeOTP(user.email, code);

    const { ip, userAgent } = getClientMeta(req);
    logSecurityEvent({
      userId: user.id,
      email: user.email,
      action: 'OTP_SENT_PASSWORD_CHANGE',
      ip,
      userAgent,
      details: 'Password change authorization code requested from Settings',
    });

    res.json({
      message: `Authorization code sent to your email address (${user.email}).`,
      email: user.email,
      devOtp: emailResult.devOtp,
    });
  } catch (err) {
    console.error('Password change request-otp error:', err);
    res.status(500).json({ error: 'Failed to send password change code' });
  }
});

/**
 * POST /api/auth/password-change/verify
 * Step 2: Verify OTP + current password + new password policy, then update password.
 */
router.post('/password-change/verify', authenticate, otpVerifyLimiter, async (req, res) => {
  try {
    const { current_password, new_password, otp } = req.body;

    if (!current_password || !new_password || !otp) {
      return res.status(400).json({ error: 'Current password, new password, and verification code are required' });
    }

    const db = getDb();
    const user = db.get('SELECT * FROM users WHERE id = ?', req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password again
    const isMatch = await bcrypt.compare(String(current_password).trim(), user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    // Verify OTP
    const otpResult = verifyStoredOTP(user.email, 'change_password', otp);
    if (!otpResult.valid) {
      return res.status(400).json({ error: otpResult.error });
    }

    // Validate new password policy
    const pwdValidation = validatePasswordStrength(new_password);
    if (!pwdValidation.isValid) {
      return res.status(400).json({ error: pwdValidation.message, issues: pwdValidation.issues });
    }

    const newHash = await bcrypt.hash(String(new_password).trim(), 12);
    db.run(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      newHash, user.id
    );

    const { ip, userAgent } = getClientMeta(req);
    logSecurityEvent({
      userId: user.id,
      email: user.email,
      action: 'PASSWORD_CHANGED',
      ip,
      userAgent,
      details: 'Password successfully changed with OTP verification',
    });

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password change verify error:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

/**
 * Legacy PUT /api/auth/password fallback
 */
router.put('/password', authenticate, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    const pwdValidation = validatePasswordStrength(new_password);
    if (!pwdValidation.isValid) {
      return res.status(400).json({ error: pwdValidation.message, issues: pwdValidation.issues });
    }

    const db = getDb();
    const user = db.get('SELECT * FROM users WHERE id = ?', req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(String(current_password).trim(), user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    const newHash = await bcrypt.hash(String(new_password).trim(), 12);
    db.run('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', newHash, req.user.id);

    const { ip, userAgent } = getClientMeta(req);
    logSecurityEvent({
      userId: user.id,
      email: user.email,
      action: 'PASSWORD_CHANGED_DIRECT',
      ip,
      userAgent,
      details: 'Password updated via direct endpoint',
    });

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// ──────────────────────────────────────────
// Security Audit Logs
// ──────────────────────────────────────────

/**
 * GET /api/auth/security-logs
 * Retrieve recent security & login activity events for the user.
 */
router.get('/security-logs', authenticate, (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '20', 10);
    const logs = getUserSecurityLogs(req.user.id, Math.min(limit, 50));
    res.json({ logs });
  } catch (err) {
    console.error('Security logs error:', err);
    res.status(500).json({ error: 'Failed to retrieve security logs' });
  }
});

// ──────────────────────────────────────────
// Account & Profile Management
// ──────────────────────────────────────────

/**
 * GET /api/auth/me
 */
router.get('/me', authenticate, (req, res) => {
  const db = getDb();
  const user = db.get('SELECT id, email, name, currency, created_at FROM users WHERE id = ?', req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
});

/**
 * PUT /api/auth/profile
 */
router.put('/profile', authenticate, (req, res) => {
  try {
    const { name, currency } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const cleanName = String(name).trim();
    const cleanCurrency = String(currency || '₹').trim();

    const db = getDb();
    db.run(
      'UPDATE users SET name = ?, currency = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      cleanName, cleanCurrency, req.user.id
    );

    const updatedUser = db.get('SELECT id, email, name, currency, created_at FROM users WHERE id = ?', req.user.id);

    const { ip, userAgent } = getClientMeta(req);
    logSecurityEvent({
      userId: req.user.id,
      email: updatedUser.email,
      action: 'PROFILE_UPDATED',
      ip,
      userAgent,
      details: `Profile updated: name=${cleanName}, currency=${cleanCurrency}`,
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * GET /api/auth/data-summary
 */
router.get('/data-summary', authenticate, (req, res) => {
  try {
    const db = getDb();
    const txRow = db.get('SELECT COUNT(*) as count FROM transactions WHERE user_id = ?', req.user.id);
    const snapRow = db.get('SELECT COUNT(*) as count FROM ie_snapshots WHERE user_id = ?', req.user.id);
    const goalRow = db.get('SELECT COUNT(*) as count FROM goals WHERE user_id = ?', req.user.id);
    const userRow = db.get('SELECT created_at FROM users WHERE id = ?', req.user.id);

    res.json({
      transactionsCount: txRow?.count || 0,
      snapshotsCount: snapRow?.count || 0,
      goalsCount: goalRow?.count || 0,
      memberSince: userRow?.created_at,
    });
  } catch (err) {
    console.error('Data summary error:', err);
    res.status(500).json({ error: 'Failed to retrieve data summary' });
  }
});

/**
 * GET /api/auth/export-data
 */
router.get('/export-data', authenticate, (req, res) => {
  try {
    const db = getDb();
    const user = db.get('SELECT id, email, name, currency, created_at FROM users WHERE id = ?', req.user.id);
    const transactions = db.all('SELECT date, description, amount, type, category, source FROM transactions WHERE user_id = ? ORDER BY date DESC', req.user.id);
    const snapshots = db.all('SELECT year, month, total_income, total_expenses, net_savings, income_data, expense_data, notes FROM ie_snapshots WHERE user_id = ? ORDER BY year DESC, month DESC', req.user.id);
    const goals = db.all('SELECT name, target_amount, current_amount, deadline, priority, status FROM goals WHERE user_id = ?', req.user.id);

    const parsedSnapshots = snapshots.map(s => {
      let incomeObj = {};
      let expenseObj = {};
      try { incomeObj = JSON.parse(s.income_data); } catch {}
      try { expenseObj = JSON.parse(s.expense_data); } catch {}
      return {
        ...s,
        income_data: incomeObj,
        expense_data: expenseObj,
      };
    });

    const { ip, userAgent } = getClientMeta(req);
    logSecurityEvent({
      userId: req.user.id,
      email: user.email,
      action: 'DATA_EXPORTED',
      ip,
      userAgent,
      details: 'Full account data backup exported',
    });

    res.json({
      exported_at: new Date().toISOString(),
      user,
      transactions,
      snapshots: parsedSnapshots,
      goals,
    });
  } catch (err) {
    console.error('Export data error:', err);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

/**
 * POST /api/auth/clear-transactions
 */
router.post('/clear-transactions', authenticate, (req, res) => {
  try {
    const db = getDb();
    db.run('DELETE FROM transactions WHERE user_id = ?', req.user.id);
    const user = db.get('SELECT email FROM users WHERE id = ?', req.user.id);
    const { ip, userAgent } = getClientMeta(req);
    logSecurityEvent({
      userId: req.user.id,
      email: user?.email || '',
      action: 'TRANSACTIONS_PURGED',
      ip,
      userAgent,
      details: 'All transaction records deleted',
    });
    res.json({ message: 'All transactions cleared successfully' });
  } catch (err) {
    console.error('Clear transactions error:', err);
    res.status(500).json({ error: 'Failed to clear transactions' });
  }
});

/**
 * POST /api/auth/clear-snapshots
 */
router.post('/clear-snapshots', authenticate, (req, res) => {
  try {
    const db = getDb();
    db.run('DELETE FROM ie_snapshots WHERE user_id = ?', req.user.id);
    const user = db.get('SELECT email FROM users WHERE id = ?', req.user.id);
    const { ip, userAgent } = getClientMeta(req);
    logSecurityEvent({
      userId: req.user.id,
      email: user?.email || '',
      action: 'SNAPSHOTS_PURGED',
      ip,
      userAgent,
      details: 'All monthly snapshots deleted',
    });
    res.json({ message: 'All budget snapshots cleared successfully' });
  } catch (err) {
    console.error('Clear snapshots error:', err);
    res.status(500).json({ error: 'Failed to clear snapshots' });
  }
});

/**
 * DELETE /api/auth/account
 */
router.delete('/account', authenticate, (req, res) => {
  try {
    const db = getDb();
    const user = db.get('SELECT email FROM users WHERE id = ?', req.user.id);
    const { ip, userAgent } = getClientMeta(req);
    logSecurityEvent({
      userId: req.user.id,
      email: user?.email || '',
      action: 'ACCOUNT_DELETED',
      ip,
      userAgent,
      details: 'User account and all cascaded data permanently purged',
    });
    db.run('DELETE FROM users WHERE id = ?', req.user.id);
    res.json({ message: 'Account permanently deleted' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
