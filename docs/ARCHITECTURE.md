<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 24px; color: #0F172A;">

<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
  <div style="font-size: 13px; color: #64748B;">docs &gt; <strong>ARCHITECTURE.md</strong></div>
  <span style="background: #F3E8FF; color: #7E22CE; padding: 5px 16px; border-radius: 9999px; font-size: 12px; font-weight: 700; letter-spacing: 0.2px;">Big picture. Clear structure. Scalable.</span>
</div>

<h1 style="font-size: 34px; font-weight: 800; color: #0F172A; margin: 6px 0 8px; letter-spacing: -0.5px;">Architecture</h1>
<p style="font-size: 15px; color: #64748B; margin: 0 0 28px;">High-level overview of the project structure, tech stack, and how everything connects.</p>

<!-- 01 System Overview -->
<div style="margin-bottom: 32px;">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
    <span style="color: #9333EA; font-weight: 800; font-size: 18px;">01</span>
    <h2 style="font-size: 18px; font-weight: 700; color: #0F172A; margin: 0;">System Overview</h2>
  </div>
  <p style="font-size: 13px; color: #64748B; margin: 0 0 16px;">A visual overview of how the application works and the main services involved.</p>

  <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 24px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
    <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
      
      <!-- Client -->
      <div style="background: #FDF2F8; border: 1px solid #FCE7F3; border-radius: 12px; padding: 16px; text-align: center; flex: 1; min-width: 130px;">
        <div style="font-size: 24px; margin-bottom: 4px;">👤</div>
        <div style="font-size: 13px; font-weight: 700; color: #9D174D;">Client</div>
        <div style="font-size: 11px; color: #BE185D;">Web / Mobile SPA</div>
      </div>

      <div style="color: #94A3B8; font-size: 18px; font-weight: bold;">&rarr;</div>

      <!-- Frontend -->
      <div style="background: #EFF6FF; border: 1px solid #DBEAFE; border-radius: 12px; padding: 16px; text-align: center; flex: 1.2; min-width: 140px;">
        <div style="font-size: 24px; margin-bottom: 4px;">💻</div>
        <div style="font-size: 13px; font-weight: 700; color: #1E40AF;">Frontend</div>
        <div style="font-size: 11px; color: #3B82F6;">React 19 + Vite</div>
        <div style="font-size: 10px; color: #60A5FA;">CSS Design Tokens</div>
      </div>

      <div style="color: #94A3B8; font-size: 18px; font-weight: bold;">&rarr;</div>

      <!-- Backend & APIs -->
      <div style="background: #ECFDF5; border: 1px solid #D1FAE5; border-radius: 12px; padding: 16px; text-align: center; flex: 1.5; min-width: 160px;">
        <div style="font-size: 24px; margin-bottom: 4px;">⚙️</div>
        <div style="font-size: 13px; font-weight: 700; color: #065F46;">Backend & APIs</div>
        <div style="font-size: 11px; color: #059669;">Node Gateway + Python Agent</div>
        <div style="font-size: 10px; color: #10B981;">SQLite Database & Auth</div>
      </div>

      <div style="color: #94A3B8; font-size: 18px; font-weight: bold;">&rarr;</div>

      <!-- External Services Stack -->
      <div style="display: flex; flex-direction: column; gap: 8px; flex: 1.2; min-width: 140px;">
        <div style="background: #FAF5FF; border: 1px solid #E9D5FF; border-radius: 8px; padding: 8px 12px; display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 16px;">🤖</span>
          <div>
            <div style="font-size: 11px; font-weight: 700; color: #6B21A8;">Gemini 3.5 Flash Lite</div>
            <div style="font-size: 10px; color: #9333EA;">Reasoning & Advice</div>
          </div>
        </div>
        
        <div style="background: #F0FDF4; border: 1px solid #DCFCE7; border-radius: 8px; padding: 8px 12px; display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 16px;">📈</span>
          <div>
            <div style="font-size: 11px; font-weight: 700; color: #166534;">ARIMA / SARIMA</div>
            <div style="font-size: 10px; color: #16A34A;">Time-Series Forecast</div>
          </div>
        </div>

        <div style="background: #EFF6FF; border: 1px solid #DBEAFE; border-radius: 8px; padding: 8px 12px; display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 16px;">📧</span>
          <div>
            <div style="font-size: 11px; font-weight: 700; color: #1E40AF;">Hybrid Nodemailer</div>
            <div style="font-size: 10px; color: #2563EB;">Email OTP & Alerts</div>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>

