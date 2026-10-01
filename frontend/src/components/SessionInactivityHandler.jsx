import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Clock, LogOut, RefreshCw } from 'lucide-react';

const INACTIVITY_LIMIT_MS = 15 * 60 * 1000; // 15 minutes
const WARNING_BEFORE_MS = 2 * 60 * 1000;    // 2 minutes warning (at 13 minutes)

export default function SessionInactivityHandler() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(120);

  const lastActivityRef = useRef(Date.now());
  const timerCheckRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  const resetActivity = () => {
    lastActivityRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setShowWarning(false);
      return;
    }

    lastActivityRef.current = Date.now();

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleUserActivity = () => {
      // If modal is not active, touch activity updates timestamp
      if (!showWarning) {
        lastActivityRef.current = Date.now();
      }
    };

    activityEvents.forEach(evt => window.addEventListener(evt, handleUserActivity, { passive: true }));

    // Periodic check every 5 seconds
    timerCheckRef.current = setInterval(() => {
      const idleTime = Date.now() - lastActivityRef.current;
      const timeLeft = INACTIVITY_LIMIT_MS - idleTime;

      if (timeLeft <= 0) {
        // Inactivity exceeded -> logout
        clearInterval(timerCheckRef.current);
        clearInterval(countdownIntervalRef.current);
        logout();
        navigate('/login?reason=inactivity');
      } else if (timeLeft <= WARNING_BEFORE_MS) {
        setShowWarning(true);
        setSecondsRemaining(Math.ceil(timeLeft / 1000));
      } else {
        setShowWarning(false);
      }
    }, 5000);

    return () => {
      activityEvents.forEach(evt => window.removeEventListener(evt, handleUserActivity));
      clearInterval(timerCheckRef.current);
      clearInterval(countdownIntervalRef.current);
    };
  }, [user, showWarning, logout, navigate]);

  // Handle countdown tick when warning is visible
  useEffect(() => {
    if (!showWarning) return;

    countdownIntervalRef.current = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          logout();
          navigate('/login?reason=inactivity');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownIntervalRef.current);
  }, [showWarning, logout, navigate]);

  if (!showWarning || !user) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(10, 24, 40, 0.75)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        background: 'var(--bg-card, #0D1E33)',
        border: '1px solid rgba(225, 29, 72, 0.35)',
        borderRadius: '16px',
        padding: '28px',
        maxWidth: '440px',
        width: '100%',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        textAlign: 'center',
        animation: 'materialize 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'rgba(225, 29, 72, 0.12)',
          color: 'var(--danger, #ef4444)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          border: '1px solid rgba(225, 29, 72, 0.3)'
        }}>
          <ShieldAlert size={28} />
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-primary)' }}>
          Session Inactivity Warning
        </h3>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 20px' }}>
          For your financial data security, your active FinGuide session will automatically close due to inactivity.
        </p>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 18px',
          background: 'rgba(225, 29, 72, 0.08)',
          border: '1px solid rgba(225, 29, 72, 0.25)',
          borderRadius: '24px',
          color: 'var(--danger, #ef4444)',
          fontWeight: 700,
          fontSize: '16px',
          fontFamily: 'var(--font-mono, monospace)',
          marginBottom: '24px'
        }}>
          <Clock size={18} />
          <span>Auto-logout in {timeFormatted}</span>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            style={{ flex: 1 }}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={resetActivity}
            style={{ flex: 1.3 }}
          >
            <RefreshCw size={15} />
            <span>Stay Logged In</span>
          </button>
        </div>
      </div>
    </div>
  );
}
