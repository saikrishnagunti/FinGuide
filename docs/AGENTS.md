# Agent Instructions

> **Operational Guidelines, Standards & Rules for AI Coding Assistants**

---

## 1. Purpose

This document defines context, architecture constraints, and behavioral standards for AI coding agents (Antigravity, Claude Code, Cursor, Copilot) working within the FinGuide repository. Following these rules ensures clean code quality, architectural consistency, and security.

---

## 2. Before You Start Checklist

- [ ] **Read [`PRD.md`](PRD.md)** to understand the core product scope and user goals.
- [ ] **Read [`ARCHITECTURE.md`](ARCHITECTURE.md)** to grasp the three-tier system topology.
- [ ] **Read [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md)** to adhere to color tokens, typography, and spacing.
- [ ] **Read [`SECURITY.md`](SECURITY.md)** to respect OTP auth, lockout rules, and privacy bounds.
- [ ] Check existing components in `frontend/src/components` before creating new ones.
- [ ] Check existing services in `server/src/services` before writing duplicate business logic.

---

## 3. General Engineering Rules

- **Tech Stack Compliance**:
  - Frontend: React 19 + Vite + Vanilla CSS tokens (`src/index.css`). **Do not use TailwindCSS**.
  - Server: Node.js 20+ Express, ES Modules (`import`/`export`), `@libsql/client` (Turso Cloud) + local SQLite fallback.
  - Agent: Python 3.11+ FastAPI, `gemini-3.5-flash-lite`, `pdfplumber`, `statsmodels`.
- **Aesthetic Excellence**: Never create bare MVP or default browser styled components. Use the FinGuide color palette (`--accent-primary`, `--bg-dark`, `--brand-turquoise`), subtle gradients, and micro-interactions.
- **Defensive Input Handling**: Always validate inputs at route boundaries, file parsers, and external API connectors.
- **Keep Code Modular**: Keep files focused and reusable. Never create unnecessary files or convoluted abstractions.
- **Do Not Hallucinate**: Never delete or refactor critical modules without checking import dependencies first.

---

## 4. Code Guidelines & Standards

### React & JavaScript Frontend
- **Functional Components**: Use modern React 19 functional components and React hooks.
- **State Immutability**: Always use immutable updates (spread operators `...`) for state objects and arrays.
- **Design Tokens**: Never hardcode colors like `#00ABE4` or `#0A1828` inline. Always use `var(--accent-primary)`, `var(--bg-card)`, etc.
- **Lifecycle Safety**: Provide proper cleanup functions in `useEffect` when setting event listeners or timers.
- **File Naming**:
  - React components & pages: `PascalCase.jsx` (e.g., `AdvisorDrawer.jsx`, `Dashboard.jsx`).
  - Backend services & utilities: `kebab-case.js` (e.g., `statement-parser.js`, `agent-client.js`).

### Python AI Intelligence Agent
- **PEP 8 Compliance**: 4-space indentation, clear docstrings, and `snake_case` identifiers.
- **Strict Typing**: Enforce type annotations on all function signatures.
- **Pydantic Validation**: All FastAPI request and response payloads must use Pydantic models.
- **Async Handlers**: Use `async def` for all FastAPI endpoints.
- **Deterministic Parsing**: When extracting PDF statement tables, handle corrupted rows and multiline transaction descriptions defensively.

---

## 5. Security & Zero-Trust Guidelines

> [!WARNING]
> FinGuide processes sensitive user financial statements. Never compromise security or user privacy.

- **Zero Secret Leaks**: Never hardcode API keys, JWT secrets, or connection strings in code or documentation. Always use `process.env` or Pydantic `BaseSettings`.
- **Two-Step Email OTP**: Sensitive operations (registration, password changes, forgot password) require verified OTP confirmation.
- **Brute-Force Lockout**: 5 failed login attempts trigger an immediate 15-minute cooldown.
- **Session Inactivity**: Sessions automatically prompt after 13 minutes of inactivity and log out after 15 minutes.
- **Human-in-the-Loop AI**: AI agents must **never** commit financial transactions, budgets, or goal changes autonomously without explicit user confirmation.

---

## 6. Useful Development Commands

```bash
# 1. Run Python AI Agent (Port 8000)
cd agent
pip install -r requirements.txt
uvicorn app.main:app --port 8000

# 2. Run Node.js Express Gateway (Port 5000)
cd server
npm install
npm run dev

# 3. Run React 19 Frontend (Port 5173)
cd frontend
npm install
npm run dev

# 4. Verify Frontend Production Build
cd frontend
npm run build
```

---

## 7. Documentation Directory

| Document | Primary Focus |
| :--- | :--- |
| [`PRD.md`](PRD.md) | Product Requirements, Target Personas & Success Metrics |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Three-Tier Architecture, Data Flows & System Diagram |
| [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) | Color Tokens, Typography, Grid & Component Specs |
| [`SECURITY.md`](SECURITY.md) | Zero-Trust Protocol, OTP Verification, Rate Limiting & Audit Trail |
| [`CODE_STYLE.md`](CODE_STYLE.md) | React, Node.js, and Python Conventions |
| [`TESTING.md`](TESTING.md) | Test Pyramid, Security Tests & Pre-Deployment Checklist |
| [`DEPLOYMENT.md`](DEPLOYMENT.md) | Production Topology, Turso Cloud, Render & Vercel |
