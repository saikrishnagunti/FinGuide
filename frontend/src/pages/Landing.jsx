import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import BrandLogo from '../components/BrandLogo';
import { BarChart3, Shield, Zap, TrendingUp, Sun, Moon } from 'lucide-react';

export default function Landing() {
  const { user } = useAuth();
  const { theme, toggleTheme, resetToSystem, isManual } = useTheme();

  const features = [
    {
      icon: <BarChart3 size={28} />,
      title: 'Smart Analysis',
      desc: 'AI-powered spending insights that tell you where your money goes and what it means.',
    },
    {
      icon: <Shield size={28} />,
      title: 'Private & Secure',
      desc: 'Your financial data stays yours. End-to-end encrypted, never shared.',
    },
    {
      icon: <Zap size={28} />,
      title: 'Instant Budgets',
      desc: 'Get realistic budget proposals tailored to your actual spending patterns.',
    },
    {
      icon: <TrendingUp size={28} />,
      title: 'Track Progress',
      desc: 'Compare months, spot trends, and forecast your financial future.',
    },
  ];

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <BrandLogo size="sm" />
        <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
          {user ? (
            <Link to="/dashboard" className="btn btn-primary">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/guest" className="btn btn-ghost btn-sm" style={{ fontWeight: 600 }}>
                Continue as Guest
              </Link>
              <Link to="/register" className="btn btn-ghost btn-sm" style={{ fontWeight: 600 }}>
                Create Account
              </Link>
              <Link
                to="/login"
                className="btn btn-primary btn-sm"
                style={{
                  background: 'linear-gradient(135deg, #00ABE4 0%, #178582 100%)',
                  boxShadow: '0 4px 14px rgba(0, 171, 228, 0.45)',
                  padding: '8px 22px',
                  fontWeight: 800,
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                }}
              >
                LOG IN
              </Link>
            </>
          )}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            onDoubleClick={resetToSystem}
            aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            title={
              isManual
                ? `Current: ${theme === 'dark' ? 'Dark' : 'Light'} (Manual). Click to toggle, double-click for Auto-System.`
                : `Current: ${theme === 'dark' ? 'Dark' : 'Light'} (Auto-synced with System). Click to toggle.`
            }
          >
            {theme === 'dark' ? <Sun size={15} className="theme-icon sun" /> : <Moon size={15} className="theme-icon moon" />}
            <span className="theme-label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="hero-content">
          <h1>Your AI-Powered Personal Finance Advisor</h1>
          <p>
            Track income & expenses, upload bank statements, and get instant
            AI-driven insights, budgets, and forecasts — all in one beautiful dashboard.
          </p>

          <div className="hero-actions">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                Open Dashboard
              </Link>
            ) : (
              <div className="hero-actions-sketch-container">
                {/* Row 1: CREATE ACCOUNT & CONTINUE AS GUEST side-by-side */}
                <div className="hero-actions-top-row">
                  <Link
                    to="/register"
                    className="btn btn-secondary btn-lg hero-sub-action"
                  >
                    CREATE ACCOUNT
                  </Link>
                  <Link
                    to="/guest"
                    className="btn btn-secondary btn-lg hero-sub-action"
                  >
                    CONTINUE AS GUEST
                  </Link>
                </div>

                {/* Row 2: Prioritized full-width LOG IN button */}
                <Link
                  to="/login"
                  className="btn btn-primary btn-lg hero-login-prioritized"
                >
                  LOG IN
                </Link>
              </div>
            )}
          </div>
          {!user && (
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-md)' }}>
              ⚡ Instant single-session audit • No email or credit card needed • 100% in-memory
            </p>
          )}
        </div>
      </section>

      <section style={{
        position: 'relative', zIndex: 10,
        padding: 'var(--space-3xl) var(--space-2xl)',
        maxWidth: '1100px', margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-lg)'
        }}>
          {features.map((f, i) => (
            <div key={i} className="card" style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto var(--space-md)'
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>
                {f.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
