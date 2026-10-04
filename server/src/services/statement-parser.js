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
const AMOUNT_REGEX = /(?:^|\s)(?:Rs\.?|INR|₹|\$|€)?\s*([0-9]+(?:,[0-9]+)*\.[0-9]{2})(?=\s|$|[A-Za-z])/g;

/**
 * Categorize transaction based on keywords in description.
 */
export function autoCategorize(description, rawCategory, type = 'expense') {
  if (rawCategory && rawCategory.trim() && rawCategory.toLowerCase() !== 'uncategorized') {
    const trimmed = rawCategory.trim();
    if (type === 'expense' && trimmed.toLowerCase() === 'salary & income') {
      return 'Payroll & Salaries';
    }
    return trimmed;
  }
  const desc = (description || '').toLowerCase();

  // Outflows with payroll or salary keywords represent payroll expenses
  if (type === 'expense' && /salary|payroll|stipend|wages|staff/i.test(desc)) {
    return 'Payroll & Salaries';
  }

  if (/salary|payroll|stipend|interest credit|dividend|neft credit|bonus/i.test(desc)) {
    return type === 'expense' ? 'Payroll & Salaries' : 'Salary & Income';
  }
  if (/swiggy|zomato|starbucks|mcdonald|kfc|pizza|burger|cafe|restaurant|baking|dining|eat|domino|barbeque|paradise|biryani/i.test(desc)) return 'Food & Dining';
  if (/blinkit|zepto|instamart|dmart|bigbasket|supermarket|grocery|groceries|spencer|fresh|kirana|provision/i.test(desc)) return 'Groceries';
  if (/uber|ola|rapido|metro|petrol|fuel|shell|bpcl|hpcl|ioc|toll|fastag|commute|cab|irctc|railway|parking/i.test(desc)) return 'Transportation';
  if (/amazon|flipkart|myntra|ajio|zara|h&m|shopping|retail|store|mall|nykaa|croma|reliance.?digital/i.test(desc)) return 'Shopping';
  if (/netflix|spotify|prime|hotstar|youtube|movie|cinema|pvr|inox|entertainment|game|playstation|bookmyshow|steam/i.test(desc)) return 'Entertainment';
  if (/rent|maintenance|society|housing|landlord|estate|flat|mortgage/i.test(desc)) return 'Housing';
  if (/bescom|electricity|water|airtel|jio|vi|broadband|wifi|tataplay|dth|gas|cylinder|utility|utilities|tsspdcl|mseb|tneb|cesc|power|indane|fibernet|act fibernet/i.test(desc)) return 'Utilities';
  if (/pharmacy|hospital|clinic|apollo|1mg|practo|medplus|doctor|health|wellness|apollophar|diagnostics|dental/i.test(desc)) return 'Healthcare';
  if (/insurance|lic|hdfc life|max life|star health|policy|tata aia|premium/i.test(desc)) return 'Insurance';
  if (/sip|zerodha|groww|mutual fund|upstox|mf|investment|etmoney|angelone|kuvera/i.test(desc)) return 'Investments';
  if (/emi|loan|tata capital|bajaj fin|equated monthly/i.test(desc)) return 'Loan & EMI';
  if (/gst|advance tax|income tax|itns|cbdt|tds|challan/i.test(desc)) return 'Taxes';

  if (type === 'income') return 'Salary & Income';

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
 * Unambiguous bank identification based on document header and official identifiers.
 * Prevents false positives from UPI payment handles like @hdfcba inside other banks' statements.
 */
export function detectBankName(allText) {
  const headerText = allText.slice(0, 2000).toLowerCase();
  const lowerAll = allText.toLowerCase();

  // 1. Unambiguous official domain names, IFSC prefixes, or exact header titles
  if (
    lowerAll.includes('bankofbaroda') ||
    lowerAll.includes('barb0') ||
    lowerAll.includes('bob pay') ||
    headerText.includes('बैंक ऑफ़ बड़ौदा') ||
    headerText.includes('bank of baroda')
  ) {
    return 'Bank of Baroda';
  }
  if (
    lowerAll.includes('icicibank') ||
    lowerAll.includes('icic0') ||
    headerText.includes('icici bank')
  ) {
    return 'ICICI Bank';
  }
  if (
    headerText.includes('hdfc bank') ||
    lowerAll.includes('hdfcbank.com') ||
    (lowerAll.includes('hdfc0') && !lowerAll.includes('utib0') && !lowerAll.includes('barb0'))
  ) {
    return 'HDFC Bank';
  }
  if (
    headerText.includes('state bank of india') ||
    lowerAll.includes('sbi.co.in') ||
    lowerAll.includes('sbin0')
  ) {
    return 'State Bank of India';
  }
  if (
    headerText.includes('kotak mahindra') ||
    headerText.includes('kotak bank') ||
    lowerAll.includes('kotak.com') ||
    lowerAll.includes('kkbk0')
  ) {
    return 'Kotak Mahindra Bank';
  }
  if (
    headerText.includes('axis bank') ||
    lowerAll.includes('axisbank.com') ||
    lowerAll.includes('utib0')
  ) {
    return 'Axis Bank';
  }
  if (headerText.includes('punjab national bank') || lowerAll.includes('pnb0')) {
    return 'Punjab National Bank';
  }
  if (headerText.includes('canara bank') || lowerAll.includes('cnrb0')) {
    return 'Canara Bank';
  }
  if (headerText.includes('union bank of india') || lowerAll.includes('ubin0')) {
    return 'Union Bank of India';
  }
  if (headerText.includes('indusind bank') || lowerAll.includes('indb0')) {
    return 'IndusInd Bank';
  }
  if (headerText.includes('idfc first') || lowerAll.includes('idfb0')) {
    return 'IDFC FIRST Bank';
  }
  if (headerText.includes('yes bank') || lowerAll.includes('yesb0')) {
    return 'Yes Bank';
  }
  if (headerText.includes('federal bank') || lowerAll.includes('fdrl0')) {
    return 'Federal Bank';
  }
  if (headerText.includes('citibank')) return 'Citibank';
  if (headerText.includes('standard chartered')) return 'Standard Chartered';
  if (headerText.includes('hsbc')) return 'HSBC Bank';
  if (headerText.includes('chase bank') || headerText.includes('jpmorgan chase')) return 'Chase Bank';
  if (headerText.includes('bank of america')) return 'Bank of America';
  if (headerText.includes('wells fargo')) return 'Wells Fargo';

  // 2. Word boundary aliases in the HEADER ONLY (never across transaction body where UPI IDs live)
  if (/\b(?:bob)\b/i.test(headerText)) return 'Bank of Baroda';
  if (/\b(?:icici)\b/i.test(headerText)) return 'ICICI Bank';
  if (/\b(?:sbi)\b/i.test(headerText)) return 'State Bank of India';
  if (/\b(?:hdfc)\b/i.test(headerText)) return 'HDFC Bank';
  if (/\b(?:pnb)\b/i.test(headerText)) return 'Punjab National Bank';

  return 'Bank Statement';
}

/**
 * Direct native PDF bank statement text parser (pure Node.js / pdf-parse).
 * Supports both single-line and multi-line/table-cell statement layouts.
 * Works offline, in memory, and without requiring any external Python service.
 */
/**
 * Direct native PDF bank statement text parser (pure Node.js / pdf-parse).
 * Supports both single-line and multi-line/table-cell statement layouts.
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

  // 1. Detect Bank Name with zero UPI false-positives
  const detectedBank = detectBankName(allText);

  // 2. Detect Account Number (masked)
  const acMatch = allText.match(/(?:account\s*(?:no|number|#|id)?|a\/c\s*(?:no)?|savings\s*account\s*(?:-\s*)?)\s*[:.-]?\s*([0-9Xx*\-]{6,25})/i);
  let accountNumber = null;
  if (acMatch && acMatch[1]) {
    const raw = acMatch[1].trim();
    accountNumber = raw.length >= 4 ? `XXXX${raw.slice(-4)}` : raw;
  }

  // 3. Detect Period
  const periodMatch = allText.match(/(?:period|statement\s*from|from)\s*[:.-]?\s*(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|\d{1,2}[\s\-][A-Za-z]{3}[\s\-]\d{2,4})\s*(?:to|-|through)\s*(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|\d{1,2}[\s\-][A-Za-z]{3}[\s\-]\d{2,4})/i);
  let periodStart = null;
  let periodEnd = null;
  if (periodMatch) {
    periodStart = normalizeDate(periodMatch[1]);
    periodEnd = normalizeDate(periodMatch[2]);
  }

  // 4. Detect initial opening balance from document header if present
  let initialOpeningBalance = null;
  const opMatch = allText.match(/(?:opening\s*balance)\s*[:.-]?\s*(?:Rs\.?|INR|₹)?\s*([0-9,]+\.[0-9]{2})/i);
  if (opMatch) {
    initialOpeningBalance = parseFloat(opMatch[1].replace(/,/g, ''));
  }

  // 5. Parse transaction blocks strictly within table boundaries
  const lines = allText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const blocks = [];
  let currentBlock = null;
  let tableStarted = false;

  const STRICT_DATE_START = /^(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{2}[\/\-\.]\d{2}|\d{1,2}[\s\-][A-Za-z]{3}[\s\-]\d{2,4})/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    // Check if table header is encountered (supports single and multi-page statements)
    if (
      (lowerLine.includes('date') && (lowerLine.includes('narration') || lowerLine.includes('particulars') || lowerLine.includes('description'))) ||
      (lowerLine.includes('date') && (lowerLine.includes('debit') || lowerLine.includes('credit') || lowerLine.includes('withdrawal')))
    ) {
      tableStarted = true;
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      continue;
    }

    // Stop table processing upon reaching disclosures or statement summary end
    if (
      lowerLine.includes('corporate & current account disclosures') ||
      lowerLine.includes('total debits count') ||
      lowerLine.includes('closing available balance') ||
      lowerLine.includes('1. verification:') ||
      lowerLine.includes('end of statement') ||
      lowerLine.includes('important messages for you') ||
      lowerLine.includes('abbreviations')
    ) {
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      tableStarted = false;
      continue;
    }

    // Never parse lines before the transaction table starts
    if (!tableStarted) {
      continue;
    }

    // Skip standalone opening balance lines inside table
    if (lowerLine.includes('opening balance')) {
      const matchAmt = line.match(/([0-9,]+\.[0-9]{2})/);
      if (matchAmt) {
        initialOpeningBalance = parseFloat(matchAmt[1].replace(/,/g, ''));
      }
      continue;
    }

    // Skip pagination, continued markers, inter-page headers
    if (
      lowerLine.startsWith('page ') ||
      lowerLine.includes('statement continued') ||
      lowerLine.includes('registered office:') ||
      lowerLine.includes('current account statement - transactions') ||
      lowerLine.startsWith('-- ') ||
      /^--\s*\d+\s*of\s*\d+\s*--$/i.test(line) ||
      /^a\/c:\s*[0-9Xx*\-]+\s*\|/i.test(line) ||
      /^account no:\s*[0-9Xx*\-]+\s*\|/i.test(line) ||
      lowerLine.startsWith('chq / ref no.') ||
      lowerLine.startsWith('chq.no.') ||
      lowerLine.startsWith('relationship type') ||
      lowerLine.startsWith('a summary of your relationship')
    ) {
      continue;
    }

    const dateMatch = line.match(STRICT_DATE_START);
    if (dateMatch) {
      if (currentBlock) {
        blocks.push(currentBlock);
      }
      currentBlock = {
        date: dateMatch[1],
        lines: [line],
      };
    } else if (currentBlock) {
      currentBlock.lines.push(line);
    }
  }

  if (currentBlock) {
    blocks.push(currentBlock);
  }

  const transactions = [];
  let prevBalance = initialOpeningBalance;

  for (const block of blocks) {
    const fullBlockText = block.lines.join(' ');
    const lastLine = block.lines[block.lines.length - 1];

    let finalAmount = 0;
    let type = 'expense';
    let balance = null;

    // Pattern 1: Credit in table column: "- 3,85,000.00 8,03,650.00" or "\t-\t3,85,000.00\t8,03,650.00"
    const crColMatch = lastLine.match(/(?:^|[\s\t])-\s+([0-9,]+\.[0-9]{2})\s+([0-9,]+\.[0-9]{2})/);
    // Pattern 2: Debit in table column: "65,000.00 - 7,38,650.00" or "\t65,000.00\t-\t7,38,650.00"
    const drColMatch = lastLine.match(/(?:^|[\s\t])([0-9,]+\.[0-9]{2})\s+-\s+([0-9,]+\.[0-9]{2})/);

    if (crColMatch) {
      type = 'income';
      finalAmount = parseFloat(crColMatch[1].replace(/,/g, ''));
      balance = parseFloat(crColMatch[2].replace(/,/g, ''));
    } else if (drColMatch) {
      type = 'expense';
      finalAmount = parseFloat(drColMatch[1].replace(/,/g, ''));
      balance = parseFloat(drColMatch[2].replace(/,/g, ''));
    } else {
      // General amount extraction with non-backtracking regex
      const amountMatches = [...fullBlockText.matchAll(AMOUNT_REGEX)].map(m => m[1]);
      if (!amountMatches || amountMatches.length === 0) continue;

      const nums = amountMatches.map(a => parseFloat(a.replace(/,/g, '')));
      if (nums.length >= 2) {
        balance = nums[nums.length - 1];
        finalAmount = nums[nums.length - 2];

        // Precise balance delta check
        if (prevBalance !== null && balance !== null) {
          const diff = Math.round((balance - prevBalance) * 100) / 100;
          if (Math.abs(Math.abs(diff) - finalAmount) < 0.1) {
            type = diff > 0 ? 'income' : 'expense';
          } else if (diff > 0) {
            type = 'income';
          } else if (diff < 0) {
            type = 'expense';
          } else {
            type = /\bCR-/i.test(fullBlockText) || /\b(?:cr|credit|deposit|salary|refund|cashback)\b/i.test(fullBlockText) ? 'income' : 'expense';
          }
        } else {
          type = /\bCR-/i.test(fullBlockText) || /\b(?:cr|credit|deposit|salary|refund|cashback)\b/i.test(fullBlockText) ? 'income' : 'expense';
        }
      } else {
        finalAmount = nums[0];
        type = /\bCR-/i.test(fullBlockText) || /\b(?:cr|credit|deposit|salary|refund|cashback)\b/i.test(fullBlockText) ? 'income' : 'expense';
      }
    }

    if (balance !== null) {
      prevBalance = balance;
    }

    if (finalAmount <= 0) continue;

    // Clean narration / description
    let desc = fullBlockText;
    desc = desc.replace(block.date, '');
    desc = desc.replace(AMOUNT_REGEX, '');
    desc = desc
      .replace(/\b(?:UPI|NEFT|RTGS|IMPS|CARD|REF|CHQ|POS|TRANSFER|CHQ\/REF|NO\.)[0-9A-Za-z\-_]*\b/gi, '')
      .replace(/\b[0-9]{10,20}\b/g, '') // remove pure digit account/UPI IDs
      .replace(/\b\d{2}:\d{2}:\d{2}\b/g, '') // remove timestamps
      .replace(/\b(?:Cr|Dr)\b/gi, '')
      .replace(/[₹$€£,;|\-\/]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Guardrail against header leak into transactions
    if (
      desc.toLowerCase().includes('account holder details') ||
      desc.toLowerCase().includes('opening balance') ||
      desc.toLowerCase().includes('closing net balance') ||
      desc.toLowerCase().startsWith('period:') ||
      desc.toLowerCase().includes('entity name:') ||
      desc.toLowerCase().includes('proprietor:')
    ) {
      continue;
    }

    transactions.push({
      date: normalizeDate(block.date),
      description: desc || 'Bank Transaction',
      amount: Math.round(finalAmount * 100) / 100,
      type,
      category: autoCategorize(desc || 'Bank Transaction', type === 'income' ? 'Salary & Income' : null, type),
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
