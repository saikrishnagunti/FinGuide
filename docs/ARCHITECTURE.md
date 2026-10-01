# 🏛️ System Architecture

<div align="center">

![Topology](https://img.shields.io/badge/Architecture-Three--Tier_Microservices-00ABE4?style=for-the-badge&logo=diagramsdotnet&logoColor=white)
![Frontend](https://img.shields.io/badge/Frontend-React_19_SPA-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Gateway](https://img.shields.io/badge/Gateway-Express_Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![AI Engine](https://img.shields.io/badge/AI_Engine-FastAPI_•_Gemini_3.5-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Database](https://img.shields.io/badge/Database-Turso_Cloud_libSQL-4FF8D2?style=for-the-badge&logo=sqlite&logoColor=black)

<p><em>High-level overview of FinGuide's distributed three-tier architecture, data pipeline, and cloud topology.</em></p>

</div>

---

### 01 System Overview

```mermaid
flowchart LR
    subgraph Client ["Client Presentation"]
        Browser["👤 Web & Mobile Browser"]
    end

    subgraph FrontendTier ["Tier 1: Frontend SPA"]
        ReactApp["💻 React 19 + Vite<br/>• Vanilla CSS Design Tokens<br/>• Session Guard & Inactivity Timer<br/>(Hosted on Vercel CDN)"]
    end

    subgraph GatewayTier ["Tier 2: API Gateway"]
        ExpressApp["⚙️ Node.js Express Gateway<br/>• JWT Authentication & Bcrypt<br/>• Helmet Security & Rate Limiting<br/>• Audit Logging Trail<br/>(Hosted on Render)"]
    end

    subgraph AgentTier ["Tier 3: AI Intelligence Engine"]
        FastAPIApp["🤖 Python FastAPI Service<br/>• pdfplumber Statement Parser<br/>• statsmodels ARIMA Forecasts<br/>• ReAct Reasoning Loop<br/>(Hosted on Render)"]
    end

    subgraph ExternalCloud ["Managed Cloud Infrastructure"]
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

<table width="100%">
<tr>
<th width="50%" align="left">⚙️ 02 Tech Stack</th>
<th width="50%" align="left">📂 03 Project Structure</th>
</tr>
<tr>
<td valign="top">

| Layer | Technologies | Primary Role |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Vanilla CSS | Single Page App, responsive dashboard, charts |
| **Gateway** | Node.js 20+, Express, Helmet | Route dispatch, JWT auth, rate limiting |
| **Database** | Turso Cloud libSQL + SQLite | Cloud persistence, local failover replication |
| **AI Agent** | Python 3.11+, FastAPI | ReAct reasoning, spending diagnostics |
| **LLM** | Gemini 3.5 Flash Lite | Grounded advice & natural language chat |
| **Parser** | `pdfplumber` + regex | Deterministic bank statement extraction |
| **Forecast** | `statsmodels` (ARIMA/SARIMA) | Algorithmic forward cash-flow projection |
| **Email** | Brevo HTTPS API (Port 443) | Transactional OTP delivery worldwide |

</td>
<td valign="top">

```
FinGuide/
├── frontend/          # React 19 SPA (Vercel)
│   ├── src/components/ # Reusable UI components
│   ├── src/pages/      # Dashboard, Upload, Advisor...
│   └── src/index.css   # Complete design token system
├── server/            # Node Express Gateway (Render)
│   ├── src/routes/     # Auth, IE, Goals, Proxy
│   ├── src/services/   # Brevo email, Security, Agent
│   └── src/database.js # Turso cloud sync engine
├── agent/             # Python FastAPI (Render)
│   ├── app/main.py     # FastAPI endpoints
│   ├── app/pdf_parser.py # Statement extraction
│   └── app/react_agent.py # ReAct reasoning loop
└── docs/              # Official repository docs
```

</td>
</tr>
</table>

---

<table width="100%">
<tr>
<th width="50%" align="left">🔄 04 End-to-End Data Flow</th>
<th width="50%" align="left">🚀 05 Scalability & Future Roadmap</th>
</tr>
<tr>
<td valign="top">

1. **User Ingestion**: User uploads a bank statement PDF or CSV via the frontend dropzone.
2. **Gateway Dispatch**: The Express gateway validates authentication, attaches the user context, and streams the file to the Python service.
3. **Deterministic Extraction**: `pdfplumber` extracts table bounding boxes and normalizes transaction balances.
4. **Cloud Replication**: Normalized records are saved to SQLite and synchronized to **Turso Cloud** in real-time.
5. **AI Advisory Review**: When the user asks for guidance, the agent retrieves ledger history, calls Gemini 3.5 Flash Lite, and returns interactive action approval cards.

</td>
<td valign="top">

- ✅ **Decoupled Architecture**: Frontend, Gateway, and AI Agent scale independently on dedicated containers.
- ✅ **Stateless Restarts**: Real-time replication to **Turso Cloud (libSQL)** ensures complete data durability across server restarts.
- ✅ **High-Performance Caching**: Pre-calculated monthly financial metrics reduce redundant database reads.
- ✅ **Asynchronous Batch Queues**: Pluggable worker queues (BullMQ/Celery) ready for high-volume statement processing.
- ✅ **Zero-Trust Security**: Per-user encrypted storage with comprehensive audit logging for all authentication events.

</td>
</tr>
</table>
