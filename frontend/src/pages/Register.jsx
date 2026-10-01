import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import PasswordStrengthMeter, { checkPasswordCriteria } from '../components/PasswordStrengthMeter';
import BrandLogo from '../components/BrandLogo';
import { Eye, EyeOff, ShieldCheck, Mail, ArrowLeft, RefreshCw, KeyRound, CheckCircle2 } from 'lucide-react';

export default function Register() {
  const [step, setStep] = useState(1); // 1 = Details, 2 = Email OTP verification
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // OTP state
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { setSession } = useAuth();
  const navigate = useNavigate();

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    const criteria = checkPasswordCriteria(password);
    if (!criteria.length || !criteria.hasUpper || !criteria.hasLower || !criteria.hasNumber || !criteria.hasSpecial) {
      return setError('Please choose a stronger password meeting all security requirements.');
    }

    setLoading(true);
    try {
      const res = await api.requestRegisterOTP(email.trim(), name.trim(), password);
      setSuccess(res.message || 'Verification code sent to your email.');
      if (res.devOtp) {
        setDevOtp(res.devOtp);
      }
      setResendCooldown(60);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and finalize registration
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      return setError('Please enter a valid 6-digit verification code');
    }

    setLoading(true);
    try {
      const res = await api.verifyRegisterOTP(email.trim(), name.trim(), password, cleanOtp);
      setSession(res.user, res.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendCooldown > 0 || resending) return;
    setError('');
    setResending(true);
    try {
      const res = await api.requestRegisterOTP(email.trim(), name.trim(), password);
      setSuccess('A fresh verification code has been dispatched.');
      if (res.devOtp) {
        setDevOtp(res.devOtp);
      }
      setResendCooldown(60);
    } catch (err) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
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
              <ShieldCheck size={24} />
            </div>
          </div>

        {step === 1 ? (
          <>
            <h2>Create your account</h2>
            <p className="subtitle">Start tracking your finances with AI</p>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleRequestOTP}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">Full Name</label>
                <input
                  id="reg-name"
                  type="text"
                  className="form-input"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">Email Address</label>
                <input
                  id="reg-email"
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Min 8 chars with upper, lower, num, symbol"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                {/* Visual Password Strength Checklist */}
                <PasswordStrengthMeter password={password} />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="reg-confirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? 'Sending verification code...' : 'Continue to Email Verification →'}
              </button>
            </form>

            <div className="auth-footer">
              Already have an account?{' '}
              <Link to="/login">Sign in</Link>
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                setStep(1);
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
                padding: 0
              }}
            >
              <ArrowLeft size={14} /> Back to details
            </button>

            <h2>Verify Your Email</h2>
            <p className="subtitle" style={{ marginBottom: '16px' }}>
              We sent a 6-digit verification code to<br />
              <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
            </p>

            {devOtp && (
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
                <span>🔐 Verification Code: <strong style={{ letterSpacing: '2px', fontSize: '14px' }}>{devOtp}</strong></span>
                <button
                  type="button"
                  onClick={() => setOtp(devOtp)}
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

            <form onSubmit={handleVerifyOTP}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-otp" style={{ textAlign: 'center' }}>
                  6-Digit Verification Code
                </label>
                <input
                  id="reg-otp"
                  type="text"
                  maxLength={6}
                  autoComplete="one-time-code"
                  autoFocus
                  style={{
                    fontSize: '24px',
                    letterSpacing: '8px',
                    textAlign: 'center',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono, monospace)',
                    padding: '12px'
                  }}
                  className="form-input"
                  placeholder="••••••"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading || otp.length !== 6}
                style={{ marginBottom: '14px' }}
              >
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Didn't receive code?</span>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendCooldown > 0 || resending}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: resendCooldown > 0 ? 'var(--text-muted)' : 'var(--accent-primary)',
                    fontWeight: 600,
                    cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                    padding: 0
                  }}
                >
                  {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend Code'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
      </div>
    </div>
  );
}
