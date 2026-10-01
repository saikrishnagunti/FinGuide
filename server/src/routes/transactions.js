import { Router } from 'express';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import { readFileSync, unlinkSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database.js';
import config from '../config.js';
import { agentClient } from '../services/agent-client.js';
import { parseStatementFile } from '../services/statement-parser.js';

const router = Router();

mkdirSync(config.uploadDir, { recursive: true });

// Accept CSV and PDF statements (up to 15 MB)
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
 * Categorize transaction based on keywords in description.
 */
function autoCategorize(description, rawCategory) {
  if (rawCategory && rawCategory.trim() && rawCategory.toLowerCase() !== 'uncategorized') {
    return rawCategory.trim();
  }
  const desc = (description || '').toLowerCase();

  if (/salary|payroll|stipend|interest credit|dividend|neft credit|bonus/i.test(desc)) return 'Salary & Income';
  if (/swiggy|zomato|starbucks|mcdonald|kfc|pizza|burger|cafe|restaurant|baking|dining|eat/i.test(desc)) return 'Food & Dining';
  if (/blinkit|zepto|instamart|dmart|bigbasket|supermarket|grocery|groceries|spencer|fresh/i.test(desc)) return 'Groceries';
  if (/uber|ola|rapido|metro|petrol|fuel|shell|bpcl|hpcl|toll|fastag|commute|cab/i.test(desc)) return 'Transportation';
  if (/amazon|flipkart|myntra|ajio|zara|h&m|shopping|retail|store|mall|nykaa/i.test(desc)) return 'Shopping';
  if (/netflix|spotify|prime|hotstar|youtube|movie|cinema|pvr|inox|entertainment|game|playstation/i.test(desc)) return 'Entertainment';
  if (/rent|maintenance|society|housing|landlord|estate/i.test(desc)) return 'Housing';
  if (/bescom|electricity|water|airtel|jio|vi|broadband|wifi|tataplay|dth|gas|cylinder|utility|utilities/i.test(desc)) return 'Utilities';
  if (/pharmacy|hospital|clinic|apollo|1mg|practo|medplus|doctor|health|wellness/i.test(desc)) return 'Healthcare';
  if (/insurance|lic|hdfc life|max life|star health|policy/i.test(desc)) return 'Insurance';
  if (/sip|zerodha|groww|mutual fund|upstox|mf|investment|etmoney/i.test(desc)) return 'Investments';

  return 'General';
}

/**
 * Clean and parse numeric amount strings.
 */
function parseCleanAmount(val) {
  if (val === undefined || val === null) return 0;
  const str = String(val).replace(/[₹$€£,\s]/g, '').trim();
  return parseFloat(str) || 0;
}

/**
 * Standardize dates into YYYY-MM-DD format.
 */
function normalizeDate(dateStr) {
  if (!dateStr) return '';
  const s = String(dateStr).trim();

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // DD/MM/YYYY or DD-MM-YYYY
  const ddmmyyyy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (ddmmyyyy) {
    const [, d, m, y] = ddmmyyyy;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // DD-Mon-YYYY (e.g. 15-Sep-2026, 01-Jan-2026)
  const monthNames = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
  };
  const ddmon = s.match(/^(\d{1,2})[\/\- ]([A-Za-z]{3})[\/\- ](\d{2,4})$/);
  if (ddmon) {
    const [, d, mon, yRaw] = ddmon;
    const y = yRaw.length === 2 ? `20${yRaw}` : yRaw;
    const m = monthNames[mon.toLowerCase()] || '01';
    return `${y}-${m}-${d.padStart(2, '0')}`;
  }

  try {
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  } catch {}

  return s;
}

/**
 * Find the real header row in bank CSVs that have preliminary metadata lines.
 */
function extractCsvFromHeader(fileContent) {
  const lines = fileContent.split(/\r?\n/);
  let headerIndex = -1;

  for (let i = 0; i < Math.min(lines.length, 25); i++) {
    const lower = lines[i].toLowerCase();
    if (
      lower.includes('date') &&
      (lower.includes('amount') || lower.includes('withdrawal') || lower.includes('debit') ||
       lower.includes('narration') || lower.includes('description') || lower.includes('particulars'))
    ) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex > 0) {
    return lines.slice(headerIndex).join('\n');
  }
  return fileContent;
}

/**
 * Sync monthly snapshots from transactions table so I&E snapshots stay updated automatically.
 */
export function syncSnapshotsFromTransactions(db, userId) {
  try {
    const months = db.all(`
      SELECT DISTINCT 
        CAST(substr(date, 1, 4) AS INTEGER) as year,
        CAST(substr(date, 6, 2) AS INTEGER) as month
      FROM transactions
      WHERE user_id = ? AND date IS NOT NULL AND length(date) >= 7
    `, userId);

    for (const { year, month } of months) {
      if (!year || !month) continue;
      const monthPrefix = `${year}-${String(month).padStart(2, '0')}%`;

      const incomeRows = db.all(`
        SELECT category, SUM(amount) as total
        FROM transactions
        WHERE user_id = ? AND type = 'income' AND date LIKE ?
        GROUP BY category
      `, userId, monthPrefix);

      const incomeData = {};
      let totalIncome = 0;
      for (const r of incomeRows) {
        const cat = r.category || 'Other Income';
        incomeData[cat] = (incomeData[cat] || 0) + Number(r.total);
        totalIncome += Number(r.total);
      }

      const expenseRows = db.all(`
        SELECT category, SUM(amount) as total
        FROM transactions
        WHERE user_id = ? AND type = 'expense' AND date LIKE ?
        GROUP BY category
      `, userId, monthPrefix);

      const expenseData = {};
      let totalExpenses = 0;
      for (const r of expenseRows) {
        const cat = r.category || 'Other Expense';
        expenseData[cat] = (expenseData[cat] || 0) + Number(r.total);
        totalExpenses += Number(r.total);
      }

      const netSavings = totalIncome - totalExpenses;

      const existing = db.get(`
        SELECT id FROM ie_snapshots WHERE user_id = ? AND month = ? AND year = ?
      `, userId, month, year);

      if (existing) {
        db.run(`
          UPDATE ie_snapshots
          SET income_data = ?, expense_data = ?, total_income = ?, total_expenses = ?, net_savings = ?
          WHERE id = ?
        `, JSON.stringify(incomeData), JSON.stringify(expenseData), totalIncome, totalExpenses, netSavings, existing.id);
      } else {
        db.run(`
          INSERT INTO ie_snapshots (user_id, month, year, income_data, expense_data, total_income, total_expenses, net_savings, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Imported from transactions')
        `, userId, month, year, JSON.stringify(incomeData), JSON.stringify(expenseData), totalIncome, totalExpenses, netSavings);
      }
    }
  } catch (syncErr) {
    console.warn('Auto snapshot sync warning:', syncErr.message);
  }
}

/**
 * GET /api/transactions
 */
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { start_date, end_date, category, type, limit = 100, offset = 0 } = req.query;
    let query = 'SELECT * FROM transactions WHERE user_id = ?';
    const params = [req.user.id];

    if (start_date) { query += ' AND date >= ?'; params.push(start_date); }
    if (end_date) { query += ' AND date <= ?'; params.push(end_date); }
    if (category) { query += ' AND category = ?'; params.push(category); }
    if (type) { query += ' AND type = ?'; params.push(type); }

    query += ' ORDER BY date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const transactions = db.all(query, ...params);

    let countQuery = 'SELECT COUNT(*) as total FROM transactions WHERE user_id = ?';
    const countParams = [req.user.id];
    if (start_date) { countQuery += ' AND date >= ?'; countParams.push(start_date); }
    if (end_date) { countQuery += ' AND date <= ?'; countParams.push(end_date); }
    if (category) { countQuery += ' AND category = ?'; countParams.push(category); }
    if (type) { countQuery += ' AND type = ?'; countParams.push(type); }

    const countResult = db.get(countQuery, ...countParams);
    const total = countResult?.total || 0;

    res.json({ transactions, total, limit: parseInt(limit), offset: parseInt(offset) });
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * POST /api/transactions
 */
router.post('/', (req, res) => {
  try {
    const db = getDb();
    const { date, description, amount, type, category } = req.body;

    if (!date || !description || amount === undefined || !type) {
      return res.status(400).json({ error: 'date, description, amount, and type are required' });
    }
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'type must be "income" or "expense"' });
    }

    const assignedCategory = category || autoCategorize(description, null);

    const result = db.run(
      `INSERT INTO transactions (user_id, date, description, amount, type, category, source) VALUES (?, ?, ?, ?, ?, ?, 'manual')`,
      req.user.id, normalizeDate(date), description.trim(), Math.abs(amount), type, assignedCategory
    );

    syncSnapshotsFromTransactions(db, req.user.id);

    const transaction = db.get('SELECT * FROM transactions WHERE id = ?', result.lastInsertRowid);
    res.status(201).json({ message: 'Transaction added', transaction });
  } catch (err) {
    console.error('Add transaction error:', err);
    res.status(500).json({ error: 'Failed to add transaction' });
  }
});

