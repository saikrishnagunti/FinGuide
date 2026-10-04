import { Router } from 'express';
import multer from 'multer';
import { mkdirSync } from 'fs';
import config from '../config.js';
import { agentClient } from '../services/agent-client.js';
import { parseStatementFile } from '../services/statement-parser.js';
import { generateFallbackAudit } from '../services/audit-fallback.js';
import { runGeminiAdvisor } from '../services/gemini-advisor.js';
import { runFallbackReactAdvisor } from '../services/react-fallback.js';

const router = Router();

mkdirSync(config.uploadDir, { recursive: true });

// Accept CSV and PDF statements (up to 15 MB) for in-memory guest parsing
const upload = multer({
  dest: config.uploadDir,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isCsvExt = /\.csv$/i.test(file.originalname);
    const isPdfExt = /\.pdf$/i.test(file.originalname);
    const validMimes = [
      'text/csv',
      'text/plain',
      'application/csv',
      'application/vnd.ms-excel',
      'text/comma-separated-values',
      'application/octet-stream',
      'application/pdf',
    ];
    if (isCsvExt || isPdfExt || validMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV (.csv) or PDF (.pdf) bank statement files are allowed.'));
    }
  },
});

/**
 * POST /api/guest/parse
 * Parse a bank statement (PDF or CSV) in-memory for a guest session.
 * NO database writes or persistent storage.
 */
router.post('/parse', (req, res) => {
  upload.single('statement')(req, res, async (err) => {
    if (err) {
      console.warn('Guest upload warning:', err.message);
      return res.status(400).json({ error: err.message || 'File upload failed' });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file received. Please select a CSV or PDF file to upload.' });
      }

      console.log(`[Guest] Parsing bank statement: ${req.file.originalname} (${req.file.mimetype})`);
      const parsedData = await parseStatementFile(
        req.file.path,
        req.file.originalname,
        req.file.mimetype,
        agentClient
      );

      res.json({
        preview: true,
        guest_session: true,
        ...parsedData,
      });
    } catch (parseErr) {
      console.error('Guest statement parse error:', parseErr);
      res.status(400).json({ error: `Failed to parse statement: ${parseErr.message}` });
    }
  });
});

/**
 * POST /api/guest/analyze
 * Run financial analysis for a guest user (no login required, no database writes).
 * Accepts income_data, expense_data, and/or transactions from current session.
 */
router.post('/analyze', async (req, res) => {
  try {
    const { income_data, expense_data, transactions, query } = req.body;

    const hasIEData = (income_data && Object.keys(income_data).length > 0) ||
                      (expense_data && Object.keys(expense_data).length > 0);
    const hasTransactions = Array.isArray(transactions) && transactions.length > 0;

    if (!hasIEData && !hasTransactions) {
      return res.status(400).json({
        error: 'Please provide either Income & Expense data or an uploaded bank statement to analyze.',
      });
    }

    // Build single-session snapshot if I&E data provided
    let snapshots = [];
    if (hasIEData) {
      const totalIncome = Object.values(income_data || {}).reduce((s, v) => s + (Number(v) || 0), 0);
      const totalExpenses = Object.values(expense_data || {}).reduce((s, v) => s + (Number(v) || 0), 0);
      snapshots.push({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        income_data: income_data || {},
        expense_data: expense_data || {},
        total_income: Math.round(totalIncome * 100) / 100,
        total_expenses: Math.round(totalExpenses * 100) / 100,
        net_savings: Math.round((totalIncome - totalExpenses) * 100) / 100,
      });
    }

    try {
      // Forward to agent with is_logged_in: false (triggers GUEST_ANALYSIS_PROMPT)
      const result = await agentClient.analyze({
        user_context: {
          name: 'Guest User',
          currency: '₹',
          is_logged_in: false,
        },
        snapshots,
        transactions: transactions || [],
        goals: [],
        period: 'current_session',
        query: query || 'Provide a comprehensive guest financial audit for this session',
      });

      return res.json({
        guest_mode: true,
        ...result,
      });
    } catch (agentErr) {
      console.warn('[GuestRoute] Python agent microservice unavailable:', agentErr.message, '— generating resilient guest audit report.');
      const fallbackResult = generateFallbackAudit({
        user: { name: 'Guest User', currency: '₹' },
        snapshots,
        transactions: transactions || [],
        goals: [],
        period: 'current_session',
        query: query || '',
      });
      return res.json({
        guest_mode: true,
        ...fallbackResult,
      });
    }
  } catch (err) {
    console.error('Guest analyze fatal error:', err);
    res.status(500).json({ error: err.message || 'Analysis failed' });
  }
});

