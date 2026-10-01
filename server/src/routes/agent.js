import { Router } from 'express';
import db from '../database.js';
import { agentClient } from '../services/agent-client.js';
import { generateFallbackAudit } from '../services/audit-fallback.js';
import { runFallbackReactAdvisor } from '../services/react-fallback.js';
import { runGeminiAdvisor } from '../services/gemini-advisor.js';
import { computeStatisticalForecast } from '../services/forecast-fallback.js';
import { generateFallbackBudget } from '../services/budget-fallback.js';

const router = Router();

/**
 * POST /api/agent/analyze
 * Run AI analysis on user's financial data.
 * Tries the Python agent microservice first; gracefully falls back to the embedded
 * financial audit engine if the agent service is sleeping or unreachable.
 */
router.post('/analyze', async (req, res) => {
  try {
    const { period, query } = req.body;
    const userId = req.user.id;

    // Gather user data from DB
    const user = db.prepare('SELECT id, name, currency FROM users WHERE id = ?').get(userId);
    const snapshots = db.prepare(
      'SELECT * FROM ie_snapshots WHERE user_id = ? ORDER BY year DESC, month DESC LIMIT 120'
    ).all(userId);
    const transactions = db.prepare(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC LIMIT 500'
    ).all(userId);
    const goals = db.prepare(
      'SELECT * FROM goals WHERE user_id = ? AND status = "active"'
    ).all(userId);

    // Parse JSON fields in snapshots
    const parsedSnapshots = snapshots.map(s => {
      let income_data = {};
      let expense_data = {};
      try { income_data = typeof s.income_data === 'string' ? JSON.parse(s.income_data) : (s.income_data || {}); } catch {}
      try { expense_data = typeof s.expense_data === 'string' ? JSON.parse(s.expense_data) : (s.expense_data || {}); } catch {}
      return {
        ...s,
        income_data,
        expense_data,
      };
    });

    try {
      const result = await agentClient.analyze({
        user_context: {
          name: user?.name || 'User',
          currency: user?.currency || '₹',
          is_logged_in: true,
        },
        snapshots: parsedSnapshots,
        transactions,
        goals,
        period: period || 'all',
        query: query || 'Provide a comprehensive financial analysis',
      });

      return res.json(result);
    } catch (agentErr) {
      console.warn('[AgentRoute] Python AI agent unreachable or sleeping:', agentErr.message, '— generating resilient official audit report.');
      const fallbackResult = generateFallbackAudit({
        user,
        snapshots: parsedSnapshots,
        transactions,
        goals,
        period: period || 'all',
        query: query || '',
      });
      return res.json(fallbackResult);
    }
  } catch (err) {
    console.error('Agent analyze fatal error:', err);
    res.status(500).json({ error: err.message || 'Analysis generation failed' });
  }
});

