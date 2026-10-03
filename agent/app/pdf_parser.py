"""Direct PDF bank statement parser using pdfplumber without LLM/RAG dependencies."""

from __future__ import annotations

import io
import re
from datetime import datetime
from typing import Any

import pdfplumber

# Common Indian & International Bank Names for statement identification
KNOWN_BANKS = [
    ("State Bank of India", ["state bank of india", "sbi"]),
    ("HDFC Bank", ["hdfc bank", "hdfc"]),
    ("ICICI Bank", ["icici bank", "icici"]),
    ("Axis Bank", ["axis bank", "uti bank"]),
    ("Kotak Mahindra Bank", ["kotak mahindra", "kotak bank", "kotak"]),
    ("Punjab National Bank", ["punjab national bank", "pnb"]),
    ("Bank of Baroda", ["bank of baroda", "bob"]),
    ("Canara Bank", ["canara bank"]),
    ("Union Bank of India", ["union bank"]),
    ("IndusInd Bank", ["indusind bank"]),
    ("IDFC FIRST Bank", ["idfc first", "idfc bank"]),
    ("Yes Bank", ["yes bank"]),
    ("Federal Bank", ["federal bank"]),
    ("Citibank", ["citibank", "citi"]),
    ("Standard Chartered", ["standard chartered", "scb"]),
    ("HSBC Bank", ["hsbc"]),
    ("Chase Bank", ["jpmorgan chase", "chase bank", "chase"]),
    ("Bank of America", ["bank of america", "bofa"]),
    ("Wells Fargo", ["wells fargo"]),
]

# Date matching regex patterns
DATE_PATTERNS = [
    # DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
    (r"\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})\b", "%d-%m-%Y"),
    # YYYY-MM-DD or YYYY/MM/DD
    (r"\b(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})\b", "%Y-%m-%d"),
    # DD/MM/YY or DD-MM-YY
    (r"\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})\b", "%d-%m-%y"),
    # DD-Mon-YYYY or DD Mon YYYY (e.g. 01-Sep-2026, 15 Aug 2026)
    (r"\b(\d{1,2})[\s\-]([A-Za-z]{3})[\s\-](\d{4})\b", "%d-%b-%Y"),
    # DD-Mon-YY (e.g. 01-Sep-26)
    (r"\b(\d{1,2})[\s\-]([A-Za-z]{3})[\s\-](\d{2})\b", "%d-%b-%y"),
]

# Strict date-start pattern for checking if a string starts with a date
_DATE_START_RE = re.compile(
    r"^(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{2}[\/\-\.]\d{2}|\d{1,2}[\s\-][A-Za-z]{3}[\s\-]\d{2,4})"
)


def parse_clean_float(val: Any) -> float:
    """Parse a string into a clean float, removing currency symbols, commas, and Cr/Dr tags."""
    if val is None:
        return 0.0
    s = str(val).strip()
    if not s or s in ["-", "--", "nil", "null"]:
        return 0.0
    # Remove currency words/symbols like Rs, Rs., INR, USD, EUR, GBP, ₹, $, €, £
    s = re.sub(r"(?i)(?:rs\.?|rs\b|inr\b|usd\b|eur\b|gbp\b)", "", s)
    s = re.sub(r"[₹$€£\s]", "", s)
    # Remove thousands commas (NOT decimal points)
    s = s.replace(",", "")
    # Remove Cr/Dr indicator
    s = re.sub(r"(?i)(?:cr|dr)$", "", s).strip()
    try:
        return abs(float(s))
    except ValueError:
        return 0.0


def standardize_date(raw_date_str: str) -> str:
    """Standardize diverse bank statement dates into YYYY-MM-DD."""
    if not raw_date_str:
        return datetime.today().strftime("%Y-%m-%d")

    clean = raw_date_str.strip().replace(".", "-").replace("/", "-")
    # Clean multiple spaces/dashes
    clean = re.sub(r"[\s\-]+", "-", clean)

    for pattern, dt_format in DATE_PATTERNS:
        match = re.search(pattern, raw_date_str)
        if match:
            matched_str = match.group(0).replace(".", "-").replace("/", "-")
            matched_str = re.sub(r"\s+", "-", matched_str)
            try:
                dt = datetime.strptime(matched_str, dt_format)
                # Ensure 4 digit year
                if dt.year < 100:
                    dt = dt.replace(year=dt.year + 2000)
                return dt.strftime("%Y-%m-%d")
            except Exception:
                pass

    # Fallback to current year if parsing fails
    return raw_date_str[:10]


