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


def parse_clean_float(val: Any) -> float:
    """Parse a string into a clean float, removing currency symbols, commas, and Cr/Dr tags."""
    if val is None:
        return 0.0
    s = str(val).strip()
    if not s or s in ["-", "--", "nil", "null"]:
        return 0.0
    # Remove currency words/symbols like Rs, Rs., INR, USD, EUR, GBP, ₹, $, €, £
    s = re.sub(r"(?i)(?:rs\.|rs\b|inr\b|usd\b|eur\b|gbp\b)", "", s)
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
    if any(k in d for k in ["bescom", "electricity", "mseb", "tneb", "cesc", "power", "water", "airtel", "jio", "vodafone", "vi", "broadband", "wifi", "gas", "indane", "hp gas", "bharat gas"]):
        return "Utilities"
    if any(k in d for k in ["netflix", "spotify", "prime", "hotstar", "youtube", "bookmyshow", "cinema", "pvr", "inox", "movie", "entertainment", "steam", "playstation"]):
        return "Entertainment"
    if any(k in d for k in ["amazon", "flipkart", "myntra", "ajio", "nykaa", "tata cliq", "zara", "h&m", "shopping", "retail", "clothing", "croma", "reliancedigital"]):
        return "Shopping"
    if any(k in d for k in ["pharmacy", "apollo", "1mg", "hospital", "clinic", "dental", "dr.", "medical", "medplus", "netmeds", "diagnostics", "lab"]):
        return "Healthcare"
    if any(k in d for k in ["zerodha", "groww", "mutual fund", "sip", "upstox", "angelone", "coin", "kuvera", "nse", "bse", "investment", "share"]):
        return "Investments"

    return "General"


