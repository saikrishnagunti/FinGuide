<div align="right">
<span style="background: #F3E8FF; color: #7E22CE; padding: 5px 16px; border-radius: 9999px; font-size: 12px; font-weight: 700; letter-spacing: 0.2px;">Big picture. Clear structure. Scalable.</span>
</div>

# 🏛️ ARCHITECTURE.md
# Architecture
<p style="color: #64748B; font-size: 16px; margin-top: -6px;">High-level overview of the project structure, tech stack, and how everything connects under the hood.</p>

---

<h3 style="color: #0F172A; margin-bottom: 8px;"><span style="color: #9333EA; font-weight: 800;">01</span> System Overview</h3>
<p style="color: #64748B; font-size: 13px; margin: 0 0 14px;">Here is how FinGuide is designed end-to-end. We split the system into 3 independent tiers so heavy AI jobs never slow down user requests.</p>

<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 22px; box-shadow: 0 2px 6px rgba(0,0,0,0.02); margin-bottom: 24px;">
<div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">

<div style="background: #FDF2F8; border: 1px solid #FCE7F3; border-radius: 12px; padding: 16px; text-align: center; flex: 1; min-width: 140px;">
<div style="font-size: 26px; margin-bottom: 4px;">👤</div>
<div style="font-size: 13px; font-weight: 700; color: #9D174D;">Client</div>
<div style="font-size: 11px; color: #BE185D;">Web & Mobile SPA</div>
</div>

<div style="color: #94A3B8; font-size: 20px; font-weight: bold;">&rarr;</div>

<div style="background: #EFF6FF; border: 1px solid #DBEAFE; border-radius: 12px; padding: 16px; text-align: center; flex: 1.2; min-width: 150px;">
<div style="font-size: 26px; margin-bottom: 4px;">💻</div>
<div style="font-size: 13px; font-weight: 700; color: #1E40AF;">Frontend</div>
<div style="font-size: 11px; color: #3B82F6;">React 19 + Vite</div>
<div style="font-size: 10px; color: #60A5FA;">CSS Design Tokens</div>
</div>

<div style="color: #94A3B8; font-size: 20px; font-weight: bold;">&rarr;</div>

<div style="background: #ECFDF5; border: 1px solid #D1FAE5; border-radius: 12px; padding: 16px; text-align: center; flex: 1.5; min-width: 170px;">
<div style="font-size: 26px; margin-bottom: 4px;">⚙️</div>
<div style="font-size: 13px; font-weight: 700; color: #065F46;">Gateway & AI</div>
<div style="font-size: 11px; color: #059669;">Node Express + FastAPI</div>
<div style="font-size: 10px; color: #10B981;">JWT Auth & Rate Limit</div>
</div>

<div style="color: #94A3B8; font-size: 20px; font-weight: bold;">&rarr;</div>

<div style="display: flex; flex-direction: column; gap: 8px; flex: 1.3; min-width: 160px;">
<div style="background: #FAF5FF; border: 1px solid #E9D5FF; border-radius: 8px; padding: 6px 12px; display: flex; align-items: center; gap: 8px;">
<span style="font-size: 16px;">🧠</span>
<div>
<div style="font-size: 11px; font-weight: 700; color: #6B21A8;">Gemini 3.5 Flash Lite</div>
<div style="font-size: 10px; color: #9333EA;">Reasoning & Advice</div>
</div>
</div>

<div style="background: #FFFBEB; border: 1px solid #FEF3C7; border-radius: 8px; padding: 6px 12px; display: flex; align-items: center; gap: 8px;">
<span style="font-size: 16px;">☁️</span>
<div>
<div style="font-size: 11px; font-weight: 700; color: #92400E;">Turso Cloud (libSQL)</div>
<div style="font-size: 10px; color: #B45309;">Encrypted Live Database</div>
</div>
</div>

<div style="background: #EFF6FF; border: 1px solid #DBEAFE; border-radius: 8px; padding: 6px 12px; display: flex; align-items: center; gap: 8px;">
<span style="font-size: 16px;">📧</span>
<div>
<div style="font-size: 11px; font-weight: 700; color: #1E40AF;">Brevo HTTPS API</div>
<div style="font-size: 10px; color: #2563EB;">Email OTPs (Port 443)</div>
</div>
</div>
</div>

</div>
</div>

<div style="display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;">

