<div align="right">
<span style="background: #E0F2FE; color: #0369A1; padding: 5px 16px; border-radius: 9999px; font-size: 12px; font-weight: 700; letter-spacing: 0.2px;">Production. Cloud Infrastructure. Data Security.</span>
</div>

# 🚀 DEPLOYMENT.md
# Deployment & Cloud Architecture
<p style="color: #64748B; font-size: 16px; margin-top: -6px;">Production hosting topology, database isolation, GitHub security guarantees, and secret management.</p>

---

<div style="margin-bottom: 24px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
<span style="color: #0284C7; font-weight: 800; font-size: 16px;">01</span>
<h3 style="color: #0F172A; margin: 0; font-size: 16px;">Cloud Data Isolation & GitHub Security</h3>
</div>

<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<div style="font-size: 14px; font-weight: 700; color: #0F172A; margin-bottom: 8px;">
❓ If someone pulls this project from my GitHub, will they have access to my cloud data?
</div>
<div style="font-size: 13px; color: #0369A1; background: #E0F2FE; border-left: 4px solid #0284C7; padding: 12px 16px; border-radius: 6px; margin-bottom: 16px; font-weight: 600;">
👉 <strong>NO, NEVER.</strong> Someone cloning your GitHub repository has <strong>0% access</strong> to your production cloud database, user records, or secrets.
</div>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
<div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px;">
<div style="font-size: 15px; margin-bottom: 4px;">📂 <strong>Code &ne; Database</strong></div>
<div style="font-size: 12px; color: #475569; line-height: 1.5;">GitHub only stores your <em>source code</em> (React components, Express routes, Python logic). It never contains running servers, databases, or user records.</div>
</div>
<div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px;">
<div style="font-size: 15px; margin-bottom: 4px;">🔑 <strong>Zero Keys in Git</strong></div>
<div style="font-size: 12px; color: #475569; line-height: 1.5;">Cloud credentials (JWT secrets, API keys, database connection strings) live exclusively in private cloud provider dashboards, <em>never</em> in GitHub.</div>
</div>
<div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px;">
<div style="font-size: 15px; margin-bottom: 4px;">🛡️ <strong>Encrypted Firewalls</strong></div>
<div style="font-size: 12px; color: #475569; line-height: 1.5;">Cloud databases enforce TLS 1.3 encryption, token authentication, and private network bindings against unauthorized outside access.</div>
</div>
</div>
</div>
</div>

<div style="margin-bottom: 24px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
<span style="color: #9333EA; font-weight: 800; font-size: 16px;">02</span>
<h3 style="color: #0F172A; margin: 0; font-size: 16px;">Database Architecture: Local vs. Production Cloud</h3>
</div>

<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<table style="width: 100%; border-collapse: collapse; font-size: 12px;">
<thead>
<tr style="text-align: left; color: #64748B; border-bottom: 2px solid #E2E8F0;">
<th style="padding: 10px 8px;">Feature</th>
<th style="padding: 10px 8px;">Local Dev (SQLite)</th>
<th style="padding: 10px 8px;">Production (Turso Cloud libSQL)</th>
<th style="padding: 10px 8px;">Alternative (Supabase Postgres)</th>
</tr>
</thead>
<tbody style="color: #334155;">
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 10px 8px; font-weight: 700;">Storage Location</td>
<td style="padding: 10px 8px;"><code>server/data/finguide.db</code></td>
<td style="padding: 10px 8px; color: #0284C7; font-weight: 700;">Managed libSQL Edge Cloud</td>
<td style="padding: 10px 8px;">Managed Postgres Cluster</td>
</tr>
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 10px 8px; font-weight: 700;">Concurrent Users</td>
<td style="padding: 10px 8px;">1 user (Local testing)</td>
<td style="padding: 10px 8px; color: #047857; font-weight: 700;">Thousands (Edge replication)</td>
<td style="padding: 10px 8px;">Thousands (Connection pool)</td>
</tr>
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 10px 8px; font-weight: 700;">Stateless Restarts</td>
<td style="padding: 10px 8px; color: #DC2626;">❌ Resets if no volume</td>
<td style="padding: 10px 8px; color: #047857; font-weight: 700;">✅ Fully persistent in cloud</td>
<td style="padding: 10px 8px; color: #047857; font-weight: 700;">✅ Fully persistent in cloud</td>
</tr>
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 10px 8px; font-weight: 700;">Automated Backups</td>
<td style="padding: 10px 8px;">Manual file copy</td>
<td style="padding: 10px 8px; color: #047857; font-weight: 700;">✅ Automatic point-in-time snapshots</td>
<td style="padding: 10px 8px;">✅ Daily cloud backups</td>
</tr>
<tr>
<td style="padding: 10px 8px; font-weight: 700;">Recommended For</td>
<td style="padding: 10px 8px;">Local testing & demo</td>
<td style="padding: 10px 8px; font-weight: 700; color: #00ABE4;">Active Production Default</td>
<td style="padding: 10px 8px;">Enterprise Postgres teams</td>
</tr>
</tbody>
</table>
</div>
</div>