def auto_categorize(description: str, txn_type: str = "expense") -> str:
    """Categorize transactions accurately based on common bank narration patterns."""
    d = (description or "").lower()

    if txn_type == "income":
        if any(k in d for k in ["interest", "int.pd", "int pd", "dividend"]):
            return "Investments"
        if any(k in d for k in ["refund", "cashback", "reversal"]):
            return "General"
        return "Salary & Income"

    if any(k in d for k in ["swiggy", "zomato", "restaurant", "cafe", "mcdonald", "starbucks", "kfc", "domino", "burger", "food", "dine", "eats", "barbeque"]):
        return "Food & Dining"
    if any(k in d for k in ["blinkit", "zepto", "instamart", "bigbasket", "dmart", "spencer", "reliance fresh", "supermarket", "grocery", "kirana", "provision"]):
        return "Groceries"
    if any(k in d for k in ["uber", "ola", "rapido", "metro", "irctc", "railway", "petrol", "fuel", "shell", "hpcl", "bpcl", "ioc", "toll", "fastag", "parking"]):
        return "Transportation"
    if any(k in d for k in ["rent", "landlord", "maintenance", "society", "home loan", "housing", "mortgage", "flat"]):
        return "Housing"
    if any(k in d for k in ["bescom", "electricity", "mseb", "tneb", "cesc", "power", "water", "airtel", "jio", "vodafone", "vi", "broadband", "wifi", "gas", "indane", "hp gas", "bharat gas", "tsspdcl"]):
        return "Utilities"
    if any(k in d for k in ["netflix", "spotify", "prime", "hotstar", "youtube", "bookmyshow", "cinema", "pvr", "inox", "movie", "entertainment", "steam", "playstation"]):
        return "Entertainment"
    if any(k in d for k in ["amazon", "flipkart", "myntra", "ajio", "nykaa", "tata cliq", "zara", "h&m", "shopping", "retail", "clothing", "croma", "reliancedigital", "reliance digital"]):
        return "Shopping"
    if any(k in d for k in ["pharmacy", "apollo", "1mg", "hospital", "clinic", "dental", "dr.", "medical", "medplus", "netmeds", "diagnostics", "lab", "apollophar"]):
        return "Healthcare"
    if any(k in d for k in ["zerodha", "groww", "mutual fund", "sip", "upstox", "angelone", "coin", "kuvera", "nse", "bse", "investment", "share"]):
        return "Investments"
    if any(k in d for k in ["emi", "loan", "tata capital", "bajaj fin"]):
        return "Loan & EMI"
    if any(k in d for k in ["gst", "advance tax", "income tax", "itns", "cbdt", "tds"]):
        return "Taxes"
    if any(k in d for k in ["insurance", "lic", "premium", "tata aia", "max life", "star health"]):
        return "Insurance"

    return "General"


