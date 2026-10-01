<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 24px; color: #0F172A;">

<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
  <div style="font-size: 13px; color: #64748B;">docs &gt; <strong>DEPLOYMENT.md</strong></div>
  <span style="background: #E0F2FE; color: #0369A1; padding: 5px 16px; border-radius: 9999px; font-size: 12px; font-weight: 700; letter-spacing: 0.2px;">Production. Cloud Infrastructure. Data Security.</span>
</div>

<h1 style="font-size: 34px; font-weight: 800; color: #0F172A; margin: 6px 0 8px; letter-spacing: -0.5px;">Deployment & Cloud Architecture</h1>
<p style="font-size: 15px; color: #64748B; margin: 0 0 28px;">Production hosting topologies, database isolation, GitHub security guarantees, and secret management.</p>

<!-- 01 Core Doubt Resolved: Cloud Data & GitHub Isolation -->
<div style="margin-bottom: 32px;">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
    <span style="color: #0284C7; font-weight: 800; font-size: 18px;">01</span>
    <h2 style="font-size: 18px; font-weight: 700; color: #0F172A; margin: 0;">Cloud Data Isolation & GitHub Security</h2>
  </div>
  
  <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 22px; margin-bottom: 16px;">
    <div style="font-size: 15px; font-weight: 700; color: #0F172A; margin-bottom: 8px;">
      ❓ If someone pulls this project from my GitHub, will they have access to my cloud data?
    </div>
    <div style="font-size: 14px; color: #0369A1; background: #E0F2FE; border-left: 4px solid #0284C7; padding: 12px 16px; border-radius: 6px; margin-bottom: 16px; font-weight: 600;">
      👉 <strong>NO, NEVER.</strong> Someone cloning your GitHub repository has <strong>0% access</strong> to your production cloud database or user records.
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px;">
      <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px;">
        <div style="font-size: 16px; margin-bottom: 4px;">📂 <strong>Code &ne; Database</strong></div>
        <div style="font-size: 12px; color: #475569; line-height: 1.5;">GitHub only stores your <em>source code</em> (React components, Express routes, Python logic). It does not hold your running database, servers, or user sessions.</div>
      </div>
      <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px;">
        <div style="font-size: 16px; margin-bottom: 4px;">🔑 <strong>Zero Keys in Git</strong></div>
        <div style="font-size: 12px; color: #475569; line-height: 1.5;">Cloud credentials (JWT secrets, API keys, database connection strings) live exclusively in private cloud provider dashboards, <em>never</em> in GitHub.</div>
      </div>
      <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px;">
        <div style="font-size: 16px; margin-bottom: 4px;">🛡️ <strong>Encrypted Firewalls</strong></div>
        <div style="font-size: 12px; color: #475569; line-height: 1.5;">Cloud databases enforce SSL TLS 1.3 encryption, randomized 32-character passwords, and IP whitelist protections against unauthorized access.</div>
      </div>
    </div>
  </div>
</div>