/**
 * POST /api/guest/chat
 * Interactive AI financial advisor for guest session (in-memory, no auth, no DB writes).
 * Accepts user's question, conversation history, and financial telemetry from current session.
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, conversation_history, financial_data } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const income_data = financial_data?.income_data || {};
    const expense_data = financial_data?.expense_data || {};
    const transactions = Array.isArray(financial_data?.transactions) ? financial_data.transactions : [];
    const auditSummary = financial_data?.audit_summary || '';

    const hasIEData = Object.keys(income_data).length > 0 || Object.keys(expense_data).length > 0;
    const hasTransactions = transactions.length > 0;

    let snapshots = [];
    if (hasIEData) {
      const totalIncome = Object.values(income_data).reduce((s, v) => s + (Number(v) || 0), 0);
      const totalExpenses = Object.values(expense_data).reduce((s, v) => s + (Number(v) || 0), 0);
      snapshots.push({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        income_data,
        expense_data,
        total_income: Math.round(totalIncome * 100) / 100,
        total_expenses: Math.round(totalExpenses * 100) / 100,
        net_savings: Math.round((totalIncome - totalExpenses) * 100) / 100,
      });
    } else if (hasTransactions) {
      const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + (Number(t.amount) || 0), 0);
      const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + (Number(t.amount) || 0), 0);
      const derivedExpenses = {};
      for (const t of transactions) {
        if (t.type === 'expense') {
          const cat = t.category || 'General';
          derivedExpenses[cat] = (derivedExpenses[cat] || 0) + (Number(t.amount) || 0);
        }
      }
      snapshots.push({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        income_data: { 'Statement Inflow': totalIncome },
        expense_data: derivedExpenses,
        total_income: Math.round(totalIncome * 100) / 100,
        total_expenses: Math.round(totalExpenses * 100) / 100,
        net_savings: Math.round((totalIncome - totalExpenses) * 100) / 100,
      });
    }

    const guestUser = {
      name: 'Guest Explorer',
      currency: '₹',
      is_logged_in: false,
    };

    // 1. Primary: Direct Gemini AI Advisor
    try {
      const geminiResult = await runGeminiAdvisor({
        message,
        user: guestUser,
        snapshots,
        transactions,
        goals: [],
        conversation_history: conversation_history || [],
        auditSummary,
      });
      return res.json({
        guest_mode: true,
        ...geminiResult,
        reply: geminiResult.raw_text,
        response: geminiResult.raw_text,
      });
    } catch (geminiErr) {
      console.warn('[GuestChat] Gemini advisor unavailable:', geminiErr.message, '— checking Python agent microservice.');
    }

    // 2. Secondary: Python Agent Microservice
    try {
      const agentResult = await agentClient.chat({
        user_context: guestUser,
        message,
        conversation_history: conversation_history || [],
        financial_data: {
          snapshots,
          transactions,
          goals: [],
        },
      });
      return res.json({
        guest_mode: true,
        ...agentResult,
        reply: agentResult.raw_text || agentResult.summary,
        response: agentResult.raw_text || agentResult.summary,
      });
    } catch (agentErr) {
      console.warn('[GuestChat] Python agent unavailable:', agentErr.message, '— executing resilient offline advisor.');
    }

    // 3. Fallback: Offline resilient advisor
    const fallbackResult = runFallbackReactAdvisor({
      message,
      user: guestUser,
      snapshots,
      transactions,
      goals: [],
    });

    return res.json({
      guest_mode: true,
      ...fallbackResult,
      reply: fallbackResult.raw_text,
      response: fallbackResult.raw_text,
    });
  } catch (err) {
    console.error('Guest chat fatal error:', err);
    res.status(500).json({ error: err.message || 'Chat service failed' });
  }
});

export default router;