def extract_metadata(all_text: str) -> dict[str, Any]:
    """Extract metadata including bank name, masked account number, and statement period."""
    header_text = all_text[:2000].lower()
    lower_text = all_text.lower()
    detected_bank = "Bank Statement"

    if "bankofbaroda" in lower_text or "barb0" in lower_text or "bob pay" in lower_text or "बैंक ऑफ़ बड़ौदा" in header_text or "bank of baroda" in header_text:
        detected_bank = "Bank of Baroda"
    elif "icicibank" in lower_text or "icic0" in lower_text or "icici bank" in header_text:
        detected_bank = "ICICI Bank"
    elif "hdfcbank.com" in lower_text or "hdfc bank" in header_text:
        detected_bank = "HDFC Bank"
    elif "sbi.co.in" in lower_text or "sbin0" in lower_text or "state bank of india" in header_text:
        detected_bank = "State Bank of India"
    elif "kotak.com" in lower_text or "kkbk0" in lower_text or "kotak mahindra" in header_text:
        detected_bank = "Kotak Mahindra Bank"
    elif "axisbank.com" in lower_text or "utib0" in lower_text or "axis bank" in header_text:
        detected_bank = "Axis Bank"
    elif "punjab national bank" in header_text or "pnb0" in lower_text:
        detected_bank = "Punjab National Bank"
    elif "canara bank" in header_text or "cnrb0" in lower_text:
        detected_bank = "Canara Bank"
    elif "union bank of india" in header_text or "ubin0" in lower_text:
        detected_bank = "Union Bank of India"
    elif "indusind bank" in header_text or "indb0" in lower_text:
        detected_bank = "IndusInd Bank"
    elif "idfc first" in header_text or "idfb0" in lower_text:
        detected_bank = "IDFC FIRST Bank"
    elif "yes bank" in header_text or "yesb0" in lower_text:
        detected_bank = "Yes Bank"
    elif "federal bank" in header_text or "fdrl0" in lower_text:
        detected_bank = "Federal Bank"
    elif "citibank" in header_text:
        detected_bank = "Citibank"
    elif "standard chartered" in header_text:
        detected_bank = "Standard Chartered"
    elif "hsbc" in header_text:
        detected_bank = "HSBC Bank"
    elif "chase bank" in header_text or "jpmorgan chase" in header_text:
        detected_bank = "Chase Bank"
    elif "bank of america" in header_text:
        detected_bank = "Bank of America"
    elif "wells fargo" in header_text:
        detected_bank = "Wells Fargo"
    elif re.search(r"\b(?:bob)\b", header_text):
        detected_bank = "Bank of Baroda"
    elif re.search(r"\b(?:icici)\b", header_text):
        detected_bank = "ICICI Bank"
    elif re.search(r"\b(?:sbi)\b", header_text):
        detected_bank = "State Bank of India"
    elif re.search(r"\b(?:hdfc)\b", header_text):
        detected_bank = "HDFC Bank"

    # Masked account number detection
    ac_match = re.search(
        r"(?:account\s*(?:no|number|#|id)?|a\/c\s*(?:no)?|savings\s*account\s*(?:-\s*)?)[\s:.\-]*([0-9Xx\*\-]{6,25})",
        all_text,
        flags=re.IGNORECASE,
    )
    account_number = None
    if ac_match:
        raw_ac = ac_match.group(1).strip()
        # Mask all but last 4 digits
        if len(raw_ac) >= 4:
            account_number = "XXXX" + raw_ac[-4:]
        else:
            account_number = raw_ac

    # Statement period detection - multiple patterns
    period_start = None
    period_end = None

    # Pattern 1: "Period: DD/MM/YYYY to DD/MM/YYYY"
    period_match = re.search(
        r"(?:period|statement\s*from|from)\s*[:.\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\s*(?:to|-|through)\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})",
        all_text,
        flags=re.IGNORECASE,
    )
    if period_match:
        period_start = standardize_date(period_match.group(1))
        period_end = standardize_date(period_match.group(2))

    # Pattern 2: "Period: DD-Mon-YYYY to DD-Mon-YYYY"
    if not period_start:
        period_match = re.search(
            r"(?:period|statement\s*from|from)\s*[:.\-]?\s*(\d{1,2}[\s\-][A-Za-z]{3}[\s\-]\d{2,4})\s*(?:to|-|through)\s*(\d{1,2}[\s\-][A-Za-z]{3}[\s\-]\d{2,4})",
            all_text,
            flags=re.IGNORECASE,
        )
        if period_match:
            period_start = standardize_date(period_match.group(1))
            period_end = standardize_date(period_match.group(2))

    # Pattern 3: BOB-style "Statement Period from Aug 01, 2026 to Aug 31, 2026"
    if not period_start:
        period_match = re.search(
            r"(?:period\s+from|from)\s+([A-Za-z]{3}\s+\d{1,2},?\s+\d{4})\s+to\s+([A-Za-z]{3}\s+\d{1,2},?\s+\d{4})",
            all_text,
            flags=re.IGNORECASE,
        )
        if period_match:
            for fmt in ["%b %d, %Y", "%b %d %Y"]:
                try:
                    s_dt = datetime.strptime(period_match.group(1), fmt)
                    e_dt = datetime.strptime(period_match.group(2), fmt)
                    period_start = s_dt.strftime("%Y-%m-%d")
                    period_end = e_dt.strftime("%Y-%m-%d")
                    break
                except ValueError:
                    continue

    return {
        "bank_name": detected_bank,
        "account_number": account_number,
        "period_start": period_start,
        "period_end": period_end,
    }


