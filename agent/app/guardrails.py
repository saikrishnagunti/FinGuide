"""Guardrails and safety filters for FinGuide."""

from __future__ import annotations

import re
from typing import NamedTuple


class GuardrailResult(NamedTuple):
    passed: bool
    filtered_query: str
    rejection_message: str | None = None


# Patterns for sensitive PII (credit cards, CVVs, bank account numbers, passwords, tax IDs)
PII_PATTERNS = [
    (r"\b(?:\d[ -]*?){13,19}\b", "[REDACTED_CARD_NUMBER]"),  # Credit/Debit Card numbers
    (r"\b\d{3,4}\b(?=.*(?:cvv|cvc|security code))", "[REDACTED_CVV]"),
    (r"(?:password|passwd|pin)\s*[:=]\s*\S+", "[REDACTED_CREDENTIAL]"),
    (r"\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b", "[REDACTED_PAN]"),  # Indian PAN Card format
    (r"\b\d{4}\s\d{4}\s\d{4}\b", "[REDACTED_AADHAAR]"),  # Indian Aadhaar format
    (r"\b\d{3}-\d{2}-\d{4}\b", "[REDACTED_SSN]"),  # US SSN format
]

# Disallowed topics: speculative stock picks, illegal activities, tax evasion
DISALLOWED_PATTERNS = [
    (
        r"\b(?:which|what)\s+(?:stocks?|shares?|cryptos?|coins?)\s+should\s+i\s+(?:buy|sell|trade|short)\b",
        "FinGuide is designed for personal budgeting and cash-flow management. I do not provide individual stock picks, crypto tips, or speculative trading calls. For market investments, please consult a SEBI/SEC-registered investment advisor or consider diversified low-cost index funds.",
    ),
    (
        r"\b(?:how\s+to\s+evade|cheat\s+on|falsify|illegal|money\s+laundering|hide\s+black\s+money)\b",
        "FinGuide strictly adheres to ethical and legal financial practices. I cannot assist with tax evasion, fraudulent reporting, or illegal financial activities.",
    ),
    (
        r"\b(?:guaranteed|100%|surefire)\s+(?:return|profit|doubling|10x)\b",
        "In financial planning, there is no such thing as guaranteed high returns without commensurate risk. FinGuide focuses on sound budgeting, risk-aware emergency funds, and disciplined long-term saving.",
    ),
]

DISCLAIMER_TEXT = (
    "\n\n---\n"
    "> ℹ️ **Disclaimer:** *FinGuide is an AI budgeting and educational assistant, "
    "not a certified financial planner, tax consultant, or registered investment advisor. "
    "All figures are projections for budgeting purposes only. Consult a licensed financial "
    "professional for personalized investment, tax, or legal decisions.*"
)


def apply_pre_guardrails(user_input: str) -> GuardrailResult:
    """Validate and sanitize user input before forwarding to AI models."""
    cleaned = user_input.strip()

    # 1. Check for disallowed intents (illegal, stock-picking, get-rich-quick)
    for pattern, message in DISALLOWED_PATTERNS:
        if re.search(pattern, cleaned, re.IGNORECASE):
            return GuardrailResult(passed=False, filtered_query=cleaned, rejection_message=message)

    # 2. Redact sensitive personal data (PII)
    for pattern, replacement in PII_PATTERNS:
        cleaned = re.sub(pattern, replacement, cleaned, flags=re.IGNORECASE)

    return GuardrailResult(passed=True, filtered_query=cleaned)


def apply_post_guardrails(response_text: str, add_disclaimer: bool = True) -> str:
    """Format and secure output text before sending to client."""
    text = response_text.strip()

    # Mask any accidental PII leaks in output
    for pattern, replacement in PII_PATTERNS:
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)

    # Append regulatory educational disclaimer if not already present
    if add_disclaimer and "Disclaimer:" not in text:
        text = f"{text}{DISCLAIMER_TEXT}"

    return text
