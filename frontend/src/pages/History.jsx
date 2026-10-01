import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Trash2, CreditCard, History as HistoryIcon } from 'lucide-react';

export default function History() {
  const { user } = useAuth();
  const currency = user?.currency || '₹';
  const [tab, setTab] = useState('snapshots');
  const [snapshots, setSnapshots] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (tab === 'snapshots') loadSnapshots();
    else loadTransactions();
  }, [tab, page]);

  async function loadSnapshots() {
    setLoading(true);
    try {
      const data = await api.getSnapshots();
      setSnapshots(data.snapshots || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadTransactions() {
    setLoading(true);
    try {
      const data = await api.getTransactions({ limit: 50, offset: page * 50 });
      setTransactions(data.transactions || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const deleteSnapshot = async (id) => {
    try {
      await api.deleteSnapshot(id);
      loadSnapshots();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await api.deleteTransaction(id);
      loadTransactions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>History</h2>
        <p>View and manage your saved financial data</p>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'snapshots' ? 'active' : ''}`} onClick={() => setTab('snapshots')}>
          I&E Snapshots
        </button>
        <button className={`tab ${tab === 'transactions' ? 'active' : ''}`} onClick={() => { setTab('transactions'); setPage(0); }}>
          Transactions
        </button>
      </div>

      {loading ? (
        <div className="page-loading"><div className="spinner" /><span>Loading...</span></div>
      ) : tab === 'snapshots' ? (
        snapshots.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-state-icon">📄</div>
            <h3>No snapshots saved</h3>
            <p>Go to Income & Expenses to save your first monthly snapshot.</p>
          </div>
        ) : (
          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Period</th>
                    <th style={{ textAlign: 'right' }}>Income</th>
                    <th style={{ textAlign: 'right' }}>Expenses</th>
                    <th style={{ textAlign: 'right' }}>Savings</th>
                    <th style={{ textAlign: 'right' }}>Rate</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {snapshots.map((s) => {
                    const rate = s.total_income > 0
                      ? ((s.net_savings / s.total_income) * 100).toFixed(1)
                      : '0';
                    return (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600 }}>
                          {new Date(s.year, s.month - 1).toLocaleString('en', { month: 'short', year: 'numeric' })}
                        </td>
                        <td className="tabular-nums" style={{ textAlign: 'right', color: 'var(--success)' }}>
                          {currency}{s.total_income.toLocaleString()}
                        </td>
                        <td className="tabular-nums" style={{ textAlign: 'right', color: 'var(--danger)' }}>
                          {currency}{s.total_expenses.toLocaleString()}
                        </td>
                        <td className="tabular-nums" style={{
                          textAlign: 'right', fontWeight: 600,
                          color: s.net_savings >= 0 ? 'var(--success)' : 'var(--danger)',
                        }}>
                          {currency}{s.net_savings.toLocaleString()}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className={`badge ${parseFloat(rate) >= 20 ? 'badge-success' : parseFloat(rate) >= 0 ? 'badge-warning' : 'badge-danger'}`}>
                            {rate}%
                          </span>
                        </td>
                        <td>
                          <button className="remove-btn" onClick={() => deleteSnapshot(s.id)}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        transactions.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-state-icon">
              <CreditCard size={36} />
            </div>
            <h3>No transactions</h3>
            <p>Upload a bank statement or add transactions manually.</p>
          </div>
        ) : (
          <div className="card">
            <div style={{ marginBottom: 'var(--space-sm)', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
              Showing {page * 50 + 1}–{Math.min((page + 1) * 50, total)} of {total}
            </div>
            <div className="table-container" style={{ maxHeight: '600px', overflow: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id}>
                      <td>{t.date}</td>
                      <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</td>
                      <td><span className="badge badge-info">{t.category}</span></td>
                      <td>
                        <span className={`badge ${t.type === 'income' ? 'badge-success' : 'badge-danger'}`}>{t.type}</span>
                      </td>
                      <td className="tabular-nums" style={{
                        textAlign: 'right', fontWeight: 600,
                        color: t.type === 'income' ? 'var(--success)' : 'var(--danger)',
                      }}>
                        {t.type === 'income' ? '+' : '-'}{currency}{t.amount.toLocaleString()}
                      </td>
                      <td>
                        <button className="remove-btn" onClick={() => deleteTransaction(t.id)}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {total > 50 && (
              <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)', justifyContent: 'center' }}>
                <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Previous</button>
                <button className="btn btn-ghost btn-sm" disabled={(page + 1) * 50 >= total} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