def extract_metadata(all_text: str) -> dict[str, Any]:
    """Extract metadata including bank name, masked account number, and statement period."""
    lower_text = all_text.lower()
    detected_bank = "Bank Statement"
    for bank_name, aliases in KNOWN_BANKS:
        if any(alias in lower_text for alias in aliases):
            detected_bank = bank_name
            break

    # Masked account number detection
    ac_match = re.search(
        r"(?:account\s*(?:no|number|#|id)?|a\/c\s*(?:no)?)\s*[:.-]?\s*([0-9Xx\*\-]{6,20})",
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

    # Statement period detection
    period_match = re.search(
        r"(?:period|statement\s*from|from)\s*[:.-]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\s*(?:to|-|through)\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})",
        all_text,
        flags=re.IGNORECASE,
    )
    period_start = None
    period_end = None
    if period_match:
        period_start = standardize_date(period_match.group(1))
        period_end = standardize_date(period_match.group(2))

    return {
        "bank_name": detected_bank,
        "account_number": account_number,
        "period_start": period_start,
        "period_end": period_end,
    }


def parse_statement_with_pdfplumber(pdf_bytes: bytes) -> dict[str, Any]:
    """
    Primary extraction engine using pdfplumber:
    1. Extracts structured tables across all pages
    2. Identifies headers dynamically
    3. Handles multi-line narrations
    4. Falls back to layout-aware line parsing if bordered tables are not detected.
    """
    transactions: list[dict[str, Any]] = []
    collected_text: list[str] = []

    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        # First collect document text for metadata
        for page in pdf.pages[:3]:  # First 3 pages contain all header metadata
            txt = page.extract_text() or ""
            if txt:
                collected_text.append(txt)

        # Strategy 1: Extract structured tables
        for page in pdf.pages:
            tables = page.extract_tables()
            if not tables:
                continue

            for table in tables:
                if not table or len(table) < 2:
                    continue

                # Header detection
                header_idx = -1
                col_map: dict[str, int] = {}

                for r_idx, row in enumerate(table[:5]):
                    clean_row = [str(c or "").strip().lower() for c in row]
                    joined_row = " ".join(clean_row)

                    # Look for date and narration/particulars columns
                    has_date = any(k in joined_row for k in ["date", "txn date", "value date", "posting"])
                    has_desc = any(k in joined_row for k in ["narration", "particulars", "description", "details", "remarks"])
                    has_amt = any(k in joined_row for k in ["withdrawal", "deposit", "debit", "credit", "amount", "balance", "dr", "cr"])

                    if has_date and (has_desc or has_amt):
                        header_idx = r_idx
                        # Map columns
                        for c_idx, col_name in enumerate(clean_row):
                            if not col_name:
                                continue
                            if any(k in col_name for k in ["txn date", "transaction date", "value date", "posting date", "date"]):
                                if "date" not in col_map:
                                    col_map["date"] = c_idx
                            elif any(k in col_name for k in ["narration", "particulars", "description", "remarks", "details", "transaction details"]):
                                if "desc" not in col_map:
                                    col_map["desc"] = c_idx
                            elif any(k in col_name for k in ["chq", "ref", "cheque", "utr", "tran id", "reference"]):
                                if "ref" not in col_map:
                                    col_map["ref"] = c_idx
                            elif any(k in col_name for k in ["withdrawal", "debit", "dr", "withdrawal amt"]):
                                if "debit" not in col_map:
                                    col_map["debit"] = c_idx
                            elif any(k in col_name for k in ["deposit", "credit", "cr", "deposit amt"]):
                                if "credit" not in col_map:
                                    col_map["credit"] = c_idx
                            elif any(k in col_name for k in ["amount", "txn amount", "net amount"]):
                                if "amount" not in col_map:
                                    col_map["amount"] = c_idx
                            elif any(k in col_name for k in ["type", "cr/dr", "dr/cr"]):
                                if "type" not in col_map:
                                    col_map["type"] = c_idx
                            elif any(k in col_name for k in ["balance", "closing"]):
                                if "balance" not in col_map:
                                    col_map["balance"] = c_idx
                        break

                if header_idx == -1 or "date" not in col_map:
                    continue

                # Process transaction rows
                date_c = col_map.get("date")
                desc_c = col_map.get("desc")
                debit_c = col_map.get("debit")
                credit_c = col_map.get("credit")
                amt_c = col_map.get("amount")
                type_c = col_map.get("type")

                for row in table[header_idx + 1:]:
                    if not row:
                        continue

                    raw_date = str(row[date_c] or "").strip() if date_c is not None and date_c < len(row) else ""
                    raw_desc = str(row[desc_c] or "").strip() if desc_c is not None and desc_c < len(row) else ""
                    raw_debit = str(row[debit_c] or "").strip() if debit_c is not None and debit_c < len(row) else ""
                    raw_credit = str(row[credit_c] or "").strip() if credit_c is not None and credit_c < len(row) else ""
                    raw_amt = str(row[amt_c] or "").strip() if amt_c is not None and amt_c < len(row) else ""
                    raw_type = str(row[type_c] or "").strip() if type_c is not None and type_c < len(row) else ""

                    # Check for multi-line narration continuation
                    is_valid_date = any(re.search(pat, raw_date) for pat, _ in DATE_PATTERNS)
                    if not is_valid_date:
                        if raw_desc and transactions:
                            # Append extra description to previous transaction
                            prev = transactions[-1]
                            clean_extra = re.sub(r"\s+", " ", raw_desc)
                            prev["description"] = f"{prev['description']} {clean_extra}".strip()
                        continue

                    # Parse transaction amount and type
                    debit_val = parse_clean_float(raw_debit)
                    credit_val = parse_clean_float(raw_credit)
                    amt_val = parse_clean_float(raw_amt)

                    txn_type = "expense"
                    final_amount = 0.0

                    if debit_val > 0:
                        final_amount = debit_val
                        txn_type = "expense"
                    elif credit_val > 0:
                        final_amount = credit_val
                        txn_type = "income"
                    elif amt_val > 0:
                        final_amount = amt_val
                        lower_row = " ".join(str(c or "") for c in row).lower()
                        if any(k in lower_row for k in ["cr", "credit", "deposit"]) or "cr" in raw_type.lower():
                            txn_type = "income"
                        else:
                            txn_type = "expense"

                    if final_amount <= 0:
                        continue

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

            # First amount is the transaction amount
            amt, amt_str = candidates[0]

            # Clean description
            desc = post_date_text
            for _, a_s in candidates:
                desc = desc.replace(a_s, "")
            desc = re.sub(r"\b(?:UPI|NEFT|RTGS|IMPS|CARD|REF|CHQ|POS|TRANSFER|CHQ/REF|NO\.)[0-9A-Za-z\-]*\b", "", desc, flags=re.IGNORECASE)
            desc = re.sub(r"[\s\t,;|\-]+", " ", desc).strip()

            # Determine type
            if any(w in lower_line for w in ["cr", "credit", "deposit", "salary", "refund"]):
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
