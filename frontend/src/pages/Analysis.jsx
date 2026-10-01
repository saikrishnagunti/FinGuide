import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useAdvisor } from '../context/AdvisorContext';
import ReactMarkdown from 'react-markdown';
import {
  FileText,
  Printer,
  Calendar,
  Sparkles,
  RotateCw,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  PiggyBank,
  Wallet,
  ArrowRight,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  Search,
} from 'lucide-react';

const PERIOD_OPTIONS = [
  { value: 'current', label: 'This Month (Current)' },
  { value: 'last_month', label: 'Last Month' },
  { value: '3_months', label: 'Last 3 Months' },
  { value: '6_months', label: 'Last 6 Months' },
  { value: '12_months', label: 'Last 12 Months' },
  { value: 'all', label: 'All-Time Historical' },
];

export default function Analysis() {
  const { user } = useAuth();
  const { openAdvisor } = useAdvisor();

  const [period, setPeriod] = useState('current');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [showCustomQuery, setShowCustomQuery] = useState(false);

  // Auto-run analysis when page loads or when period changes
  useEffect(() => {
    runAnalysis();
  }, [period]);

  const runAnalysis = async (customQuery) => {
    setLoading(true);
    setError('');
    try {
      const selectedPeriodObj = PERIOD_OPTIONS.find(p => p.value === period);
      const periodLabel = selectedPeriodObj ? selectedPeriodObj.label : period;

      const data = await api.analyze({
        query: customQuery || query || `Provide a comprehensive formal Financial Audit report for ${periodLabel}`,
        period,
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to complete financial audit');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePlanWithAdvisor = () => {
    const periodLabel = PERIOD_OPTIONS.find(p => p.value === period)?.label || 'Current Period';
    const insightsList = result?.insights || [];
    const insightsSummary = insightsList.length > 0
      ? insightsList.map((ins, i) => `${i + 1}. ${ins}`).join('\n')
      : 'Review of income, expenditure, and savings rate.';

    const prompt = `I just reviewed my formal Financial Audit report (${periodLabel}).\n\nKey Audit Findings:\n${insightsSummary}\n\nBased on these diagnostic findings, help me build an actionable financial plan: propose realistic monthly budget caps, highlight top expenses to cut, and suggest milestones to grow my savings.`;

    openAdvisor(prompt);
  };

  const quickPrompts = [
    'Analyze category burn rates & discretionary spending',
    'Where is money leaking without clear value?',
    'Evaluate my emergency fund & savings runway',
    'Benchmark my spending against the 50/30/20 framework',
  ];

  const currentPeriodLabel = PERIOD_OPTIONS.find(p => p.value === period)?.label || 'This Month';
  const currentDateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const docId = `AUD-${user?.id || '01'}-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  const stats = result?.sections?.find(s => s.title === 'Quick Stats')?.data;
  const totalIncome = stats?.total_income ?? 0;
  const totalExpenses = stats?.total_expenses ?? 0;
  const netSavings = stats?.net_savings ?? (totalIncome - totalExpenses);
  const savingsRate = stats?.savings_rate ?? (totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0);

  return (
    <div className="audit-page-container">
      {/* ── Document Top Toolbar ── */}
      <header className="report-toolbar no-print">
        <div className="report-toolbar-left">
          <div className="report-badge">
            <FileText size={16} />
            <span>FINANCIAL AUDIT REPORT</span>
          </div>
          <span className="report-meta">
            Ref: <code>{docId}</code> • Status: <strong>Verified</strong>
          </span>
        </div>

        <div className="report-toolbar-right">
          {/* Date / Period Picker */}
          <div className="period-picker-wrapper">
            <Calendar size={14} className="period-picker-icon" />
            <select
              className="period-select"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              disabled={loading}
              title="Select Audit Period"
            >
              {PERIOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Export / Print Report Button */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handlePrint}
            title="Export or print formal audit report"
          >
            <Printer size={15} />
            <span>Export / Print Report</span>
          </button>

          {/* Re-Audit Button */}
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => runAnalysis()}
            disabled={loading}
            title="Re-run diagnostic audit"
          >
            <RotateCw size={14} className={loading ? 'spinning' : ''} />
            <span>{loading ? 'Auditing...' : 'Re-Run Audit'}</span>
          </button>

          {/* Toggle Custom Query Bar */}
          <button
            type="button"
            className={`btn btn-ghost btn-sm ${showCustomQuery ? 'active' : ''}`}
            onClick={() => setShowCustomQuery(!showCustomQuery)}
            title="Ask specific audit question"
          >
            <Search size={14} />
          </button>
        </div>
      </header>

      {/* Optional Custom Query Collapsible Drawer (No-Print) */}
      {showCustomQuery && (
        <div className="card custom-query-card no-print">
          <div className="card-title" style={{ fontSize: '13px', marginBottom: '8px' }}>
            🔍 Focus Diagnostic on Specific Question
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Analyze my discretionary dining vs grocery spending..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runAnalysis(query)}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => runAnalysis(query)}
              disabled={loading}
            >
              <Sparkles size={16} />
              Run
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '11px', padding: '3px 8px' }}
                onClick={() => {
                  setQuery(p);
                  runAnalysis(p);
                }}
                disabled={loading}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <div className="alert alert-danger no-print">{error}</div>}

      {/* ── Document-Style Report Body ── */}
      <article className="audit-document">
        {/* Document Header & Formal Letterhead */}
        <header className="audit-doc-header">
          <div className="audit-letterhead-top">
            <div className="audit-org" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="brand-icon-box" style={{ width: '36px', height: '36px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <h1 className="audit-title">FINANCIAL AUDIT & DIAGNOSTIC REPORT</h1>
                <p className="audit-subtitle">Comprehensive Cash Flow, Solvency & Spending Assessment</p>
              </div>
            </div>
            <div className="audit-doc-badge">
              <ShieldCheck size={16} />
              <span>OFFICIAL DIAGNOSTIC</span>
            </div>
          </div>

          <div className="audit-meta-grid">
            <div className="audit-meta-item">
              <span className="audit-meta-label">Client Name:</span>
              <strong className="audit-meta-val">{user?.name || 'Authorized User'}</strong>
            </div>
            <div className="audit-meta-item">
              <span className="audit-meta-label">Audit Period:</span>
              <strong className="audit-meta-val">{currentPeriodLabel}</strong>
            </div>
            <div className="audit-meta-item">
              <span className="audit-meta-label">Generated Date:</span>
              <strong className="audit-meta-val">{currentDateStr}</strong>
            </div>
            <div className="audit-meta-item">
              <span className="audit-meta-label">Document Ref:</span>
              <strong className="audit-meta-val">{docId}</strong>
            </div>
          </div>
        </header>

        {/* Loading Skeleton */}
        {loading && (
          <div className="card page-loading" style={{ minHeight: '320px', margin: 'var(--space-xl) 0' }}>
            <div className="spinner" />
            <h3 style={{ marginTop: 'var(--space-md)' }}>Synthesizing Financial Audit...</h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
              Analyzing statement records, calculating spending trends, and evaluating cash flow health...
            </p>
          </div>
        )}

        {/* Audit Content */}
        {!loading && result && (
          <div className="audit-doc-body">
            {/* 1. Executive Summary: Core Financial Vitals */}
            <section className="audit-section">
              <div className="audit-section-heading">
                <h3>1. Executive Financial Summary</h3>
                <span className="audit-section-tag">Key Vitals</span>
              </div>

              <div className="stat-cards audit-vitals-grid">
                <div className="card stat-card income">
                  <div className="card-header">
                    <span className="card-title">Audited Income</span>
                    <div className="stat-card-icon"><TrendingUp size={18} /></div>
                  </div>
                  <div className="card-value tabular-nums">{user?.currency || '₹'}{totalIncome.toLocaleString()}</div>
                  <div className="card-subtitle">{currentPeriodLabel}</div>
                </div>

                <div className="card stat-card expense">
                  <div className="card-header">
                    <span className="card-title">Audited Expenditure</span>
                    <div className="stat-card-icon"><TrendingDown size={18} /></div>
                  </div>
                  <div className="card-value tabular-nums">{user?.currency || '₹'}{totalExpenses.toLocaleString()}</div>
                  <div className="card-subtitle">{currentPeriodLabel}</div>
                </div>

                <div className="card stat-card savings">
                  <div className="card-header">
                    <span className="card-title">Net Cash Flow</span>
                    <div className="stat-card-icon"><PiggyBank size={18} /></div>
                  </div>
                  <div className="card-value tabular-nums" style={{ color: netSavings >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {netSavings < 0 ? '-' : ''}{user?.currency || '₹'}{Math.abs(netSavings).toLocaleString()}
                  </div>
                  <div className="card-subtitle">{netSavings >= 0 ? 'Surplus Cash Flow' : 'Deficit / Overdraft'}</div>
                </div>

                <div className="card stat-card rate">
                  <div className="card-header">
                    <span className="card-title">Savings Rate</span>
                    <div className="stat-card-icon"><Wallet size={18} /></div>
                  </div>
                  <div className="card-value">{savingsRate}%</div>
                  <div className="card-subtitle">
                    {savingsRate >= 20 ? 'Optimal (≥20%)' : savingsRate >= 10 ? 'Adequate (10-20%)' : 'Caution (<10%)'}
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Formal Analysis & Breakdown Narrative */}
            <section className="audit-section">
              <div className="audit-section-heading">
                <h3>2. Diagnostic Analysis & Breakdown</h3>
                <span className="audit-section-tag">Detailed Findings</span>
              </div>
              <div className="audit-narrative-card">
                <div className="markdown-content">
                  <ReactMarkdown>{result.raw_text}</ReactMarkdown>
                </div>
              </div>
            </section>

            {/* 3. Key Audit Insights */}
            {result.insights?.length > 0 && (
              <section className="audit-section">
                <div className="audit-section-heading">
                  <h3>3. Strategic Audit Findings</h3>
                  <span className="audit-section-tag">Key Takeaways</span>
                </div>

                <div className="audit-insights-box">
                  <ul className="insights-list">
                    {result.insights.map((insight, idx) => (
                      <li key={idx} className="insight-item">
                        <span className="insight-icon">🔍</span>
                        <div className="insight-body">
                          <strong>Finding #{idx + 1}:</strong> {insight}
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* ── ACTION BUTTON REQUIRED BY USER ── */}
                  {/* [ 💬 Plan with Advisor → ] button right under the generated insights */}
                  <div className="plan-with-advisor-card no-print">
                    <div className="plan-with-advisor-content">
                      <div className="plan-with-advisor-icon">
                        <MessageSquare size={24} />
                      </div>
                      <div>
                        <h4>Ready to act on these audit findings?</h4>
                        <p>
                          Open an instant planning session with your AI Advisor to set budget caps, trim high-burn categories, and lock in savings goals.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary btn-plan-advisor"
                      onClick={handlePlanWithAdvisor}
                      title="Open Advisor Companion to build an actionable plan"
                    >
                      <span>💬 Plan with Advisor →</span>
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* 4. Audit Sign-Off & Disclaimer Footer */}
            <footer className="audit-doc-footer">
              <div className="audit-signoff-grid">
                <div>
                  <div className="audit-signoff-line" />
                  <span className="audit-signoff-label">Prepared By:</span>
                  <p className="audit-signoff-name">FinGuide Financial Intelligence</p>
                </div>
                <div>
                  <div className="audit-signoff-line" />
                  <span className="audit-signoff-label">Certified For:</span>
                  <p className="audit-signoff-name">{user?.name || 'Account Holder'}</p>
                </div>
              </div>

              <div className="audit-disclaimer-note">
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Audit Disclaimer:</strong> This Financial Audit is generated automatically from your uploaded statements and snapshot ledger records for educational budgeting and cash-flow diagnostics. It does not constitute certified tax, legal, or investment advice.
                </span>
              </div>
            </footer>
          </div>
        )}

        {/* Empty state if user has no data yet */}
        {!loading && !result && (
          <div className="card empty-state" style={{ margin: 'var(--space-2xl) 0' }}>
            <div className="empty-state-icon">
              <FileText size={36} />
            </div>
            <h3>No Statement or Snapshot Records Available</h3>
            <p>Upload a bank statement or add your monthly income & expenses to generate your formal Financial Audit.</p>
          </div>
        )}
      </article>
    </div>
  );
}
