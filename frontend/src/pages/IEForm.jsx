import { useState } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Save, TrendingUp, TrendingDown } from 'lucide-react';

const DEFAULT_INCOME = [
  { label: 'Salary', amount: '' },
  { label: 'Freelance / Side Income', amount: '' },
];

const DEFAULT_EXPENSES = [
  { label: 'Rent / Housing', amount: '' },
  { label: 'Groceries', amount: '' },
  { label: 'Utilities', amount: '' },
  { label: 'Transport', amount: '' },
  { label: 'Dining Out', amount: '' },
  { label: 'Shopping', amount: '' },
  { label: 'Entertainment', amount: '' },
  { label: 'Insurance', amount: '' },
  { label: 'EMI / Loans', amount: '' },
  { label: 'Health / Medical', amount: '' },
];

export default function IEForm() {
  const { user } = useAuth();
  const currency = user?.currency || '₹';
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [incomeRows, setIncomeRows] = useState(DEFAULT_INCOME);
  const [expenseRows, setExpenseRows] = useState(DEFAULT_EXPENSES);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const addRow = (setter) => {
    setter(prev => [...prev, { label: '', amount: '' }]);
  };

  const removeRow = (setter, index) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const updateRow = (setter, index, field, value) => {
    setter(prev => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const totalIncome = incomeRows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const totalExpenses = expenseRows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const netSavings = totalIncome - totalExpenses;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      const incomeData = {};
      incomeRows.forEach(r => {
        if (r.label && r.amount) incomeData[r.label] = parseFloat(r.amount);
      });

      const expenseData = {};
      expenseRows.forEach(r => {
        if (r.label && r.amount) expenseData[r.label] = parseFloat(r.amount);
      });

      if (Object.keys(incomeData).length === 0 && Object.keys(expenseData).length === 0) {
        setMessage({ type: 'warning', text: 'Please fill in at least one income or expense field' });
        return;
      }

      await api.createSnapshot({ month, year, income_data: incomeData, expense_data: expenseData, notes });
      setMessage({ type: 'success', text: `Snapshot for ${year}-${String(month).padStart(2, '0')} saved successfully!` });
    } catch (err) {
      setMessage({ type: 'danger', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Income & Expenses</h2>
        <p>Enter your monthly income and expenses to get AI-powered insights</p>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Period selector */}
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Month</label>
              <select
                className="form-select"
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i).toLocaleString('en', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Year</label>
              <select
                className="form-select"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const y = now.getFullYear() - 2 + i;
                  return <option key={y} value={y}>{y}</option>;
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Income Section */}
        <div className="card ie-section">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} style={{ color: 'var(--success)' }} />
            Income Sources
          </h3>
          {incomeRows.map((row, i) => (
            <div key={i} className="ie-row">
              <input
                type="text"
                className="form-input"
                placeholder="Income source (e.g., Salary)"
                value={row.label}
                onChange={(e) => updateRow(setIncomeRows, i, 'label', e.target.value)}
              />
              <input
                type="number"
                className="form-input ie-amount tabular-nums"
                placeholder={`${currency} Amount`}
                value={row.amount}
                onChange={(e) => updateRow(setIncomeRows, i, 'amount', e.target.value)}
                min="0"
                step="100"
              />
              <button type="button" className="remove-btn" onClick={() => removeRow(setIncomeRows, i)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => addRow(setIncomeRows)}>
            <Plus size={14} /> Add income source
          </button>
          <div className="ie-total">
            <span>Total Income</span>
            <span className="text-success tabular-nums">{currency}{totalIncome.toLocaleString()}</span>
          </div>
        </div>

        {/* Expense Section */}
        <div className="card ie-section">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingDown size={18} style={{ color: 'var(--danger)' }} />
            Monthly Expenses
          </h3>
          {expenseRows.map((row, i) => (
            <div key={i} className="ie-row">
              <input
                type="text"
                className="form-input"
                placeholder="Expense category (e.g., Rent)"
                value={row.label}
                onChange={(e) => updateRow(setExpenseRows, i, 'label', e.target.value)}
              />
              <input
                type="number"
                className="form-input ie-amount tabular-nums"
                placeholder={`${currency} Amount`}
                value={row.amount}
                onChange={(e) => updateRow(setExpenseRows, i, 'amount', e.target.value)}
                min="0"
                step="100"
              />
              <button type="button" className="remove-btn" onClick={() => removeRow(setExpenseRows, i)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => addRow(setExpenseRows)}>
            <Plus size={14} /> Add expense category
          </button>
          <div className="ie-total">
            <span>Total Expenses</span>
            <span className="text-danger tabular-nums">{currency}{totalExpenses.toLocaleString()}</span>
          </div>
        </div>

        {/* Summary & Save */}
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: 'var(--space-md)', background: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-md)'
          }}>
            <span style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>
              Net Savings
            </span>
            <span style={{
              fontWeight: 700, fontSize: 'var(--font-size-xl)',
              color: netSavings >= 0 ? 'var(--success)' : 'var(--danger)',
            }}>
              ₹{netSavings.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <textarea
              className="form-textarea"
              placeholder="Any notes about this month..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={saving}>
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Snapshot'}
          </button>
        </div>
      </form>
    </div>
  );
}
