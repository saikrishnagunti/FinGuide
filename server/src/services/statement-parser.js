import { readFileSync, unlinkSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { PDFParse } from 'pdf-parse';

// Common Indian & International Bank Names for statement identification
const KNOWN_BANKS = [
  ['State Bank of India', ['state bank of india', 'sbi']],
  ['HDFC Bank', ['hdfc bank', 'hdfc']],
  ['ICICI Bank', ['icici bank', 'icici']],
  ['Axis Bank', ['axis bank', 'uti bank']],
  ['Kotak Mahindra Bank', ['kotak mahindra', 'kotak bank', 'kotak']],
  ['Punjab National Bank', ['punjab national bank', 'pnb']],
  ['Bank of Baroda', ['bank of baroda', 'bob']],
  ['Canara Bank', ['canara bank']],
  ['Union Bank of India', ['union bank']],
  ['IndusInd Bank', ['indusind bank']],
  ['IDFC FIRST Bank', ['idfc first', 'idfc bank']],
  ['Yes Bank', ['yes bank']],
  ['Federal Bank', ['federal bank']],
  ['Citibank', ['citibank', 'citi']],
  ['Standard Chartered', ['standard chartered', 'scb']],
  ['HSBC Bank', ['hsbc']],
  ['Chase Bank', ['jpmorgan chase', 'chase bank', 'chase']],
  ['Bank of America', ['bank of america', 'bofa']],
  ['Wells Fargo', ['wells fargo']],
];

const DATE_REGEX = /(\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b|\b\d{4}[\/\-\.]\d{2}[\/\-\.]\d{2}\b|\b\d{1,2}[\s\-][A-Za-z]{3}[\s\-]\d{2,4}\b)/;
const AMOUNT_REGEX = /(?:Rs\.?|INR|₹|\$|€|£)?\s*([0-9]{1,3}(?:,[0-9]{2,3})*\.[0-9]{2}|[0-9]+\.[0-9]{2})/gi;

/**
 * Categorize transaction based on keywords in description.
 */
export function autoCategorize(description, rawCategory) {
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
export function parseCleanAmount(val) {
  if (val === undefined || val === null) return 0;
  const str = String(val).replace(/[₹$€£,\s]/g, '').trim();
  return parseFloat(str) || 0;
}

/**
 * Standardize dates into YYYY-MM-DD format.
 */
export function normalizeDate(dateStr) {
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
export function extractCsvFromHeader(fileContent) {
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
 * Parse CSV file into normalized transactions list.
 */
export function parseCsvTransactions(filePath) {
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
 * Direct native PDF bank statement text parser (pure Node.js / pdf-parse).
 * Works offline, in memory, and without requiring any external Python service.
 */
export async function parsePdfNative(filePath, originalname = 'statement.pdf') {
  const fileBuffer = readFileSync(filePath);
  const parser = new PDFParse({ data: fileBuffer });
  let allText = '';
  try {
    const textResult = await parser.getText();
    if (textResult.pages && textResult.pages.length > 0) {
      allText = textResult.pages.map(p => p.text).join('\n');
    } else {
      allText = textResult.text || '';
    }
  } catch (err) {
    console.warn('[StatementParser] Native PDF getText error:', err.message);
  } finally {
    try { await parser.destroy(); } catch {}
  }

  if (!allText || !allText.trim()) {
    throw new Error('PDF file contains no readable text. It may be a scanned image or password-protected document.');
  }

  // 1. Detect Bank Name
  let detectedBank = 'Bank Statement';
  const lowerText = allText.toLowerCase();
  for (const [bankName, aliases] of KNOWN_BANKS) {
    if (aliases.some(alias => lowerText.includes(alias))) {
      detectedBank = bankName;
      break;
    }
  }

  // 2. Detect Account Number (masked)
  const acMatch = allText.match(/(?:account\s*(?:no|number|#|id)?|a\/c\s*(?:no)?)\s*[:.-]?\s*([0-9Xx*\-]{6,25})/i);
  let accountNumber = null;
  if (acMatch && acMatch[1]) {
    const raw = acMatch[1].trim();
    accountNumber = raw.length >= 4 ? `XXXX${raw.slice(-4)}` : raw;
  }

  // 3. Detect Period
  const periodMatch = allText.match(/(?:period|statement\s*from|from)\s*[:.-]?\s*(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})\s*(?:to|-|through)\s*(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/i);
  let periodStart = null;
  let periodEnd = null;
  if (periodMatch) {
    periodStart = normalizeDate(periodMatch[1]);
    periodEnd = normalizeDate(periodMatch[2]);
  }

  // 4. Parse transaction rows from text lines
  const lines = allText.split(/\r?\n/);
  const transactions = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const lowerLine = line.toLowerCase();

    // Skip header/footer noise
    if (
      lowerLine.includes('opening balance') ||
      lowerLine.includes('closing balance') ||
      lowerLine.includes('total withdrawal') ||
      lowerLine.includes('total deposit') ||
      lowerLine.includes('page ') ||
      lowerLine.includes('narration / description') ||
      lowerLine.includes('account statement') ||
      lowerLine.includes('statement of')
    ) {
      continue;
    }

    const dateMatch = line.match(DATE_REGEX);
    if (!dateMatch) {
      if (transactions.length > 0 && line.length < 100 && !/^\d+$/.test(line)) {
        const last = transactions[transactions.length - 1];
        last.description = `${last.description} ${line}`.replace(/\s+/g, ' ').trim();
      }
      continue;
    }

    const rawDate = dateMatch[1];
    const postDateText = line.slice(dateMatch.index + rawDate.length).trim();

    // Find all amounts
    const amountMatches = [...postDateText.matchAll(AMOUNT_REGEX)].map(m => m[1]);
    if (!amountMatches || amountMatches.length === 0) continue;

    const nums = amountMatches.map(a => parseFloat(a.replace(/,/g, '')));
    let finalAmount = 0;
    let type = 'expense';

    if (nums.length >= 3) {
      const debit = nums[0];
      const credit = nums[1];
      if (debit > 0) {
        finalAmount = debit;
        type = 'expense';
      } else if (credit > 0) {
        finalAmount = credit;
        type = 'income';
      } else {
        finalAmount = nums[0];
      }
    } else if (nums.length >= 1) {
      finalAmount = nums[0];
      if (
        /\b(?:cr|credit|deposit)\b/.test(lowerLine) ||
        /salary|payroll|stipend|dividend|interest|refund|cashback/i.test(line)
      ) {
        type = 'income';
      } else {
        type = 'expense';
      }
    }

    if (finalAmount <= 0) continue;

    // Clean description: strip amounts and common banking prefixes
    let desc = postDateText;
    for (const aStr of amountMatches) {
      desc = desc.replace(aStr, '');
    }
    desc = desc
      .replace(/\b(?:UPI|NEFT|RTGS|IMPS|CARD|REF|CHQ|POS|TRANSFER|CHQ\/REF|NO\.)[0-9A-Za-z\-_]*\b/gi, '')
      .replace(/[₹$€£,;|]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const stdDate = normalizeDate(rawDate);
    const category = autoCategorize(desc || 'Bank Transaction', type === 'income' ? 'Salary & Income' : null);

    transactions.push({
      date: stdDate,
      description: desc || 'Bank Transaction',
      amount: Math.round(finalAmount * 100) / 100,
      type,
      category,
    });
  }

  // Sort chronologically
  transactions.sort((a, b) => a.date.localeCompare(b.date));

  if (!periodStart && transactions.length > 0) {
    periodStart = transactions[0].date;
    periodEnd = transactions[transactions.length - 1].date;
  }

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

  return {
    count: transactions.length,
    statement_metadata: {
      bank_name: detectedBank,
      account_number: accountNumber,
      period_start: periodStart,
      period_end: periodEnd,
      total_income: Math.round(totalIncome * 100) / 100,
      total_expenses: Math.round(totalExpenses * 100) / 100,
      net_savings: Math.round((totalIncome - totalExpenses) * 100) / 100,
      count: transactions.length,
    },
    transactions,
  };
}

/**
 * Universal statement file parser (PDF or CSV).
 * Deletes temporary file upon completion.
 */
export async function parseStatementFile(filePath, originalname, mimetype, agentClient) {
  const isPdf = /\.pdf$/i.test(originalname) || mimetype === 'application/pdf';
  let rawTransactions = [];
  let metadata = {
    bank_name: isPdf ? 'Bank Statement' : 'CSV Statement',
    account_number: null,
    period_start: null,
    period_end: null,
    total_income: 0,
    total_expenses: 0,
    net_savings: 0,
    count: 0,
  };

  try {
    if (isPdf) {
      let agentSucceeded = false;
      // 1. Try agent first if client available
      if (agentClient) {
        try {
          const pdfData = await agentClient.parsePdfStatement(filePath, originalname);
          if (pdfData && Array.isArray(pdfData.transactions) && pdfData.transactions.length > 0) {
            rawTransactions = pdfData.transactions;
            if (pdfData.statement_metadata) {
              metadata = { ...metadata, ...pdfData.statement_metadata };
            }
            agentSucceeded = true;
          }
        } catch (agentErr) {
          console.warn('[StatementParser] Python agent unavailable or failed:', agentErr.message, 'Falling back to native Node.js PDF engine.');
        }
      }

      // 2. Resilient Native Node.js PDF parsing fallback
      if (!agentSucceeded) {
        console.log(`[StatementParser] Parsing PDF via native Node.js engine: ${originalname}`);
        const nativePdfData = await parsePdfNative(filePath, originalname);
        rawTransactions = nativePdfData.transactions || [];
        if (nativePdfData.statement_metadata) {
          metadata = { ...metadata, ...nativePdfData.statement_metadata };
        }
      }
    } else {
      rawTransactions = parseCsvTransactions(filePath);
    }
  } finally {
    try {
      unlinkSync(filePath);
    } catch {}
  }

  if (!rawTransactions || rawTransactions.length === 0) {
    throw new Error(
      isPdf
        ? 'Could not extract transactions from PDF. Please ensure the document is a readable bank account statement.'
        : 'Could not detect any valid transactions. Please ensure your CSV has Date, Description, and Amount columns.'
    );
  }

  const previewTransactions = rawTransactions.map((t, idx) => ({
    temp_id: `tmp_${idx}_${Date.now()}`,
    date: normalizeDate(t.date),
    description: String(t.description || 'Transaction').trim(),
    amount: Math.abs(Number(t.amount) || 0),
    type: t.type === 'income' ? 'income' : 'expense',
    category: t.category || autoCategorize(t.description, null),
  }));

  const totalIncome = previewTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = previewTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

  metadata.total_income = Math.round(totalIncome * 100) / 100;
  metadata.total_expenses = Math.round(totalExpenses * 100) / 100;
  metadata.net_savings = Math.round((totalIncome - totalExpenses) * 100) / 100;
  metadata.count = previewTransactions.length;

  if (!metadata.period_start && previewTransactions.length > 0) {
    const sorted = [...previewTransactions].sort((a, b) => a.date.localeCompare(b.date));
    metadata.period_start = sorted[0].date;
    metadata.period_end = sorted[sorted.length - 1].date;
  }

  return {
    filename: originalname,
    summary: metadata,
    transactions: previewTransactions,
  };
}