function parseCsvTransactions(filePath) {
  const rawContent = readFileSync(filePath, 'utf-8');
  const cleanContent = extractCsvFromHeader(rawContent);

  const records = parse(cleanContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });

  if (!records || records.length === 0) {
    throw new Error('CSV file contains no readable transaction records.');
  }

  const parsedTransactions = [];
  for (const record of records) {
    const keys = Object.keys(record);
    const findVal = (...candidates) => {
      for (const cand of candidates) {
        const key = keys.find(k => k.trim().toLowerCase() === cand.toLowerCase());
        if (key && record[key] !== undefined && record[key] !== null) return String(record[key]).trim();
      }
      return '';
    };

    const dateRaw = findVal('Date', 'Transaction Date', 'Txn Date', 'Value Date', 'Posting Date');
    const descRaw = findVal('Description', 'Narration', 'Particulars', 'Transaction Remarks', 'Payee', 'Merchant', 'Details', 'Memo');
    const debitRaw = findVal('Withdrawal Amt.', 'Withdrawal Amount', 'Withdrawal', 'Debit Amount', 'Debit', 'DR');
    const creditRaw = findVal('Deposit Amt.', 'Deposit Amount', 'Deposit', 'Credit Amount', 'Credit', 'CR');
    const amountRaw = findVal('Amount', 'Transaction Amount', 'Net Amount');
    const typeRaw = findVal('Type', 'Transaction Type', 'Dr/Cr', 'CR/DR');
    const catRaw = findVal('Category', 'Spending Category', 'Tag');

    let amount = 0;
    let type = 'expense';

    const debit = parseCleanAmount(debitRaw);
    const credit = parseCleanAmount(creditRaw);
    const singleAmount = parseCleanAmount(amountRaw);

    if (debit > 0) {
      amount = debit;
      type = 'expense';
    } else if (credit > 0) {
      amount = credit;
      type = 'income';
    } else if (singleAmount !== 0) {
      amount = Math.abs(singleAmount);
      if (singleAmount < 0) {
        type = 'expense';
      } else if (/cr|credit|deposit|income/i.test(typeRaw)) {
        type = 'income';
      } else if (/dr|debit|withdrawal|expense/i.test(typeRaw)) {
        type = 'expense';
      } else {
        type = /salary|payroll|dividend|interest|credit|refund/i.test(descRaw) ? 'income' : 'expense';
      }
    }

    const date = normalizeDate(dateRaw);
    const description = (descRaw || 'Transaction').trim();

    if (date && amount > 0) {
      const category = autoCategorize(description, catRaw);
      parsedTransactions.push({
        date,
        description,
        amount,
        type,
        category,
      });
    }
  }
  return parsedTransactions;
}