<div style="margin-bottom: 24px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
<span style="color: #059669; font-weight: 800; font-size: 16px;">03</span>
<h3 style="color: #0F172A; margin: 0; font-size: 16px;">Production Cloud Topology</h3>
</div>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
<div style="background: #EFF6FF; border: 1px solid #DBEAFE; border-radius: 12px; padding: 18px;">
<div style="font-size: 24px; margin-bottom: 6px;">🌐</div>
<div style="font-size: 13px; font-weight: 700; color: #1E40AF; margin-bottom: 2px;">Frontend Hosting</div>
<div style="font-size: 11px; font-weight: 600; color: #2563EB; margin-bottom: 8px;">Vercel Edge Network</div>
<ul style="font-size: 11px; color: #475569; margin: 0; padding-left: 16px; line-height: 1.6;">
<li>Automated Git CI/CD deployments</li>
<li>Global CDN edge caching</li>
<li>Free SSL & custom domains</li>
</ul>
</div>

<div style="background: #F0FDF4; border: 1px solid #DCFCE7; border-radius: 12px; padding: 18px;">
<div style="font-size: 24px; margin-bottom: 6px;">⚙️</div>
<div style="font-size: 13px; font-weight: 700; color: #166534; margin-bottom: 2px;">Node Gateway</div>
<div style="font-size: 11px; font-weight: 600; color: #16A34A; margin-bottom: 8px;">Render Web Service</div>
<ul style="font-size: 11px; color: #475569; margin: 0; padding-left: 16px; line-height: 1.6;">
<li>Always-on Express server</li>
<li>Brevo HTTPS API OTP delivery</li>
<li>Zero-trust session & rate limits</li>
</ul>
</div>

<div style="background: #FAF5FF; border: 1px solid #E9D5FF; border-radius: 12px; padding: 18px;">
<div style="font-size: 24px; margin-bottom: 6px;">🤖</div>
<div style="font-size: 13px; font-weight: 700; color: #6B21A8; margin-bottom: 2px;">AI Agent Service</div>
<div style="font-size: 11px; font-weight: 600; color: #9333EA; margin-bottom: 8px;">Render Python Service</div>
<ul style="font-size: 11px; color: #475569; margin: 0; padding-left: 16px; line-height: 1.6;">
<li>Python 3.11+ FastAPI runtime</li>
<li>Gemini 3.5 Flash Lite engine</li>
<li>statsmodels ARIMA forecasts</li>
</ul>
</div>

<div style="background: #FFFBEB; border: 1px solid #FEF3C7; border-radius: 12px; padding: 18px;">
<div style="font-size: 24px; margin-bottom: 6px;">🗄️</div>
<div style="font-size: 13px; font-weight: 700; color: #92400E; margin-bottom: 2px;">Production Database</div>
<div style="font-size: 11px; font-weight: 600; color: #B45309; margin-bottom: 8px;">Turso Cloud (libSQL)</div>
<ul style="font-size: 11px; color: #475569; margin: 0; padding-left: 16px; line-height: 1.6;">
<li>Serverless libSQL cloud</li>
<li>Encrypted real-time sync</li>
<li>Multi-region durability</li>
</ul>
</div>
</div>
</div>

<div style="margin-bottom: 24px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
<span style="color: #DC2626; font-weight: 800; font-size: 16px;">04</span>
<h3 style="color: #0F172A; margin: 0; font-size: 16px;">Secrets & Environment Variables Management</h3>
</div>

