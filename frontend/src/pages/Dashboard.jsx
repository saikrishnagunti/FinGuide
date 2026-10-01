import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Sparkles,
  AlertCircle,
  Info,
  Calendar,
  Layers,
  FileText,
  PieChart as PieChartIcon,
  Bot,
  PlusCircle,
  BarChart3,
  Activity,
  Filter,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from 'recharts';

const DONUT_COLORS_LIGHT = [
  '#00ABE4', // Drone Bright Blue
  '#178582', // Slumber Turquoise
  '#BFA181', // Slumber Gold
  '#0A1828', // Dark Classic Blue
  '#20A39E', // Vibrant Turquoise Teal
  '#A88B6B', // Deep Warm Bronze
  '#38BDF8', // Cyan Sky
  '#E11D48', // Crimson Outflow
];

const DONUT_COLORS_DARK = [
  '#00ABE4', // Luminous Bright Blue
  '#20A39E', // Luminous Turquoise
  '#BFA181', // Champagne Gold
  '#E9F1FA', // Luminous Light Blue
  '#178582', // Deep Turquoise
  '#DFCAAF', // Warm Gold Tint
  '#38BDF8', // Sky Cyan
  '#F43F5E', // Rose Crimson
];

// Custom Tooltip for the Line/Area/Bar Chart showing Historical vs Statistical Projections
function CustomTrendTooltip({ active, payload, label, currency = '₹', isDark = false }) {
  if (!active || !payload || !payload.length) return null;

  const dataPoint = payload[0]?.payload || {};
  const isForecast = dataPoint.isForecast;

  const bg = isDark ? '#0D1E33' : '#ffffff';
  const border = isForecast
    ? '1px solid #00ABE4'
    : isDark ? '1px solid rgba(191,161,129,0.35)' : '1px solid rgba(10,24,40,0.12)';
  const textColor = isDark ? '#ffffff' : '#0A1828';
  const shadow = isDark ? '0 12px 32px rgba(0,0,0,0.7)' : '0 10px 28px -4px rgba(10,24,40,0.12)';

  const inc = isForecast ? (dataPoint.ForecastIncome || 0) : (dataPoint.Income || 0);
  const exp = isForecast ? (dataPoint.ForecastExpenses || 0) : (dataPoint.Expenses || 0);
  const net = isForecast ? (dataPoint.Savings || (inc - exp)) : (inc - exp);
  const savingsRate = inc > 0 ? Math.round((net / inc) * 100) : 0;

  return (
    <div
      style={{
        background: bg,
        border,
        borderRadius: '10px',
        padding: '12px 16px',
        color: textColor,
        fontSize: '12px',
        boxShadow: shadow,
        minWidth: '220px',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: isDark ? '1px solid rgba(191,161,129,0.2)' : '1px solid rgba(10,24,40,0.1)', paddingBottom: '6px' }}>
        <strong style={{ fontSize: '13px' }}>{dataPoint.monthKey || label}</strong>
        {isForecast ? (
          <span
            style={{
              fontSize: '10px',
              padding: '2px 8px',
              borderRadius: '9999px',
              background: 'rgba(0, 171, 228, 0.15)',
              color: '#00ABE4',
              fontWeight: 600,
              border: '1px solid rgba(0, 171, 228, 0.35)',
            }}
          >
            Statistical Forecast
          </span>
        ) : (
          <span
            style={{
              fontSize: '10px',
              padding: '2px 8px',
              borderRadius: '9999px',
              background: 'rgba(23, 133, 130, 0.15)',
              color: '#178582',
              fontWeight: 600,
              border: '1px solid rgba(23, 133, 130, 0.3)',
            }}
          >
            Actual
          </span>
        )}
      </div>

      {isForecast ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0', color: '#178582' }}>
            <span>Forecast Inflow:</span>
            <strong className="tabular-nums">{currency}{(dataPoint.ForecastIncome || 0).toLocaleString()}</strong>
          </div>
          {dataPoint.incomeLower !== undefined && dataPoint.incomeUpper !== undefined && (
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right', marginBottom: '4px' }}>
              (80% Conf: {currency}{Math.round(dataPoint.incomeLower).toLocaleString()} - {currency}{Math.round(dataPoint.incomeUpper).toLocaleString()})
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0', color: '#E11D48' }}>
            <span>Forecast Outflow:</span>
            <strong className="tabular-nums">{currency}{(dataPoint.ForecastExpenses || 0).toLocaleString()}</strong>
          </div>
          {dataPoint.expensesLower !== undefined && dataPoint.expensesUpper !== undefined && (
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right', marginBottom: '4px' }}>
              (80% Conf: {currency}{Math.round(dataPoint.expensesLower).toLocaleString()} - {currency}{Math.round(dataPoint.expensesUpper).toLocaleString()})
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', paddingTop: '6px', borderTop: isDark ? '1px dashed rgba(191,161,129,0.25)' : '1px dashed rgba(10,24,40,0.12)', color: net >= 0 ? '#178582' : '#E11D48' }}>
            <span>Est. Net Wealth Delta:</span>
            <strong className="tabular-nums">{net >= 0 ? '+' : ''}{currency}{net.toLocaleString()} ({savingsRate}%)</strong>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0', color: '#178582' }}>
            <span>Total Inflow:</span>
            <strong className="tabular-nums">{currency}{(dataPoint.Income || 0).toLocaleString()}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0', color: '#E11D48' }}>
            <span>Total Outflow:</span>
            <strong className="tabular-nums">{currency}{(dataPoint.Expenses || 0).toLocaleString()}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', paddingTop: '6px', borderTop: isDark ? '1px dashed rgba(191,161,129,0.25)' : '1px dashed rgba(10,24,40,0.12)', color: net >= 0 ? '#178582' : '#E11D48' }}>
            <span>Net Monthly Surplus:</span>
            <strong className="tabular-nums">{net >= 0 ? '+' : ''}{currency}{net.toLocaleString()} ({savingsRate}%)</strong>
          </div>
        </>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [snapshots, setSnapshots] = useState([]);
  const [summary, setSummary] = useState(null);
  const [timeSeriesForecast, setTimeSeriesForecast] = useState(null);
  const [forecastHorizon, setForecastHorizon] = useState(2); // 1 or 2 months
  const [forecastModel, setForecastModel] = useState('best'); // best (Auto evaluated), arima, sarima, ets
  const [loading, setLoading] = useState(true);
  const [forecastLoading, setForecastLoading] = useState(false);
  const { isDark } = useTheme();
  const [timeRange, setTimeRange] = useState(() => {
    try {
      return localStorage.getItem('finguide_time_range') || 'all';
    } catch {
      return 'all';
    }
  });

  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange);
    try {
      localStorage.setItem('finguide_time_range', newRange);
    } catch {}
  };
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const donutColors = isDark ? DONUT_COLORS_DARK : DONUT_COLORS_LIGHT;

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    // Reload time-series forecast whenever horizon or model changes
    if (!loading) {
      loadForecast(forecastHorizon, forecastModel);
    }
  }, [forecastHorizon, forecastModel]);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const [snapshotRes, summaryRes, forecastRes] = await Promise.all([
        api.getSnapshots().catch(() => ({ snapshots: [] })),
        api.getTransactionSummary().catch(() => ({ summary: [], totals: [] })),
        api.getTimeSeriesForecast({ monthsAhead: forecastHorizon, modelType: forecastModel }).catch(() => null),
      ]);
      setSnapshots(snapshotRes.snapshots || []);
      setSummary(summaryRes);
      setTimeSeriesForecast(forecastRes);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadForecast(horizon, model) {
    setForecastLoading(true);
    try {
      const res = await api.getTimeSeriesForecast({
        monthsAhead: horizon,
        modelType: model,
      });
      setTimeSeriesForecast(res);
    } catch (err) {
      console.warn('Failed to refresh time series forecast:', err);
    } finally {
      setForecastLoading(false);
    }
  }

  // Dynamic calculation for Stat Cards based on selected timeframe
  const periodStats = useMemo(() => {
    if (!snapshots || snapshots.length === 0) {
      const inc = summary?.totals?.find(t => t.type === 'income')?.total || 0;
      const exp = summary?.totals?.find(t => t.type === 'expense')?.total || 0;
      const net = inc - exp;
      return {
        income: Number(inc) || 0,
        expenses: Number(exp) || 0,
        net: Number(net) || 0,
        rate: inc > 0 ? ((net / inc) * 100).toFixed(1) : 0,
        subtitle: 'All-Time Records',
      };
    }

    if (timeRange === '1m') {
      const latest = snapshots[0] || {};
      const inc = Number(latest.total_income) || 0;
      const exp = Number(latest.total_expenses) || 0;
      const net = Number(latest.net_savings) || (inc - exp);
      return {
        income: inc,
        expenses: exp,
        net,
        rate: inc > 0 ? ((net / inc) * 100).toFixed(1) : 0,
        subtitle: 'Current Month',
      };
    }

    const limit = timeRange === '6m' ? 6 : timeRange === '12m' ? 12 : snapshots.length;
    const slice = snapshots.slice(0, limit);
    const inc = slice.reduce((sum, s) => sum + (Number(s.total_income) || 0), 0);
    const exp = slice.reduce((sum, s) => sum + (Number(s.total_expenses) || 0), 0);
    const net = inc - exp;
    const rate = inc > 0 ? ((net / inc) * 100).toFixed(1) : 0;
    const label = timeRange === '6m' ? 'Last 6 Months' : timeRange === '12m' ? 'Last 12 Months' : 'All-Time Historical';

    return {
      income: inc,
      expenses: exp,
      net,
      rate,
      subtitle: `${label} (${slice.length} Mos)`,
    };
  }, [snapshots, summary, timeRange]);

  const latest = snapshots[0] || {};
  const totalIncome = Number(periodStats?.income) || 0;
  const totalExpenses = Number(periodStats?.expenses) || 0;
  const netSavings = Number(periodStats?.net) || 0;
  const savingsRate = Number(periodStats?.rate) || 0;

  // Build clean chronological history list
  let historyList = [];
  if (timeSeriesForecast?.history && timeSeriesForecast.history.length > 0) {
    historyList = timeSeriesForecast.history;
  } else if (snapshots.length > 0) {
    historyList = [...snapshots]
      .reverse()
      .map(s => ({
        month_key: `${s.year}-${String(s.month).padStart(2, '0')}`,
        income: Number(s.total_income) || 0,
        expenses: Number(s.total_expenses) || 0,
        savings: (Number(s.total_income) || 0) - (Number(s.total_expenses) || 0),
      }));
  } else if (summary?.monthly?.length > 0) {
    historyList = summary.monthly.map(m => ({
      month_key: m.month_key,
      income: Number(m.income) || 0,
      expenses: Number(m.expenses) || 0,
      savings: (Number(m.income) || 0) - (Number(m.expenses) || 0),
    }));
  }

  const isEligibleForForecast = (timeSeriesForecast?.eligible ?? false) && (historyList.length >= 12);
  const historicalCount = timeSeriesForecast?.historical_count || historyList.length;

  // Assemble unified data array for the Line Chart
  const lineChartData = [];

  // Historical data points
  historyList.forEach((h, index) => {
    const isLastHistorical = index === historyList.length - 1;
    lineChartData.push({
      name: h.month_key,
      monthKey: h.month_key,
      Income: h.income,
      Expenses: h.expenses,
      Savings: h.income - h.expenses,
      // Seamless connection anchor to forecast lines
      ForecastIncome: (isEligibleForForecast && isLastHistorical && timeSeriesForecast?.forecast?.length > 0) ? h.income : null,
      ForecastExpenses: (isEligibleForForecast && isLastHistorical && timeSeriesForecast?.forecast?.length > 0) ? h.expenses : null,
      isForecast: false,
    });
  });

  // Forecast data points (only when at least 12 months data exists)
  if (isEligibleForForecast && timeSeriesForecast?.forecast) {
    timeSeriesForecast.forecast.forEach((f) => {
      lineChartData.push({
        name: `${f.month_key}*`,
        monthKey: f.month_key,
        Income: null,
        Expenses: null,
        ForecastIncome: f.income,
        ForecastExpenses: f.expenses,
        Savings: f.savings,
        incomeLower: f.income_lower,
        incomeUpper: f.income_upper,
        expensesLower: f.expenses_lower,
        expensesUpper: f.expenses_upper,
        isForecast: true,
      });
    });
  }

  // Filter historical points by timeRange if requested
  let displayChartData = lineChartData;
  if (timeRange === '1m') {
    const histOnly = lineChartData.filter(d => !d.isForecast);
    const forecastOnly = lineChartData.filter(d => d.isForecast);
    displayChartData = [...histOnly.slice(-1), ...forecastOnly];
  } else if (timeRange === '6m') {
    const histOnly = lineChartData.filter(d => !d.isForecast);
    const forecastOnly = lineChartData.filter(d => d.isForecast);
    displayChartData = [...histOnly.slice(-6), ...forecastOnly];
  } else if (timeRange === '12m') {
    const histOnly = lineChartData.filter(d => !d.isForecast);
    const forecastOnly = lineChartData.filter(d => d.isForecast);
    displayChartData = [...histOnly.slice(-12), ...forecastOnly];
  }

  // Summary averages for the KPI strip above chart
  const histPoints = lineChartData.filter(d => !d.isForecast);
  const avgIncome = Number(histPoints.length > 0
    ? Math.round(histPoints.reduce((acc, p) => acc + (p.Income || 0), 0) / histPoints.length)
    : Math.round(totalIncome)) || 0;
  const avgExpense = Number(histPoints.length > 0
    ? Math.round(histPoints.reduce((acc, p) => acc + (p.Expenses || 0), 0) / histPoints.length)
    : Math.round(totalExpenses)) || 0;
  const avgNet = avgIncome - avgExpense;
  const avgSavingsRate = avgIncome > 0 ? Math.round((avgNet / avgIncome) * 100) : 0;

  // Pie chart from expense categories
  const expenseCategories = (summary?.summary || [])
    .filter(s => s.type === 'expense')
    .map(s => ({
      name: s.category,
      value: Math.round(s.total),
    }));

  const totalExpensesSum = expenseCategories.reduce((acc, curr) => acc + (curr.value || 0), 0);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  const hasData = snapshots.length > 0 || (summary?.summary || []).length > 0 || historyList.length > 0;
  const currency = user?.currency || '₹';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="dashboard-container">
      <div className="dashboard-hero-header animate-materialize" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div>
          <div className="dashboard-date-badge">
            <Calendar size={13} />
            <span>{formattedDate}</span>
          </div>
          <h2 className="dashboard-welcome-title">
            {getGreeting()}, <span className="highlight-name">{user?.name || 'Investor'}</span>
          </h2>
          <p className="dashboard-welcome-desc">
            Your real-time wealth telemetry, cash flow trajectories, and statistical forecast models.
          </p>
        </div>

        {/* Audit-Style Timeframe Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap', marginTop: 'var(--space-xs)' }}>
          <div
            className="period-picker-wrapper"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--surface-hover)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-color)',
            }}
          >
            <Calendar size={14} color="var(--primary)" />
            <select
              className="period-select"
              value={timeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
              title="Select Dashboard Timeframe"
            >
              <option value="1m">1 Month (Current)</option>
              <option value="6m">Last 6 Months</option>
              <option value="12m">Last 12 Months</option>
              <option value="all">All-Time Historical</option>
            </select>
          </div>

          <div
            className="chart-pill-group"
            style={{
              display: 'inline-flex',
              background: 'var(--surface-hover)',
              padding: '3px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-color)',
            }}
          >
            <button
              type="button"
              className={`chart-pill-btn ${timeRange === '1m' ? 'active' : ''}`}
              onClick={() => handleTimeRangeChange('1m')}
              style={{ fontSize: '11px', padding: '3px 10px', borderRadius: 'var(--radius-full)' }}
            >
              1M
            </button>
            <button
              type="button"
              className={`chart-pill-btn ${timeRange === '6m' ? 'active' : ''}`}
              onClick={() => handleTimeRangeChange('6m')}
              style={{ fontSize: '11px', padding: '3px 10px', borderRadius: 'var(--radius-full)' }}
            >
              6M
            </button>
            <button
              type="button"
              className={`chart-pill-btn ${timeRange === '12m' ? 'active' : ''}`}
              onClick={() => handleTimeRangeChange('12m')}
              style={{ fontSize: '11px', padding: '3px 10px', borderRadius: 'var(--radius-full)' }}
            >
              12M
            </button>
            <button
              type="button"
              className={`chart-pill-btn ${timeRange === 'all' ? 'active' : ''}`}
              onClick={() => handleTimeRangeChange('all')}
              style={{ fontSize: '11px', padding: '3px 10px', borderRadius: 'var(--radius-full)' }}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards">
        <div className="card stat-card income animate-materialize stagger-1">
          <div className="card-header">
            <span className="card-title">Total Inflow</span>
            <div className="stat-card-icon"><TrendingUp size={18} /></div>
          </div>
          <div className="card-value tabular-nums">{currency}{totalIncome.toLocaleString()}</div>
          <div className="card-subtitle">
            <span className="trend-badge positive">Inflow</span>
            <span>{periodStats.subtitle}</span>
          </div>
        </div>

        <div className="card stat-card expense animate-materialize stagger-2">
          <div className="card-header">
            <span className="card-title">Total Outflow</span>
            <div className="stat-card-icon"><TrendingDown size={18} /></div>
          </div>
          <div className="card-value tabular-nums">{currency}{totalExpenses.toLocaleString()}</div>
          <div className="card-subtitle">
            <span className="trend-badge negative">Outflow</span>
            <span>{periodStats.subtitle}</span>
          </div>
        </div>

        <div className="card stat-card savings animate-materialize stagger-3">
          <div className="card-header">
            <span className="card-title">Net Wealth Delta</span>
            <div
              className="stat-card-icon"
              style={isDark ? { background: 'rgba(191, 161, 129, 0.18)', color: '#BFA181', border: '1px solid rgba(191, 161, 129, 0.38)' } : {}}
            >
              <PiggyBank size={18} />
            </div>
          </div>
          <div className="card-value tabular-nums" style={{ color: netSavings >= 0 ? (isDark ? '#BFA181' : 'var(--success)') : 'var(--danger)' }}>
            {netSavings < 0 ? '-' : ''}{currency}{Math.abs(netSavings).toLocaleString()}
          </div>
          <div className="card-subtitle">
            <span className={`trend-badge ${netSavings >= 0 ? (isDark ? 'gold' : 'positive') : 'negative'}`}>
              {netSavings >= 0 ? 'Surplus' : 'Deficit'}
            </span>
            <span>{periodStats.subtitle}</span>
          </div>
        </div>

        <div className="card stat-card rate animate-materialize stagger-4">
          <div className="card-header">
            <span className="card-title">Savings Efficiency</span>
            <div className="stat-card-icon"><Wallet size={18} /></div>
          </div>
          <div className="card-value tabular-nums">{savingsRate}%</div>
          <div className="card-subtitle">
            <span className="status-indicator-dot" style={{ background: savingsRate >= 20 ? 'var(--success)' : savingsRate >= 10 ? 'var(--warning)' : 'var(--danger)' }} />
            <span>{savingsRate >= 20 ? 'Optimal (≥20%)' : savingsRate >= 10 ? 'Moderate (10-20%)' : 'Needs Optimization (<10%)'}</span>
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="card empty-state">
          <div className="empty-state-icon">
            <Layers size={32} />
          </div>
          <h3>No financial telemetry recorded</h3>
          <p>Initialize your cash flow tracking by creating an Income & Expense log or uploading your bank statement.</p>
          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', marginTop: '1rem' }}>
            <Link to="/ie-form" className="btn btn-primary">Add Income & Expenses</Link>
            <Link to="/upload" className="btn btn-secondary">Upload Statement</Link>
          </div>
        </div>
      ) : (
        <div className="grid-2">
          {/* Income vs Expenses Trend - High-Fidelity Time Series & Multi-Plot Map */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-header" style={{ flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Cash Flow & Wealth Trajectory Map
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Historical Trends & Predictive Projections
                </span>
              </div>

              {/* Status and Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto', flexWrap: 'wrap' }}>
                {/* 12-Month Eligibility Indicator */}
                {isEligibleForForecast ? (
                  <span
                    className="badge"
                    style={{
                      background: 'var(--success-bg)',
                      color: 'var(--success)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      fontSize: '11px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                    }}
                    title={timeSeriesForecast?.model_used}
                  >
                    <Sparkles size={12} />
                    {forecastHorizon}M: {timeSeriesForecast?.best_model_name || 'Best Fit'} ({historicalCount} mo)
                  </span>
                ) : (
                  <span
                    className="badge"
                    style={{
                      background: 'var(--warning-bg)',
                      color: 'var(--warning)',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      fontSize: '11px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                    }}
                    title="At least 12 months required for statistical modeling"
                  >
                    <AlertCircle size={12} />
                    Forecast Locked ({historicalCount}/12 mo)
                  </span>
                )}

                {/* Horizon Selector (1M or 2M) */}
                <div style={{ display: 'inline-flex', background: 'var(--bg-card-hover)', borderRadius: '6px', padding: '2px', border: '1px solid var(--border-color)' }}>
                  <button
                    type="button"
                    onClick={() => setForecastHorizon(1)}
                    disabled={forecastLoading}
                    style={{
                      border: 'none',
                      background: forecastHorizon === 1 ? 'var(--accent-primary)' : 'transparent',
                      color: forecastHorizon === 1 ? '#fff' : 'var(--text-muted)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: forecastHorizon === 1 ? 600 : 400,
                    }}
                  >
                    +1M
                  </button>
                  <button
                    type="button"
                    onClick={() => setForecastHorizon(2)}
                    disabled={forecastLoading}
                    style={{
                      border: 'none',
                      background: forecastHorizon === 2 ? 'var(--accent-primary)' : 'transparent',
                      color: forecastHorizon === 2 ? '#fff' : 'var(--text-muted)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: forecastHorizon === 2 ? 600 : 400,
                    }}
                  >
                    +2M
                  </button>
                </div>

                {/* Model Selector */}
                <select
                  value={forecastModel}
                  onChange={(e) => setForecastModel(e.target.value)}
                  disabled={forecastLoading}
                  style={{
                    background: 'var(--bg-card-hover)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    outline: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  <option value="best">Best Fit</option>
                  <option value="arima">ARIMA</option>
                  <option value="sarima">SARIMA (12M)</option>
                  <option value="ets">Holt-Winters ETS</option>
                </select>
              </div>
            </div>

            {/* Interactive Chart Controls Bar (View Switcher + Time Horizon Filters) */}
            <div className="chart-controls-bar">
              <div className="chart-pill-group">
                <button
                  type="button"
                  className={`chart-pill-btn ${chartView === 'area' ? 'active' : ''}`}
                  onClick={() => setChartView('area')}
                  title="Volumetric Cash Flow Trajectory"
                >
                  <Activity size={13} />
                  <span>Area Flow</span>
                </button>
                <button
                  type="button"
                  className={`chart-pill-btn ${chartView === 'bar' ? 'active' : ''}`}
                  onClick={() => setChartView('bar')}
                  title="Side-by-side Monthly Inflow vs Outflow Comparison"
                >
                  <BarChart3 size={13} />
                  <span>Monthly Bars</span>
                </button>
                <button
                  type="button"
                  className={`chart-pill-btn ${chartView === 'net' ? 'active' : ''}`}
                  onClick={() => setChartView('net')}
                  title="Net Wealth Surplus / Deficit Curve"
                >
                  <TrendingUp size={13} />
                  <span>Net Curve</span>
                </button>
              </div>

              {/* Time Horizon Filter */}
              <div className="chart-pill-group">
                <button
                  type="button"
                  className={`chart-pill-btn ${timeRange === '1m' ? 'active' : ''}`}
                  onClick={() => handleTimeRangeChange('1m')}
                >
                  1M
                </button>
                <button
                  type="button"
                  className={`chart-pill-btn ${timeRange === '6m' ? 'active' : ''}`}
                  onClick={() => handleTimeRangeChange('6m')}
                >
                  6M
                </button>
                <button
                  type="button"
                  className={`chart-pill-btn ${timeRange === '12m' ? 'active' : ''}`}
                  onClick={() => handleTimeRangeChange('12m')}
                >
                  12M
                </button>
                <button
                  type="button"
                  className={`chart-pill-btn ${timeRange === 'all' ? 'active' : ''}`}
                  onClick={() => handleTimeRangeChange('all')}
                >
                  All
                </button>
              </div>
            </div>

            {/* KPI Summary Strip */}
            <div className="chart-kpi-summary-strip">
              <div className="chart-kpi-item">
                <span className="chart-kpi-label">Avg. Inflow / Mo</span>
                <span className="chart-kpi-value tabular-nums" style={{ color: 'var(--success)' }}>
                  {currency}{avgIncome.toLocaleString()}
                </span>
              </div>
              <div className="chart-kpi-item">
                <span className="chart-kpi-label">Avg. Outflow / Mo</span>
                <span className="chart-kpi-value tabular-nums" style={{ color: 'var(--danger)' }}>
                  {currency}{avgExpense.toLocaleString()}
                </span>
              </div>
              <div className="chart-kpi-item">
                <span className="chart-kpi-label">Net Monthly Flow</span>
                <span className="chart-kpi-value tabular-nums" style={{ color: avgNet >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {avgNet >= 0 ? '+' : ''}{currency}{avgNet.toLocaleString()} ({avgSavingsRate}%)
                </span>
              </div>
              <div className="chart-kpi-item">
                <span className="chart-kpi-label">Historical Data</span>
                <span className="chart-kpi-value" style={{ color: 'var(--text-secondary)' }}>
                  {historicalCount} Mos
                </span>
              </div>
            </div>

            {/* Model Evaluation Metric Comparison Bar (ARIMA vs SARIMA vs ETS) */}
            {isEligibleForForecast && Array.isArray(timeSeriesForecast?.evaluations?.income) && timeSeriesForecast.evaluations.income.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                  padding: '6px 12px',
                  background: 'var(--bg-card-hover)',
                  borderRadius: '6px',
                  margin: '0 0 10px 0',
                  border: '1px solid var(--border-color)',
                  fontSize: '11px',
                }}
              >
                <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                  <TrendingUp size={12} style={{ color: 'var(--accent-primary)' }} />
                  Evaluation:
                </span>
                {(timeSeriesForecast.evaluations.income || []).map((m, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: m.is_best ? (isDark ? 'rgba(191, 161, 129, 0.2)' : 'var(--success-bg)') : 'transparent',
                      color: m.is_best ? (isDark ? '#BFA181' : 'var(--success)') : 'var(--text-secondary)',
                      fontWeight: m.is_best ? 700 : 400,
                      border: m.is_best ? (isDark ? '1px solid rgba(191, 161, 129, 0.45)' : '1px solid rgba(23, 133, 130, 0.35)') : '1px solid transparent',
                    }}
                    title={`${m.name} - In-sample error (MAPE): ${m.mape}%, RMSE: ${m.rmse}`}
                  >
                    {m.short_name}: {m.mape}% error {m.is_best ? '🏆 Best' : ''}
                  </span>
                ))}
              </div>
            )}

            {/* Dynamic Plot Rendering based on selected chartView */}
            {displayChartData.length > 0 ? (
              <div style={{ position: 'relative', width: '100%', flex: 1, minHeight: 300 }}>
                <ResponsiveContainer width="100%" height={300}>
                  {chartView === 'area' ? (
                    <AreaChart data={displayChartData} margin={{ top: 12, right: 16, left: -10, bottom: 4 }}>
                      <defs>
                        <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#178582" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#178582" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#E11D48" stopOpacity={0.28} />
                          <stop offset="95%" stopColor="#E11D48" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="forecastIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00ABE4" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#00ABE4" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="forecastExpenseGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F87171" stopOpacity={0.22} />
                          <stop offset="95%" stopColor="#F87171" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(233,241,250,0.08)" : "rgba(10,24,40,0.08)"} />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: isDark ? '#E9F1FA' : '#3B5266', fontSize: 11 }}
                        stroke={isDark ? "rgba(233,241,250,0.15)" : "rgba(10,24,40,0.15)"}
                      />
                      <YAxis
                        tick={{ fill: isDark ? '#E9F1FA' : '#3B5266', fontSize: 11 }}
                        stroke={isDark ? "rgba(233,241,250,0.15)" : "rgba(10,24,40,0.15)"}
                        tickFormatter={(val) => `${currency}${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
                      />
                      <Tooltip content={<CustomTrendTooltip currency={currency} isDark={isDark} />} />
                      <Legend
                        wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }}
                        formatter={(value) => <span style={{ color: 'var(--text-secondary)' }}>{value}</span>}
                      />

                      <Area
                        type="monotone"
                        dataKey="Income"
                        stroke="#178582"
                        strokeWidth={2.5}
                        fill="url(#incomeGrad)"
                        dot={{ r: 3.5, fill: '#178582', strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: '#178582' }}
                        name="Actual Inflow"
                        connectNulls={false}
                        isAnimationActive
                        animationDuration={850}
                        animationEasing="ease-out"
                      />
                      <Area
                        type="monotone"
                        dataKey="Expenses"
                        stroke="#E11D48"
                        strokeWidth={2.5}
                        fill="url(#expenseGrad)"
                        dot={{ r: 3.5, fill: '#E11D48', strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: '#E11D48' }}
                        name="Actual Outflow"
                        connectNulls={false}
                        isAnimationActive
                        animationDuration={850}
                        animationEasing="ease-out"
                      />

                      {isEligibleForForecast && (
                        <Area
                          type="monotone"
                          dataKey="ForecastIncome"
                          stroke="#00ABE4"
                          strokeWidth={2.5}
                          strokeDasharray="5 5"
                          fill="url(#forecastIncomeGrad)"
                          dot={{ r: 4.5, fill: '#178582', stroke: '#00ABE4', strokeWidth: 2 }}
                          activeDot={{ r: 7, fill: '#00ABE4' }}
                          name={`Forecast Inflow (+${forecastHorizon}M)`}
                          connectNulls
                        />
                      )}
                      {isEligibleForForecast && (
                        <Area
                          type="monotone"
                          dataKey="ForecastExpenses"
                          stroke="#F87171"
                          strokeWidth={2.5}
                          strokeDasharray="5 5"
                          fill="url(#forecastExpenseGrad)"
                          dot={{ r: 4.5, fill: '#E11D48', stroke: '#F87171', strokeWidth: 2 }}
                          activeDot={{ r: 7, fill: '#F87171' }}
                          name={`Forecast Outflow (+${forecastHorizon}M)`}
                          connectNulls
                        />
                      )}
                    </AreaChart>
                  ) : chartView === 'bar' ? (
                    <BarChart data={displayChartData} margin={{ top: 12, right: 16, left: -10, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(233,241,250,0.08)" : "rgba(10,24,40,0.08)"} />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: isDark ? '#E9F1FA' : '#3B5266', fontSize: 11 }}
                        stroke={isDark ? "rgba(233,241,250,0.15)" : "rgba(10,24,40,0.15)"}
                      />
                      <YAxis
                        tick={{ fill: isDark ? '#E9F1FA' : '#3B5266', fontSize: 11 }}
                        stroke={isDark ? "rgba(233,241,250,0.15)" : "rgba(10,24,40,0.15)"}
                        tickFormatter={(val) => `${currency}${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
                      />
                      <Tooltip content={<CustomTrendTooltip currency={currency} isDark={isDark} />} />
                      <Legend
                        wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }}
                        formatter={(value) => <span style={{ color: 'var(--text-secondary)' }}>{value}</span>}
                      />
                      <Bar
                        dataKey="Income"
                        fill="#178582"
                        name="Actual Inflow"
                        radius={[5, 5, 0, 0]}
                        isAnimationActive
                        animationDuration={750}
                      />
                      <Bar
                        dataKey="Expenses"
                        fill="#E11D48"
                        name="Actual Outflow"
                        radius={[5, 5, 0, 0]}
                        isAnimationActive
                        animationDuration={750}
                      />
                      {isEligibleForForecast && (
                        <Bar
                          dataKey="ForecastIncome"
                          fill="#00ABE4"
                          name={`Forecast Inflow (+${forecastHorizon}M)`}
                          radius={[5, 5, 0, 0]}
                          isAnimationActive
                          animationDuration={750}
                        />
                      )}
                      {isEligibleForForecast && (
                        <Bar
                          dataKey="ForecastExpenses"
                          fill="#F87171"
                          name={`Forecast Outflow (+${forecastHorizon}M)`}
                          radius={[5, 5, 0, 0]}
                          isAnimationActive
                          animationDuration={750}
                        />
                      )}
                    </BarChart>
                  ) : (
                    <AreaChart data={displayChartData} margin={{ top: 12, right: 16, left: -10, bottom: 4 }}>
                      <defs>
                        <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={isDark ? "#BFA181" : "#00ABE4"} stopOpacity={0.35} />
                          <stop offset="95%" stopColor={isDark ? "#BFA181" : "#00ABE4"} stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(233,241,250,0.08)" : "rgba(10,24,40,0.08)"} />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: isDark ? '#E9F1FA' : '#3B5266', fontSize: 11 }}
                        stroke={isDark ? "rgba(233,241,250,0.15)" : "rgba(10,24,40,0.15)"}
                      />
                      <YAxis
                        tick={{ fill: isDark ? '#E9F1FA' : '#3B5266', fontSize: 11 }}
                        stroke={isDark ? "rgba(233,241,250,0.15)" : "rgba(10,24,40,0.15)"}
                        tickFormatter={(val) => `${currency}${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
                      />
                      <ReferenceLine y={0} stroke={isDark ? "rgba(191, 161, 129, 0.35)" : "rgba(10, 24, 40, 0.2)"} strokeDasharray="3 3" />
                      <Tooltip content={<CustomTrendTooltip currency={currency} isDark={isDark} />} />
                      <Legend
                        wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }}
                        formatter={(value) => <span style={{ color: 'var(--text-secondary)' }}>{value}</span>}
                      />
                      <Area
                        type="monotone"
                        dataKey="Savings"
                        stroke={isDark ? "#BFA181" : "#00ABE4"}
                        strokeWidth={2.5}
                        fill="url(#netGrad)"
                        dot={{ r: 4, fill: isDark ? '#BFA181' : '#00ABE4' }}
                        activeDot={{ r: 7, fill: isDark ? '#DFCAAF' : '#38BDF8' }}
                        name="Net Wealth Delta (Surplus / Deficit)"
                        isAnimationActive
                        animationDuration={850}
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
                <p>Add financial records to see trend line analysis</p>
              </div>
            )}

            {/* Ineligibility Notice if < 12 Months */}
            {!isEligibleForForecast && historyList.length > 0 && (
              <div
                style={{
                  margin: '8px 0 4px 0',
                  padding: '8px 12px',
                  background: 'var(--warning-bg)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11px',
                  color: 'var(--warning)',
                }}
              >
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                <span>
                  <strong>12-Month History Required:</strong> Predictive forecasting requires at least 12 months of historical records to accurately detect annual spending patterns. Currently recorded: <strong>{historicalCount}/12 months</strong>. Projections will automatically unlock once 12 months are recorded.
                </span>
              </div>
            )}

            {/* Mandatory Disclaimer at the bottom of the plot */}
            <div
              style={{
                marginTop: 'auto',
                paddingTop: '8px',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                fontSize: '11px',
                color: 'var(--text-muted)',
                lineHeight: 1.4,
              }}
            >
              <Info size={13} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--accent-primary)' }} />
              <span>
                <strong>Disclaimer:</strong> {String(timeSeriesForecast?.disclaimer || "Forecasts are generated using historical cash-flow trends for informational budgeting guidance only, not financial advice. Projections require at least 12 months of data, and actual outcomes may differ.").replace(/^Disclaimer:\s*/i, '')}
              </span>
            </div>
          </div>

          {/* Spending Breakdown & Interactive Category Matrix */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
              <div>
                <span className="card-title">Spending Breakdown</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>
                  Interactive Category Allocation & Share of Wallet
                </span>
              </div>
            </div>
            {expenseCategories.length > 0 ? (
              <>
                <div style={{ position: 'relative', width: '100%', height: 260 }}>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={expenseCategories}
                        cx="50%"
                        cy="50%"
                        innerRadius={68}
                        outerRadius={98}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                        onMouseEnter={(_, idx) => setHoveredCategory(expenseCategories[idx])}
                        onMouseLeave={() => setHoveredCategory(null)}
                      >
                        {expenseCategories.map((_, idx) => (
                          <Cell
                            key={idx}
                            fill={donutColors[idx % donutColors.length]}
                            opacity={hoveredCategory && hoveredCategory.name !== expenseCategories[idx].name ? 0.45 : 1}
                            style={{ cursor: 'pointer', transition: 'opacity 200ms ease' }}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Dynamic Center Donut Metric - High-legibility readout without tooltip collisions */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                      pointerEvents: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      maxWidth: '130px',
                      zIndex: 2,
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: hoveredCategory ? (isDark ? '#BFA181' : 'var(--text-primary)') : 'var(--text-muted)',
                        fontWeight: 700,
                        transition: 'color 150ms ease',
                      }}
                    >
                      {hoveredCategory ? hoveredCategory.name : 'Total Outflow'}
                    </span>
                    <span
                      className="tabular-nums"
                      style={{
                        fontSize: '17px',
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-mono)',
                        margin: '2px 0',
                        lineHeight: 1.2,
                      }}
                    >
                      {currency}{Number(hoveredCategory ? hoveredCategory.value : totalExpensesSum || 0).toLocaleString('en-IN')}
                    </span>
                    {hoveredCategory && totalExpensesSum > 0 ? (
                      <span
                        style={{
                          fontSize: '10.5px',
                          color: isDark ? '#BFA181' : 'var(--accent-primary)',
                          fontWeight: 700,
                          background: isDark ? 'rgba(191, 161, 129, 0.18)' : 'rgba(0, 171, 228, 0.12)',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          border: isDark ? '1px solid rgba(191, 161, 129, 0.35)' : '1px solid rgba(0, 171, 228, 0.25)',
                          marginTop: '2px',
                        }}
                      >
                        {Math.round((hoveredCategory.value / totalExpensesSum) * 100)}% share
                      </span>
                    ) : (
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {expenseCategories.length} categories
                      </span>
                    )}
                  </div>
                </div>

                {/* Interactive Category Progress Matrix */}
                <div className="spending-matrix-list">
                  {expenseCategories.slice(0, 5).map((cat, i) => {
                    const pct = totalExpensesSum > 0 ? Math.round((cat.value / totalExpensesSum) * 100) : 0;
                    const catColor = donutColors[i % donutColors.length];
                    const isHovered = hoveredCategory?.name === cat.name;

                    return (
                      <div
                        key={i}
                        className="spending-matrix-row"
                        onMouseEnter={() => setHoveredCategory(cat)}
                        onMouseLeave={() => setHoveredCategory(null)}
                        style={{
                          cursor: 'pointer',
                          padding: '4px 6px',
                          borderRadius: '6px',
                          background: isHovered ? 'var(--bg-card-hover)' : 'transparent',
                          transition: 'background-color 150ms ease',
                        }}
                      >
                        <div className="spending-matrix-header">
                          <span className="spending-matrix-cat">
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: catColor, flexShrink: 0 }} />
                            <span>{cat.name}</span>
                          </span>
                          <span className="spending-matrix-amount">
                            {currency}{Number(cat?.value || 0).toLocaleString('en-IN')} <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({pct}%)</span>
                          </span>
                        </div>
                        <div className="spending-matrix-track">
                          <div
                            className="spending-matrix-fill"
                            style={{
                              width: `${pct}%`,
                              background: catColor,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
                <p>Upload transactions to see spending breakdown</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ marginTop: 'var(--space-xl)' }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Quick Actions</span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
            <Link to="/analysis" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={16} /> Financial Audit
            </Link>
            <Link to="/budget" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <PieChartIcon size={16} /> Budget Planner
            </Link>
            <Link to="/advisor" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={16} /> Ask Advisor
            </Link>
            <Link to="/ie-form" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <PlusCircle size={16} /> Add Data
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