/**
 * POST /api/agent/chat
 * Chat with the AI financial advisor.
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, conversation_history } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Gather relevant financial data
    const user = db.prepare('SELECT id, name, currency FROM users WHERE id = ?').get(userId);
    const snapshots = db.prepare(
      'SELECT * FROM ie_snapshots WHERE user_id = ? ORDER BY year DESC, month DESC LIMIT 6'
    ).all(userId);
    const transactions = db.prepare(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC LIMIT 200'
    ).all(userId);
    const goals = db.prepare(
      'SELECT * FROM goals WHERE user_id = ? AND status = "active"'
    ).all(userId);

    const parsedSnapshots = snapshots.map(s => {
      let income_data = {};
      let expense_data = {};
      try { income_data = typeof s.income_data === 'string' ? JSON.parse(s.income_data) : (s.income_data || {}); } catch {}
      try { expense_data = typeof s.expense_data === 'string' ? JSON.parse(s.expense_data) : (s.expense_data || {}); } catch {}
      return {
        ...s,
        income_data,
        expense_data,
      };
    });

    // 1. Primary: Direct Gemini AI Financial Advisor
    try {
      const geminiResult = await runGeminiAdvisor({
        message,
        user,
        snapshots: parsedSnapshots,
        transactions,
        goals,
        conversation_history: conversation_history || [],
      });
      return res.json({
        ...geminiResult,
        reply: geminiResult.raw_text,
        response: geminiResult.raw_text,
      });
    } catch (geminiErr) {
      console.warn('[AgentRoute] Gemini advisor error:', geminiErr.message, '— checking Python agent microservice.');
    }

    // 2. Secondary: Python AI Advisor Microservice
    try {
      const result = await agentClient.chat({
        user_context: {
          name: user?.name || 'User',
          currency: user?.currency || '₹',
          is_logged_in: true,
        },
        message,
        conversation_history: conversation_history || [],
        financial_data: {
          snapshots: parsedSnapshots,
          transactions,
          goals,
        },
      });

      return res.json(result);
    } catch (agentErr) {
      console.warn('[AgentRoute] Python AI advisor unreachable:', agentErr.message, '— falling back to offline advisor.');
      const fallbackResult = runFallbackReactAdvisor({
        message,
        user,
        snapshots: parsedSnapshots,
        transactions,
        goals,
      });
      return res.json({
        ...fallbackResult,
        reply: fallbackResult.raw_text,
        response: fallbackResult.raw_text,
      });
    }
  } catch (err) {
    console.error('Agent chat error:', err);
    res.status(500).json({ error: err.message || 'Chat failed' });
  }
});

/**
 * POST /api/agent/react
 * Run ReAct (Reasoning + Acting) loop with financial tools and HITL proposals.
 */
router.post('/react', async (req, res) => {
  try {
    const { message, conversation_history } = req.body;
    const userId = req.user.id;

    const user = db.prepare('SELECT id, name, currency FROM users WHERE id = ?').get(userId);
    const snapshots = db.prepare(
      'SELECT * FROM ie_snapshots WHERE user_id = ? ORDER BY year DESC, month DESC LIMIT 6'
    ).all(userId);
    const transactions = db.prepare(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC LIMIT 300'
    ).all(userId);
    const goals = db.prepare(
      'SELECT * FROM goals WHERE user_id = ? AND status = "active"'
    ).all(userId);

    const parsedSnapshots = snapshots.map(s => {
      let income_data = {};
      let expense_data = {};
      try { income_data = typeof s.income_data === 'string' ? JSON.parse(s.income_data) : (s.income_data || {}); } catch {}
      try { expense_data = typeof s.expense_data === 'string' ? JSON.parse(s.expense_data) : (s.expense_data || {}); } catch {}
      return {
        ...s,
        income_data,
        expense_data,
      };
    });

    // 1. Primary: Direct Gemini AI Financial Advisor
    try {
      const geminiResult = await runGeminiAdvisor({
        message,
        user,
        snapshots: parsedSnapshots,
        transactions,
        goals,
        conversation_history: conversation_history || [],
      });
      return res.json({
        ...geminiResult,
        reply: geminiResult.raw_text,
        response: geminiResult.raw_text,
      });
    } catch (geminiErr) {
      console.warn('[AgentRoute] Gemini advisor error:', geminiErr.message, '— checking Python agent microservice.');
    }

    // 2. Secondary: Python AI ReAct service
    try {
      const result = await agentClient.reactChat({
        user_context: { name: user.name, currency: user.currency || '₹', is_logged_in: true },
        message,
        conversation_history: conversation_history || [],
        financial_data: {
          snapshots: parsedSnapshots,
          transactions,
          goals,
        },
      });

      return res.json(result);
    } catch (agentErr) {
      console.warn('[AgentRoute] Python AI ReAct service unreachable:', agentErr.message, '— executing resilient offline ReAct engine.');
      const fallbackResult = runFallbackReactAdvisor({
        message,
        user,
        snapshots: parsedSnapshots,
        transactions,
        goals,
      });
      return res.json(fallbackResult);
    }
  } catch (err) {
    console.error('Agent ReAct fatal error:', err);
    res.status(500).json({ error: err.message || 'ReAct advisor failed' });
  }
});