<!-- 02 SQLite vs Managed Cloud Databases -->
<div style="margin-bottom: 32px;">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
    <span style="color: #9333EA; font-weight: 800; font-size: 18px;">02</span>
    <h2 style="font-size: 18px; font-weight: 700; color: #0F172A; margin: 0;">Database Architecture: SQLite vs. Cloud PostgreSQL</h2>
  </div>

  <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
      <thead>
        <tr style="text-align: left; color: #64748B; border-bottom: 2px solid #E2E8F0;">
          <th style="padding: 10px 8px;">Feature</th>
          <th style="padding: 10px 8px;">Local Dev (SQLite)</th>
          <th style="padding: 10px 8px;">Cloud VPS (SQLite + Volume)</th>
          <th style="padding: 10px 8px;">Industry Cloud (Supabase / Postgres)</th>
        </tr>
      </thead>
      <tbody style="color: #334155;">
        <tr style="border-bottom: 1px solid #F1F5F9;">
          <td style="padding: 10px 8px; font-weight: 700;">Storage Location</td>
          <td style="padding: 10px 8px;"><code style="background: #F1F5F9; padding: 2px 6px; border-radius: 4px;">server/data/finguide.db</code></td>
          <td style="padding: 10px 8px;">Mounted Cloud SSD Disk (Render/Fly.io)</td>
          <td style="padding: 10px 8px; color: #0284C7; font-weight: 600;">Dedicated Managed Cloud Cluster</td>
        </tr>
        <tr style="border-bottom: 1px solid #F1F5F9;">
          <td style="padding: 10px 8px; font-weight: 700;">Concurrent Users</td>
          <td style="padding: 10px 8px;">1 user (Local testing)</td>
          <td style="padding: 10px 8px;">Dozens (Single-writer WAL)</td>
          <td style="padding: 10px 8px; color: #047857; font-weight: 600;">Thousands (Auto-scaling connection pool)</td>
        </tr>
        <tr style="border-bottom: 1px solid #F1F5F9;">
          <td style="padding: 10px 8px; font-weight: 700;">Stateless Serverless Support</td>
          <td style="padding: 10px 8px; color: #DC2626;">❌ Resets on restart</td>
          <td style="padding: 10px 8px; color: #D97706;">⚠️ Requires mounted volume</td>
          <td style="padding: 10px 8px; color: #047857; font-weight: 600;">✅ Fully stateless & permanent</td>
        </tr>
        <tr style="border-bottom: 1px solid #F1F5F9;">
          <td style="padding: 10px 8px; font-weight: 700;">Automated Backups</td>
          <td style="padding: 10px 8px;">Manual file copy</td>
          <td style="padding: 10px 8px;">Snapshot scripts</td>
          <td style="padding: 10px 8px; color: #047857; font-weight: 600;">✅ Point-in-time recovery & daily snapshots</td>
        </tr>
        <tr>
          <td style="padding: 10px 8px; font-weight: 700;">Recommended For</td>
          <td style="padding: 10px 8px;">Local testing & demo</td>
          <td style="padding: 10px 8px;">Low-cost single-instance MVP</td>
          <td style="padding: 10px 8px; font-weight: 700; color: #00ABE4;">Production launch with real customers</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Deep Dive: How Both Options Work in Practice -->
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;">
    
    <!-- Path A: Render Persistent Volume -->
    <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="background: #E0F2FE; color: #0284C7; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 6px;">PATH A</span>
        <div style="font-size: 14px; font-weight: 700; color: #0F172A;">Render Persistent Volume (SQLite)</div>
      </div>
      <p style="font-size: 12px; color: #64748B; margin: 0 0 12px; line-height: 1.4;">Zero code modifications required. Your existing SQLite architecture runs directly in the cloud.</p>
      
      <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; font-size: 11px; color: #334155; line-height: 1.6;">
        <div><strong>1. Create Disk in Render:</strong> Go to Web Service &gt; Disks &gt; Add Disk</div>
        <div><strong>2. Disk Name:</strong> <code>finguide_data</code></div>
        <div><strong>3. Mount Path:</strong> <code>/var/data</code> (Size: 1 GB)</div>
        <div><strong>4. Environment Variable:</strong> Set <code>DATABASE_PATH=/var/data/finguide.db</code></div>
      </div>
      <div style="margin-top: 10px; font-size: 11px; color: #059669; font-weight: 600;">
        ✔ Best for: Quick single-instance MVP launch with minimal complexity.
      </div>
    </div>

    <!-- Path B: Supabase Managed PostgreSQL -->
    <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="background: #ECFDF5; color: #047857; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 6px;">PATH B</span>
        <div style="font-size: 14px; font-weight: 700; color: #0F172A;">Supabase Cloud PostgreSQL</div>
      </div>
      <p style="font-size: 12px; color: #64748B; margin: 0 0 12px; line-height: 1.4;">Free managed cloud PostgreSQL with automatic daily backups and multi-user concurrency.</p>
      
      <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; font-size: 11px; color: #334155; line-height: 1.6;">
        <div><strong>1. Create Supabase Project:</strong> Instant free cloud database at supabase.com</div>
        <div><strong>2. Run Schema:</strong> Paste SQL migration script in Supabase SQL Editor</div>
        <div><strong>3. Connection URI:</strong> Copy <code>postgresql://postgres:[password]@db...</code></div>
        <div><strong>4. Environment Variable:</strong> Set <code>DATABASE_URL</code> in Render dashboard</div>
      </div>
      <div style="margin-top: 10px; font-size: 11px; color: #0284C7; font-weight: 600;">
        ✔ Best for: Multi-instance scaling, web studio table viewer, enterprise SLA.
      </div>
    </div>

  </div>
</div>

