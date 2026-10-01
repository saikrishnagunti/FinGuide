# 💻 Code Style Guide

<div align="center">

![Code Style](https://img.shields.io/badge/Code_Style-Clean_&_Defensive-4338CA?style=for-the-badge&logo=eslint&logoColor=white)
![React](https://img.shields.io/badge/React-19_ESM-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node](https://img.shields.io/badge/Node.js-20_LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11_FastAPI-3776AB?style=for-the-badge&logo=python&logoColor=white)

<p><em>Engineering standards, naming conventions, and best practices across the FinGuide codebase.</em></p>

</div>

---

### 01 Engineering Philosophy

| Principle | Practical Engineering Implementation |
| :--- | :--- |
| **📖 Clarity Over Cleverness** | Write readable, self-describing code. Avoid compressed, complex one-liners when a clear 3-line block is easier to debug and test. |
| **🛡️ Defensive Boundaries** | Never trust client input or raw third-party data. Validate payloads using Pydantic in Python and schema checks in Express. |
| **✨ Zero UI Slop** | Internal framework terms (e.g. `sqlite3`, `sql.js`, `FastAPI error`, `gemini-3.5-flash-lite`) must **never** be exposed in end-user error toasts or UI copy. |
| **♻️ Reusability & DRY** | Reuse established components in `frontend/src/components` and utilities in `server/src/services` before creating new files. |

---

<table width="100%">
<tr>
<th width="50%" align="left">⚛️ 02 React & JavaScript Conventions</th>
<th width="50%" align="left">🐍 03 Python & FastAPI Conventions</th>
</tr>
<tr>
<td valign="top">

- [x] **ES Modules**: `import/export` syntax across all frontend and Node files
- [x] **Functional Components**: Clean JSX components with modern React hooks
- [x] **State Immutability**: Always spread state objects and arrays (`[...prev]`)
- [x] **Lifecycle Safety**: Proper cleanup return functions in `useEffect`
- [x] **Component Naming**: `PascalCase.jsx` for components and pages
- [x] **Service Naming**: `kebab-case.js` for backend utilities
- [x] **Zero Hardcoded Colors**: Strictly use `var(--accent-primary)`

</td>
<td valign="top">

- [x] **PEP 8 Compliance**: 4-space indentation, snake_case identifiers
- [x] **Type Annotations**: Enforce type hints on all function signatures
- [x] **Pydantic Schemas**: Validate all request/response models strictly
- [x] **Async Handlers**: Use `async def` for FastAPI route handlers
- [x] **Defensive PDF Parsing**: Gracefully handle malformed bank statement tables
- [x] **Tool Isolation**: Agent tools organized cleanly under `agent/app/`
- [x] **Disclaimers**: Attach financial disclaimers to generated advice

</td>
</tr>
</table>

---

<table width="100%">
<tr>
<th width="50%" align="left">🎨 04 CSS Design Tokens</th>
<th width="50%" align="left">🗄️ 05 Database & SQL Conventions</th>
</tr>
<tr>
<td valign="top">

- [x] **No TailwindCSS**: Rely on custom tokens in `frontend/src/index.css`
- [x] **Token References**: Use `var(--accent-primary)`, `var(--bg-card)`, etc.
- [x] **8px Spatial Grid**: Use `var(--space-sm)`, `var(--space-md)`, etc.
- [x] **Dark Mode Variables**: Centralized variables on `:root` and `[data-theme]`
- [x] **Tabular Numbers**: Apply `tabular-nums` for currency figures in tables

</td>
<td valign="top">

- [x] **Parameterized Queries**: Always bind query parameters to prevent SQLi
- [x] **Turso Cloud Replication**: Sync state changes immediately with `saveDatabase()`
- [x] **Snake Case Columns**: `created_at`, `password_hash`, `locked_until`
- [x] **Transactions**: Wrap multi-table bulk updates in explicit transactions
- [x] **Defensive Fallback**: Keep local in-memory SQLite mirror ready if cloud disconnects

</td>
</tr>
</table>