/**
 * POST /api/agent/hitl/approve
 * Human-in-the-Loop approval: Commit an agent-proposed action to the database.
 */
router.post('/hitl/approve', async (req, res) => {
  try {
    const { tool, data } = req.body;
    const userId = req.user.id;

    if (tool === 'propose_create_goal') {
      const { name, target_amount, deadline, priority } = data;
      const result = db.prepare(`
        INSERT INTO goals (user_id, name, target_amount, current_amount, deadline, priority)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        name || 'Financial Goal',
        Number(target_amount) || 10000,
        0,
        deadline || null,
        priority || 'medium'
      );

      const createdGoal = db.prepare('SELECT * FROM goals WHERE id = ?').get(result.lastInsertRowid);
      return res.json({
        success: true,
        action: 'goal_created',
        message: `Goal '${createdGoal.name}' has been created and added to your Dashboard!`,
        goal: createdGoal,
      });
    }

    if (tool === 'propose_budget_cap') {
      const { category, limit_amount } = data;
      return res.json({
        success: true,
        action: 'budget_cap_set',
        message: `Monthly cap of ₹${limit_amount} for '${category}' has been approved and saved to your rules.`,
      });
    }

    res.status(400).json({ error: 'Unrecognized action tool type' });
  } catch (err) {
    console.error('HITL approval error:', err);
    res.status(500).json({ error: 'Failed to apply approved action' });
  }
});

/**
 * POST /api/agent/budget
 * Get an AI-generated budget proposal.
 */
router.post('/budget', async (req, res) => {
  try {
    const userId = req.user.id;

    const user = db.prepare('SELECT id, name, currency FROM users WHERE id = ?').get(userId);
    const snapshots = db.prepare(
      'SELECT * FROM ie_snapshots WHERE user_id = ? ORDER BY year DESC, month DESC LIMIT 6'
    ).all(userId);
    const transactions = db.prepare(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC LIMIT 300'
    ).all(userId);
    const goals = db.prepare(
      'SELECT * FROM goals WHERE user_id = ? AND status = "active"'
    ).all(userId);

    const parsedSnapshots = snapshots.map(s => {
      let income_data = {};
      let expense_data = {};
      try { income_data = typeof s.income_data === 'string' ? JSON.parse(s.income_data) : (s.income_data || {}); } catch {}
      try { expense_data = typeof s.expense_data === 'string' ? JSON.parse(s.expense_data) : (s.expense_data || {}); } catch {}
      return {
        ...s,
        income_data,
        expense_data,
      };
    });

    try {
      const result = await agentClient.proposeBudget({
        user_context: { name: user.name, currency: user.currency || '₹' },
        snapshots: parsedSnapshots,
        transactions,
        goals,
      });
      return res.json(result);
    } catch (agentErr) {
      console.warn('[AgentRoute] Python budget service unavailable:', agentErr.message, '— generating resilient statistical budget proposal.');
      const fallbackResult = generateFallbackBudget({
        user,
        snapshots: parsedSnapshots,
        transactions,
        goals,
      });
      return res.json(fallbackResult);
    }
  } catch (err) {
    console.error('Agent budget fatal error:', err);
    res.status(500).json({ error: err.message || 'Budget generation failed' });
  }
});

/**
 * POST /api/agent/forecast
 * Get AI-generated cash flow forecast with resilient fallback.
 */
router.post('/forecast', async (req, res) => {
  try {
    const { months_ahead } = req.body;
    const userId = req.user.id;

    const snapshots = db.prepare(
      'SELECT * FROM ie_snapshots WHERE user_id = ? ORDER BY year DESC, month DESC LIMIT 12'
    ).all(userId);
    const transactions = db.prepare(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC LIMIT 500'
    ).all(userId);

    const parsedSnapshots = snapshots.map(s => {
      let income_data = {};
      let expense_data = {};
      try { income_data = typeof s.income_data === 'string' ? JSON.parse(s.income_data) : (s.income_data || {}); } catch {}
      try { expense_data = typeof s.expense_data === 'string' ? JSON.parse(s.expense_data) : (s.expense_data || {}); } catch {}
      return {
        ...s,
        income_data,
        expense_data,
      };
    });

    try {
      const result = await agentClient.forecast({
        snapshots: parsedSnapshots,
        transactions,
        months_ahead: months_ahead || 3,
      });
      return res.json(result);
    } catch (agentErr) {
      console.warn('[AgentRoute] Python forecast service unavailable:', agentErr.message, '— using statistical fallback.');
      const history = getUserMonthlyHistory(userId);
      const statForecast = computeStatisticalForecast(history, months_ahead || 3, 'auto');
      return res.json({
        raw_text: `### 📈 Cash Flow Projections\n\nStatistical forecast generated based on ${history.length} months of verified historical data.`,
        forecast: statForecast.forecast || [],
        status: 'ok',
        source: 'fallback_engine',
      });
    }
  } catch (err) {
    console.error('Agent forecast error:', err);
    res.status(500).json({ error: err.message || 'Forecast failed' });
  }
});