/**
 * POST /api/transactions/parse
 * Human-in-the-Loop (HITL) Step 1:
 * Accepts a bank statement PDF or CSV, extracts all transactions and summary metadata via pdfplumber,
 * and returns a preview for human confirmation and editing without saving to the DB yet.
 */
router.post('/parse', (req, res) => {
  upload.single('statement')(req, res, async (err) => {
    if (err) {
      console.warn('Multer upload warning:', err.message);
      return res.status(400).json({ error: err.message || 'File upload failed' });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file received. Please select a CSV or PDF file to upload.' });
      }

      console.log(`[Transactions] Parsing bank statement: ${req.file.originalname} (${req.file.mimetype})`);
      const parsedData = await parseStatementFile(
        req.file.path,
        req.file.originalname,
        req.file.mimetype,
        agentClient
      );

      res.json({
        preview: true,
        ...parsedData,
      });

    } catch (err) {
      console.error('Statement parse error:', err);
      try { unlinkSync(req.file?.path); } catch {}
      res.status(400).json({ error: `Failed to parse statement: ${err.message}` });
    }
  });
});

/**
 * POST /api/transactions/confirm
 * Human-in-the-Loop (HITL) Step 2:
 * User reviews and optionally modifies the parsed statement summary and transaction records.
 * Upon clicking "Confirm & Save", saves all verified transactions into SQLite and updates snapshots.
 */
