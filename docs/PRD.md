# 📄 Product Requirements Document (PRD)

<div align="center">

![Product](https://img.shields.io/badge/Product-FinGuide-7E22CE?style=for-the-badge&logo=target&logoColor=white)
![Vision](https://img.shields.io/badge/Vision-AI_Wealth_OS-00ABE4?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production_Ready-178582?style=for-the-badge)

<p><em>Product strategy, target personas, core feature specifications, and success benchmarks.</em></p>

</div>

---

### 01 Product Overview

| Property | Details |
| :--- | :--- |
| **Product Name** | **FinGuide — AI Financial Intelligence & Wealth OS** |
| **Tagline** | Autonomous personal financial advisory, bank statement verification, and predictive wealth forecasting powered by AI. |
| **Mission** | Bridge the gap between raw, opaque bank statements and actionable wealth building by combining deterministic parsing, statistical modeling (ARIMA/SARIMA), and Gemini 3.5 Flash Lite reasoning. |
| **Core Values** | 100% User Privacy &bull; Zero Intrusive Banking Logins &bull; Human-in-the-Loop Decision Governance. |

---

### 02 Problem & Goal

> [!WARNING]
> **The Problem with Modern Personal Finance Tools:**
> Managing finances today is tedious and anxiety-inducing. Spreadsheets require manual data entry that users abandon within weeks. Aggregators demand intrusive online banking passwords that privacy-conscious individuals refuse to grant. Furthermore, traditional budgeting apps display passive historical charts without answering forward-looking questions like *"Can I afford a ₹50,000 expense in 3 months without compromising my emergency fund?"*

> [!NOTE]
> **The FinGuide Solution & Goal:**
> Deliver complete, actionable financial clarity in **under 2 minutes** by allowing users to drag & drop their bank statements, review verified transactions with complete privacy, and receive grounded AI guidance where the user always maintains final approval.

---

<table width="100%">
<tr>
<th width="50%" align="left">👥 03 Target Personas</th>
<th width="50%" align="left">💬 04 User Voice & Core Need</th>
</tr>
<tr>
<td valign="top">

- **Salaried Professionals**: Want automatic transaction categorization, savings rate calculation, and zero spreadsheet upkeep.
- **Freelancers & Contractors**: Require forward cash flow projections to navigate irregular monthly invoices and buffer emergency reserves.
- **Couples & Households**: Need shared milestone tracking, debt payoff roadmaps, and realistic expense targets.
- **Privacy-Conscious Savers**: Demand tools that parse statements locally without demanding bank passwords or selling data.

</td>
<td valign="top">

> *"I want a smart financial companion that analyzes my actual bank statements, gives me honest advice about my spending habits, and helps me plan purchases — without selling my data or asking for my bank password."*
>
> — **Target User Feedback**

</td>
</tr>
</table>

---

### 05 Core Features Matrix

| Feature Module | Visual Icon | User Capabilities | Underlying Technology |
| :--- | :---: | :--- | :--- |
| **Statement Upload** | 📄 | Drag & drop PDF or CSV statements from major banks with instant validation | `pdfplumber` + regex pattern matcher |
| **Financial Audit** | 📊 | Automatic spending categorization, 50/30/20 benchmark scoring, and health metrics | Express Gateway + SQLite computation |
| **Cash Flow Forecast** | 📈 | Algorithmic forward projections of account balances and safety runway | `statsmodels` (ARIMA / SARIMA / ETS) |
| **AI Advisor Copilot** | 🤖 | Conversational financial advice grounded in user transaction history | Google Gemini 3.5 Flash Lite + ReAct loop |
| **Action Approvals** | 🛡️ | Human-in-the-loop confirmation cards; AI cannot modify data without permission | React 19 interactive confirmation drawers |
| **Zero-Trust Security** | 🔒 | 2-step email OTP verification, 15m brute force lockout, and idle session auto-logout | Brevo HTTPS API + Bcrypt + Helmet |

---

### 06 Success Metrics & Key Performance Indicators (KPIs)

| Metric | Target Benchmark | How We Measure Success |
| :--- | :---: | :--- |
| **Statement Extraction Accuracy** | `≥ 98.5%` | Accurate transaction row parsing across diverse bank statement PDF layouts |
| **Time to First Financial Audit** | `< 60 seconds` | Time from initial file upload to rendered interactive financial dashboard |
| **User Action Approval Rate** | `≥ 70%` | Proportion of AI-suggested budgets and savings goals accepted by users |
| **Session Security Integrity** | `100%` | All unattended sessions safely locked after 15 minutes of idle time |
| **User Satisfaction Rating** | `≥ 4.8 / 5.0` | User sentiment regarding budgeting clarity and advice relevance |
