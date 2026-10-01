import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import PasswordStrengthMeter, { checkPasswordCriteria } from '../components/PasswordStrengthMeter';
import BrandLogo from '../components/BrandLogo';
import { Eye, EyeOff, ShieldAlert, KeyRound, CheckCircle2, ArrowLeft, Clock, Mail, AlertTriangle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Lockout / Cooldown state
  const [isLocked, setIsLocked] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // Forgot password flow state
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1 = Enter email, 2 = Enter OTP & new password
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [devResetOtp, setDevResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check URL query parameters for timeout notices
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('reason') === 'inactivity') {
      setError('You were automatically signed out due to 15 minutes of inactivity for your financial security.');
    }
  }, [location.search]);

  // Lockout countdown timer
  useEffect(() => {
    if (!isLocked || remainingSeconds <= 0) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          setError('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isLocked, remainingSeconds]);

  // Resend cooldown timer for password reset
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Check login status on blur or input
  const handleCheckCooldown = async (mail) => {
    if (!mail || !mail.includes('@')) return;
    try {
      const res = await api.checkLoginStatus(mail.trim());
      if (res.isLocked) {
        setIsLocked(true);
        setRemainingSeconds(res.remainingSeconds);
      }
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isLocked) {
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password.trim());
      navigate('/dashboard');
    } catch (err) {
      // Check if error contains lockout info
      try {
        const status = await api.checkLoginStatus(email.trim());
        if (status.isLocked) {
          setIsLocked(true);
          setRemainingSeconds(status.remainingSeconds);
          setError(`Account is locked for 15 minutes due to 5 failed attempts.`);
          return;
        }
      } catch {}

      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // Step 1 of Password Reset: Request OTP
  const handleRequestResetOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!resetEmail || !resetEmail.includes('@')) {
      return setError('Please enter a valid email address');
    }

    setResetLoading(true);
    try {
      const res = await api.requestPasswordResetOTP(resetEmail.trim());
      setSuccess(res.message || 'Verification code sent to your email.');
      if (res.devOtp) {
        setDevResetOtp(res.devOtp);
      }
      setResendCooldown(60);
      setResetStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send password reset code. Please check your email.');
    } finally {
      setResetLoading(false);
    }
  };

  // Step 2 of Password Reset: Verify OTP & update password
  const handleVerifyResetOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanOtp = resetOtp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      return setError('Please enter the 6-digit verification code');
    }

    if (newPassword !== confirmNewPassword) {
      return setError('Passwords do not match');
    }

    const criteria = checkPasswordCriteria(newPassword);
    if (!criteria.length || !criteria.hasUpper || !criteria.hasLower || !criteria.hasNumber || !criteria.hasSpecial) {
      return setError('New password does not meet security requirements.');
    }

    setResetLoading(true);
    try {
      const res = await api.verifyPasswordResetOTP(resetEmail.trim(), cleanOtp, newPassword.trim());
      setSuccess(res.message || 'Password reset successfully! Please sign in with your new password.');
      setEmail(resetEmail.trim());
      setPassword(newPassword.trim());
      setIsResetMode(false);
      setResetStep(1);
      setResetOtp('');
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please check your code.');
    } finally {
      setResetLoading(false);
    }
  };

  const formatTime = (totalSec) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="auth-page">
      {/* Top Header Bar with clickable FinGuide brand logo */}
      <header className="auth-header-bar">
        <BrandLogo size="sm" />
        <Link
          to="/"
          className="btn btn-ghost btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
        >
          <ArrowLeft size={15} /> Back to Home
        </Link>
      </header>

      {/* Centered card container with prominent BrandLogo button linking to / */}
      <div className="auth-card-container">
        <BrandLogo size="lg" className="auth-center-logo-btn" />

        <div className="auth-card" style={{ maxWidth: '440px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-md)' }}>
            <div className="brand-icon-box" style={{ width: '44px', height: '44px', borderRadius: '12px' }}>
              <KeyRound size={22} />
            </div>
          </div>

        {!isResetMode ? (
          <>
            <h2>Welcome back</h2>
            <p className="subtitle">Sign in to your FinGuide account</p>

            {/* Lockout / Cooldown Active Banner */}
            {isLocked && (
              <div style={{
                background: 'rgba(225, 29, 72, 0.12)',
                border: '1px solid rgba(225, 29, 72, 0.35)',
                borderRadius: '10px',
                padding: '14px 16px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                color: 'var(--danger, #ef4444)'
              }}>
                <Clock size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '2px' }}>
                    Login Cooldown Active
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Too many incorrect password attempts. For security, logins are paused.
                    Try again in: <strong style={{ color: 'var(--danger, #ef4444)' }}>{formatTime(remainingSeconds)}</strong>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} />
                <span>{success}</span>
              </div>
            )}
            {!isLocked && error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleCheckCooldown(email)}
                  required
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xs)' }}>
                  <label className="form-label" htmlFor="login-password" style={{ margin: 0 }}>Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email.trim());
                      setError('');
                      setSuccess('');
                      setIsResetMode(true);
                      setResetStep(1);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-primary)',
                      fontSize: 'var(--font-size-xs)',
                      cursor: 'pointer',
                      padding: 0,
                      fontWeight: 600,
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="password-input-wrapper">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLocked}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(prev => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading || isLocked}
              >
                {loading
                  ? 'Signing in...'
                  : isLocked
                  ? `Cooldown Active (${formatTime(remainingSeconds)})`
                  : 'Sign In'}
              </button>
            </form>

            <div className="auth-footer">
              Don't have an account?{' '}
              <Link to="/register">Create one</Link>
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                setIsResetMode(false);
                setError('');
                setSuccess('');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '12px',
                cursor: 'pointer',
                marginBottom: '16px',
                padding: 0,
              }}
            >
              <ArrowLeft size={14} /> Back to Sign In
            </button>

            <h2>Reset Password</h2>
            <p className="subtitle">
              {resetStep === 1
                ? 'Enter your email to receive a 6-digit verification code'
                : `Enter the code sent to ${resetEmail} and your new password`}
            </p>

            {devResetOtp && resetStep === 2 && (
              <div style={{
                background: 'rgba(0, 171, 228, 0.1)',
                border: '1px dashed rgba(0, 171, 228, 0.4)',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '16px',
                fontSize: '12px',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px'
              }}>
                <span>💡 Dev Mode OTP: <strong>{devResetOtp}</strong></span>
                <button
                  type="button"
                  onClick={() => setResetOtp(devResetOtp)}
                  style={{
                    background: 'var(--accent-primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Auto-fill
                </button>
              </div>
            )}

            {success && (
              <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} />
                <span>{success}</span>
              </div>
            )}
            {error && <div className="alert alert-danger">{error}</div>}

            {resetStep === 1 ? (
              <form onSubmit={handleRequestResetOTP}>
                <div className="form-group">
                  <label className="form-label" htmlFor="reset-email">Your Account Email</label>
                  <input
                    id="reset-email"
                    type="email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={resetLoading}
                >
                  {resetLoading ? 'Sending code...' : 'Send Security Code →'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyResetOTP}>
                <div className="form-group">
                  <label className="form-label" htmlFor="reset-otp" style={{ textAlign: 'center' }}>
                    6-Digit Security Code
                  </label>
                  <input
                    id="reset-otp"
                    type="text"
                    maxLength={6}
                    autoComplete="one-time-code"
                    autoFocus
                    style={{
                      fontSize: '22px',
                      letterSpacing: '8px',
                      textAlign: 'center',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono, monospace)',
                      padding: '10px'
                    }}
                    className="form-input"
                    placeholder="••••••"
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="new-password">New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Min 8 chars with upper, lower, num, symbol"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowNewPassword(prev => !prev)}
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <PasswordStrengthMeter password={newPassword} />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="confirm-new-password">Confirm New Password</label>
                  <input
                    id="confirm-new-password"
                    type="password"
                    className="form-input"
                    placeholder="Repeat new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={resetLoading || resetOtp.length !== 6}
                  style={{ marginBottom: '14px' }}
                >
                  {resetLoading ? 'Updating password...' : 'Verify & Set New Password'}
                </button>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Didn't get the code?</span>
                  <button
                    type="button"
                    onClick={handleRequestResetOTP}
                    disabled={resendCooldown > 0 || resetLoading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: resendCooldown > 0 ? 'var(--text-muted)' : 'var(--accent-primary)',
                      fontWeight: 600,
                      cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                      padding: 0
                    }}
                  >
                    {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
      </div>
    </div>
  );
}