router.post('/confirm', (req, res) => {
  try {
    const { transactions, statement_metadata } = req.body;
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ error: 'No transactions provided to save.' });
    }

    const db = getDb();
    const batchId = uuidv4();
    const validTransactions = [];

    for (const txn of transactions) {
      const date = normalizeDate(txn.date);
      const description = String(txn.description || 'Transaction').trim();
      const amount = Math.abs(Number(txn.amount) || 0);
      const type = txn.type === 'income' ? 'income' : 'expense';
      const category = txn.category || autoCategorize(description, null);

      if (date && amount > 0) {
        validTransactions.push({ date, description, amount, type, category });
      }
    }

    if (validTransactions.length === 0) {
      return res.status(400).json({ error: 'No valid transactions found. Ensure dates and positive amounts are provided.' });
    }

    for (const txn of validTransactions) {
      db.run(
        `INSERT INTO transactions (user_id, date, description, amount, type, category, source, upload_batch_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        req.user.id, txn.date, txn.description, txn.amount, txn.type, txn.category, 'statement_confirmed', batchId
      );
    }

    // Automatically sync transactions to monthly snapshots table
    syncSnapshotsFromTransactions(db, req.user.id);

    const savedTransactions = db.all(
      'SELECT * FROM transactions WHERE upload_batch_id = ? ORDER BY date DESC', batchId
    );

    res.status(201).json({
      success: true,
      message: `Statement confirmed! Successfully saved ${savedTransactions.length} transactions to your account.`,
      batch_id: batchId,
      count: savedTransactions.length,
      transactions: savedTransactions,
    });
  } catch (err) {
    console.error('Confirm transactions error:', err);
    res.status(500).json({ error: `Failed to save transactions: ${err.message}` });
  }
});

/**
 * POST /api/transactions/upload
 * Multi-format parser supporting both PDF bank statements (pdfplumber) and CSV exports.
 */
router.post('/upload', (req, res) => {
  upload.single('statement')(req, res, async (err) => {
    if (err) {
      console.warn('Multer upload warning:', err.message);
      return res.status(400).json({ error: err.message || 'File upload failed' });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file received. Please select a CSV or PDF file to upload.' });
      }

      const isPdf = /\.pdf$/i.test(req.file.originalname) || req.file.mimetype === 'application/pdf';
      const batchId = uuidv4();
      const db = getDb();

      console.log(`[Transactions] Processing upload bank statement: ${req.file.originalname} (${req.file.mimetype})`);
      const parsedData = await parseStatementFile(
        req.file.path,
        req.file.originalname,
        req.file.mimetype,
        agentClient
      );
      const parsedTransactions = parsedData.transactions || [];

      if (parsedTransactions.length === 0) {
        return res.status(400).json({
          error: isPdf
            ? 'Could not extract transactions from PDF. Please ensure the document is a readable bank account statement.'
            : 'Could not detect any valid transactions. Please ensure your CSV has Date, Description, and Amount columns.',
        });
      }

      const sourceType = isPdf ? 'pdf_upload' : 'upload';
      for (const txn of parsedTransactions) {
        db.run(
          `INSERT INTO transactions (user_id, date, description, amount, type, category, source, upload_batch_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          req.user.id, txn.date, txn.description, txn.amount, txn.type, txn.category, sourceType, batchId
        );
      }

      // Automatically sync transactions to monthly snapshots table
      syncSnapshotsFromTransactions(db, req.user.id);

      const savedTransactions = db.all(
        'SELECT * FROM transactions WHERE upload_batch_id = ? ORDER BY date DESC', batchId
      );

      res.status(201).json({
        message: isPdf
          ? `Extracted and imported ${savedTransactions.length} transactions from your bank statement`
          : `Successfully imported and categorized ${savedTransactions.length} transactions`,
        batch_id: batchId,
        count: savedTransactions.length,
        transactions: savedTransactions,
      });

    } catch (err) {
      console.error('Upload processing error:', err);
      try { unlinkSync(req.file?.path); } catch {}
      res.status(400).json({ error: `Failed to process statement: ${err.message}` });
    }
  });
});

/**
 * GET /api/transactions/summary
 */
router.get('/summary', (req, res) => {
  try {
    const db = getDb();
    const { start_date, end_date } = req.query;
    let query = `SELECT category, type, SUM(amount) as total, COUNT(*) as count, AVG(amount) as avg_amount FROM transactions WHERE user_id = ?`;
    const params = [req.user.id];

    if (start_date) { query += ' AND date >= ?'; params.push(start_date); }
    if (end_date) { query += ' AND date <= ?'; params.push(end_date); }
    query += ' GROUP BY category, type ORDER BY total DESC';

    const summary = db.all(query, ...params);

    let totalsQuery = `SELECT type, SUM(amount) as total, COUNT(*) as count FROM transactions WHERE user_id = ?`;
    const totalsParams = [req.user.id];
    if (start_date) { totalsQuery += ' AND date >= ?'; totalsParams.push(start_date); }
    if (end_date) { totalsQuery += ' AND date <= ?'; totalsParams.push(end_date); }
    totalsQuery += ' GROUP BY type';

    const totals = db.all(totalsQuery, ...totalsParams);

    const monthlyQuery = `
      SELECT substr(date, 1, 7) as month_key,
             SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
             SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
      FROM transactions
      WHERE user_id = ?
      GROUP BY substr(date, 1, 7)
      ORDER BY month_key ASC
    `;
    const monthly = db.all(monthlyQuery, req.user.id);

    res.json({ summary, totals, monthly });
  } catch (err) {
    console.error('Summary error:', err);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

/**
 * DELETE /api/transactions/:id
 */
router.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    const result = db.run('DELETE FROM transactions WHERE id = ? AND user_id = ?', parseInt(req.params.id), req.user.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Transaction not found' });
    syncSnapshotsFromTransactions(db, req.user.id);
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    console.error('Delete transaction error:', err);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

export default router;
