<div align="right">
<span style="background: #ECFDF5; color: #047857; padding: 5px 16px; border-radius: 9999px; font-size: 12px; font-weight: 700; letter-spacing: 0.2px;">Verify early. Ship with confidence.</span>
</div>

# 🧪 TESTING.md
# Testing Guide
<p style="color: #64748B; font-size: 16px; margin-top: -6px;">Quality assurance strategy, automated tests, security checks, and end-to-end verification.</p>

---

<div style="margin-bottom: 24px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
<span style="color: #9333EA; font-weight: 800; font-size: 16px;">01</span>
<h3 style="color: #0F172A; margin: 0; font-size: 16px;">Testing Pyramid</h3>
</div>

<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
<div style="background: #FDF2F8; border: 1px solid #FCE7F3; border-radius: 12px; padding: 16px; text-align: center;">
<div style="font-size: 22px; margin-bottom: 4px;">🎭</div>
<div style="font-size: 13px; font-weight: 700; color: #9D174D; margin-bottom: 4px;">Visual E2E Tests</div>
<div style="font-size: 11px; color: #BE185D; line-height: 1.4;">Playwright browser tests verifying OTP modals, lockout banners, and responsiveness.</div>
</div>

<div style="background: #EFF6FF; border: 1px solid #DBEAFE; border-radius: 12px; padding: 16px; text-align: center;">
<div style="font-size: 22px; margin-bottom: 4px;">🔗</div>
<div style="font-size: 13px; font-weight: 700; color: #1E40AF; margin-bottom: 4px;">Integration Tests</div>
<div style="font-size: 11px; color: #3B82F6; line-height: 1.4;">Multi-step security flows, Turso DB mutations, and Python agent API communication.</div>
</div>

<div style="background: #ECFDF5; border: 1px solid #D1FAE5; border-radius: 12px; padding: 16px; text-align: center;">
<div style="font-size: 22px; margin-bottom: 4px;">⚙️</div>
<div style="font-size: 13px; font-weight: 700; color: #065F46; margin-bottom: 4px;">Unit & Parsing Tests</div>
<div style="font-size: 11px; color: #059669; line-height: 1.4;">Deterministic table bounding-box extraction and ARIMA forecast convergence.</div>
</div>
</div>
</div>

<div style="display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;">

<div style="flex: 1; min-width: 280px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
<span style="color: #3B82F6; font-weight: 800; font-size: 16px;">02</span>
<h3 style="color: #0F172A; margin: 0; font-size: 16px;">Backend Security & DB Test</h3>
</div>
<div style="background: #0F172A; border-radius: 14px; padding: 18px; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 11px; color: #E2E8F0; line-height: 1.7; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<span style="color: #94A3B8;"># Verify Turso cloud connection and local DB schema</span><br/>
<span style="color: #38BDF8;">cd server</span><br/>
<span style="color: #4ADE80;">node --input-type=module -e "</span><br/>
<span style="color: #CBD5E1;">&nbsp;&nbsp;import { initializeDatabase } from './src/database.js';</span><br/>
<span style="color: #CBD5E1;">&nbsp;&nbsp;await initializeDatabase();</span><br/>
<span style="color: #CBD5E1;">&nbsp;&nbsp;console.log('✅ DB Migration & Turso OK');</span><br/>
<span style="color: #4ADE80;">"</span>
</div>
</div>

<div style="flex: 1; min-width: 280px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
<span style="color: #10B981; font-weight: 800; font-size: 16px;">03</span>
<h3 style="color: #0F172A; margin: 0; font-size: 16px;">Frontend Build Test</h3>
</div>
<div style="background: #0F172A; border-radius: 14px; padding: 18px; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 11px; color: #E2E8F0; line-height: 1.7; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<span style="color: #94A3B8;"># Verify production frontend build & assets bundling</span><br/>
<span style="color: #38BDF8;">cd frontend</span><br/>
<span style="color: #4ADE80;">npm run build</span><br/><br/>
<span style="color: #94A3B8;"># Runs Vite build and checks CSS tokens</span>
</div>
</div>

</div>

<div style="margin-bottom: 24px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
<span style="color: #E11D48; font-weight: 800; font-size: 16px;">04</span>
<h3 style="color: #0F172A; margin: 0; font-size: 16px;">Security Verification Matrix</h3>
</div>

<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<table style="width: 100%; border-collapse: collapse; font-size: 12px;">
<thead>
<tr style="text-align: left; color: #64748B; border-bottom: 1px solid #E2E8F0;">
<th style="padding: 8px 0;">Security Test</th>
<th>Trigger Condition</th>
<th>Expected Outcome</th>
</tr>
</thead>
<tbody style="color: #334155;">
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 8px 0; font-weight: 700;">Failed Login Lockout</td>
<td>5 consecutive incorrect passwords</td>
<td><span style="color: #E11D48; font-weight: 600;">HTTP 429:</span> 15-minute cooldown timer displayed</td>
</tr>
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 8px 0; font-weight: 700;">Anti-Brute Force OTP</td>
<td>5 invalid verification codes entered</td>
<td><span style="color: #E11D48; font-weight: 600;">HTTP 400:</span> Code revoked & deleted from database</td>
</tr>
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 8px 0; font-weight: 700;">Session Inactivity</td>
<td>13 minutes of no user interaction</td>
<td><span style="color: #D97706; font-weight: 600;">Modal Warning:</span> 120s countdown before auto-logout</td>
</tr>
<tr>
<td style="padding: 8px 0; font-weight: 700;">Clickjacking Defense</td>
<td>Render site inside an <code>&lt;iframe&gt;</code></td>
<td><span style="color: #059669; font-weight: 600;">Blocked:</span> Helmet <code>X-Frame-Options: DENY</code></td>
</tr>
</tbody>
</table>
</div>
</div>

<div style="margin-bottom: 24px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
<span style="color: #10B981; font-weight: 800; font-size: 16px;">05</span>
<h3 style="color: #0F172A; margin: 0; font-size: 16px;">Pre-Deployment Checklist</h3>
</div>

<div style="background: #ECFDF5; border: 1px solid #D1FAE5; border-radius: 14px; padding: 20px; font-size: 13px; color: #065F46; line-height: 1.9; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<div>✔ <code>npm run build</code> succeeds with 0 errors in <code>frontend/</code></div>
<div>✔ Database schema migrations apply cleanly in <code>server/</code></div>
<div>✔ Turso cloud replication connects and syncs on startup</div>
<div>✔ Brevo HTTPS API key verified and test emails deliver</div>
<div>✔ Environment variables configured in Render & Vercel</div>
<div>✔ Documentation in <code>/docs</code> reflects latest changes</div>
</div>
</div>