<!-- 03 Recommended Production Cloud Topology -->
<div style="margin-bottom: 32px;">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
    <span style="color: #059669; font-weight: 800; font-size: 18px;">03</span>
    <h2 style="font-size: 18px; font-weight: 700; color: #0F172A; margin: 0;">Recommended Production Topology</h2>
  </div>

  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 16px;">
    
    <!-- Frontend Card -->
    <div style="background: #EFF6FF; border: 1px solid #DBEAFE; border-radius: 12px; padding: 18px;">
      <div style="font-size: 20px; margin-bottom: 6px;">🌐</div>
      <div style="font-size: 14px; font-weight: 700; color: #1E40AF; margin-bottom: 4px;">Frontend Hosting</div>
      <div style="font-size: 12px; font-weight: 600; color: #2563EB; margin-bottom: 8px;">Vercel / Netlify / Cloudflare</div>
      <ul style="font-size: 11px; color: #475569; margin: 0; padding-left: 16px; line-height: 1.6;">
        <li>Automated Git CI/CD deployments</li>
        <li>Global edge CDN distribution</li>
        <li>Instant SSL & custom domain</li>
      </ul>
    </div>

    <!-- Node Gateway Card -->
    <div style="background: #F0FDF4; border: 1px solid #DCFCE7; border-radius: 12px; padding: 18px;">
      <div style="font-size: 20px; margin-bottom: 6px;">⚙️</div>
      <div style="font-size: 14px; font-weight: 700; color: #166534; margin-bottom: 4px;">Node Gateway</div>
      <div style="font-size: 12px; font-weight: 600; color: #16A34A; margin-bottom: 8px;">Render / Railway / Fly.io</div>
      <ul style="font-size: 11px; color: #475569; margin: 0; padding-left: 16px; line-height: 1.6;">
        <li>Always-on Express server</li>
        <li>Hybrid Nodemailer OTP delivery</li>
        <li>Zero-trust session & rate limiting</li>
      </ul>
    </div>

    <!-- Python Agent Card -->
    <div style="background: #FAF5FF; border: 1px solid #E9D5FF; border-radius: 12px; padding: 18px;">
      <div style="font-size: 20px; margin-bottom: 6px;">🤖</div>
      <div style="font-size: 14px; font-weight: 700; color: #6B21A8; margin-bottom: 4px;">AI Agent Service</div>
      <div style="font-size: 12px; font-weight: 600; color: #9333EA; margin-bottom: 8px;">Render / Google Cloud Run</div>
      <ul style="font-size: 11px; color: #475569; margin: 0; padding-left: 16px; line-height: 1.6;">
        <li>Python 3.11+ FastAPI runtime</li>
        <li>Gemini 3.5 Flash Lite LLM engine</li>
        <li>Statsmodels ARIMA / SARIMA forecasts</li>
      </ul>
    </div>

    <!-- Cloud Database Card -->
    <div style="background: #FFFBEB; border: 1px solid #FEF3C7; border-radius: 12px; padding: 18px;">
      <div style="font-size: 20px; margin-bottom: 6px;">🗄️</div>
      <div style="font-size: 14px; font-weight: 700; color: #92400E; margin-bottom: 4px;">Production Database</div>
      <div style="font-size: 12px; font-weight: 600; color: #B45309; margin-bottom: 8px;">Supabase / Neon Postgres</div>
      <ul style="font-size: 11px; color: #475569; margin: 0; padding-left: 16px; line-height: 1.6;">
        <li>Serverless PostgreSQL</li>
        <li>Real-time automated encryption</li>
        <li>Multi-AZ high availability</li>
      </ul>
    </div>

  </div>
</div>