<div style="flex: 1; min-width: 300px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
<span style="color: #EC4899; font-weight: 800; font-size: 16px;">02</span>
<h3 style="color: #0F172A; margin: 0; font-size: 16px;">Tech Stack</h3>
</div>
<p style="font-size: 12px; color: #64748B; margin: 0 0 10px;">Tools and technologies powering the application.</p>
<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<table style="width: 100%; border-collapse: collapse; font-size: 12px;">
<tbody>
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 9px 0; font-weight: 700; color: #1E40AF; width: 110px;">💻 Frontend</td>
<td style="padding: 9px 0; color: #334155;">React 19, Vite, Vanilla CSS Design Tokens</td>
</tr>
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 9px 0; font-weight: 700; color: #065F46;">⚙️ Gateway</td>
<td style="padding: 9px 0; color: #334155;">Node.js Express, Helmet, Rate Limiters</td>
</tr>
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 9px 0; font-weight: 700; color: #D97706;">🗄️ Database</td>
<td style="padding: 9px 0; color: #334155;">Turso Cloud (libSQL) with local SQLite fallback</td>
</tr>
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 9px 0; font-weight: 700; color: #7C3AED;">🤖 AI Agent</td>
<td style="padding: 9px 0; color: #334155;">Python FastAPI, Google Gemini 3.5 Flash Lite</td>
</tr>
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 9px 0; font-weight: 700; color: #0284C7;">📄 Parser</td>
<td style="padding: 9px 0; color: #334155;">pdfplumber (Deterministic table extraction)</td>
</tr>
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 9px 0; font-weight: 700; color: #059669;">📈 Forecasts</td>
<td style="padding: 9px 0; color: #334155;">statsmodels (ARIMA / SARIMA / ETS)</td>
</tr>
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 9px 0; font-weight: 700; color: #2563EB;">📧 Email</td>
<td style="padding: 9px 0; color: #334155;">Brevo HTTPS API (Port 443 OTP delivery)</td>
</tr>
<tr>
<td style="padding: 9px 0; font-weight: 700; color: #DB2777;">🛡️ Security</td>
<td style="padding: 9px 0; color: #334155;">Two-Step OTP, 15m Lockout, Idle Auto-Logout</td>
</tr>
</tbody>
</table>
</div>
</div>

<div style="flex: 1; min-width: 300px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
<span style="color: #3B82F6; font-weight: 800; font-size: 16px;">03</span>
<h3 style="color: #0F172A; margin: 0; font-size: 16px;">Project Structure</h3>
</div>
<p style="font-size: 12px; color: #64748B; margin: 0 0 10px;">A clean view of how files are organized.</p>
<div style="background: #0F172A; border-radius: 14px; padding: 18px; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 11px; color: #E2E8F0; line-height: 1.7; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<div><span style="color: #38BDF8;">FinGuide/</span></div>
<div>├── <span style="color: #F472B6;">frontend/</span>        <span style="color: #64748B;"># React 19 SPA (Vercel)</span></div>
<div>│   ├── <span style="color: #FDE047;">src/components/</span> <span style="color: #64748B;"># Reusable UI widgets</span></div>
<div>│   ├── <span style="color: #FDE047;">src/pages/</span>      <span style="color: #64748B;"># Dashboard, Upload, Advisor...</span></div>
<div>│   └── <span style="color: #FDE047;">src/index.css</span>   <span style="color: #64748B;"># Design token variables</span></div>
<div>├── <span style="color: #4ADE80;">server/</span>          <span style="color: #64748B;"># Express Gateway (Render)</span></div>
<div>│   ├── <span style="color: #FDE047;">src/routes/</span>     <span style="color: #64748B;"># Auth, IE, Goals, Proxy</span></div>
<div>│   ├── <span style="color: #FDE047;">src/services/</span>   <span style="color: #64748B;"># Brevo email, Turso DB, Security</span></div>
<div>│   └── <span style="color: #FDE047;">src/database.js</span> <span style="color: #64748B;"># Turso cloud sync engine</span></div>
<div>├── <span style="color: #A78BFA;">agent/</span>           <span style="color: #64748B;"># FastAPI Intelligence (Render)</span></div>
<div>│   ├── <span style="color: #FDE047;">app/main.py</span>     <span style="color: #64748B;"># Fast API endpoints</span></div>
<div>│   ├── <span style="color: #FDE047;">app/pdf_parser.py</span><span style="color: #64748B;"># Multi-bank PDF table reader</span></div>
<div>│   └── <span style="color: #FDE047;">app/react_agent.py</span><span style="color: #64748B;"># ReAct reasoning loop</span></div>
<div>└── <span style="color: #38BDF8;">docs/</span>            <span style="color: #64748B;"># Complete project documentation</span></div>
</div>
</div>

