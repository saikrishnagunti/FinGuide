import { Check, X } from 'lucide-react';

export function checkPasswordCriteria(password = '') {
  const pwd = String(password);
  return {
    length: pwd.length >= 8,
    hasUpper: /[A-Z]/.test(pwd),
    hasLower: /[a-z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
  };
}

export default function PasswordStrengthMeter({ password = '' }) {
  const criteria = checkPasswordCriteria(password);
  const metCount = Object.values(criteria).filter(Boolean).length;

  if (!password) return null;

  let strengthLabel = 'Very Weak';
  let strengthColor = 'var(--danger, #ef4444)';
  let progressPercent = (metCount / 5) * 100;

  if (metCount <= 2) {
    strengthLabel = 'Weak';
    strengthColor = 'var(--danger, #ef4444)';
  } else if (metCount === 3) {
    strengthLabel = 'Fair';
    strengthColor = '#f59e0b';
  } else if (metCount === 4) {
    strengthLabel = 'Good';
    strengthColor = 'var(--accent-primary, #00ABE4)';
  } else if (metCount === 5) {
    strengthLabel = 'Strong & Secure';
    strengthColor = 'var(--success, #178582)';
  }

  const items = [
    { label: 'At least 8 characters', met: criteria.length },
    { label: 'One uppercase letter (A-Z)', met: criteria.hasUpper },
    { label: 'One lowercase letter (a-z)', met: criteria.hasLower },
    { label: 'One number (0-9)', met: criteria.hasNumber },
    { label: 'One special symbol (!@#$...)', met: criteria.hasSpecial },
  ];

  return (
    <div style={{ marginTop: '8px', marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Password Strength:</span>
        <span style={{ fontSize: '11px', fontWeight: 700, color: strengthColor }}>{strengthLabel}</span>
      </div>
      <div style={{
        height: '4px',
        width: '100%',
        backgroundColor: 'rgba(148, 163, 184, 0.2)',
        borderRadius: '2px',
        overflow: 'hidden',
        marginBottom: '8px'
      }}>
        <div style={{
          height: '100%',
          width: `${progressPercent}%`,
          backgroundColor: strengthColor,
          transition: 'width 0.3s ease, background-color 0.3s ease'
        }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '4px' }}>
        {items.map((item, idx) => (
          <div key={idx} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '10px',
            color: item.met ? 'var(--success, #10b981)' : 'var(--text-muted)'
          }}>
            {item.met ? <Check size={11} strokeWidth={3} /> : <X size={11} />}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