<!-- 04 Secrets Management & Environment Configuration -->
<div style="margin-bottom: 32px;">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
    <span style="color: #DC2626; font-weight: 800; font-size: 18px;">04</span>
    <h2 style="font-size: 18px; font-weight: 700; color: #0F172A; margin: 0;">Secrets & Environment Variables Management</h2>
  </div>

  <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px;">
    <div style="font-size: 13px; color: #334155; margin-bottom: 14px; line-height: 1.5;">
      Variables are configured directly in your cloud platform's <strong>Settings &gt; Environment Variables</strong> dashboard. They are injected at container startup and never written to code repositories.
    </div>

    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
      <thead>
        <tr style="text-align: left; color: #64748B; border-bottom: 1px solid #E2E8F0;">
          <th style="padding: 8px 0;">Target Service</th>
          <th>Variable Name</th>
          <th>Production Setting</th>
          <th>Purpose</th>
        </tr>
      </thead>
      <tbody style="color: #334155;">
        <tr style="border-bottom: 1px solid #F1F5F9;">
          <td style="padding: 8px 0; font-weight: 700; color: #1E40AF;">Frontend (Vercel)</td>
          <td><code>VITE_API_URL</code></td>
          <td><code>https://api.finguide.yourdomain.com</code></td>
          <td>Directs React API requests to Node gateway</td>
        </tr>
        <tr style="border-bottom: 1px solid #F1F5F9;">
          <td style="padding: 8px 0; font-weight: 700; color: #065F46;">Node Gateway (Render)</td>
          <td><code>NODE_ENV</code></td>
          <td><code>production</code></td>
          <td>Enables secure cookies, disables verbose error traces</td>
        </tr>
        <tr style="border-bottom: 1px solid #F1F5F9;">
          <td style="padding: 8px 0; font-weight: 700; color: #065F46;">Node Gateway (Render)</td>
          <td><code>SECRET_KEY</code></td>
          <td><code>64-character random hex string</code></td>
          <td>Signs and verifies user JWT auth tokens</td>
        </tr>
        <tr style="border-bottom: 1px solid #F1F5F9;">
          <td style="padding: 8px 0; font-weight: 700; color: #065F46;">Node Gateway (Render)</td>
          <td><code>AGENT_SERVICE_URL</code></td>
          <td><code>https://agent.finguide.yourdomain.com</code></td>
          <td>Internal bridge to Python FastAPI service</td>
        </tr>
        <tr style="border-bottom: 1px solid #F1F5F9;">
          <td style="padding: 8px 0; font-weight: 700; color: #6B21A8;">Python Agent (Render)</td>
          <td><code>GEMINI_API_KEY</code></td>
          <td><code>AIzaSy... (Your Google AI Studio Key)</code></td>
          <td>Authenticates Gemini 3.5 Flash Lite engine</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 700; color: #6B21A8;">Python Agent (Render)</td>
          <td><code>GEMINI_MODEL</code></td>
          <td><code>gemini-3.5-flash-lite</code></td>
          <td>Specifies primary reasoning model</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<!-- 05 Step-by-Step Production Launch Guide -->
