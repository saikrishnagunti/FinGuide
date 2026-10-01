# FinGuide

<div align="center">

![FinGuide Banner](https://img.shields.io/badge/FinGuide-AI_Financial_Intelligence_&_Wealth_OS-00ABE4?style=for-the-badge&logo=googlecloud&logoColor=white)

[![React 19](https://img.shields.io/badge/React-19_Vite-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Node Express](https://img.shields.io/badge/Node.js-Express_Gateway-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://expressjs.com/)
[![Python FastAPI](https://img.shields.io/badge/FastAPI-AI_Intelligence-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Turso libSQL](https://img.shields.io/badge/Turso-Cloud_Database-4FF8D2?style=flat-square&logo=sqlite&logoColor=black)](https://turso.tech/)
[![Google Gemini](https://img.shields.io/badge/Gemini_3.5-Flash_Lite-8E75B2?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![Brevo API](https://img.shields.io/badge/Brevo-Email_OTP-0B99FF?style=flat-square)](https://www.brevo.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

<p><em>Autonomous personal financial advisory, bank statement verification, and predictive wealth forecasting powered by <strong>Google Gemini 3.5 Flash Lite</strong>.</em></p>

</div>

---

### 📚 Official Documentation Directory

| Document | Category Badge | Purpose & Scope |
| :--- | :---: | :--- |
| [📄 **`PRD.md`**](docs/PRD.md) | ![Goals](https://img.shields.io/badge/PRD-Product_Goals-7E22CE?style=flat-square) | Product requirements, user personas, problem statement, and success KPIs. |
| [🤖 **`AGENTS.md`**](docs/AGENTS.md) | ![Rules](https://img.shields.io/badge/Agents-Team_Rules-BE185D?style=flat-square) | Operational guidelines, checklists, and conventions for AI pair programmers. |
| [🎨 **`DESIGN_SYSTEM.md`**](docs/DESIGN_SYSTEM.md) | ![Tokens](https://img.shields.io/badge/Design-Tokens_&_UI-047857?style=flat-square) | Drone Blue color palette, typography scale, 8px grid, and component specs. |
| [🏛️ **`ARCHITECTURE.md`**](docs/ARCHITECTURE.md) | ![Topology](https://img.shields.io/badge/Arch-Three--Tier-1D4ED8?style=flat-square) | Distributed system topology, folder structure, end-to-end data flows, and scaling. |
| [🛡️ **`SECURITY.md`**](docs/SECURITY.md) | ![Security](https://img.shields.io/badge/Security-Zero_Trust-B91C1C?style=flat-square) | Two-step OTP, 15m lockout cooldown, idle auto-logout, and audit logging trail. |
| [💻 **`CODE_STYLE.md`**](docs/CODE_STYLE.md) | ![Code](https://img.shields.io/badge/Code-Standards-4338CA?style=flat-square) | React 19 conventions, Python FastAPI standards, and database query safety. |
| [🧪 **`TESTING.md`**](docs/TESTING.md) | ![Testing](https://img.shields.io/badge/QA-Test_Pyramid-B45309?style=flat-square) | Test pyramid, backend integration scripts, Playwright visual tests, and checklists. |
| [🚀 **`DEPLOYMENT.md`**](docs/DEPLOYMENT.md) | ![Cloud](https://img.shields.io/badge/Cloud-Production-0369A1?style=flat-square) | Production topology (Vercel + Render), Turso cloud libSQL, and secret configs. |

---

### 🏛️ System Architecture

```mermaid
flowchart LR
    subgraph Client ["Client Presentation"]
        Browser["👤 Web & Mobile Browser"]
    end

    subgraph FrontendTier ["Tier 1: Frontend (SPA)"]
        ReactApp["💻 React 19 + Vite<br/>• Vanilla CSS Design Tokens<br/>• Session Guard & Inactivity Timer<br/>(Hosted on Vercel CDN)"]
    end

    subgraph GatewayTier ["Tier 2: API Gateway"]
        ExpressApp["⚙️ Node.js Express Gateway<br/>• JWT Authentication & Bcrypt<br/>• Helmet Security & Rate Limiting<br/>• Audit Logging Trail<br/>(Hosted on Render)"]
    end

    subgraph AgentTier ["Tier 3: AI Intelligence Engine"]
        FastAPIApp["🤖 Python FastAPI Service<br/>• pdfplumber Statement Parser<br/>• statsmodels ARIMA Forecasts<br/>• ReAct Reasoning Loop<br/>(Hosted on Render)"]
    end

    subgraph ExternalCloud ["Managed Cloud Services"]
        TursoDB[("☁️ Turso Cloud Database<br/>(libSQL Edge Persistence)")]
        BrevoAPI["📧 Brevo Email API<br/>(HTTPS Port 443 OTPs)"]
        GeminiAI["🧠 Google AI Studio<br/>(Gemini 3.5 Flash Lite)"]
    end

    Browser -->|HTTPS REST| ReactApp
    ReactApp -->|REST API / JSON| ExpressApp
    ExpressApp -->|Internal HTTP| FastAPIApp
    ExpressApp -->|libSQL over TLS| TursoDB
    ExpressApp -->|HTTPS API| BrevoAPI
    FastAPIApp -->|REST API| GeminiAI
```

---

### ⚡ Quick Start Guide

<table width="100%">
<tr>
<th width="33%" align="left">1️⃣ STEP 1: AI Agent</th>
<th width="33%" align="left">2️⃣ STEP 2: Gateway Server</th>
<th width="33%" align="left">3️⃣ STEP 3: Frontend Client</th>
</tr>
<tr>
<td valign="top">

```bash
cd agent
pip install -r requirements.txt
uvicorn app.main:app --port 8000
```

</td>
<td valign="top">

```bash
cd server
npm install
npm run dev
```

</td>
<td valign="top">

```bash
cd frontend
npm install
npm run dev
```

</td>
</tr>
</table>

Open [**http://localhost:5173**](http://localhost:5173) in your browser.

---

### 🛡️ Production Security Highlights

- 🔒 **Zero-Knowledge Statement Ingestion**: Bank statements are processed in-memory; online banking credentials are never requested or stored.
- 📧 **Two-Step Email OTP**: One-time codes sent via Brevo HTTPS API (port 443) authenticate registrations and password changes.
- ⏱️ **Brute-Force Lockout**: 5 failed login attempts trigger an automatic 15-minute cooldown timer.
- 🔔 **Inactivity Auto-Logout**: Unattended sessions automatically prompt after 13 minutes and log out at 15 minutes.
- ☁️ **Cloud Database Isolation**: User records reside exclusively in encrypted **Turso Cloud** storage; zero personal financial data ever enters Git.