<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<p style="font-size: 12px; color: #64748B; margin: 0 0 12px;">These variables are saved directly in your cloud dashboard (Render & Vercel) and injected at container startup.</p>
<table style="width: 100%; border-collapse: collapse; font-size: 12px;">
<thead>
<tr style="text-align: left; color: #64748B; border-bottom: 1px solid #E2E8F0;">
<th style="padding: 8px 0;">Target Service</th>
<th>Variable Name</th>
<th>Recommended Setting</th>
<th>Purpose</th>
</tr>
</thead>
<tbody style="color: #334155;">
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 8px 0; font-weight: 700; color: #1E40AF;">Frontend (Vercel)</td>
<td><code>VITE_API_URL</code></td>
<td><code>https://your-node-api.onrender.com</code></td>
<td>Directs React requests to live Node gateway</td>
</tr>
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 8px 0; font-weight: 700; color: #065F46;">Gateway (Render)</td>
<td><code>NODE_ENV</code></td>
<td><code>production</code></td>
<td>Enables secure cookies and production mode</td>
</tr>
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 8px 0; font-weight: 700; color: #065F46;">Gateway (Render)</td>
<td><code>SECRET_KEY</code></td>
<td><code>64-character random string</code></td>
<td>Cryptographic salt for JWT token signing</td>
</tr>
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 8px 0; font-weight: 700; color: #065F46;">Gateway (Render)</td>
<td><code>CORS_ORIGIN</code></td>
<td><code>https://fin-guide-gamma.vercel.app</code></td>
<td>Whitelists frontend origin to prevent CORS blocks</td>
</tr>
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 8px 0; font-weight: 700; color: #065F46;">Gateway (Render)</td>
<td><code>TURSO_DATABASE_URL</code></td>
<td><code>libsql://finguide-db-...turso.io</code></td>
<td>Live connection URL to Turso cloud database</td>
</tr>
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 8px 0; font-weight: 700; color: #065F46;">Gateway (Render)</td>
<td><code>TURSO_AUTH_TOKEN</code></td>
<td><code>eyJhbGciOi...</code></td>
<td>Authentication token for Turso cloud database</td>
</tr>
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 8px 0; font-weight: 700; color: #065F46;">Gateway (Render)</td>
<td><code>BREVO_API_KEY</code></td>
<td><code>xkeysib-...</code></td>
<td>Brevo HTTPS API key for sending email OTPs</td>
</tr>
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 8px 0; font-weight: 700; color: #065F46;">Gateway (Render)</td>
<td><code>AGENT_SERVICE_URL</code></td>
<td><code>https://your-agent.onrender.com</code></td>
<td>Bridge to Python FastAPI intelligence service</td>
</tr>
<tr>
<td style="padding: 8px 0; font-weight: 700; color: #6B21A8;">Agent (Render)</td>
<td><code>GEMINI_API_KEY</code></td>
<td><code>AIzaSy...</code></td>
<td>Authenticates Google Gemini 3.5 Flash Lite engine</td>
</tr>
</tbody>
</table>
</div>
</div>

<div style="margin-bottom: 24px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
<span style="color: #EA580C; font-weight: 800; font-size: 16px;">05</span>
<h3 style="color: #0F172A; margin: 0; font-size: 16px;">Step-by-Step Launch Workflow</h3>
</div>

<div style="display: flex; flex-direction: column; gap: 10px;">
<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px; display: flex; gap: 12px; align-items: center; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<div style="background: #EFF6FF; color: #2563EB; font-weight: 800; border-radius: 8px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0;">1</div>
<div>
<div style="font-size: 13px; font-weight: 700; color: #0F172A;">Push Clean Codebase to GitHub</div>
<div style="font-size: 12px; color: #64748B;">Verify <code>.env</code> and <code>server/data/*.db</code> are ignored. Run <code>git push origin main</code>.</div>
</div>
</div>

<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px; display: flex; gap: 12px; align-items: center; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<div style="background: #ECFDF5; color: #059669; font-weight: 800; border-radius: 8px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0;">2</div>
<div>
<div style="font-size: 13px; font-weight: 700; color: #0F172A;">Set Up Turso Cloud Database</div>
<div style="font-size: 12px; color: #64748B;">Create a database at turso.tech, copy the database URL and generate an auth token.</div>
</div>
</div>

<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px; display: flex; gap: 12px; align-items: center; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<div style="background: #FAF5FF; color: #7C3AED; font-weight: 800; border-radius: 8px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0;">3</div>
<div>
<div style="font-size: 13px; font-weight: 700; color: #0F172A;">Deploy Python AI Service on Render</div>
<div style="font-size: 12px; color: #64748B;">Root: <code>agent</code>. Build: <code>pip install -r requirements.txt</code>. Start: <code>uvicorn app.main:app --host 0.0.0.0 --port $PORT</code>.</div>
</div>
</div>

<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px; display: flex; gap: 12px; align-items: center; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<div style="background: #EFF6FF; color: #1D4ED8; font-weight: 800; border-radius: 8px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0;">4</div>
<div>
<div style="font-size: 13px; font-weight: 700; color: #0F172A;">Deploy Node Express Gateway on Render</div>
<div style="font-size: 12px; color: #64748B;">Root: <code>server</code>. Build: <code>npm install</code>. Start: <code>node src/index.js</code>. Add Turso and Brevo env vars.</div>
</div>
</div>

<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px; display: flex; gap: 12px; align-items: center; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<div style="background: #FFFBEB; color: #D97706; font-weight: 800; border-radius: 8px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0;">5</div>
<div>
<div style="font-size: 13px; font-weight: 700; color: #0F172A;">Deploy React Frontend on Vercel</div>
<div style="font-size: 12px; color: #64748B;">Root: <code>frontend</code>. Set <code>VITE_API_URL</code> to your Render backend URL. Deploy!</div>
</div>
</div>
</div>
</div>
