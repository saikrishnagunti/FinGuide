# 💻 CODE_STYLE.md

> ![Write clean code. Ship fast.](https://img.shields.io/badge/Write_clean_code._Ship_fast.-4338CA?style=flat-square)

# Code Style Guide

How I write code in this project. If you're an agent helping out, follow these patterns.

---

<table width="100%">
<tr><td colspan="2">

### 01 &nbsp; Engineering Philosophy

I like code that's easy to read and hard to break. Here's the mindset:

| Principle | What it means in practice |
| :--- | :--- |
| 📖 **Clarity over cleverness** | Write readable code. If a 3-line block is clearer than a one-liner, use 3 lines. |
| 🛡️ **Defensive boundaries** | Never trust client input. Validate everything — Pydantic on Python side, schema checks on Express. |
| ✨ **Zero UI slop** | Internal terms like `sqlite3`, `FastAPI error`, or `gemini-3.5-flash-lite` should never appear in user-facing toasts. |
| ♻️ **Reuse, don't reinvent** | Check `frontend/src/components/` and `server/src/services/` before creating new files. |

</td></tr>
</table>

---

<table width="100%">
<tr>
<th width="50%" align="left">02 &nbsp; React & JavaScript Conventions</th>
<th width="50%" align="left">03 &nbsp; Python & FastAPI Conventions</th>
</tr>
<tr>
<td valign="top">

⚛️

- [x] ES Modules — `import/export` across all files
- [x] Functional components with modern React hooks
- [x] Immutable state updates — always spread (`[...prev]`)
- [x] Cleanup return in `useEffect` for listeners and timers
- [x] `PascalCase.jsx` for components and pages
- [x] `kebab-case.js` for backend utilities
- [x] No hardcoded hex values — use `var(--accent-primary)`

</td>
<td valign="top">

🐍

- [x] PEP 8 — 4-space indentation, `snake_case` names
- [x] Type annotations on all function signatures
- [x] Pydantic schemas for request/response validation
- [x] `async def` for FastAPI route handlers
- [x] Graceful handling of malformed PDF tables
- [x] Agent tools organized under `agent/app/`
- [x] Financial disclaimers attached to generated advice

</td>
</tr>
</table>

---

<table width="100%">
<tr>
<th width="50%" align="left">04 &nbsp; CSS Design Tokens</th>
<th width="50%" align="left">05 &nbsp; Database & SQL Conventions</th>
</tr>
<tr>
<td valign="top">

🎨

- [x] No TailwindCSS — custom tokens in `frontend/src/index.css`
- [x] Reference tokens: `var(--accent-primary)`, `var(--bg-card)`
- [x] 8px spatial grid: `var(--space-sm)`, `var(--space-md)`, etc.
- [x] Centralized dark mode variables on `:root`
- [x] `tabular-nums` for currency figures in tables

</td>
<td valign="top">

🗄️

- [x] Parameterized queries to prevent SQL injection
- [x] Sync changes to Turso Cloud with `saveDatabase()`
- [x] Snake case columns: `created_at`, `password_hash`
- [x] Wrap multi-table updates in explicit transactions
- [x] Local SQLite mirror as fallback if cloud disconnects

</td>
</tr>
</table>