def _is_valid_date(s: str) -> bool:
    """Check if a string starts with a recognizable date pattern."""
    return bool(_DATE_START_RE.match(s.strip()))


def _is_noise_row(narration: str) -> bool:
    """Check if a row is noise (header/footer/summary) rather than a transaction."""
    low = narration.lower()
    noise_phrases = [
        "opening balance", "closing balance", "closing available balance",
        "account holder details", "total debits count", "total credits count",
        "period:", "abbreviations", "nominee details", "relationship type",
        "base branch address", "end of statement", "statement continued",
        "registered office:", "important messages", "corporate & current account",
        "verification:", "a summary of your relationship",
    ]
    return any(phrase in low for phrase in noise_phrases)


def _detect_type_from_columns(debit_str: str, credit_str: str, balance_str: str, narration: str) -> tuple[str, float]:
    """
    Determine transaction type and amount from separate debit/credit columns.
    Returns (type, amount).
    """
    debit_val = parse_clean_float(debit_str)
    credit_val = parse_clean_float(credit_str)

    if credit_val > 0 and debit_val == 0:
        return "income", credit_val
    elif debit_val > 0 and credit_val == 0:
        return "expense", debit_val
    elif debit_val > 0 and credit_val > 0:
        # Both present - use narration to disambiguate
        if re.search(r"(?i)\bCR[\-\s]|credit|deposit|salary|refund|cashback", narration):
            return "income", credit_val
        return "expense", debit_val

    return "", 0.0


