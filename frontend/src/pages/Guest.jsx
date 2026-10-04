import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '../utils/api';
import BrandLogo from '../components/BrandLogo';
import {
  Sparkles,
  Upload,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Printer,
  UserPlus,
  RefreshCw,
  ArrowRight,
  HelpCircle,
  Layers,
  ChevronRight,
  Info,
  Send,
  Bot,
  MessageSquare,
} from 'lucide-react';

const auditMarkdownComponents = {
  table: ({ node, ...props }) => (
    <div className="audit-table-container">
      <table className="audit-table" {...props} />
    </div>
  ),
  th: ({ node, ...props }) => <th className="audit-th" {...props} />,
  td: ({ node, children, ...props }) => {
    const text = Array.isArray(children)
      ? children.map(c => (typeof c === 'string' ? c : (c?.props?.children || ''))).join(' ')
      : String(children || '');

    if (/high concentration|critical|deficit/i.test(text)) {
      return (
        <td className="audit-td" {...props}>
          <span className="audit-pill audit-pill-danger">{children}</span>
        </td>
      );
    }
    if (/moderate|caution|warning/i.test(text)) {
      return (
        <td className="audit-td" {...props}>
          <span className="audit-pill audit-pill-warning">{children}</span>
        </td>
      );
    }
    if (/controlled|optimal|sound|low/i.test(text)) {
      return (
        <td className="audit-td" {...props}>
          <span className="audit-pill audit-pill-success">{children}</span>
        </td>
      );
    }
    return <td className="audit-td tabular-nums" {...props}>{children}</td>;
  },
  blockquote: ({ node, ...props }) => (
    <div className="audit-callout">
      <blockquote {...props} />
    </div>
  ),
  h2: ({ node, ...props }) => <h3 className="audit-heading" {...props} />,
  h3: ({ node, ...props }) => <h3 className="audit-heading" {...props} />,
  ul: ({ node, ...props }) => <ul className="audit-checklist" {...props} />,
  ol: ({ node, ...props }) => <ol className="audit-directives" {...props} />,
  li: ({ node, ...props }) => <li className="audit-item" {...props} />,
  hr: () => <hr className="audit-divider" />,
};

const SAMPLE_INCOME = {
  Salary: 125000,
  Freelance: 25000,
  Investments: 5000,
  'Other Income': 0,
};

const SAMPLE_EXPENSES = {
  Housing: 35000,
  Groceries: 18000,
  'Food & Dining': 12000,
  Utilities: 6500,
  Transportation: 8000,
  Entertainment: 5000,
  Shopping: 7500,
  Healthcare: 3000,
  'Debt / Loans': 15000,
  Miscellaneous: 2000,
};

