import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Target } from 'lucide-react';

export default function Goals() {
  const { user } = useAuth();
  const currency = user?.currency || '₹';
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', target_amount: '', current_amount: '', deadline: '', priority: 'medium' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => { loadGoals(); }, []);

  async function loadGoals() {
    try {
      const data = await api.getGoals();
      setGoals(data.goals || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.createGoal({
        ...form,
        target_amount: parseFloat(form.target_amount),
        current_amount: parseFloat(form.current_amount) || 0,
      });
      setMessage('Goal created!');
      setShowForm(false);
      setForm({ name: '', target_amount: '', current_amount: '', deadline: '', priority: 'medium' });
      loadGoals();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteGoal(id);
      loadGoals();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateProgress = async (goal, newAmount) => {
    try {
      await api.updateGoal(goal.id, { current_amount: parseFloat(newAmount) });
      loadGoals();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="page-loading"><div className="spinner" /><span>Loading goals...</span></div>;
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Financial Goals</h2>
          <p>Set and track your savings goals</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> New Goal
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="card-title" style={{ marginBottom: 'var(--space-md)' }}>🎯 Create New Goal</div>
          <form onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Goal Name</label>
                <input
                  type="text" className="form-input" placeholder="e.g., Emergency Fund"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Target Amount ({currency})</label>
                <input
                  type="number" className="form-input tabular-nums" placeholder="100000"
                  value={form.target_amount} onChange={(e) => setForm({ ...form, target_amount: e.target.value })} required min="1"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Current Savings ({currency})</label>
                <input
                  type="number" className="form-input tabular-nums" placeholder="0"
                  value={form.current_amount} onChange={(e) => setForm({ ...form, current_amount: e.target.value })} min="0"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Deadline</label>
                <input
                  type="date" className="form-input"
                  value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <button type="submit" className="btn btn-primary">Create Goal</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {goals.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">
            <Target size={36} />
          </div>
          <h3>No goals yet</h3>
          <p>Create your first financial goal to start tracking your progress.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-lg)' }}>
          {goals.map((goal) => {
            const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
            const isAchieved = progress >= 100;
            const remainingAmount = Math.max(0, (goal.target_amount || 0) - (goal.current_amount || 0));
            let monthlyNeeded = null;
            if (goal.deadline && remainingAmount > 0) {
              const deadlineDate = new Date(goal.deadline);
              const now = new Date();
              const monthsDiff = (deadlineDate.getFullYear() - now.getFullYear()) * 12 + (deadlineDate.getMonth() - now.getMonth());
              if (monthsDiff > 0) {
                monthlyNeeded = Math.ceil(remainingAmount / monthsDiff);
              } else if (monthsDiff === 0) {
                monthlyNeeded = remainingAmount;
              }
            }

            return (
              <div key={goal.id} className="card">
                <div className="card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <Target size={18} style={{ color: 'var(--accent-primary)' }} />
                    <span style={{ fontWeight: 600 }}>{goal.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                    <span className={`badge ${goal.priority === 'high' ? 'badge-danger' : goal.priority === 'medium' ? 'badge-warning' : 'badge-info'}`}>
                      {goal.priority}
                    </span>
                    <button className="remove-btn" onClick={() => handleDelete(goal.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--space-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xs)', fontSize: 'var(--font-size-sm)' }}>
                    <span className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>{currency}{(goal.current_amount || 0).toLocaleString()}</span>
                    <span className="tabular-nums" style={{ color: 'var(--text-muted)' }}>{currency}{(goal.target_amount || 0).toLocaleString()}</span>
                  </div>
                  <div style={{
                    height: '8px', background: 'var(--bg-input)', borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(progress, 100)}%`,
                      background: isAchieved ? 'var(--gradient-success)' : 'var(--gradient-primary)',
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <div style={{
                    textAlign: 'right', fontSize: 'var(--font-size-xs)',
                    color: isAchieved ? 'var(--success)' : 'var(--text-muted)',
                    marginTop: '4px',
                  }}>
                    {progress.toFixed(1)}% {isAchieved ? '🎉' : ''}
                  </div>
                </div>

                {goal.deadline && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    <span>📅 Deadline: {new Date(goal.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    {monthlyNeeded !== null && !isAchieved && (
                      <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                        Req: {currency}{monthlyNeeded.toLocaleString()}/mo
                      </span>
                    )}
                  </div>
                )}

                <div style={{ marginTop: 'var(--space-sm)', display: 'flex', gap: 'var(--space-xs)', alignItems: 'center' }}>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Update amount"
                    style={{ flex: 1, padding: '4px 8px', fontSize: 'var(--font-size-xs)' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdateProgress(goal, e.target.value);
                    }}
                  />
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Press Enter</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