</div>

<div style="display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;">

<div style="flex: 1; min-width: 300px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
<span style="color: #F59E0B; font-weight: 800; font-size: 16px;">04</span>
<h3 style="color: #0F172A; margin: 0; font-size: 16px;">Data Flow</h3>
</div>
<p style="font-size: 12px; color: #64748B; margin: 0 0 10px;">How data moves through the application step-by-step.</p>
<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 12px;">

<div style="display: flex; align-items: flex-start; gap: 10px;">
<span style="background: #EC4899; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; flex-shrink: 0;">1</span>
<div style="font-size: 13px; color: #334155; line-height: 1.4;">User interacts with the frontend (e.g. statement upload or asking the AI advisor).</div>
</div>

<div style="display: flex; align-items: flex-start; gap: 10px;">
<span style="background: #8B5CF6; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; flex-shrink: 0;">2</span>
<div style="font-size: 13px; color: #334155; line-height: 1.4;">Vite frontend dispatches requests to Node Express gateway with JWT token verification.</div>
</div>

<div style="display: flex; align-items: flex-start; gap: 10px;">
<span style="background: #3B82F6; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; flex-shrink: 0;">3</span>
<div style="font-size: 13px; color: #334155; line-height: 1.4;">Gateway handles auth, syncs data to Turso cloud DB, or forwards request to Python agent.</div>
</div>

<div style="display: flex; align-items: flex-start; gap: 10px;">
<span style="background: #06B6D4; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; flex-shrink: 0;">4</span>
<div style="font-size: 13px; color: #334155; line-height: 1.4;">Python service runs pdfplumber parsing, ARIMA forecasts, or Gemini 3.5 Flash Lite reasoning.</div>
</div>

<div style="display: flex; align-items: flex-start; gap: 10px;">
<span style="background: #10B981; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; flex-shrink: 0;">5</span>
<div style="font-size: 13px; color: #334155; line-height: 1.4;">Response returns to frontend; UI displays verified transactions or advisor action cards.</div>
</div>

</div>
</div>

<div style="flex: 1; min-width: 300px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
<span style="color: #10B981; font-weight: 800; font-size: 16px;">05</span>
<h3 style="color: #0F172A; margin: 0; font-size: 16px;">Scalability & Future Considerations</h3>
</div>
<p style="font-size: 12px; color: #64748B; margin: 0 0 10px;">Key areas we've built for growth as the product scales.</p>
<div style="background: #ECFDF5; border: 1px solid #D1FAE5; border-radius: 14px; padding: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 12px; font-size: 13px; color: #065F46; line-height: 1.45;">

<div style="display: flex; align-items: flex-start; gap: 8px;">
<span style="color: #059669; font-weight: bold;">✔</span>
<div><strong>Decoupled Microservices:</strong> Frontend, Node gateway, and Python AI agent can scale independently based on load.</div>
</div>

<div style="display: flex; align-items: flex-start; gap: 8px;">
<span style="color: #059669; font-weight: bold;">✔</span>
<div><strong>Cloud Database Persistence:</strong> Live real-time replication to Turso Cloud (libSQL) guarantees data survives restarts.</div>
</div>

<div style="display: flex; align-items: flex-start; gap: 8px;">
<span style="color: #059669; font-weight: bold;">✔</span>
<div><strong>Caching Ready:</strong> Cache pre-computed monthly spending totals to keep dashboard load times instant.</div>
</div>

<div style="display: flex; align-items: flex-start; gap: 8px;">
<span style="color: #059669; font-weight: bold;">✔</span>
<div><strong>Background Queues:</strong> Celery or BullMQ can be dropped in for heavy batch statement processing.</div>
</div>

<div style="display: flex; align-items: flex-start; gap: 8px;">
<span style="color: #059669; font-weight: bold;">✔</span>
<div><strong>Audit Accountability:</strong> Every login attempt, password change, and data export is logged for security.</div>
</div>

</div>
</div>

</div>