def _merge_fragmented_tables(pdf: pdfplumber.PDF) -> list[dict[str, Any]]:
    """
    Handle banks like BOB where each transaction is in its own table.
    Strategy: Collect ALL table rows across ALL pages, identify the column structure
    from a header row, then apply it uniformly to all data rows.
    """
    all_rows: list[list[str]] = []
    col_map: dict[str, int] = {}
    header_found = False

    for page in pdf.pages:
        tables = page.extract_tables()
        if not tables:
            continue

        for table in tables:
            if not table:
                continue

            for row in table:
                if not row or not any(str(c or "").strip() for c in row):
                    continue

                clean_row = [str(c or "").strip() for c in row]
                joined_lower = " ".join(c.lower() for c in clean_row)

                # Detect header row
                if not header_found:
                    has_date = any(k in joined_lower for k in ["date", "txn date", "value date", "posting"])
                    has_desc = any(k in joined_lower for k in ["narration", "particulars", "description", "details", "remarks"])
                    has_amt = any(k in joined_lower for k in ["withdrawal", "deposit", "debit", "credit", "amount", "balance", "dr", "cr"])

                    if has_date and (has_desc or has_amt):
                        header_found = True
                        for c_idx, col_name in enumerate(clean_row):
                            cn = col_name.lower()
                            if not cn:
                                continue
                            if any(k in cn for k in ["txn date", "transaction date", "value date", "posting date", "date"]):
                                if "date" not in col_map:
                                    col_map["date"] = c_idx
                            elif any(k in cn for k in ["narration", "particulars", "description", "remarks", "details", "transaction details", "transaction description"]):
                                if "desc" not in col_map:
                                    col_map["desc"] = c_idx
                            elif any(k in cn for k in ["chq", "ref", "cheque", "utr", "tran id", "reference"]):
                                if "ref" not in col_map:
                                    col_map["ref"] = c_idx
                            elif any(k in cn for k in ["withdrawal", "debit", "dr", "withdrawal amt"]):
                                if "debit" not in col_map:
                                    col_map["debit"] = c_idx
                            elif any(k in cn for k in ["deposit", "credit", "cr", "deposit amt"]):
                                if "credit" not in col_map:
                                    col_map["credit"] = c_idx
                            elif any(k in cn for k in ["amount", "txn amount", "net amount"]):
                                if "amount" not in col_map:
                                    col_map["amount"] = c_idx
                            elif any(k in cn for k in ["type", "cr/dr", "dr/cr"]):
                                if "type" not in col_map:
                                    col_map["type"] = c_idx
                            elif any(k in cn for k in ["balance", "closing"]):
                                if "balance" not in col_map:
                                    col_map["balance"] = c_idx
                        continue  # Don't add header to data rows

                # If it's a re-occurrence of header on next page, skip it
                if header_found and any(k in joined_lower for k in ["date", "narration", "particulars"]):
                    has_date2 = any(k in joined_lower for k in ["date", "txn date", "value date"])
                    has_desc2 = any(k in joined_lower for k in ["narration", "particulars", "description"])
                    if has_date2 and has_desc2:
                        continue

                if header_found:
                    all_rows.append(clean_row)

    if not header_found or "date" not in col_map:
        return []

    # Process all collected rows into transactions
    transactions: list[dict[str, Any]] = []

    date_c = col_map.get("date")
    desc_c = col_map.get("desc")
    debit_c = col_map.get("debit")
    credit_c = col_map.get("credit")
    amt_c = col_map.get("amount")
    type_c = col_map.get("type")
    balance_c = col_map.get("balance")

    for row in all_rows:
        raw_date = row[date_c] if date_c is not None and date_c < len(row) else ""
        raw_desc = row[desc_c] if desc_c is not None and desc_c < len(row) else ""
        raw_debit = row[debit_c] if debit_c is not None and debit_c < len(row) else ""
        raw_credit = row[credit_c] if credit_c is not None and credit_c < len(row) else ""
        raw_amt = row[amt_c] if amt_c is not None and amt_c < len(row) else ""
        raw_type = row[type_c] if type_c is not None and type_c < len(row) else ""
        raw_balance = row[balance_c] if balance_c is not None and balance_c < len(row) else ""

        # Clean multi-line narrations (pdfplumber embeds \n)
        raw_desc = re.sub(r"\s*\n\s*", " ", raw_desc).strip()

        # Validate date
        if not raw_date or not _is_valid_date(raw_date):
            # Multi-line narration continuation: append to previous transaction
            if raw_desc and transactions:
                extra = re.sub(r"\s+", " ", raw_desc)
                transactions[-1]["description"] = f"{transactions[-1]['description']} {extra}".strip()
            continue

        # Skip noise rows
        if _is_noise_row(raw_desc):
            continue

        # Determine type and amount
        txn_type, final_amount = _detect_type_from_columns(raw_debit, raw_credit, raw_balance, raw_desc)

        # Fallback: single amount column with type column or narration hints
        if final_amount == 0 and raw_amt:
            final_amount = parse_clean_float(raw_amt)
            if final_amount > 0:
                lower_context = f"{raw_type} {raw_desc} {raw_balance}".lower()
                if any(k in lower_context for k in ["cr", "credit", "deposit", "salary", "refund", "cashback"]):
                    txn_type = "income"
                else:
                    txn_type = "expense"

        # Fallback: BOB-style balance column with "Cr" suffix can help disambiguate
        # but the primary signal is which column (debit/credit) has the value

        if final_amount <= 0:
            continue

        # Clean description
        clean_desc = re.sub(r"\s+", " ", raw_desc or "Bank Transaction").strip()

        category = auto_categorize(clean_desc, txn_type)
        std_date = standardize_date(raw_date)

        transactions.append({
            "date": std_date,
            "description": clean_desc,
            "amount": round(final_amount, 2),
            "type": txn_type,
            "category": category,
        })

    return transactions


def parse_statement_with_pdfplumber(pdf_bytes: bytes) -> dict[str, Any]:
    """
    Primary extraction engine using pdfplumber:
    1. Merges ALL table rows across pages (handles fragmented BOB-style tables)
    2. Identifies column headers dynamically (works with ICICI, HDFC, BOB, SBI, etc.)
    3. Handles multi-line narrations
    4. Falls back to layout-aware line parsing if no tables are detected.
    """
    transactions: list[dict[str, Any]] = []
    collected_text: list[str] = []

    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        # Collect document text for metadata
        for page in pdf.pages[:3]:
            txt = page.extract_text() or ""
            if txt:
                collected_text.append(txt)

        # Strategy 1: Unified table extraction across all pages
        # This handles both:
        #   - Multi-row tables (ICICI, HDFC): header + N data rows in one table
        #   - Fragmented tables (BOB): header in table N, then 1 data row per table
        transactions = _merge_fragmented_tables(pdf)

        # Strategy 2: If table extraction didn't yield transactions, use layout text extraction
        if not transactions:
            transactions = _parse_statement_from_text(pdf)

    # Calculate summary metrics
    metadata = extract_metadata("\n".join(collected_text))

    total_income = sum(t["amount"] for t in transactions if t["type"] == "income")
    total_expenses = sum(t["amount"] for t in transactions if t["type"] == "expense")
    net_savings = total_income - total_expenses

    if transactions:
        # Sort chronologically
        transactions.sort(key=lambda t: t["date"])
        if not metadata["period_start"]:
            metadata["period_start"] = transactions[0]["date"]
        if not metadata["period_end"]:
            metadata["period_end"] = transactions[-1]["date"]

    metadata["total_income"] = round(total_income, 2)
    metadata["total_expenses"] = round(total_expenses, 2)
    metadata["net_savings"] = round(net_savings, 2)

    return {
        "count": len(transactions),
        "statement_metadata": metadata,
        "transactions": transactions,
    }


