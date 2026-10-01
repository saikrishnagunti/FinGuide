import { Link } from 'react-router-dom';

/**
 * FinGuide Brand Logo Button
 * Clicking this button redirects the user to the main landing page (/)
 */
export default function BrandLogo({
  to = '/',
  size = 'md',
  showSubtitle = false,
  className = '',
  style = {}
}) {
  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 24 : 20;
  const boxSize = size === 'sm' ? '32px' : size === 'lg' ? '44px' : '38px';
  const fontSize = size === 'sm' ? '1.1rem' : size === 'lg' ? '1.45rem' : '1.25rem';

  return (
    <Link
      to={to}
      className={`brand-logo-btn ${className}`}
      title="FinGuide - Return to Main Page"
      aria-label="FinGuide Main Page"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size === 'sm' ? '8px' : '12px',
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        ...style
      }}
    >
      <div
        className="brand-icon-box"
        style={{
          width: boxSize,
          height: boxSize,
          borderRadius: size === 'sm' ? '8px' : '11px',
          background: 'linear-gradient(135deg, #00ABE4 0%, #178582 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 4px 14px rgba(0, 171, 228, 0.35)',
          flexShrink: 0,
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
        <span
          className="brand-name-text"
          style={{
            fontSize,
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: 'var(--text-primary)',
            transition: 'color 0.2s ease'
          }}
        >
          FinGuide
        </span>
        {showSubtitle && (
          <span
            style={{
              fontSize: '0.625rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: 'var(--accent-primary)',
              textTransform: 'uppercase'
            }}
          >
            AI WEALTH OS
          </span>
        )}
      </div>
    </Link>
  );
}