export default function Guest() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Active input mode: 'form', 'upload', or 'both'
  const [activeTab, setActiveTab] = useState('form');

  // I&E Form State
  const [incomeData, setIncomeData] = useState({
    Salary: '',
    Freelance: '',
    Investments: '',
    'Other Income': '',
  });

  const [expenseData, setExpenseData] = useState({
    Housing: '',
    Groceries: '',
    'Food & Dining': '',
    Utilities: '',
    Transportation: '',
    Entertainment: '',
    Shopping: '',
    Healthcare: '',
    'Debt / Loans': '',
    Miscellaneous: '',
  });

  // Bank Statement Upload State
  const [statementFile, setStatementFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [parsedStatement, setParsedStatement] = useState(null);
  const [statementTransactions, setStatementTransactions] = useState([]);
  const [uploadError, setUploadError] = useState('');

  // Analysis State
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState('');

  // Guest Advisor Chat State
  const [advisorMessages, setAdvisorMessages] = useState([]);
  const [advisorInput, setAdvisorInput] = useState('');
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [advisorError, setAdvisorError] = useState('');
  const advisorEndRef = useRef(null);
  const guestAdvisorInputRef = useRef(null);

  const guestQuickPrompts = [
    '💡 How can I cut spending in my highest category?',
    '📊 Propose a realistic 50/30/20 monthly budget',
    '🛡️ How much emergency fund should I set aside?',
    '📈 Where should I allocate my monthly cash surplus?',
    '⚠️ Are there any hidden cash leaks in my transactions?',
  ];

  // Auto-scroll advisor messages on update
  useEffect(() => {
    if (analysisResult && advisorMessages.length > 1) {
      advisorEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [advisorMessages, advisorLoading, analysisResult]);

  // Calculations for I&E Form
  const calcFormTotalIncome = () =>
    Object.values(incomeData).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);

  const calcFormTotalExpenses = () =>
    Object.values(expenseData).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);

  const formIncome = calcFormTotalIncome();
  const formExpenses = calcFormTotalExpenses();
  const formNetSavings = formIncome - formExpenses;
  const formSavingsRate = formIncome > 0 ? ((formNetSavings / formIncome) * 100).toFixed(1) : 0;

  // Handlers for Form
  const handleIncomeChange = (field, val) => {
    setIncomeData(prev => ({ ...prev, [field]: val }));
  };

  const handleExpenseChange = (field, val) => {
    setExpenseData(prev => ({ ...prev, [field]: val }));
  };

  const handleLoadSampleData = () => {
    setIncomeData(SAMPLE_INCOME);
    setExpenseData(SAMPLE_EXPENSES);
  };

  const handleClearForm = () => {
    setIncomeData({
      Salary: '',
      Freelance: '',
      Investments: '',
      'Other Income': '',
    });
    setExpenseData({
      Housing: '',
      Groceries: '',
      'Food & Dining': '',
      Utilities: '',
      Transportation: '',
      Entertainment: '',
      Shopping: '',
      Healthcare: '',
      'Debt / Loans': '',
      Miscellaneous: '',
    });
    setAdvisorMessages([]);
    setAdvisorInput('');
    setAdvisorError('');
  };

  // Handlers for Statement Upload
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatementFile(file);
    setUploadError('');
    setUploadLoading(true);

    try {
      const res = await api.guestParseStatement(file);
      setParsedStatement(res.summary || {});
      setStatementTransactions(res.transactions || []);
    } catch (err) {
      setUploadError(err.message || 'Failed to parse statement. Please check file format.');
      setParsedStatement(null);
      setStatementTransactions([]);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleRemoveTransaction = (tempId) => {
    setStatementTransactions(prev => prev.filter(t => t.temp_id !== tempId));
  };

  const handleClearStatement = () => {
    setStatementFile(null);
    setParsedStatement(null);
    setStatementTransactions([]);
    setUploadError('');
    setAdvisorMessages([]);
    setAdvisorInput('');
    setAdvisorError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Send message to Guest AI Advisor
  const handleSendGuestAdvisor = async (promptText) => {
    const text = (promptText || advisorInput).trim();
    if (!text || advisorLoading) return;

    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...advisorMessages, userMsg];
    setAdvisorMessages(updatedMessages);
    setAdvisorInput('');
    setAdvisorLoading(true);
    setAdvisorError('');

    try {
      const cleanIncome = {};
      Object.entries(incomeData).forEach(([k, v]) => {
        const num = parseFloat(v);
        if (num > 0) cleanIncome[k] = num;
      });

      const cleanExpenses = {};
      Object.entries(expenseData).forEach(([k, v]) => {
        const num = parseFloat(v);
        if (num > 0) cleanExpenses[k] = num;
      });

      const history = updatedMessages
        .slice(-10)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await api.guestChat(text, history, {
        income_data: cleanIncome,
        expense_data: cleanExpenses,
        transactions: statementTransactions,
        audit_summary: analysisResult?.raw_text || analysisResult?.summary || '',
      });

      setAdvisorMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: res.reply || res.raw_text || res.response || 'I evaluated your session figures, but could not formulate a response. Please try rephrasing.',
        },
      ]);
    } catch (err) {
      console.error('Guest advisor error:', err);
      setAdvisorError(err.message || 'Unable to connect to AI Advisor.');
      setAdvisorMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ ${err.message || 'Failed to reach the advisor service. Please verify server connectivity.'}`,
        },
      ]);
    } finally {
      setAdvisorLoading(false);
    }
  };

  // Run Guest Analysis
  const handleRunAnalysis = async () => {
    setAnalysisError('');
    setAnalyzing(true);

    try {
      // Build clean income and expense objects from form (excluding zeros/empties)
      const cleanIncome = {};
      Object.entries(incomeData).forEach(([k, v]) => {
        const num = parseFloat(v);
        if (num > 0) cleanIncome[k] = num;
      });

      const cleanExpenses = {};
      Object.entries(expenseData).forEach(([k, v]) => {
        const num = parseFloat(v);
        if (num > 0) cleanExpenses[k] = num;
      });

      const hasForm = Object.keys(cleanIncome).length > 0 || Object.keys(cleanExpenses).length > 0;
      const hasTxns = statementTransactions.length > 0;

      if (!hasForm && !hasTxns) {
        setAnalysisError('Please enter some Income & Expense values or upload a statement to generate your audit.');
        setAnalyzing(false);
        return;
      }

      const res = await api.guestAnalyze(
        hasForm ? cleanIncome : null,
        hasForm ? cleanExpenses : null,
        hasTxns ? statementTransactions : [],
        'Provide a comprehensive single-session financial audit, category breakdown, simple monthly budget, and 3-5 clear recommendations.'
      );

      setAnalysisResult(res);

      // Initialize guest advisor welcome message with audit telemetry
      const quick = res?.sections?.find(s => s.title === 'Quick Stats')?.data || {};
      const inc = Number(quick.total_income ?? formIncome ?? 0);
      const exp = Number(quick.total_expenses ?? formExpenses ?? 0);
      const net = Number(quick.net_savings ?? (inc - exp));
      const rate = Number(quick.savings_rate ?? (inc > 0 ? ((net / inc) * 100).toFixed(1) : 0));
      const topCat = quick.top_categories?.[0]?.category;

      setAdvisorMessages([
        {
          role: 'assistant',
          content: `Hi! 👋 I'm **FinGuide AI**, your companion financial advisor for this session.\n\nI have reviewed your Financial Audit: your verified monthly inflow is **₹${inc.toLocaleString()}** and outflows are **₹${exp.toLocaleString()}**, resulting in an operating cash flow of **₹${net.toLocaleString()}** (${rate}% savings rate)${topCat ? `. Your largest expenditure center is **${topCat}**` : ''}.\n\nAsk me anything below about this audit — such as how to cut your top categories, benchmark against the 50/30/20 rule, or plan for a big purchase!`,
        },
      ]);

      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById('guest-audit-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err) {
      console.error('Guest analysis error:', err);
      setAnalysisError(err.message || 'Failed to generate financial audit. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Determine effective quick stats
  const quickStats = analysisResult?.sections?.find(s => s.title === 'Quick Stats')?.data || {};
  const totalIncomeVal = Number(quickStats.total_income ?? formIncome ?? 0);
  const totalExpensesVal = Number(quickStats.total_expenses ?? formExpenses ?? 0);
  const netSavingsVal = Number(quickStats.net_savings ?? (totalIncomeVal - totalExpensesVal));
  const savingsRateVal = Number(quickStats.savings_rate ?? (totalIncomeVal > 0 ? ((netSavingsVal / totalIncomeVal) * 100).toFixed(1) : 0));
  const topCategories = quickStats.top_categories || [];

  return (
    <div className="guest-page-wrapper">
      {/* ── Top Navigation Bar ── */}
      <header className="guest-header">
        <div className="guest-header-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BrandLogo size="sm" />
            <span className="badge badge-primary">Guest Session</span>
          </div>
          <div className="guest-header-actions">
            <Link to="/login" className="btn btn-ghost btn-sm">Log In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              <UserPlus size={15} style={{ marginRight: '6px' }} />
              Create Free Account
            </Link>
          </div>
        </div>
      </header>

      {/* ── Guest Mode Hero Banner ── */}
      <section className="guest-hero-banner">
        <div className="guest-hero-content">
          <div className="guest-mode-pill">
            <ShieldCheck size={16} />
            <span>100% In-Memory Session • Zero Data Saved on Server</span>
          </div>
          <h1>Instant Financial Audit & Budgeting</h1>
          <p>
            Experience FinGuide’s AI advisor without an account. Fill out your current monthly income & expenses, 
            or upload a single bank statement to receive instant cash-flow diagnostics, category breakdowns, 
            and a tailored monthly budget.
          </p>
        </div>
      </section>

      {/* ── Main Input Card ── */}
      <main className="guest-main-container">
        <div className="card guest-input-card">
          {/* Tabs Selector */}
          <div className="guest-tabs-header">
            <button
              type="button"
              className={`guest-tab-btn ${activeTab === 'form' ? 'active' : ''}`}
              onClick={() => setActiveTab('form')}
            >
              <FileText size={18} />
              <span>1. Income & Expense Form</span>
              {formIncome > 0 && <span className="tab-indicator">Filled</span>}
            </button>
            <button
              type="button"
              className={`guest-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              <Upload size={18} />
              <span>2. Upload Bank Statement</span>
              {statementTransactions.length > 0 && (
                <span className="tab-indicator">{statementTransactions.length} txns</span>
              )}
            </button>
          </div>

          <div className="guest-tab-body">
            {/* ── TAB 1: I&E FORM ── */}
            {activeTab === 'form' && (
              <div className="guest-form-section">
                <div className="guest-section-toolbar">
                  <div>
                    <h3 className="guest-section-title">Monthly Cash Inflows & Outflows</h3>
                    <p className="guest-section-desc">
                      Enter your typical monthly figures or click "Load Sample Data" to preview an audit instantly.
                    </p>
                  </div>
                  <div className="guest-toolbar-btns">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleLoadSampleData}
                      title="Fill with realistic sample data"
                    >
                      <Sparkles size={14} style={{ marginRight: '6px', color: '#a5b4fc' }} />
                      Load Sample Data
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm text-danger"
                      onClick={handleClearForm}
                      title="Clear all fields"
                    >
                      <Trash2 size={14} style={{ marginRight: '6px' }} />
                      Clear Form
                    </button>
                  </div>
                </div>

                <div className="guest-ie-grid">
                  {/* Income Column */}
                  <div className="guest-ie-col income-col">
                    <div className="col-header">
                      <div className="col-header-title">
                        <TrendingUp size={18} style={{ color: 'var(--success)' }} />
                        <h4>Monthly Income (Inflows)</h4>
                      </div>
                      <span className="col-total">₹{(formIncome || 0).toLocaleString()}</span>
                    </div>

                    <div className="fields-grid">
                      {Object.keys(incomeData).map((field) => (
                        <div key={field} className="form-group">
                          <label>{field}</label>
                          <div className="input-prefix-wrapper">
                            <span className="input-prefix">₹</span>
                            <input
                              type="number"
                              className="form-input form-control"
                              placeholder="0"
                              min="0"
                              value={incomeData[field]}
                              onChange={(e) => handleIncomeChange(field, e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expenses Column */}
                  <div className="guest-ie-col expense-col">
                    <div className="col-header">
                      <div className="col-header-title">
                        <TrendingDown size={18} style={{ color: 'var(--danger)' }} />
                        <h4>Monthly Expenses (Outflows)</h4>
                      </div>
                      <span className="col-total">₹{(formExpenses || 0).toLocaleString()}</span>
                    </div>

                    <div className="fields-grid">
                      {Object.keys(expenseData).map((field) => (
                        <div key={field} className="form-group">
                          <label>{field}</label>
                          <div className="input-prefix-wrapper">
                            <span className="input-prefix">₹</span>
                            <input
                              type="number"
                              className="form-input form-control"
                              placeholder="0"
                              min="0"
                              value={expenseData[field]}
                              onChange={(e) => handleExpenseChange(field, e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Form Live Summary Ribbon */}
                {(formIncome > 0 || formExpenses > 0) && (
                  <div className="guest-form-summary-ribbon">
                    <div className="ribbon-metric">
                      <span>Total Income</span>
                      <strong>₹{(formIncome || 0).toLocaleString()}</strong>
                    </div>
                    <div className="ribbon-metric">
                      <span>Total Expenses</span>
                      <strong>₹{(formExpenses || 0).toLocaleString()}</strong>
                    </div>
                    <div className="ribbon-metric">
                      <span>Net Cash Flow</span>
                      <strong className={formNetSavings >= 0 ? 'text-success' : 'text-danger'}>
                        ₹{(formNetSavings || 0).toLocaleString()}
                      </strong>
                    </div>
                    <div className="ribbon-metric">
                      <span>Savings Rate</span>
                      <strong>{formSavingsRate}%</strong>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 2: BANK STATEMENT UPLOAD ── */}
            {activeTab === 'upload' && (
              <div className="guest-upload-section">
                <div className="guest-section-toolbar">
                  <div>
                    <h3 className="guest-section-title">Upload a Bank Statement</h3>
                    <p className="guest-section-desc">
                      Upload your bank statement PDF or CSV. Our in-memory parser extracts transactions for this session only without saving anything to a database.
                    </p>
                  </div>
                  {statementTransactions.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm text-danger"
                      onClick={handleClearStatement}
                    >
                      <Trash2 size={14} style={{ marginRight: '6px' }} />
                      Remove Statement
                    </button>
                  )}
                </div>

                {!statementTransactions.length ? (
                  <div
                    className={`dropzone-area ${uploadLoading ? 'loading' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept=".csv,.pdf,text/csv,application/pdf"
                      style={{ display: 'none' }}
                    />
                    <div className="dropzone-icon">
                      <Upload size={36} />
                    </div>
                    <h4>Drop your statement here, or click to browse</h4>
                    <p>Supports bank account PDF statements or CSV export files (up to 15MB)</p>
                    <div className="dropzone-badges">
                      <span className="badge badge-secondary">🔒 Private Preview</span>
                      <span className="badge badge-secondary">⚡ Instant Extraction</span>
                      <span className="badge badge-secondary">🛡️ No Data Saved</span>
                    </div>

                    {uploadLoading && (
                      <div className="dropzone-loading-overlay">
                        <div className="spinner" />
                        <span>Extracting statement transactions...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="statement-preview-wrapper">
                    {/* Statement Metadata Summary Card */}
                    <div className="statement-meta-card">
                      <div className="meta-left">
                        <div className="file-badge-icon">
                          <FileText size={24} />
                        </div>
                        <div>
                          <h4>{statementFile?.name || 'Bank Statement'}</h4>
                          <p>
                            {parsedStatement.period_start && parsedStatement.period_end
                              ? `Period: ${parsedStatement.period_start} to ${parsedStatement.period_end}`
                              : 'Parsed Bank Statement'}
                            {' • '}
                            <strong>{statementTransactions.length} transactions</strong>
                          </p>
                        </div>
                      </div>
                      <div className="meta-stats">
                        <div className="meta-stat-item">
                          <span>Total Inflows</span>
                          <strong className="text-success">
                            ₹{Number(parsedStatement?.total_income || 0).toLocaleString()}
                          </strong>
                        </div>
                        <div className="meta-stat-item">
                          <span>Total Outflows</span>
                          <strong className="text-danger">
                            ₹{Number(parsedStatement?.total_expenses || 0).toLocaleString()}
                          </strong>
                        </div>
                        <div className="meta-stat-item">
                          <span>Net</span>
                          <strong>₹{Number(parsedStatement?.net_savings || 0).toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Extracted Transactions Preview Table */}
                    <div className="parsed-transactions-table-wrap">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Type</th>
                            <th style={{ textAlign: 'right' }}>Amount</th>
                            <th style={{ width: '40px' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {statementTransactions.slice(0, 15).map((txn) => (
                            <tr key={txn.temp_id}>
                              <td style={{ whiteSpace: 'nowrap' }}>{txn.date}</td>
                              <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {txn.description}
                              </td>
                              <td>
                                <span className="badge badge-secondary">{txn.category}</span>
                              </td>
                              <td>
                                <span className={`badge ${txn.type === 'income' ? 'badge-success' : 'badge-danger'}`}>
                                  {txn.type}
                                </span>
                              </td>
                              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                ₹{Number(txn.amount || 0).toLocaleString()}
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => handleRemoveTransaction(txn.temp_id)}
                                  title="Remove transaction"
                                >
                                  <Trash2 size={13} style={{ color: 'var(--text-muted)' }} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {statementTransactions.length > 15 && (
                        <div className="table-more-hint">
                          Showing first 15 of {statementTransactions.length} parsed transactions. All {statementTransactions.length} will be included in the audit.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {uploadError && (
                  <div className="alert alert-danger" style={{ marginTop: 'var(--space-md)' }}>
                    <AlertCircle size={16} />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Main Action Bar ── */}
          <div className="guest-action-footer">
            <div className="footer-info">
              <Info size={16} style={{ color: 'var(--accent-primary)' }} />
              <span>
                {statementTransactions.length > 0 && (formIncome > 0 || formExpenses > 0)
                  ? 'Ready to analyze both your I&E entries and parsed bank statement transactions.'
                  : statementTransactions.length > 0
                  ? `Ready to analyze ${statementTransactions.length} statement transactions.`
                  : formIncome > 0 || formExpenses > 0
                  ? 'Ready to analyze your filled monthly Income & Expenses.'
                  : 'Fill the I&E form or upload a statement above to proceed.'}
              </span>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-lg"
              disabled={analyzing || (formIncome === 0 && formExpenses === 0 && statementTransactions.length === 0)}
              onClick={handleRunAnalysis}
            >
              {analyzing ? (
                <>
                  <div className="spinner-sm" />
                  Running AI Financial Audit...
                </>
              ) : (
                <>
                  <Sparkles size={18} style={{ marginRight: '8px' }} />
                  Generate Guest Financial Audit
                  <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                </>
              )}
            </button>
          </div>

          {analysisError && (
            <div className="alert alert-danger" style={{ margin: 'var(--space-md)' }}>
              <AlertCircle size={16} />
              <span>{analysisError}</span>
            </div>
          )}
        </div>

        {/* ── AUDIT RESULTS DISPLAY ── */}
        {analysisResult && (
          <section id="guest-audit-results" className="guest-results-section">
            {/* Document Header */}
            <div className="guest-report-toolbar">
              <div className="report-ref-badge">
                <FileText size={16} />
                <span>OFFICIAL GUEST FINANCIAL AUDIT</span>
                <span className="bullet">•</span>
                <code>SESSION-{Date.now().toString().slice(-6)}</code>
              </div>
              <div className="toolbar-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    document.getElementById('guest-advisor-section')?.scrollIntoView({ behavior: 'smooth' });
                    setTimeout(() => guestAdvisorInputRef.current?.focus(), 250);
                  }}
                  title="Ask FinGuide AI Advisor about this audit"
                >
                  <MessageSquare size={15} style={{ marginRight: '6px' }} />
                  Ask Advisor
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => window.print()}
                >
                  <Printer size={15} style={{ marginRight: '6px' }} />
                  Print / Export Report
                </button>
                <Link to="/register" className="btn btn-primary btn-sm">
                  <UserPlus size={15} style={{ marginRight: '6px' }} />
                  Save to Account
                </Link>
              </div>
            </div>

            {/* Document Article */}
            <article className="audit-document guest-audit-doc">
              {/* Document Letterhead */}
              <div className="audit-header">
                <div className="audit-letterhead" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="brand-icon-box" style={{ width: '36px', height: '36px', borderRadius: '8px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <div>
                    <h1>FINANCIAL AUDIT & DIAGNOSTIC REPORT</h1>
                    <p>Single-Session Cash Flow, Solvency & Spending Assessment (Guest Mode)</p>
                  </div>
                </div>
                <div className="audit-badge verified">GUEST SESSION VERIFIED</div>
              </div>

              {/* Client & Session Info */}
              <div className="audit-meta-grid">
                <div className="audit-meta-item">
                  <span className="audit-meta-label">Session User:</span>
                  <span className="audit-meta-val">Guest Explorer</span>
                </div>
                <div className="audit-meta-item">
                  <span className="audit-meta-label">Scope of Data:</span>
                  <span className="audit-meta-val">
                    {statementTransactions.length > 0 && formIncome > 0
                      ? 'I&E Form + Statement'
                      : statementTransactions.length > 0
                      ? `Bank Statement (${statementTransactions.length} txns)`
                      : 'Monthly I&E Form'}
                  </span>
                </div>
                <div className="audit-meta-item">
                  <span className="audit-meta-label">Audit Generated:</span>
                  <span className="audit-meta-val">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="audit-meta-item">
                  <span className="audit-meta-label">Persistence:</span>
                  <span className="audit-meta-val" style={{ color: 'var(--warning)' }}>In-Memory Only</span>
                </div>
              </div>

              {/* 1. Executive Summary Vitals */}
              <section className="audit-section">
                <div className="audit-section-heading">
                  <h3>1. Executive Financial Summary</h3>
                  <span className="section-pill">Core Vitals</span>
                </div>

                <div className="audit-vitals-grid">
                  <div className="vital-card income">
                    <span className="vital-label">Total Monthly Inflows</span>
                    <strong className="vital-value">₹{Number(totalIncomeVal || 0).toLocaleString()}</strong>
                    <span className="vital-subtext">Verified Current Session</span>
                  </div>
                  <div className="vital-card expense">
                    <span className="vital-label">Total Monthly Outflows</span>
                    <strong className="vital-value">₹{Number(totalExpensesVal || 0).toLocaleString()}</strong>
                    <span className="vital-subtext">Verified Current Session</span>
                  </div>
                  <div className="vital-card net">
                    <span className="vital-label">Net Monthly Cash Flow</span>
                    <strong className={`vital-value ${netSavingsVal >= 0 ? 'text-success' : 'text-danger'}`}>
                      ₹{Number(netSavingsVal || 0).toLocaleString()}
                    </strong>
                    <span className="vital-subtext">
                      {netSavingsVal >= 0 ? 'Surplus Cash Flow' : 'Deficit Cash Outflow'}
                    </span>
                  </div>
                  <div className="vital-card rate">
                    <span className="vital-label">Savings Rate</span>
                    <strong className="vital-value">{savingsRateVal}%</strong>
                    <span className="vital-subtext">
                      {savingsRateVal >= 20 ? 'Optimal (≥20%)' : savingsRateVal >= 10 ? 'Adequate (10-20%)' : 'Needs Optimization (<10%)'}
                    </span>
                  </div>
                </div>
              </section>

              {/* 2. Category-Wise Spending Breakdown */}
              {topCategories.length > 0 && (
                <section className="audit-section">
                  <div className="audit-section-heading">
                    <h3>2. Category-Wise Spending Breakdown</h3>
                    <span className="section-pill">Where Your Money Goes</span>
                  </div>

                  <div className="guest-category-breakdown-grid">
                    {topCategories.map((cat, idx) => (
                      <div key={idx} className="category-progress-item">
                        <div className="cat-label-row">
                          <span className="cat-name">{cat.category}</span>
                          <span className="cat-amt">
                            ₹{Number(cat.amount ?? cat.total ?? 0).toLocaleString()} ({cat.percentage || 0}%)
                          </span>
                        </div>
                        <div className="cat-progress-bar-bg">
                          <div
                            className="cat-progress-bar-fill"
                            style={{ width: `${Math.min(Number(cat.percentage || 0), 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 3. AI Diagnostic Analysis & Proposed Monthly Budget */}
              <section className="audit-section">
                <div className="audit-section-heading">
                  <h3>3. Diagnostic Insights & Proposed Monthly Budget</h3>
                  <span className="section-pill">AI Financial Insights</span>
                </div>

                <div className="audit-prose-content markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={auditMarkdownComponents}>
                    {analysisResult.raw_text || analysisResult.summary || ''}
                  </ReactMarkdown>
                </div>
              </section>

              {/* 4. Interactive Ask FinGuide AI Advisor */}
              <section id="guest-advisor-section" className="audit-section guest-advisor-section no-print">
                <div className="audit-section-heading">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bot size={20} style={{ color: 'var(--accent-primary)' }} />
                    <h3>4. Ask FinGuide Advisor About This Audit</h3>
                  </div>
                  <span className="section-pill" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }}>
                    Live AI Companion
                  </span>
                </div>

                <div className="guest-advisor-card">
                  <p className="guest-advisor-subtitle">
                    Have questions about your audited cash surplus of ₹{Number(netSavingsVal || 0).toLocaleString()}, optimizing your spending categories, or planning next steps? Ask FinGuide anything below.
                  </p>

                  {/* Suggested Question Chips */}
                  <div className="guest-advisor-chips-row">
                    <span className="chips-label">💡 Suggested Questions:</span>
                    <div className="guest-advisor-chips">
                      {guestQuickPrompts.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="advisor-chip"
                          disabled={advisorLoading}
                          onClick={() => handleSendGuestAdvisor(p)}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chat Conversation Thread */}
                  <div className="guest-advisor-messages-box">
                    {advisorMessages.map((msg, idx) => (
                      <div key={idx} className={`chat-message ${msg.role}`}>
                        <div className="chat-avatar">
                          {msg.role === 'assistant' ? <Bot size={16} /> : 'G'}
                        </div>
                        <div className="chat-content">
                          <div className="markdown-content">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    ))}

                    {advisorLoading && (
                      <div className="chat-message assistant">
                        <div className="chat-avatar"><Bot size={16} /></div>
                        <div className="chat-content">
                          <div className="chat-typing">
                            <span /><span /><span />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={advisorEndRef} />
                  </div>

                  {advisorError && (
                    <div className="alert alert-danger" style={{ margin: '8px 16px', fontSize: '13px' }}>
                      <AlertCircle size={15} />
                      <span>{advisorError}</span>
                    </div>
                  )}

                  {/* Chat Input Bar */}
                  <form
                    className="guest-advisor-input-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendGuestAdvisor();
                    }}
                  >
                    <input
                      ref={guestAdvisorInputRef}
                      type="text"
                      className="form-control"
                      placeholder="Ask your advisor a question about this audit (e.g. Can I afford a ₹50,000 trip?)..."
                      value={advisorInput}
                      onChange={(e) => setAdvisorInput(e.target.value)}
                      disabled={advisorLoading}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={advisorLoading || !advisorInput.trim()}
                      title="Send message to advisor"
                    >
                      {advisorLoading ? (
                        <div className="spinner-sm" style={{ width: '16px', height: '16px' }} />
                      ) : (
                        <Send size={16} />
                      )}
                      <span>Ask Advisor</span>
                    </button>
                  </form>

                  {/* Footer Bar */}
                  <div className="guest-advisor-bottom-bar">
                    <span className="guest-advisor-privacy-hint">
                      🔒 100% In-Memory Session • Private & Temporary
                    </span>
                    {advisorMessages.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs text-muted"
                        onClick={() => {
                          setAdvisorMessages([advisorMessages[0]]);
                        }}
                      >
                        <Trash2 size={12} style={{ marginRight: '4px' }} />
                        Reset Chat
                      </button>
                    )}
                  </div>
                </div>
              </section>

              {/* 5. Strategic Account Invitation CTA */}
              <div className="guest-account-invite-card no-print">
                <div className="invite-content">
                  <div className="invite-badge">
                    <Sparkles size={16} />
                    <span>Unlock Full FinGuide Capabilities</span>
                  </div>
                  <h3>Save This Audit & Track Your Financial Freedom</h3>
                  <p>
                    This audit is temporarily held in your browser memory and will reset once you close this tab. 
                    Create your free FinGuide account now to save this report, track month-over-month trends, 
                    set automated budget caps, and consult your persistent AI companion anytime.
                  </p>
                  <div className="invite-actions">
                    <Link to="/register" className="btn btn-primary btn-lg">
                      <UserPlus size={18} style={{ marginRight: '8px' }} />
                      Create Free Account
                    </Link>
                    <button
                      type="button"
                      className="btn btn-secondary btn-lg"
                      onClick={() => window.print()}
                    >
                      <Printer size={18} style={{ marginRight: '8px' }} />
                      Print / PDF Backup
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-lg"
                      onClick={() => {
                        setAnalysisResult(null);
                        setAdvisorMessages([]);
                        setAdvisorInput('');
                        setAdvisorError('');
                        handleClearForm();
                        handleClearStatement();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <RefreshCw size={18} style={{ marginRight: '8px' }} />
                      Start New Audit
                    </button>
                  </div>
                </div>
              </div>

              {/* Report Footer */}
              <div className="audit-footer">
                <div className="audit-signoff">
                  <div className="signoff-block">
                    <span className="signoff-label">Audited By:</span>
                    <p className="signoff-title">FinGuide Financial Intelligence</p>
                  </div>
                  <div className="signoff-block">
                    <span className="signoff-label">Session Mode:</span>
                    <p className="signoff-title">Guest Preview (Private & Temporary)</p>
                  </div>
                </div>
                <div className="audit-legal-disclaimer">
                  <strong>Notice:</strong> This guest financial audit is generated from session inputs for educational budgeting and cash-flow diagnostics. It does not constitute certified legal, investment, or tax advisory services.
                </div>
              </div>
            </article>
          </section>
        )}
      </main>

      {/* ── Floating Advisor Jump Button for Guest Mode ── */}
      {analysisResult && (
        <button
          type="button"
          className="advisor-fab no-print"
          onClick={() => {
            document.getElementById('guest-advisor-section')?.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => guestAdvisorInputRef.current?.focus(), 250);
          }}
          title="Ask FinGuide Advisor About This Audit"
          aria-label="Ask FinGuide Advisor"
        >
          <div className="advisor-fab-icon">
            <Sparkles size={18} />
          </div>
          <span className="advisor-fab-text">Ask Advisor</span>
          <span className="advisor-fab-pulse" />
        </button>
      )}
    </div>
  );
}
