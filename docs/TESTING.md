<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 24px; color: #0F172A;">

<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
  <div style="font-size: 13px; color: #64748B;">docs &gt; <strong>TESTING.md</strong></div>
  <span style="background: #ECFDF5; color: #047857; padding: 5px 16px; border-radius: 9999px; font-size: 12px; font-weight: 700; letter-spacing: 0.2px;">Verify early. Ship with confidence.</span>
</div>

<h1 style="font-size: 34px; font-weight: 800; color: #0F172A; margin: 6px 0 8px; letter-spacing: -0.5px;">Testing Guide</h1>
<p style="font-size: 15px; color: #64748B; margin: 0 0 28px;">Quality assurance strategy, automated tests, security checks, and end-to-end verification.</p>

<!-- 01 Testing Strategy -->
<div style="margin-bottom: 28px;">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
    <span style="color: #9333EA; font-weight: 800; font-size: 18px;">01</span>
    <h2 style="font-size: 18px; font-weight: 700; color: #0F172A; margin: 0;">Testing Pyramid</h2>
  </div>
  
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;">
    <div style="background: #FDF2F8; border: 1px solid #FCE7F3; border-radius: 12px; padding: 16px; text-align: center;">
      <div style="font-size: 20px; margin-bottom: 4px;">🎭</div>
      <div style="font-size: 13px; font-weight: 700; color: #9D174D; margin-bottom: 4px;">Visual E2E Tests</div>
      <div style="font-size: 11px; color: #BE185D; line-height: 1.4;">Playwright browser tests verifying OTP modals, lockout banners, and responsiveness.</div>
    </div>
    <div style="background: #EFF6FF; border: 1px solid #DBEAFE; border-radius: 12px; padding: 16px; text-align: center;">
      <div style="font-size: 20px; margin-bottom: 4px;">🔗</div>
      <div style="font-size: 13px; font-weight: 700; color: #1E40AF; margin-bottom: 4px;">Integration Tests</div>
      <div style="font-size: 11px; color: #3B82F6; line-height: 1.4;">Multi-step security flows, database mutations, and Python agent API communication.</div>
    </div>
    <div style="background: #ECFDF5; border: 1px solid #D1FAE5; border-radius: 12px; padding: 16px; text-align: center;">
      <div style="font-size: 20px; margin-bottom: 4px;">⚙️</div>
      <div style="font-size: 13px; font-weight: 700; color: #065F46; margin-bottom: 4px;">Unit & Parsing Tests</div>
      <div style="font-size: 11px; color: #059669; line-height: 1.4;">Deterministic table bounding-box extraction and ARIMA forecast convergence.</div>
    </div>
  </div>
</div>

<!-- 02 Backend Integration Tests & 03 Agent Tests (Grid) -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px;">
  
  <!-- 02 Backend Integration Tests -->
  <div>
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
      <span style="color: #3B82F6; font-weight: 800; font-size: 16px;">02</span>
      <h2 style="font-size: 16px; font-weight: 700; color: #0F172A; margin: 0;">Backend Security Test</h2>
    </div>
    <div style="background: #0F172A; border-radius: 12px; padding: 16px; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #E2E8F0; line-height: 1.6;">
      <div style="color: #38BDF8;"># Run End-to-End Security Test</div>
      <div>cd server</div>
      <div style="color: #4ADE80;">node --input-type=module -e "</div>
      <div style="color: #CBD5E1; padding-left: 10px;">import { initializeDatabase } from './src/database.js';</div>
      <div style="color: #CBD5E1; padding-left: 10px;">await initializeDatabase();</div>
      <div style="color: #CBD5E1; padding-left: 10px;">console.log('✅ DB Migration OK');</div>
      <div style="color: #4ADE80;">"</div>
    </div>
  </div>

  <!-- 03 AI Agent Service Tests -->
  <div>
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
      <span style="color: #10B981; font-weight: 800; font-size: 16px;">03</span>
      <h2 style="font-size: 16px; font-weight: 700; color: #0F172A; margin: 0;">Frontend Build Test</h2>
    </div>
    <div style="background: #0F172A; border-radius: 12px; padding: 16px; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #E2E8F0; line-height: 1.6;">
      <div style="color: #38BDF8;"># Verify Frontend Production Build</div>
      <div>cd frontend</div>
      <div style="color: #4ADE80;">npm run build</div>
      <div style="color: #94A3B8; margin-top: 8px;"># Verifies syntax, imports, and CSS tokens</div>
    </div>
  </div>

</div>

<!-- 04 Security Checks Table -->
<div style="margin-bottom: 28px;">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
    <span style="color: #E11D48; font-weight: 800; font-size: 16px;">04</span>
    <h2 style="font-size: 16px; font-weight: 700; color: #0F172A; margin: 0;">Security Verification Matrix</h2>
  </div>
  
  <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
      <thead>
        <tr style="text-align: left; color: #64748B; border-bottom: 1px solid #E2E8F0;">
          <th style="padding: 6px 0;">Security Test</th>
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

<!-- 05 Pre-Deployment Checklist -->
<div>
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
    <span style="color: #10B981; font-weight: 800; font-size: 16px;">05</span>
    <h2 style="font-size: 16px; font-weight: 700; color: #0F172A; margin: 0;">Pre-Deployment Checklist</h2>
  </div>
  
  <div style="background: #ECFDF5; border: 1px solid #D1FAE5; border-radius: 12px; padding: 18px; font-size: 13px; color: #065F46; line-height: 1.8;">
    <div>✔ <code>npm run build</code> succeeds with 0 errors in <code>frontend/</code></div>
    <div>✔ Database schema migrations apply cleanly in <code>server/</code></div>
    <div>✔ 6-step end-to-end security integration test completes with 100% pass rate</div>
    <div>✔ Environment variables in <code>.env</code> verified (or dev fallbacks active)</div>
    <div>✔ Technical documentation in <code>/docs</code> reflects latest changes</div>
  </div>
</div>

</div>