<!-- 02 Tech Stack & 03 Project Structure (Grid) -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 32px;">
  
  <!-- 02 Tech Stack -->
  <div>
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
      <span style="color: #EC4899; font-weight: 800; font-size: 16px;">02</span>
      <h2 style="font-size: 16px; font-weight: 700; color: #0F172A; margin: 0;">Tech Stack</h2>
    </div>
    <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <tbody>
          <tr style="border-bottom: 1px solid #F1F5F9;">
            <td style="padding: 8px 0; font-weight: 700; color: #1E40AF; width: 100px;">💻 Frontend</td>
            <td style="padding: 8px 0; color: #334155;">React 19, Vite, Vanilla CSS Tokens</td>
          </tr>
          <tr style="border-bottom: 1px solid #F1F5F9;">
            <td style="padding: 8px 0; font-weight: 700; color: #065F46;">⚙️ Gateway</td>
            <td style="padding: 8px 0; color: #334155;">Node.js, Express, Helmet, Rate Limit</td>
          </tr>
          <tr style="border-bottom: 1px solid #F1F5F9;">
            <td style="padding: 8px 0; font-weight: 700; color: #D97706;">🗄️ Database</td>
            <td style="padding: 8px 0; color: #334155;">SQLite (sql.js in-memory + disk file)</td>
          </tr>
          <tr style="border-bottom: 1px solid #F1F5F9;">
            <td style="padding: 8px 0; font-weight: 700; color: #7C3AED;">🤖 AI Agent</td>
            <td style="padding: 8px 0; color: #334155;">Python FastAPI, Gemini 3.5 Flash Lite</td>
          </tr>
          <tr style="border-bottom: 1px solid #F1F5F9;">
            <td style="padding: 8px 0; font-weight: 700; color: #0284C7;">📄 Parser</td>
            <td style="padding: 8px 0; color: #334155;">pdfplumber (Deterministic table extraction)</td>
          </tr>
          <tr style="border-bottom: 1px solid #F1F5F9;">
            <td style="padding: 8px 0; font-weight: 700; color: #059669;">📈 Modeling</td>
            <td style="padding: 8px 0; color: #334155;">statsmodels (ARIMA / SARIMA / ETS)</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 700; color: #DB2777;">🛡️ Security</td>
            <td style="padding: 8px 0; color: #334155;">2-Step OTP, 15m Lockout, Idle Logout</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- 03 Project Structure -->
  <div>
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
      <span style="color: #3B82F6; font-weight: 800; font-size: 16px;">03</span>
      <h2 style="font-size: 16px; font-weight: 700; color: #0F172A; margin: 0;">Project Structure</h2>
    </div>
    <div style="background: #0F172A; border-radius: 12px; padding: 16px; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #E2E8F0; line-height: 1.7;">
      <div><span style="color: #38BDF8;">FinGuide/</span></div>
      <div>├── <span style="color: #F472B6;">frontend/</span>      <span style="color: #64748B;"># React 19 SPA (Port 5173)</span></div>
      <div>│   ├── <span style="color: #FDE047;">src/components/</span> <span style="color: #64748B;"># Reusable UI components</span></div>
      <div>│   ├── <span style="color: #FDE047;">src/pages/</span>      <span style="color: #64748B;"># Dashboard, Upload, Advisor...</span></div>
      <div>│   └── <span style="color: #FDE047;">src/index.css</span>   <span style="color: #64748B;"># Complete design token system</span></div>
      <div>├── <span style="color: #4ADE80;">server/</span>        <span style="color: #64748B;"># Node Express Gateway (Port 5000)</span></div>
      <div>│   ├── <span style="color: #FDE047;">src/routes/</span>     <span style="color: #64748B;"># Auth, IE, Goals, Proxy</span></div>
      <div>│   ├── <span style="color: #FDE047;">src/services/</span>   <span style="color: #64748B;"># Security, Email, Agent-Client</span></div>
      <div>│   └── <span style="color: #FDE047;">src/database.js</span> <span style="color: #64748B;"># sql.js SQLite persistence</span></div>
      <div>├── <span style="color: #A78BFA;">agent/</span>         <span style="color: #64748B;"># Python FastAPI (Port 8000)</span></div>
      <div>│   ├── <span style="color: #FDE047;">app/main.py</span>     <span style="color: #64748B;"># API routes & app bootstrap</span></div>
      <div>│   ├── <span style="color: #FDE047;">app/react_agent.py</span> <span style="color: #64748B;"># ReAct reasoning loop</span></div>
      <div>│   └── <span style="color: #FDE047;">app/timeseries.py</span> <span style="color: #64748B;"># ARIMA/SARIMA forecasting</span></div>
      <div>└── <span style="color: #38BDF8;">docs/</span>          <span style="color: #64748B;"># Complete project documentation</span></div>
    </div>
  </div>

