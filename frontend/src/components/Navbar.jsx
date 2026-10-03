import { Menu, Sparkles, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ title, onMenuToggle }) {
  const { user } = useAuth();
  const { theme, toggleTheme, resetToSystem, isManual } = useTheme();
  const currency = user?.currency || '₹';

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          className="menu-toggle"
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
          title="Toggle Navigation"
        >
          <Menu size={20} />
        </button>
        <div className="navbar-heading">
          <span className="navbar-breadcrumb">WORKSPACE /</span>
          <h1 className="navbar-title">{title}</h1>
        </div>
      </div>

      <div className="navbar-actions">
        {/* Dynamic Light/Dark Theme Switcher (Synced with System by default) */}
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
          {theme === 'dark' ? (
            <>
              <Sun size={15} className="theme-icon sun" />
              <span className="theme-label">Light</span>
            </>
          ) : (
            <>
              <Moon size={15} className="theme-icon moon" />
              <span className="theme-label">Dark</span>
            </>
          )}
        </button>

        <div className="navbar-pill currency-pill" title={`Active display currency: ${currency}`}>
          <span className="currency-symbol">{currency}</span>
          <span className="currency-label">{currency === '₹' ? 'INR' : currency === '$' ? 'USD' : currency === '€' ? 'EUR' : currency === '£' ? 'GBP' : 'CURR'}</span>
        </div>

        <div className="navbar-pill ai-status-pill" title="AI Financial Advisor is active and ready">
          <span className="status-dot-pulse" />
          <Sparkles size={13} className="ai-icon" />
          <span className="status-text">AI Online</span>
        </div>
      </div>
    </header>
  );
}
