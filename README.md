<div align="right">
<span style="background: #E0F2FE; color: #0369A1; padding: 5px 16px; border-radius: 9999px; font-size: 12px; font-weight: 700; letter-spacing: 0.2px;">AI Financial Intelligence & Wealth OS</span>
</div>

# FinGuide
<p style="color: #64748B; font-size: 16px; margin-top: -6px;">Autonomous personal financial advisory, bank statement verification, and predictive wealth forecasting powered by <strong>Gemini 3.5 Flash Lite</strong>.</p>

---

<div style="margin-bottom: 24px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
<span style="color: #9333EA; font-weight: 800; font-size: 16px;">📚</span>
<h3 style="color: #0F172A; margin: 0; font-size: 16px;">Official Documentation Directory</h3>
</div>

<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<table style="width: 100%; border-collapse: collapse; font-size: 13px;">
<thead>
<tr style="text-align: left; color: #64748B; border-bottom: 1px solid #E2E8F0;">
<th style="padding: 8px 0;">Document</th>
<th>Badge</th>
<th>Summary & Purpose</th>
</tr>
</thead>
<tbody style="color: #334155;">
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 10px 0;"><a href="docs/PRD.md" style="color: #00ABE4; font-weight: 700; text-decoration: none;">📄 PRD.md</a></td>
<td><span style="background: #F3E8FF; color: #7E22CE; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700;">Product Goals</span></td>
<td>Product requirements, target personas, problem statement, and success metrics.</td>
</tr>
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 10px 0;"><a href="docs/AGENTS.md" style="color: #00ABE4; font-weight: 700; text-decoration: none;">🤖 AGENTS.md</a></td>
<td><span style="background: #FDF2F8; color: #BE185D; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700;">Agent Rules</span></td>
<td>Guidelines for AI coding assistants: rules, checklist, and standard practices.</td>
</tr>
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 10px 0;"><a href="docs/DESIGN_SYSTEM.md" style="color: #00ABE4; font-weight: 700; text-decoration: none;">🎨 DESIGN_SYSTEM.md</a></td>
<td><span style="background: #ECFDF5; color: #047857; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700;">Design Tokens</span></td>
<td>Drone Blue color palette, Plus Jakarta Sans typography, 8px grid, and components.</td>
</tr>
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 10px 0;"><a href="docs/ARCHITECTURE.md" style="color: #00ABE4; font-weight: 700; text-decoration: none;">🏛️ ARCHITECTURE.md</a></td>
<td><span style="background: #EFF6FF; color: #1D4ED8; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700;">System Topology</span></td>
<td>Three-tier architecture, folder tree, end-to-end data flows, and scalability.</td>
</tr>
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 10px 0;"><a href="docs/SECURITY.md" style="color: #00ABE4; font-weight: 700; text-decoration: none;">🛡️ SECURITY.md</a></td>
<td><span style="background: #FEE2E2; color: #B91C1C; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700;">Zero Trust</span></td>
<td>Two-step OTP, 15m lockout cooldown, inactivity logout, and threat mitigations.</td>
</tr>
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 10px 0;"><a href="docs/CODE_STYLE.md" style="color: #00ABE4; font-weight: 700; text-decoration: none;">💻 CODE_STYLE.md</a></td>
<td><span style="background: #E0E7FF; color: #4338CA; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700;">Engineering</span></td>
<td>JavaScript/React rules, Python/FastAPI conventions, and database standards.</td>
</tr>
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 10px 0;"><a href="docs/TESTING.md" style="color: #00ABE4; font-weight: 700; text-decoration: none;">🧪 TESTING.md</a></td>
<td><span style="background: #FEF3C7; color: #B45309; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700;">Quality Assurance</span></td>
<td>Test pyramid, backend integration scripts, Playwright visual tests, and pre-deploy checklist.</td>
</tr>
<tr>
<td style="padding: 10px 0;"><a href="docs/DEPLOYMENT.md" style="color: #00ABE4; font-weight: 700; text-decoration: none;">🚀 DEPLOYMENT.md</a></td>
<td><span style="background: #E0F2FE; color: #0369A1; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700;">Cloud & Production</span></td>
<td>Cloud hosting, Turso cloud database reality, GitHub data isolation, and secrets.</td>
</tr>
</tbody>
</table>
</div>
</div>

<div style="margin-bottom: 24px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
<span style="color: #3B82F6; font-weight: 800; font-size: 16px;">🏛️</span>
<h3 style="color: #0F172A; margin: 0; font-size: 16px;">Three-Tier Architecture</h3>
</div>

<div style="background: #0F172A; border-radius: 14px; padding: 20px; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 12px; color: #E2E8F0; line-height: 1.8; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<div><span style="color: #38BDF8;">React 19 + Vite Frontend (Port 5173 / Vercel Edge)</span></div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│</div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼ <span style="color: #94A3B8;">HTTPS REST API / Reverse Proxy</span></div>
<div><span style="color: #4ADE80;">Node.js Express Gateway (Port 5000 / Render)</span></div>
<div>&nbsp;&nbsp;├── Turso Cloud libSQL Database (Live Cloud Sync + Local Fallback)</div>
<div>&nbsp;&nbsp;├── Helmet Security Headers & Tiered Rate Limiting</div>
<div>&nbsp;&nbsp;└── Brevo HTTPS API Email Delivery (Port 443 OTPs)</div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│</div>
<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼ <span style="color: #94A3B8;">Internal HTTP JSON</span></div>
<div><span style="color: #A78BFA;">Python FastAPI Intelligence Service (Port 8000 / Render)</span></div>
<div>&nbsp;&nbsp;├── pdfplumber Table Extraction Engine</div>
<div>&nbsp;&nbsp;├── statsmodels (ARIMA / SARIMA / ETS Forecasting)</div>
<div>&nbsp;&nbsp;└── Google Gemini 3.5 Flash Lite Reasoning Engine</div>
</div>
</div>

<div style="margin-bottom: 24px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
<span style="color: #10B981; font-weight: 800; font-size: 16px;">⚡</span>
<h3 style="color: #0F172A; margin: 0; font-size: 16px;">Quick Start Guide</h3>
</div>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
<div style="background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 12px; padding: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<div style="font-size: 11px; font-weight: 800; color: #7C3AED; margin-bottom: 8px;">STEP 1: AGENT</div>
<div style="font-family: monospace; font-size: 11px; color: #334155; line-height: 1.7;">
cd agent<br/>
pip install -r requirements.txt<br/>
uvicorn app.main:app --port 8000
</div>
</div>

<div style="background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 12px; padding: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<div style="font-size: 11px; font-weight: 800; color: #059669; margin-bottom: 8px;">STEP 2: SERVER</div>
<div style="font-family: monospace; font-size: 11px; color: #334155; line-height: 1.7;">
cd server<br/>
npm install<br/>
npm run dev
</div>
</div>

<div style="background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 12px; padding: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<div style="font-size: 11px; font-weight: 800; color: #0284C7; margin-bottom: 8px;">STEP 3: FRONTEND</div>
<div style="font-family: monospace; font-size: 11px; color: #334155; line-height: 1.7;">
cd frontend<br/>
npm install<br/>
npm run dev
</div>
</div>
</div>
</div>
