# Product Requirements Document (PRD)

> **FinGuide — AI Financial Intelligence & Wealth Operating System**

---

## 1. Product Overview

| Property | Details |
| :--- | :--- |
| **Product Name** | FinGuide |
| **Tagline** | Autonomous personal financial advisory, bank statement verification, and predictive wealth forecasting powered by AI. |
| **Mission** | Bridge the gap between raw, opaque bank statements and actionable wealth management by combining deterministic parsing, statistical modeling (ARIMA/SARIMA), and Gemini 3.5 Flash Lite reasoning. |
| **Core Values** | 100% User Privacy, Zero Intrusive Banking Logins, Human-in-the-Loop Decision Control. |

---

## 2. Problem Statement

Managing personal finances is fragmented, manual, and anxiety-inducing:
1. **Spreadsheet Fatigue**: Manual expense tracking requires tedious data entry that users inevitably abandon within weeks.
2. **Privacy Intrusion**: Open-banking aggregators demand sensitive bank login credentials that security-minded individuals refuse to share.
3. **Passive History vs. Proactive Answers**: Traditional budgeting tools only show backward-looking historical charts, failing to answer forward-looking questions like *"Can I afford a ₹50,000 purchase next quarter without touching my emergency fund?"*

---

## 3. Product Vision & Goals

Help users achieve complete financial clarity in **under 2 minutes** by:
1. **Frictionless Ingestion**: Drag & drop any standard bank statement PDF or CSV.
2. **Transparent Verification**: Review, edit, and confirm auto-categorized transactions.
3. **Intelligent Forecasting**: View data-backed forward cash flow and emergency fund projections.
4. **Governed AI Advisory**: Converse with an AI financial advisor that suggests plans requiring explicit user approval before execution.

---

## 4. Target User Personas

| Persona | Core Need | FinGuide Solution |
| :--- | :--- | :--- |
| **Salaried Professionals** | Wants automated expense categorization and savings rate tracking without manual spreadsheets. | Instant PDF upload, monthly health audits, and automated savings rate scoring. |
| **Freelancers & Contractors** | Has variable income month-to-month and needs cash runway forecasts. | ARIMA/SARIMA time-series projections that identify cash crunches weeks in advance. |
| **Households & Couples** | Needs to budget for large upcoming expenses and pay down high-interest debt. | Interactive budget snapshots, debt reduction milestones, and goal feasibility checking. |
| **Privacy-Conscious Individuals** | Refuses to link bank credentials to third-party aggregator services. | Offline-capable parsing: upload PDF statements directly with zero bank password requests. |

---

## 5. Core Feature Pillars

### 📄 1. Intelligent Statement Parser
- Upload bank statements in PDF or CSV formats (ICICI, BOB, HDFC, SBI, Axis, etc.).
- Deterministic table bounding-box extraction using `pdfplumber` with fallback to text regex scanners.
- Human-in-the-Loop verification table allowing inline corrections, category reassignments, and deletion.

### 📊 2. Financial Health Audit
- Instant calculation of core vitals: Total Income, Total Expenses, Net Savings, and Savings Rate.
- Spending category breakdown (Housing, Food, Utilities, Discretionary, Investment).
- Benchmarking against the 50/30/20 financial rule.

### 📈 3. Predictive Cash Flow Modeling
- Statistical time-series forecasting using `statsmodels` (ARIMA, SARIMA, ETS).
- Dynamic projections of end-of-month balances and safe spending ceilings.
- Early warning alerts for impending cash flow dips.

### 🤖 4. AI Advisor with Approval Governance
- Conversational financial copilot powered by **Google Gemini 3.5 Flash Lite**.
- ReAct loop that retrieves real transaction history to ground all advice in factual user data.
- **Action Confirmation Cards**: The advisor cannot modify budgets, goals, or categories without explicit user confirmation.

### 🛡️ 5. Zero-Trust Security Suite
- Mandatory Two-Step Email OTP for registration and sensitive security actions.
- 5-attempt failed login lockout triggering a 15-minute cooldown.
- Session auto-logout after 15 minutes of idle time with a 120-second warning countdown.
- Complete security audit log of all security-sensitive events.

---

## 6. Success Metrics & KPIs

- **Extraction Accuracy**: $\ge 98.5\%$ accurate transaction extraction across major Indian and global bank formats.
- **Time to First Value**: Under 60 seconds from statement upload to rendered financial audit.
- **Action Adoption Rate**: $\ge 70\%$ of AI-suggested budgets and goals accepted by active users.
- **Session Security Integrity**: 100% of inactive sessions safely locked after 15 minutes.
- **User Satisfaction**: $\ge 4.8 / 5.0$ clarity rating in user budgeting decisions.
