# Code Style Guide

> **Engineering Standards, Conventions & Best Practices Across FinGuide**

---

## 1. Engineering Philosophy

| Principle | Meaning & Practical Implementation |
| :--- | :--- |
| **📖 Clarity Over Cleverness** | Write readable, self-describing code. Avoid compressed, complex one-liners when a clear 3-line block is easier to debug and test. |
| **🛡️ Defensive Boundaries** | Never trust client input or raw third-party data. Validate payloads using Pydantic in Python and schema checks in Express. |
| **✨ Zero UI Slop** | Internal framework terms (e.g. `sqlite3`, `sql.js`, `FastAPI error`, `gemini-3.5-flash-lite`) must **never** be exposed in end-user error toasts or UI copy. |
| **♻️ Reusability & DRY** | Reuse established components in `frontend/src/components` and utilities in `server/src/services` before creating new files. |

---

## 2. React & Frontend Conventions

- **Module Format**: Strictly use ES Modules (`import` and `export`).
- **Component Pattern**:
  ```jsx
  import { useState, useEffect } from 'react';
  import { Shield, Check } from 'lucide-react';

  export default function MetricCard({ title, value, status = 'normal' }) {
    // Component logic
    return (
      <div className="card-panel">
        <h3>{title}</h3>
        <p className="metric-value">{value}</p>
      </div>
    );
  }
  ```
- **State Updates**: Never mutate state objects or arrays in-place. Always use shallow/deep copy spreads:
  ```javascript
  // ✅ Correct:
  setTransactions(prev => [...prev, newTx]);
  // ❌ Incorrect:
  transactions.push(newTx);
  ```
- **Cleanup Handlers**: Any `addEventListener` or `setInterval` registered in a `useEffect` must return an explicit cleanup function to prevent memory leaks and ghost event triggers.
- **Naming Conventions**:
  - Components & Pages: `PascalCase.jsx` (e.g. `AdvisorDrawer.jsx`, `Dashboard.jsx`)
  - Context & Hooks: `camelCase.jsx` or `useCamelCase.js` (e.g. `AuthContext.jsx`, `useTheme.js`)
  - Utilities: `camelCase.js` (e.g. `api.js`)

---

## 3. Python & FastAPI Backend Conventions

- **PEP 8 Compliance**: Enforce 4-space indentation, snake_case function/variable names, and PascalCase class names.
- **Strict Typing**: All function signatures must include Python type annotations:
  ```python
  from typing import List, Dict, Any

  async def calculate_burn_rate(transactions: List[Dict[str, Any]], days: int = 30) -> float:
      """Calculate user daily expense burn rate over specified lookback window."""
      ...
  ```
- **FastAPI Endpoints**: Always define route handlers as `async def` and validate payloads with Pydantic:
  ```python
  from fastapi import APIRouter, HTTPException, Depends
  from app.schemas import AnalysisRequest, AnalysisResponse

  router = APIRouter()

  @router.post("/analyze", response_model=AnalysisResponse)
  async def analyze_finances(payload: AnalysisRequest):
      ...
  ```
- **PDF Extraction**: All table extractions must be defensively wrapped in `try/except` blocks to handle malformed bank statements without crashing the server process.

---

## 4. CSS & Styling Conventions

- **Zero Hardcoded Colors**: Always use predefined CSS variables:
  ```css
  /* ✅ Correct */
  background-color: var(--bg-card);
  color: var(--accent-primary);

  /* ❌ Forbidden */
  background-color: #0d1e33;
  color: #00abe4;
  ```
- **No TailwindCSS**: FinGuide relies on a curated, performant Vanilla CSS design system configured in [`frontend/src/index.css`](file:///d:/JOB/AI/FinGuide/frontend/src/index.css).
- **Tabular Numerics**: Whenever displaying currencies or bank balances, use tabular numerals (`font-variant-numeric: tabular-nums;`) so numeric digits align vertically in tables.

---

## 5. Database & SQL Conventions

- **Always Parameterize Queries**: Never concatenate raw strings into SQL queries. Parameterized queries prevent SQL injection vulnerabilities:
  ```javascript
  // ✅ Correct:
  await executeQuery('SELECT * FROM users WHERE email = ?', [email]);

  // ❌ Forbidden:
  await executeQuery(`SELECT * FROM users WHERE email = '${email}'`);
  ```
- **Cloud Replication**: Any state-mutating operation (`INSERT`, `UPDATE`, `DELETE`) on the database must trigger synchronization with Turso Cloud via `saveDatabase()`.
- **Snake Case Columns**: Schema columns must follow snake_case (e.g., `user_id`, `password_hash`, `created_at`).
