import { useState } from 'react';
import { api } from '../utils/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Wallet, Sparkles, FileText, CheckCircle2, Info, Lightbulb } from 'lucide-react';

export default function Budget() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const generateBudget = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getBudgetProposal();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Budget Planner</h2>
        <p>Get an AI-generated budget proposal based on your actual spending patterns</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {!result && !loading && (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 'var(--radius-lg)',
            background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto var(--space-lg)', fontSize: '2rem',
          }}>
            <Wallet size={32} />
          </div>
          <h3 style={{ marginBottom: 'var(--space-sm)' }}>Generate Your Budget</h3>
          <p style={{
            color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)',
            maxWidth: '500px', margin: '0 auto var(--space-lg)',
          }}>
            Our AI will analyze your income, expenses, and spending history
            to create a realistic, personalized monthly budget.
          </p>
          <button className="btn btn-primary btn-lg" onClick={generateBudget} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} /> Generate Budget Proposal
          </button>
        </div>
      )}

      {loading && (
        <div className="card page-loading" style={{ minHeight: '200px' }}>
          <div className="spinner" />
          <span>Creating your personalized budget...</span>
        </div>
      )}

      {result && !loading && (
        <div>
          <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="card-header">
              <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} style={{ color: 'var(--accent-primary)' }} />
                Your Budget Proposal
              </span>
              <button className="btn btn-secondary btn-sm" onClick={generateBudget}>
                Regenerate
              </button>
            </div>
            <div className="markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.raw_text}</ReactMarkdown>
            </div>
          </div>

          {result.insights?.length > 0 && (
            <div className="card">
              <div className="card-header">
                <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lightbulb size={18} style={{ color: 'var(--warning)' }} />
                  Budget Insights
                </span>
              </div>
              <ul className="insights-list">
                {result.insights.map((insight, i) => (
                  <li key={i} className="insight-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--success)', marginTop: '3px', flexShrink: 0 }} />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="alert alert-info" style={{ marginTop: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={18} style={{ flexShrink: 0 }} />
            <span>This budget is based on your recent spending patterns. It is educational guidance, not formal financial advice.</span>
          </div>
        </div>
      )}
    </div>
  );
}