def _parse_statement_from_text(pdf: pdfplumber.PDF) -> list[dict[str, Any]]:
    """Fallback parser for statements where tables have no border lines."""
    transactions: list[dict[str, Any]] = []

    # Combined date regex
    date_regex = re.compile(
        r"(\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b|\b\d{4}[\/\-\.]\d{2}[\/\-\.]\d{2}\b|\b\d{1,2}[\s\-][A-Za-z]{3}[\s\-]\d{2,4}\b)"
    )
    # Currency amount pattern: requires 2 decimal places e.g. 88,000.00 or 750.00
    amount_regex = re.compile(
        r"(?:Rs\.?|INR|₹)?\s*([0-9]{1,3}(?:,[0-9]{2,3})*\.[0-9]{2}|[0-9]+\.[0-9]{2})"
    )

    for page in pdf.pages:
        text = page.extract_text(layout=False) or ""
        lines = text.split("\n")

        for line in lines:
            line_clean = line.strip()
            lower_line = line_clean.lower()

            # Skip header/footer noise
            if any(h in lower_line for h in [
                "period:", "statement of", "account statement", "page ",
                "narration / description", "opening balance", "closing balance",
                "customer name", "branch:", "ifsc", "total withdrawal", "total deposit",
                "closing available balance", "total debits count", "total credits count",
                "corporate & current account disclosures", "verification:", "registered office:",
                "entity name:", "proprietor:", "account holder details", "abbreviations",
            ]):
                continue

            date_match = date_regex.search(line_clean)
            if not date_match:
                continue

            raw_date = date_match.group(1)
            # Find amounts only after the date
            post_date_text = line_clean[date_match.end():]
            amounts = [m for m in amount_regex.findall(post_date_text) if m and m != "."]
            if not amounts:
                continue

            # Convert amounts
            candidates = []
            for a_str in amounts:
                try:
                    val = float(a_str.replace(",", ""))
                    if val > 0:
                        candidates.append((val, a_str))
                except ValueError:
                    continue

            if not candidates:
                continue

            # In multi-column statements, last amount is balance, previous is transaction amount
            if len(candidates) >= 2:
                amt, amt_str = candidates[-2]
            else:
                amt, amt_str = candidates[0]

            # Clean description
            desc = post_date_text
            for _, a_s in candidates:
                desc = desc.replace(a_s, "")
            desc = re.sub(r"\b(?:UPI|NEFT|RTGS|IMPS|CARD|REF|CHQ|POS|TRANSFER|CHQ/REF|NO\.)[0-9A-Za-z\-]*\b", "", desc, flags=re.IGNORECASE)
            desc = re.sub(r"[\s\t,;|\-]+", " ", desc).strip()

            lower_desc = desc.lower()
            if any(k in lower_desc for k in ["opening balance", "closing balance", "closing available balance", "account holder details", "total debits count", "total credits count"]):
                continue

            # Determine type using word boundaries and column indicators
            if re.search(r"\bCR-|\b(?:cr|credit|deposit|salary|refund|cashback)\b", line_clean, re.IGNORECASE):
                txn_type = "income"
            else:
                txn_type = "expense"

            category = auto_categorize(desc, txn_type)
            std_date = standardize_date(raw_date)

            transactions.append({
                "date": std_date,
                "description": desc or "Bank Transaction",
                "amount": round(amt, 2),
                "type": txn_type,
                "category": category,
            })

    return transactions
