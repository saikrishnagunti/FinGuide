import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, FileText, Upload, ClipboardList,
  Wallet, Bot, History, Target, LogOut, Settings
} from 'lucide-react';

const navItems = [
  { section: 'Overview' },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/analysis', label: 'Financial Audit', icon: ClipboardList },
  { section: 'Data Entry' },
  { path: '/ie-form', label: 'Income & Expenses', icon: FileText },
  { path: '/upload', label: 'Upload Statement', icon: Upload },
  { section: 'Planning' },
  { path: '/budget', label: 'Budget Planner', icon: Wallet },
  { path: '/goals', label: 'Goals', icon: Target },
  { path: '/history', label: 'History', icon: History },
  { section: 'AI Advisor' },
  { path: '/advisor', label: 'Ask Advisor', icon: Bot },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 99, display: 'none'
          }}
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="brand-icon-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="brand-text-container">
            <div className="brand-title">FinGuide</div>
            <div className="brand-subtitle">AI WEALTH OS</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, i) => {
            if (item.section) {
              return (
                <div key={i} className="sidebar-section-title">
                  {item.section}
                </div>
              );
            }

            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
                onClick={onClose}
              >
                <Icon size={18} className="sidebar-link-icon" />
                <span className="sidebar-link-text">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar">
              {user?.name ? user.name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'FG'}
            </div>
            <div className="sidebar-user-details">
              <div className="sidebar-user-name">
                {user?.name || 'User'}
              </div>
              <div className="sidebar-user-email">
                {user?.email || ''}
              </div>
            </div>
            <div className="sidebar-user-actions">
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `sidebar-action-btn ${isActive ? 'active' : ''}`
                }
                title="Settings & Data Management"
                aria-label="Settings"
                onClick={onClose}
              >
                <Settings size={16} />
              </NavLink>
              <button
                className="sidebar-action-btn logout"
                onClick={logout}
                title="Logout"
                aria-label="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