</div>

<!-- 04 Data Flow & 05 Scalability (Grid) -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
  
  <!-- 04 Data Flow -->
  <div>
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
      <span style="color: #F59E0B; font-weight: 800; font-size: 16px;">04</span>
      <h2 style="font-size: 16px; font-weight: 700; color: #0F172A; margin: 0;">Data Flow</h2>
    </div>
    <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px;">
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; align-items: flex-start; gap: 10px;">
          <span style="background: #EC4899; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; flex-shrink: 0;">1</span>
          <div style="font-size: 13px; color: #334155; line-height: 1.4;">User interacts with the frontend (e.g. statement upload or advisor query).</div>
        </div>
        
        <div style="display: flex; align-items: flex-start; gap: 10px;">
          <span style="background: #8B5CF6; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; flex-shrink: 0;">2</span>
          <div style="font-size: 13px; color: #334155; line-height: 1.4;">Vite proxies request to Node Express gateway with JWT & rate limit validation.</div>
        </div>

        <div style="display: flex; align-items: flex-start; gap: 10px;">
          <span style="background: #3B82F6; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; flex-shrink: 0;">3</span>
          <div style="font-size: 13px; color: #334155; line-height: 1.4;">Gateway persists ledger updates in SQLite or dispatches request to Python AI service.</div>
        </div>

        <div style="display: flex; align-items: flex-start; gap: 10px;">
          <span style="background: #06B6D4; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; flex-shrink: 0;">4</span>
          <div style="font-size: 13px; color: #334155; line-height: 1.4;">Python service runs pdfplumber, ARIMA models, or Gemini 3.5 Flash Lite reasoning.</div>
        </div>

        <div style="display: flex; align-items: flex-start; gap: 10px;">
          <span style="background: #10B981; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; flex-shrink: 0;">5</span>
          <div style="font-size: 13px; color: #334155; line-height: 1.4;">Response returns to frontend; UI updates in real-time with approval controls.</div>
        </div>
      </div>
    </div>
  </div>

  <!-- 05 Scalability & Future Considerations -->
  <div>
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
      <span style="color: #10B981; font-weight: 800; font-size: 16px;">05</span>
      <h2 style="font-size: 16px; font-weight: 700; color: #0F172A; margin: 0;">Scalability & Future Roadmap</h2>
    </div>
    <div style="background: #ECFDF5; border: 1px solid #D1FAE5; border-radius: 12px; padding: 18px;">
      <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px; color: #065F46; line-height: 1.45;">
        <div style="display: flex; align-items: flex-start; gap: 8px;">
          <span style="color: #059669; font-weight: bold;">✔</span>
          <div><strong>Modular Architecture:</strong> Independent frontend, gateway, and AI service for flexible scaling.</div>
        </div>
        <div style="display: flex; align-items: flex-start; gap: 8px;">
          <span style="color: #059669; font-weight: bold;">✔</span>
          <div><strong>PostgreSQL Readiness:</strong> Seamless migration from local sql.js to managed cloud PostgreSQL.</div>
        </div>
        <div style="display: flex; align-items: flex-start; gap: 8px;">
          <span style="color: #059669; font-weight: bold;">✔</span>
          <div><strong>Redis Caching:</strong> Cache pre-computed spending aggregates and forecast horizons.</div>
        </div>
        <div style="display: flex; align-items: flex-start; gap: 8px;">
          <span style="color: #059669; font-weight: bold;">✔</span>
          <div><strong>Background Task Queues:</strong> Celery/BullMQ for asynchronous batch statement parsing.</div>
        </div>
        <div style="display: flex; align-items: flex-start; gap: 8px;">
          <span style="color: #059669; font-weight: bold;">✔</span>
          <div><strong>Zero Trust Security:</strong> Encrypted per-user storage and real-time audit logging.</div>
        </div>
      </div>
    </div>
  </div>

</div>

</div>
