import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import PasswordStrengthMeter, { checkPasswordCriteria } from '../components/PasswordStrengthMeter';
import {
  User, Shield, Database, Trash2, Download, CheckCircle2,
  AlertTriangle, Eye, EyeOff, Save, KeyRound, RefreshCw, DollarSign,
  Settings as SettingsIcon, Clock, ShieldAlert, ShieldCheck, Mail, ArrowLeft, History, Lock
} from 'lucide-react';

const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'INR (₹) - Indian Rupee' },
  { code: 'USD', symbol: '$', label: 'USD ($) - US Dollar' },
  { code: 'EUR', symbol: '€', label: 'EUR (€) - Euro' },
  { code: 'GBP', symbol: '£', label: 'GBP (£) - British Pound' },
  { code: 'JPY', symbol: '¥', label: 'JPY (¥) - Japanese Yen' },
  { code: 'CAD', symbol: 'C$', label: 'CAD (C$) - Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'AUD (A$) - Australian Dollar' },
];

export default function Settings() {
  const { user, updateUser, logout } = useAuth();

  // Profile state
  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.currency || '₹');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);

  // Password state & 2-Step OTP
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);

  // Security OTP state for password change
  const [passwordOtpStep, setPasswordOtpStep] = useState(1); // 1 = current pwd -> request code, 2 = enter OTP & new pwd
  const [passwordOtp, setPasswordOtp] = useState('');
  const [devPasswordOtp, setDevPasswordOtp] = useState('');
  const [passwordResendCooldown, setPasswordResendCooldown] = useState(0);

  // Security Audit Logs
  const [securityLogs, setSecurityLogs] = useState([]);
  const [loadingSecurityLogs, setLoadingSecurityLogs] = useState(false);

  // Data summary state
  const [dataSummary, setDataSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [dataMessage, setDataMessage] = useState(null);

  // Confirmation modals / state
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Active tab
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security' | 'data' | 'danger'

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setCurrency(user.currency || '₹');
    }
  }, [user]);

  const loadDataSummary = async () => {
    try {
      setLoadingSummary(true);
      const summary = await api.getDataSummary();
      setDataSummary(summary);
    } catch (err) {
      console.error('Failed to load data summary:', err);
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    loadDataSummary();
  }, []);

  // Update Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMessage(null);
    if (!name.trim()) {
      setProfileMessage({ type: 'error', text: 'Name cannot be empty' });
      return;
    }

    try {
      setProfileSaving(true);
      const res = await api.updateProfile(name, currency);
      updateUser(res.user);
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setProfileMessage(null), 4000);
    } catch (err) {
      setProfileMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setProfileSaving(false);
    }
  };

  // Security Logs loader
  const loadSecurityLogs = async () => {
    try {
      setLoadingSecurityLogs(true);
      const res = await api.getSecurityLogs(25);
      setSecurityLogs(res.logs || []);
    } catch (err) {
      console.error('Failed to load security logs:', err);
    } finally {
      setLoadingSecurityLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'security') {
      loadSecurityLogs();
    }
  }, [activeTab]);

  // Resend cooldown timer for password change OTP
  useEffect(() => {
    if (passwordResendCooldown <= 0) return;
    const interval = setInterval(() => {
      setPasswordResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [passwordResendCooldown]);

  // Step 1: Request Password Change OTP
  const handleRequestPasswordOTP = async (e) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!currentPassword) {
      setPasswordMessage({ type: 'error', text: 'Please enter your current password' });
      return;
    }

    try {
      setPasswordSaving(true);
      const res = await api.requestPasswordChangeOTP(currentPassword);
      setPasswordMessage({ type: 'success', text: res.message || 'Authorization code sent to your email.' });
      if (res.devOtp) {
        setDevPasswordOtp(res.devOtp);
      }
      setPasswordResendCooldown(60);
      setPasswordOtpStep(2);
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.message || 'Failed to request authorization code' });
    } finally {
      setPasswordSaving(false);
    }
  };

  // Step 2: Verify OTP and update password
  const handleVerifyPasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage(null);

    const cleanOtp = passwordOtp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setPasswordMessage({ type: 'error', text: 'Please enter the 6-digit authorization code' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    const criteria = checkPasswordCriteria(newPassword);
    if (!criteria.length || !criteria.hasUpper || !criteria.hasLower || !criteria.hasNumber || !criteria.hasSpecial) {
      setPasswordMessage({ type: 'error', text: 'New password does not meet security requirements.' });
      return;
    }

    try {
      setPasswordSaving(true);
      const res = await api.verifyPasswordChangeOTP(currentPassword, newPassword, cleanOtp);
      setPasswordMessage({ type: 'success', text: res.message || 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordOtp('');
      setDevPasswordOtp('');
      setPasswordOtpStep(1);
      loadSecurityLogs();
      setTimeout(() => setPasswordMessage(null), 5000);
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.message || 'Failed to change password' });
    } finally {
      setPasswordSaving(false);
    }
  };

  // Export All Data (JSON)
  const handleExportJSON = async () => {
    try {
      setExporting(true);
      const data = await api.exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finguide_backup_${user?.email || 'user'}_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDataMessage({ type: 'success', text: 'JSON backup downloaded successfully' });
      setTimeout(() => setDataMessage(null), 3500);
    } catch (err) {
      setDataMessage({ type: 'error', text: err.message || 'Export failed' });
    } finally {
      setExporting(false);
    }
  };

  // Export Transactions (CSV)
  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const data = await api.exportAllData();
      const transactions = data.transactions || [];
      if (transactions.length === 0) {
        setDataMessage({ type: 'info', text: 'No transactions found to export' });
        setExporting(false);
        return;
      }

      const headers = ['Date', 'Description', 'Amount', 'Type', 'Category', 'Source'];
      const rows = transactions.map(t => [
        t.date,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        t.amount,
        t.type,
        `"${(t.category || '').replace(/"/g, '""')}"`,
        t.source || ''
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finguide_transactions_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDataMessage({ type: 'success', text: 'Transactions CSV exported successfully' });
      setTimeout(() => setDataMessage(null), 3500);
    } catch (err) {
      setDataMessage({ type: 'error', text: err.message || 'CSV Export failed' });
    } finally {
      setExporting(false);
    }
  };

  // Perform Danger Action
  const executeDangerAction = async () => {
    if (!confirmAction) return;
    setActionLoading(true);

    try {
      if (confirmAction === 'clear-transactions') {
        const res = await api.clearTransactions();
        setDataMessage({ type: 'success', text: res.message || 'Transactions cleared' });
        await loadDataSummary();
      } else if (confirmAction === 'clear-snapshots') {
        const res = await api.clearSnapshots();
        setDataMessage({ type: 'success', text: res.message || 'Snapshots cleared' });
        await loadDataSummary();
      } else if (confirmAction === 'delete-account') {
        if (deleteConfirmationText !== 'DELETE') {
          alert('Please type DELETE to confirm account deletion');
          setActionLoading(false);
          return;
        }
        await api.deleteAccount();
        logout();
        window.location.href = '/';
        return;
      }
      setConfirmAction(null);
      setDeleteConfirmationText('');
    } catch (err) {
      alert(err.message || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="settings-page" style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <SettingsIcon size={26} style={{ color: 'var(--accent-primary)' }} />
            Settings & Account
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Personalize your account details, manage security, download backups, and manage your financial records.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="settings-tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        <button
          className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('profile')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: 'var(--font-size-sm)' }}
        >
          <User size={16} /> Profile & Currency
        </button>
        <button
          className={`btn ${activeTab === 'security' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('security')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: 'var(--font-size-sm)' }}
        >
          <Shield size={16} /> Password & Security
        </button>
        <button
          className={`btn ${activeTab === 'data' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('data')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: 'var(--font-size-sm)' }}
        >
          <Database size={16} /> Data & Exports
        </button>
        <button
          className={`btn ${activeTab === 'danger' ? 'btn-danger' : 'btn-ghost'}`}
          onClick={() => setActiveTab('danger')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: 'var(--font-size-sm)', marginLeft: 'auto', color: activeTab === 'danger' ? '#fff' : 'var(--danger)' }}
        >
          <AlertTriangle size={16} /> Danger Zone
        </button>
      </div>

      {/* ── Tab: Profile & Currency ── */}
      {activeTab === 'profile' && (
        <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <User size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>Profile Information</h3>
          </div>

          {profileMessage && (
            <div
              className={`alert ${profileMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                background: profileMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: profileMessage.type === 'success' ? '#10b981' : '#ef4444',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {profileMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
              <span>{profileMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="settings-name">Full Name</label>
                <input
                  id="settings-name"
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="settings-email">Email Address</label>
                <input
                  id="settings-email"
                  type="email"
                  className="form-input"
                  value={user?.email || ''}
                  disabled
                  style={{ opacity: 0.7, cursor: 'not-allowed', background: 'rgba(255,255,255,0.03)' }}
                />
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
                  Email is linked to your account and cannot be modified.
                </span>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="settings-currency">Preferred Currency Symbol</label>
                <select
                  id="settings-currency"
                  className="form-select"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.symbol}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
                  Used across reports, budget summaries, and forecasts.
                </span>
              </div>
            </div>

            <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={profileSaving}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {profileSaving ? (
                  <>
                    <RefreshCw size={16} className="spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Profile Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Tab: Password & Security ── */}
      {activeTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Change Password Card with OTP */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <KeyRound size={20} style={{ color: 'var(--accent-primary)' }} />
                <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>Change Password (2-Step Email Authorization)</h3>
              </div>
              <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Mail size={12} /> Email Verified
              </span>
            </div>

            {passwordMessage && (
              <div
                className={`alert ${passwordMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  background: passwordMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: passwordMessage.type === 'success' ? '#10b981' : '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {passwordMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                <span>{passwordMessage.text}</span>
              </div>
            )}

            {passwordOtpStep === 1 ? (
              <form onSubmit={handleRequestPasswordOTP} style={{ maxWidth: '520px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                  To change your password, enter your current password below. A 6-digit authorization code will be sent to your registered email address (<strong>{user?.email}</strong>) to approve the change.
                </p>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" htmlFor="current-password">Current Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="current-password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="form-input"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      style={{ paddingRight: '2.5rem' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      style={{
                        position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex'
                      }}
                      title={showCurrentPassword ? 'Hide password' : 'Show password'}
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={passwordSaving}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {passwordSaving ? (
                    <>
                      <RefreshCw size={16} className="spin" />
                      Sending Authorization Code...
                    </>
                  ) : (
                    <>
                      <Mail size={16} />
                      Request Email Authorization Code →
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyPasswordChange} style={{ maxWidth: '520px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordOtpStep(1);
                      setPasswordMessage(null);
                    }}
                    style={{
                      background: 'none', border: 'none', color: 'var(--text-muted)',
                      display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', cursor: 'pointer', padding: 0
                    }}
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Sent to: <strong>{user?.email}</strong>
                  </span>
                </div>

                {devPasswordOtp && (
                  <div style={{
                    background: 'rgba(0, 171, 228, 0.1)',
                    border: '1px dashed rgba(0, 171, 228, 0.4)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    marginBottom: '14px',
                    fontSize: '12px',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>💡 Dev Mode OTP: <strong>{devPasswordOtp}</strong></span>
                    <button
                      type="button"
                      onClick={() => setPasswordOtp(devPasswordOtp)}
                      style={{
                        background: 'var(--accent-primary)', color: '#fff', border: 'none',
                        borderRadius: '4px', padding: '2px 8px', fontSize: '11px', cursor: 'pointer', fontWeight: 600
                      }}
                    >
                      Auto-fill
                    </button>
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" htmlFor="password-otp">6-Digit Authorization Code</label>
                  <input
                    id="password-otp"
                    type="text"
                    maxLength={6}
                    autoComplete="one-time-code"
                    autoFocus
                    style={{
                      fontSize: '20px',
                      letterSpacing: '6px',
                      textAlign: 'center',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono, monospace)',
                      padding: '8px'
                    }}
                    className="form-input"
                    placeholder="••••••"
                    value={passwordOtp}
                    onChange={(e) => setPasswordOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={handleRequestPasswordOTP}
                      disabled={passwordResendCooldown > 0 || passwordSaving}
                      style={{
                        background: 'none', border: 'none', color: passwordResendCooldown > 0 ? 'var(--text-muted)' : 'var(--accent-primary)',
                        fontSize: '11px', fontWeight: 600, cursor: passwordResendCooldown > 0 ? 'not-allowed' : 'pointer', padding: 0
                      }}
                    >
                      {passwordResendCooldown > 0 ? `Resend code in ${passwordResendCooldown}s` : 'Resend code'}
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" htmlFor="new-password">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      className="form-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 chars with upper, lower, num, symbol"
                      style={{ paddingRight: '2.5rem' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{
                        position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex'
                      }}
                      title={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <PasswordStrengthMeter password={newPassword} />
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" htmlFor="confirm-password">Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      style={{ paddingRight: '2.5rem' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex'
                      }}
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={passwordSaving || passwordOtp.length !== 6}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {passwordSaving ? (
                    <>
                      <RefreshCw size={16} className="spin" />
                      Authorizing...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      Verify Code & Change Password
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Active Security Protections Card */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <ShieldCheck size={20} style={{ color: 'var(--success)' }} />
              <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>Account Security Protections</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-card-hover)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                  <Mail size={16} style={{ color: 'var(--accent-primary)' }} />
                  Two-Step Email Verification
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  Key account actions (account creation, password changes, and resets) require a one-time 6-digit verification code sent to your email.
                </div>
              </div>

              <div style={{ background: 'var(--bg-card-hover)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                  <Clock size={16} style={{ color: 'var(--danger)' }} />
                  Failed Sign-In Lockout
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  Your account temporarily pauses for 15 minutes after 5 consecutive incorrect password attempts to keep your records safe from unauthorized guessing.
                </div>
              </div>

              <div style={{ background: 'var(--bg-card-hover)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                  <ShieldAlert size={16} style={{ color: 'var(--warning)' }} />
                  Automatic Inactivity Logout
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  FinGuide displays a countdown warning and signs out after 15 minutes of inactivity so your finances remain private if you step away.
                </div>
              </div>

              <div style={{ background: 'var(--bg-card-hover)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                  <Lock size={16} style={{ color: 'var(--success)' }} />
                  Connection & Data Safeguards
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  Automated request controls, session token encryption, and browser protection headers safeguard your account from external abuse.
                </div>
              </div>
            </div>
          </div>

          {/* Security & Activity Audit Log */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <History size={20} style={{ color: 'var(--accent-primary)' }} />
                <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>Recent Account & Security Activity</h3>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={loadSecurityLogs}
                disabled={loadingSecurityLogs}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RefreshCw size={13} className={loadingSecurityLogs ? 'spin' : ''} />
                Refresh Log
              </button>
            </div>

            {loadingSecurityLogs ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                Loading activity logs...
              </div>
            ) : securityLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '13px' }}>
                No recent security activity logged yet.
              </div>
            ) : (
              <div className="table-container" style={{ maxHeight: '360px', overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Activity</th>
                      <th>Date & Time</th>
                      <th>IP Address</th>
                      <th>Device / Browser</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {securityLogs.map((log) => {
                      let badgeClass = 'badge-info';
                      if (log.action.includes('SUCCESS') || log.action.includes('CREATED') || log.action.includes('CHANGED')) {
                        badgeClass = 'badge-success';
                      } else if (log.action.includes('FAILED') || log.action.includes('LOCKED')) {
                        badgeClass = 'badge-danger';
                      } else if (log.action.includes('OTP')) {
                        badgeClass = 'badge-warning';
                      }

                      const ACTION_NAMES = {
                        LOGIN_SUCCESS: 'Signed In',
                        LOGIN_FAILED: 'Sign-In Failed',
                        ACCOUNT_LOCKED: 'Account Locked',
                        ACCOUNT_CREATED: 'Account Registered',
                        OTP_SENT_REGISTRATION: 'Registration Code Sent',
                        OTP_SENT_PASSWORD_CHANGE: 'Password Code Sent',
                        PASSWORD_CHANGED: 'Password Changed',
                        PASSWORD_RESET_COMPLETED: 'Password Reset',
                        DATA_EXPORTED: 'Backup Downloaded',
                        DATA_PURGED: 'Records Cleared',
                        ACCOUNT_DELETED: 'Account Deleted',
                      };

                      return (
                        <tr key={log.id}>
                          <td>
                            <span className={`badge ${badgeClass}`} style={{ fontSize: '11px' }}>
                              {ACTION_NAMES[log.action] || log.action.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td style={{ fontSize: '12px', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                            {new Date(log.created_at).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </td>
                          <td style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                            {log.ip_address || '127.0.0.1'}
                          </td>
                          <td style={{ fontSize: '11px', color: 'var(--text-secondary)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.user_agent}>
                            {log.user_agent ? log.user_agent.split(' ')[0] : 'Web Client'}
                          </td>
                          <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {log.details || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Data & Exports ── */}
      {activeTab === 'data' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {dataMessage && (
            <div
              className={`alert ${dataMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: dataMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                color: dataMessage.type === 'success' ? '#10b981' : '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <CheckCircle2 size={18} />
              <span>{dataMessage.text}</span>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>Your Stored Data Summary</h3>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={loadDataSummary}
                disabled={loadingSummary}
                title="Refresh summary"
              >
                <RefreshCw size={14} className={loadingSummary ? 'spin' : ''} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Transactions
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.25rem' }}>
                  {loadingSummary ? '...' : (dataSummary?.transactionsCount ?? 0)}
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Bank & manual entries
                </div>
              </div>

              <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Monthly Snapshots
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#38bdf8', marginTop: '0.25rem' }}>
                  {loadingSummary ? '...' : (dataSummary?.snapshotsCount ?? 0)}
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Income & expense logs
                </div>
              </div>

              <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Financial Goals
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#a855f7', marginTop: '0.25rem' }}>
                  {loadingSummary ? '...' : (dataSummary?.goalsCount ?? 0)}
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Savings & target trackers
                </div>
              </div>

              <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Member Since
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                  {dataSummary?.memberSince ? new Date(dataSummary.memberSince).toLocaleDateString() : 'Active'}
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Account created
                </div>
              </div>
            </div>
          </div>

          {/* Export Data Card */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <Download size={20} style={{ color: 'var(--primary)' }} />
              <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>Download & Export Records</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: '1.25rem' }}>
              You own all your financial data. Export anytime for personal record keeping, spreadsheet analysis, or offline backups.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <button
                className="btn btn-secondary"
                onClick={handleExportJSON}
                disabled={exporting}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Download size={16} />
                Export Full Backup (JSON)
              </button>

              <button
                className="btn btn-secondary"
                onClick={handleExportCSV}
                disabled={exporting}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Download size={16} />
                Export Transactions (CSV)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Danger Zone ── */}
      {activeTab === 'danger' && (
        <div className="card" style={{ padding: '1.75rem', borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid rgba(239, 68, 68, 0.2)', paddingBottom: '0.75rem' }}>
            <AlertTriangle size={20} style={{ color: 'var(--danger)' }} />
            <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', color: 'var(--danger)' }}>Danger Zone</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: '1.5rem' }}>
            The following actions permanently delete your stored data or account records. These actions cannot be undone. Please proceed with caution.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Clear Transactions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Clear All Transactions</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Deletes all parsed statement transactions ({dataSummary?.transactionsCount ?? 0} records). Keeps your profile and monthly snapshots intact.
                </div>
              </div>
              <button
                className="btn btn-outline"
                style={{ borderColor: 'var(--danger)', color: 'var(--danger)', fontSize: 'var(--font-size-xs)' }}
                onClick={() => setConfirmAction('clear-transactions')}
              >
                <Trash2 size={14} style={{ marginRight: '4px' }} /> Clear Transactions
              </button>
            </div>

            {/* Clear Monthly Snapshots */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Clear Monthly Snapshots</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Deletes all income & expense logs and historical budget snapshots ({dataSummary?.snapshotsCount ?? 0} records).
                </div>
              </div>
              <button
                className="btn btn-outline"
                style={{ borderColor: 'var(--danger)', color: 'var(--danger)', fontSize: 'var(--font-size-xs)' }}
                onClick={() => setConfirmAction('clear-snapshots')}
              >
                <Trash2 size={14} style={{ marginRight: '4px' }} /> Clear Snapshots
              </button>
            </div>

            {/* Delete Account */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(239, 68, 68, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.3)', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--danger)' }}>Delete Account Permanently</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Erase your entire account, all transactions, snapshots, goals, and history. You will be logged out immediately.
                </div>
              </div>
              <button
                className="btn btn-danger"
                style={{ fontSize: 'var(--font-size-xs)' }}
                onClick={() => setConfirmAction('delete-account')}
              >
                <AlertTriangle size={14} style={{ marginRight: '4px' }} /> Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '1rem'
          }}
          onClick={() => !actionLoading && setConfirmAction(null)}
        >
          <div
            className="card"
            style={{
              maxWidth: '480px', width: '100%', padding: '1.75rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)', border: '1px solid var(--border-color)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--danger)', marginBottom: '1rem' }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0 }}>
                {confirmAction === 'clear-transactions' && 'Clear All Transactions?'}
                {confirmAction === 'clear-snapshots' && 'Clear Monthly Snapshots?'}
                {confirmAction === 'delete-account' && 'Permanently Delete Account?'}
              </h3>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              {confirmAction === 'clear-transactions' && (
                'Are you sure you want to delete all stored transaction records? This action cannot be undone. Consider exporting a backup first.'
              )}
              {confirmAction === 'clear-snapshots' && (
                'Are you sure you want to delete all saved monthly income and expense snapshots? This action cannot be undone.'
              )}
              {confirmAction === 'delete-account' && (
                'This will permanently delete your account, your authentication credentials, and all financial data from our database.'
              )}
            </p>

            {confirmAction === 'delete-account' && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontSize: 'var(--font-size-xs)' }}>
                  Type <strong style={{ color: 'var(--danger)' }}>DELETE</strong> to confirm:
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="DELETE"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setConfirmAction(null);
                  setDeleteConfirmationText('');
                }}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={executeDangerAction}
                disabled={actionLoading || (confirmAction === 'delete-account' && deleteConfirmationText !== 'DELETE')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {actionLoading ? (
                  <>
                    <RefreshCw size={14} className="spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Confirm & Proceed
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