<div style="margin-bottom: 32px;">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
    <span style="color: #EA580C; font-weight: 800; font-size: 18px;">05</span>
    <h2 style="font-size: 18px; font-weight: 700; color: #0F172A; margin: 0;">Step-by-Step Launch Workflow</h2>
  </div>

  <div style="display: flex; flex-direction: column; gap: 12px;">
    
    <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px; display: flex; gap: 14px; align-items: flex-start;">
      <div style="background: #EFF6FF; color: #2563EB; font-weight: 800; border-radius: 8px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0;">1</div>
      <div>
        <div style="font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 2px;">Ensure .gitignore is Active Before First Push</div>
        <div style="font-size: 12px; color: #64748B;">Verify that <code>.env</code>, <code>data/</code>, and <code>server/data/*.db</code> are ignored. Run <code>git status</code> to confirm no secret files or databases are staged.</div>
      </div>
    </div>

    <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px; display: flex; gap: 14px; align-items: flex-start;">
      <div style="background: #ECFDF5; color: #059669; font-weight: 800; border-radius: 8px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0;">2</div>
      <div>
        <div style="font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 2px;">Push Clean Codebase to GitHub</div>
        <div style="font-size: 12px; color: #64748B;">Create a private or public GitHub repository. Push your code. Only clean application source files will be uploaded.</div>
      </div>
    </div>

    <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px; display: flex; gap: 14px; align-items: flex-start;">
      <div style="background: #FAF5FF; color: #7C3AED; font-weight: 800; border-radius: 8px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0;">3</div>
      <div>
        <div style="font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 2px;">Deploy Python AI Service (Agent)</div>
        <div style="font-size: 12px; color: #64748B;">Connect repo to Render / Cloud Run. Set Root Directory to <code>agent</code>. Set Build Command: <code>pip install -r requirements.txt</code>. Set Start Command: <code>uvicorn app.main:app --host 0.0.0.0 --port $PORT</code>.</div>
      </div>
    </div>

    <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px; display: flex; gap: 14px; align-items: flex-start;">
      <div style="background: #EFF6FF; color: #1D4ED8; font-weight: 800; border-radius: 8px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0;">4</div>
      <div>
        <div style="font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 2px;">Deploy Node.js Express Gateway</div>
        <div style="font-size: 12px; color: #64748B;">Connect repo to Render. Set Root Directory to <code>server</code>. Add Persistent Disk (e.g. 1GB mounted at <code>/data</code> for SQLite) OR set Supabase PostgreSQL connection string. Set Start Command: <code>node src/index.js</code>.</div>
      </div>
    </div>

    <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px; display: flex; gap: 14px; align-items: flex-start;">
      <div style="background: #FFFBEB; color: #D97706; font-weight: 800; border-radius: 8px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0;">5</div>
      <div>
        <div style="font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 2px;">Deploy React Frontend on Vercel</div>
        <div style="font-size: 12px; color: #64748B;">Import repository into Vercel. Set Root Directory to <code>frontend</code>. Set <code>VITE_API_URL</code> environment variable to your live Node server URL. Click Deploy.</div>
      </div>
    </div>

  </div>
</div>

<!-- 06 Pre-Flight Production Checklist -->
<div>
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
    <span style="color: #10B981; font-weight: 800; font-size: 18px;">06</span>
    <h2 style="font-size: 18px; font-weight: 700; color: #0F172A; margin: 0;">Pre-Flight Security & Privacy Checklist</h2>
  </div>

  <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px;">
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px; color: #334155;">
      <div>☑ <code>.gitignore</code> active in root directory</div>
      <div>☑ No <code>.env</code> committed to version control</div>
      <div>☑ No <code>*.db</code> SQLite files committed to Git</div>
      <div>☑ Strong random <code>SECRET_KEY</code> set in cloud</div>
      <div>☑ Production CORS restricted to frontend domain</div>
      <div>☑ Gemini 3.5 Flash Lite API key restricted in Google Cloud</div>
      <div>☑ HTTPS / SSL enforced on all domains</div>
      <div>☑ Rate limiting active on authentication endpoints</div>
    </div>
  </div>
</div>

<!-- 07 Supabase PostgreSQL Schema Script -->
<div style="margin-top: 32px;">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
    <span style="color: #6366F1; font-weight: 800; font-size: 18px;">07</span>
    <h2 style="font-size: 18px; font-weight: 700; color: #0F172A; margin: 0;">Supabase / PostgreSQL Quick-Migration DDL</h2>
  </div>

  <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px;">
    <p style="font-size: 12px; color: #64748B; margin: 0 0 10px;">If deploying to Supabase, paste this exact script into the <strong>Supabase SQL Editor</strong> to create all tables with matching constraints:</p>
    
    <pre style="background: #0F172A; color: #E2E8F0; padding: 14px; border-radius: 8px; font-size: 11px; overflow-x: auto; line-height: 1.5; font-family: 'JetBrains Mono', monospace;">
-- Users & Auth Table
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  currency TEXT DEFAULT '₹',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Income / Expense Snapshots
CREATE TABLE IF NOT EXISTS ie_snapshots (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  month INT NOT NULL,
  year INT NOT NULL,
  income_data JSONB NOT NULL DEFAULT '[]',
  expense_data JSONB NOT NULL DEFAULT '[]',
  total_income NUMERIC(14,2) DEFAULT 0,
  total_expenses NUMERIC(14,2) DEFAULT 0,
  net_savings NUMERIC(14,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);

-- Transactions Ledger
CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')),
  category TEXT DEFAULT 'Uncategorized',
  source TEXT DEFAULT 'manual',
  upload_batch_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial Goals
CREATE TABLE IF NOT EXISTS goals (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount NUMERIC(14,2) NOT NULL,
  current_amount NUMERIC(14,2) DEFAULT 0,
  deadline DATE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('active', 'achieved', 'paused')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security: Email OTP Verification Codes
CREATE TABLE IF NOT EXISTS otps (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  purpose TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security: Lockout & Brute Force Tracker
CREATE TABLE IF NOT EXISTS login_attempts (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address TEXT,
  attempt_count INT DEFAULT 1,
  locked_until TIMESTAMPTZ,
  last_attempt TIMESTAMPTZ DEFAULT NOW()
);

-- Security: Audit Logging Trail
CREATE TABLE IF NOT EXISTS security_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
    </pre>
  </div>
</div>

</div>