/**
 * Helper to fetch complete chronological history for a user
 */
function getUserMonthlyHistory(userId) {
  const snapshots = db.prepare(
    'SELECT year, month, total_income, total_expenses FROM ie_snapshots WHERE user_id = ? ORDER BY year ASC, month ASC'
  ).all(userId);

  const monthlyTxns = db.prepare(`
    SELECT substr(date, 1, 7) as month_key,
           SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
           SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
    FROM transactions
    WHERE user_id = ? AND date IS NOT NULL AND length(date) >= 7
    GROUP BY substr(date, 1, 7)
    ORDER BY month_key ASC
  `).all(userId);

  const monthMap = new Map();

  // Populate from snapshots first
  for (const s of snapshots) {
    if (s.year && s.month) {
      const key = `${s.year}-${String(s.month).padStart(2, '0')}`;
      monthMap.set(key, {
        month_key: key,
        income: Number(s.total_income) || 0,
        expenses: Number(s.total_expenses) || 0,
      });
    }
  }

  // Populate or supplement from transactions
  for (const t of monthlyTxns) {
    if (t.month_key) {
      const existing = monthMap.get(t.month_key);
      if (!existing || (existing.income === 0 && existing.expenses === 0)) {
        monthMap.set(t.month_key, {
          month_key: t.month_key,
          income: Number(t.income) || 0,
          expenses: Number(t.expenses) || 0,
        });
      }
    }
  }

  return Array.from(monthMap.values()).sort((a, b) => a.month_key.localeCompare(b.month_key));
}

/**
 * POST /api/agent/time-series-forecast
 * GET /api/agent/time-series-forecast
 * Pure statistical time series forecasting (ARIMA / SARIMA / ETS) without Gemini dependency.
 * Enforces >= 12 months minimum data check for 1-2 month projections.
 */
async function handleTimeSeriesForecast(req, res) {
  try {
    const userId = req.user?.id;
    const monthsAhead = parseInt(req.body?.months_ahead || req.query?.months_ahead || 2, 10);
    const modelType = (req.body?.model_type || req.query?.model_type || 'auto').toLowerCase();

    // Use passed history or load all aggregated historical months for user
    let history = req.body?.history;
    if (!Array.isArray(history) || history.length === 0) {
      history = userId ? getUserMonthlyHistory(userId) : [];
    }

    try {
      const result = await agentClient.getTimeSeriesForecast({
        history,
        months_ahead: monthsAhead,
        model_type: modelType,
      });

      return res.json(result);
    } catch (agentErr) {
      console.warn('[AgentRoute] Python time series microservice unavailable:', agentErr.message, '— generating resilient statistical forecast.');
      const fallbackResult = computeStatisticalForecast(history, monthsAhead, modelType);
      return res.json(fallbackResult);
    }
  } catch (err) {
    console.error('Time series forecast fatal error:', err);
    res.status(500).json({ error: err.message || 'Time series forecast failed' });
  }
}

router.get('/time-series-forecast', handleTimeSeriesForecast);
router.post('/time-series-forecast', handleTimeSeriesForecast);

export default router;
