import { useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  Upload as UploadIcon,
  FileText,
  CheckCircle2,
  Download,
  AlertCircle,
  Building2,
  Calendar,
  DollarSign,
  Trash2,
  Plus,
  ArrowRight,
  RefreshCw,
  Sparkles,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Layers,
} from 'lucide-react';

const CATEGORIES = [
  'Salary & Income',
  'Housing',
  'Food & Dining',
  'Groceries',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Healthcare',
  'Investments',
  'General',
];

export default function UploadPage() {
  const { user } = useAuth();
  const currency = user?.currency || '₹';
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileInput = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer?.files[0];
    if (file) parseFile(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  };

  const parseFile = async (file) => {
    setError('');
    setResult(null);
    setPreview(null);

    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    const isCsv = file.name.toLowerCase().endsWith('.csv');

    if (!isPdf && !isCsv) {
      setError('Please upload a valid bank statement PDF (.pdf) or CSV (.csv) file.');
      return;
    }

    setUploading(true);

    try {
      const data = await api.parseStatement(file);
      setPreview(data);
    } catch (err) {
      setError(err.message || 'Failed to extract transactions from statement. Please verify file format.');
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  // Live calculation of totals based on user edits
  const liveTotals = useMemo(() => {
    if (!preview || !preview.transactions) return { income: 0, expense: 0, net: 0 };
    const income = preview.transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    const expense = preview.transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    return {
      income: Math.round(income * 100) / 100,
      expense: Math.round(expense * 100) / 100,
      net: Math.round((income - expense) * 100) / 100,
    };
  }, [preview]);

  // HITL row edit handlers
  const handleUpdateRow = (tempId, field, value) => {
    setPreview((prev) => {
      if (!prev) return prev;
      const updated = prev.transactions.map((t) => {
        if (t.temp_id === tempId) {
          const updatedRow = { ...t, [field]: value };
          if (field === 'amount') {
            updatedRow.amount = Math.abs(Number(value) || 0);
          }
          return updatedRow;
        }
        return t;
      });
      return { ...prev, transactions: updated };
    });
  };

  const handleToggleType = (tempId) => {
    setPreview((prev) => {
      if (!prev) return prev;
      const updated = prev.transactions.map((t) => {
        if (t.temp_id === tempId) {
          const newType = t.type === 'income' ? 'expense' : 'income';
          return {
            ...t,
            type: newType,
            category: newType === 'income' && t.category === 'General' ? 'Salary & Income' : t.category,
          };
        }
        return t;
      });
      return { ...prev, transactions: updated };
    });
  };

  const handleDeleteRow = (tempId) => {
    setPreview((prev) => {
      if (!prev) return prev;
      const updated = prev.transactions.filter((t) => t.temp_id !== tempId);
      return { ...prev, transactions: updated };
    });
  };

  const handleAddRow = () => {
    const today = new Date().toISOString().slice(0, 10);
    const newTxn = {
      temp_id: `manual_${Date.now()}`,
      date: today,
      description: 'Manual Adjustment',
      amount: 0,
      type: 'expense',
      category: 'General',
    };
    setPreview((prev) => {
      if (!prev) return prev;
      return { ...prev, transactions: [newTxn, ...prev.transactions] };
    });
  };

  const handleConfirmSave = async () => {
    if (!preview || !preview.transactions || preview.transactions.length === 0) {
      setError('No transactions to save. Add at least one transaction or upload another file.');
      return;
    }

    setConfirming(true);
    setError('');

    try {
      const payload = {
        transactions: preview.transactions,
        statement_metadata: {
          ...preview.summary,
          total_income: liveTotals.income,
          total_expenses: liveTotals.expense,
          net_savings: liveTotals.net,
        },
      };

      const res = await api.confirmStatement(payload);
      setResult(res);
      setPreview(null);
    } catch (err) {
      setError(err.message || 'Failed to save confirmed transactions to your account');
    } finally {
      setConfirming(false);
    }
  };

  const downloadSampleCsv = () => {
    const sample = `Date,Description,Debit,Credit,Category
2026-09-01,Monthly Salary Credit,,75000,Salary & Income
2026-09-02,House Rent Payment,22000,,Housing
2026-09-04,Swiggy Food Delivery,650,,Food & Dining
2026-09-06,Blinkit Quick Grocery,1450,,Groceries
2026-09-08,Uber Ride to Office,380,,Transportation
2026-09-10,Netflix Subscription,649,,Entertainment
2026-09-12,Electricity Bill Bescom,1850,,Utilities
2026-09-15,Freelance Design Project,,18000,Salary & Income
2026-09-18,Apollo Pharmacy,820,,Healthcare
2026-09-22,Amazon Shopping,2499,,Shopping`;

    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_finguide_statement.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: 'var(--space-2xl)' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div>
          <h2>Upload Bank Statement</h2>
          <p>
            Import your official <strong>PDF</strong> or <strong>CSV</strong> bank statement.
            Review and adjust all detected transactions before saving them to your financial records.
          </p>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={downloadSampleCsv}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Download size={14} /> Download Sample CSV
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-md)' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* PHASE 1: UPLOAD ZONE (Visible when neither preview nor result is active) */}
      {!preview && !result && (
        <div className="card">
          <div
            className={`upload-zone ${dragging ? 'dragging' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInput.current?.click()}
            style={{ padding: 'var(--space-2xl) var(--space-xl)', textAlign: 'center', cursor: 'pointer' }}
          >
            <input
              ref={fileInput}
              type="file"
              accept=".csv,.pdf,text/csv,application/pdf"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            {uploading ? (
              <>
                <div className="spinner" style={{ margin: '0 auto var(--space-md)', width: '36px', height: '36px' }} />
                <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Sparkles size={20} color="var(--primary)" />
                  Reading statement file...
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>Detecting transaction dates, deposits, withdrawals, and categories</p>
              </>
            ) : (
              <>
                <div className="upload-zone-icon" style={{ marginBottom: 'var(--space-md)' }}>
                  <UploadIcon size={44} color="var(--primary)" />
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-xs)' }}>
                  Drop your Bank Statement PDF or CSV here
                </h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
                  or click to select file from your device (HDFC, SBI, ICICI, Axis, Kotak, Chase, BofA, etc.)
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                  <span className="badge badge-info">PDF & CSV Supported</span>
                  <span className="badge badge-info">Auto Categorization</span>
                  <span className="badge badge-success">Review Before Saving</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* PHASE 2: HUMAN-IN-THE-LOOP (HITL) PREVIEW & EDITING TABLE */}
      {preview && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {/* HITL Header Banner */}
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(16, 185, 129, 0.08) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <UserCheck size={20} color="var(--primary)" />
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                    Review & Verify Transactions
                  </h3>
                  <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>Step 2 of 2: Review & Confirm</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Review your extracted records below. You can edit descriptions, modify amounts, adjust categories, or delete unwanted rows before saving.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => { setPreview(null); setError(''); }}
                  disabled={confirming}
                >
                  Discard File
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleConfirmSave}
                  disabled={confirming || preview.transactions.length === 0}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
                >
                  {confirming ? (
                    <>
                      <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                      Saving to Account...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Confirm & Save to Account ({preview.transactions.length})
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Extracted Metadata Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
              <div className="card" style={{ padding: 'var(--space-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <Building2 size={14} /> Identified Institution
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{preview.summary?.bank_name || 'Bank Statement'}</div>
                {preview.summary?.account_number && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Acc: {preview.summary.account_number}</div>
                )}
              </div>

              <div className="card" style={{ padding: 'var(--space-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <Calendar size={14} /> Statement Period
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                  {preview.summary?.period_start ? `${preview.summary.period_start} → ${preview.summary.period_end || 'End'}` : 'Auto-detected'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>File: {preview.filename}</div>
              </div>

              <div className="card" style={{ padding: 'var(--space-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <TrendingUp size={14} /> Total Statement Income
                </div>
                <div className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>
                  +{currency}{liveTotals.income.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {preview.transactions.filter(t => t.type === 'income').length} deposits
                </div>
              </div>

              <div className="card" style={{ padding: 'var(--space-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <TrendingDown size={14} /> Total Statement Expenses
                </div>
                <div className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--danger)' }}>
                  -{currency}{liveTotals.expense.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {preview.transactions.filter(t => t.type === 'expense').length} debits
                </div>
              </div>

              <div className="card" style={{ padding: 'var(--space-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <DollarSign size={14} /> Net Period Savings
                </div>
                <div className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 700, color: liveTotals.net >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {liveTotals.net >= 0 ? '+' : ''}{currency}{liveTotals.net.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Net cashflow
                </div>
              </div>
            </div>
          </div>

          {/* HITL Interactive Transaction Table */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
              <div>
                <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={18} />
                  Review & Correct Extracted Transactions ({preview.transactions.length})
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Click any field below to edit descriptions, modify amounts, switch categories, or delete rows.
                </span>
              </div>

              <button
                className="btn btn-secondary btn-sm"
                onClick={handleAddRow}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={14} /> Add Transaction
              </button>
            </div>

            <div className="table-container" style={{ maxHeight: '600px', overflow: 'auto' }}>
              <table style={{ minWidth: '850px' }}>
                <thead>
                  <tr>
                    <th style={{ width: '130px' }}>Date</th>
                    <th>Description / Narration</th>
                    <th style={{ width: '160px' }}>Category</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Type</th>
                    <th style={{ width: '140px', textAlign: 'right' }}>Amount ({currency})</th>
                    <th style={{ width: '60px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-secondary)' }}>
                        No transactions found. Click "+ Add Transaction" to create one manually.
                      </td>
                    </tr>
                  ) : (
                    preview.transactions.map((txn, index) => (
                      <tr key={txn.temp_id || index}>
                        {/* Date field */}
                        <td>
                          <input
                            type="date"
                            value={txn.date}
                            onChange={(e) => handleUpdateRow(txn.temp_id, 'date', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-color)',
                              background: 'var(--bg-input)',
                              color: 'var(--text-primary)',
                              fontSize: '0.85rem',
                            }}
                          />
                        </td>

                        {/* Description field */}
                        <td>
                          <input
                            type="text"
                            value={txn.description}
                            onChange={(e) => handleUpdateRow(txn.temp_id, 'description', e.target.value)}
                            placeholder="Transaction description"
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-color)',
                              background: 'var(--bg-input)',
                              color: 'var(--text-primary)',
                              fontSize: '0.85rem',
                            }}
                          />
                        </td>

                        {/* Category selector */}
                        <td>
                          <select
                            value={txn.category}
                            onChange={(e) => handleUpdateRow(txn.temp_id, 'category', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-color)',
                              background: 'var(--bg-input)',
                              color: 'var(--text-primary)',
                              fontSize: '0.85rem',
                            }}
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </td>

                        {/* Interactive Type Toggle */}
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleType(txn.temp_id)}
                            className={`badge ${txn.type === 'income' ? 'badge-success' : 'badge-danger'}`}
                            style={{
                              cursor: 'pointer',
                              border: 'none',
                              padding: '6px 10px',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              textTransform: 'capitalize',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                            title="Click to toggle Income / Expense"
                          >
                            <RefreshCw size={11} />
                            {txn.type}
                          </button>
                        </td>

                        {/* Amount input */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                            <span style={{ color: txn.type === 'income' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                              {txn.type === 'income' ? '+' : '-'}{currency}
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={txn.amount}
                              onChange={(e) => handleUpdateRow(txn.temp_id, 'amount', e.target.value)}
                              style={{
                                width: '100px',
                                textAlign: 'right',
                                padding: '6px 8px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-input)',
                                color: 'var(--text-primary)',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                              }}
                            />
                          </div>
                        </td>

                        {/* Delete row action */}
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(txn.temp_id)}
                            className="btn-icon"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              padding: '4px',
                            }}
                            title="Delete this row"
                          >
                            <Trash2 size={16} color="var(--danger)" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 'var(--space-md)',
                marginTop: 'var(--space-md)',
                borderTop: '1px solid var(--border-color)',
                flexWrap: 'wrap',
                gap: 'var(--space-sm)',
              }}
            >
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Ready to save {preview.transactions.length} transactions to your financial records.
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => { setPreview(null); setError(''); }}
                  disabled={confirming}
                >
                  Discard
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleConfirmSave}
                  disabled={confirming || preview.transactions.length === 0}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
                >
                  {confirming ? (
                    <>
                      <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                      Saving to Account...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Confirm & Save to Account
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 3: CONFIRMATION SUCCESS VIEW */}
      {result && (
        <div>
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={20} />
              <strong>{result.message || 'Statement successfully confirmed and saved to your account!'}</strong>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <Link to="/dashboard" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                View Dashboard <ArrowRight size={14} />
              </Link>
              <Link to="/transactions" className="btn btn-secondary btn-sm">
                View All Transactions
              </Link>
            </div>
          </div>

          <div className="card" style={{ marginTop: 'var(--space-md)' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="card-title">
                <FileText size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                Confirmed Transactions Saved ({result.count})
              </span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => { setResult(null); setPreview(null); setError(''); }}
              >
                Upload Another Statement
              </button>
            </div>

            <div className="table-container" style={{ maxHeight: '500px', overflow: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(result.transactions || []).map((txn) => (
                    <tr key={txn.id}>
                      <td>{txn.date}</td>
                      <td>{txn.description}</td>
                      <td>
                        <span className="badge badge-info">{txn.category}</span>
                      </td>
                      <td>
                        <span className={`badge ${txn.type === 'income' ? 'badge-success' : 'badge-danger'}`}>
                          {txn.type}
                        </span>
                      </td>
                      <td className="tabular-nums" style={{
                        textAlign: 'right', fontWeight: 600,
                        color: txn.type === 'income' ? 'var(--success)' : 'var(--danger)',
                      }}>
                        {txn.type === 'income' ? '+' : '-'}{currency}{txn.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* User Guide Card */}
      {!preview && (
        <div className="card" style={{ marginTop: 'var(--space-lg)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
            <Sparkles size={20} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ margin: 0, fontSize: 'var(--font-size-md)' }}>
              How Bank Statement Import Works
            </h3>
          </div>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Importing your bank statement takes just three simple steps. You will always preview and verify every transaction before anything is saved:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ background: 'var(--surface-hover)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent-primary)', color: '#fff', fontSize: '12px' }}>1</span>
                Upload Your File
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                Drag and drop your bank statement PDF or CSV. Statements from major banks are automatically recognized.
              </p>
            </div>

            <div style={{ background: 'var(--surface-hover)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent-primary)', color: '#fff', fontSize: '12px' }}>2</span>
                Review & Edit
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                Verify detected deposits and withdrawals. Adjust categories, update amounts, or remove any transactions you don't want to track.
              </p>
            </div>

            <div style={{ background: 'var(--surface-hover)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent-primary)', color: '#fff', fontSize: '12px' }}>3</span>
                Save & Analyze
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                Confirm to save your records. Your Dashboard, monthly cash flow, and budget insights update instantly.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)', background: 'rgba(0, 171, 228, 0.05)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0, 171, 228, 0.15)' }}>
            <span>🔒 <strong>Your Privacy Matters:</strong> Your bank statements are parsed securely and privately. No financial credentials or account login info are ever requested.</span>
          </div>
        </div>
      )}
    </div>
  );
}
