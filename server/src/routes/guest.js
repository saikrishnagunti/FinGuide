import { Router } from 'express';
import multer from 'multer';
import { mkdirSync } from 'fs';
import config from '../config.js';
import { agentClient } from '../services/agent-client.js';
import { parseStatementFile } from '../services/statement-parser.js';

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

import { generateFallbackAudit } from '../services/audit-fallback.js';

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

export default router;
