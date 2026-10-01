<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 24px; color: #0F172A;">

<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
  <div style="font-size: 13px; color: #64748B;">docs &gt; <strong>AGENTS.md</strong></div>
  <span style="background: #F3E8FF; color: #7E22CE; padding: 5px 16px; border-radius: 9999px; font-size: 12px; font-weight: 700; letter-spacing: 0.2px;">Build better, together.</span>
</div>

<h1 style="font-size: 34px; font-weight: 800; color: #0F172A; margin: 6px 0 8px; letter-spacing: -0.5px;">Agent Instructions</h1>
<p style="font-size: 15px; color: #64748B; margin: 0 0 28px;">Guidelines for AI coding agents working on this project.</p>

<!-- 01 Purpose -->
<div style="margin-bottom: 28px;">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
    <span style="color: #9333EA; font-weight: 800; font-size: 18px;">01</span>
    <h2 style="font-size: 18px; font-weight: 700; color: #0F172A; margin: 0;">Purpose</h2>
  </div>
  <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; font-size: 14px; line-height: 1.6; color: #334155;">
    This file provides instructions, context, and operational rules for AI agents (e.g. Claude Code, Antigravity, Cursor, Copilot) working on this project. Follow these guidelines to ensure consistent, high-quality code and a stellar developer experience.
  </div>
</div>

<!-- 02 Before You Start & 03 General Rules (Side by Side Grid) -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
  
  <!-- 02 Before You Start (Pink Pastel) -->
  <div style="background: #FDF2F8; border: 1px solid #FCE7F3; border-radius: 14px; padding: 20px;">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
      <span style="color: #DB2777; font-weight: 800; font-size: 16px;">02</span>
      <h3 style="font-size: 16px; font-weight: 700; color: #9D174D; margin: 0;">Before You Start</h3>
    </div>
    <div style="font-size: 18px; margin-bottom: 12px;">📖</div>
    <div style="font-size: 13px; color: #831843; line-height: 1.9;">
      <div>☐ Read PRD.md to understand the product and goals</div>
      <div>☐ Read DESIGN_SYSTEM.md for UI/UX guidelines</div>
      <div>☐ Read ARCHITECTURE.md for technical structure</div>
      <div>☐ Check existing components and patterns</div>
      <div>☐ Understand the folder structure</div>
      <div>☐ Look at open requirements or security rules</div>
    </div>
  </div>

  <!-- 03 General Rules (Mint Pastel) -->
  <div style="background: #ECFDF5; border: 1px solid #D1FAE5; border-radius: 14px; padding: 20px;">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
      <span style="color: #059669; font-weight: 800; font-size: 16px;">03</span>
      <h3 style="font-size: 16px; font-weight: 700; color: #065F46; margin: 0;">General Rules</h3>
    </div>
    <div style="font-size: 18px; margin-bottom: 12px;">⚙️</div>
    <div style="font-size: 13px; color: #064E3B; line-height: 1.9;">
      <div>☐ Use React 19 + Vite + Vanilla CSS tokens</div>
      <div>☐ Follow the design system in index.css</div>
      <div>☐ Reuse existing UI components</div>
      <div>☐ Keep code modular and scalable</div>
      <div>☐ Write clean, readable, self-documenting code</div>
      <div>☐ Add comments for complex financial calculations</div>
      <div>☐ Don't create unnecessary files or abstractions</div>
      <div>☐ Follow the established folder structure</div>
    </div>
  </div>

</div>

<!-- 04 Code Guidelines & 05 Security & Best Practices (Side by Side Grid) -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
  
  <!-- 04 Code Guidelines (Amber/Yellow Pastel) -->
  <div style="background: #FFFBEB; border: 1px solid #FEF3C7; border-radius: 14px; padding: 20px;">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
      <span style="color: #D97706; font-weight: 800; font-size: 16px;">04</span>
      <h3 style="font-size: 16px; font-weight: 700; color: #92400E; margin: 0;">Code Guidelines</h3>
    </div>
    <div style="font-size: 18px; margin-bottom: 12px;">&lt;/&gt;</div>
    <div style="font-size: 13px; color: #78350F; line-height: 1.9;">
      <div>☐ Use functional components and modern hooks</div>
      <div>☐ Use meaningful variable and function names</div>
      <div>☐ Prefer existing UI design tokens over raw hex</div>
      <div>☐ Keep components small, focused, and reusable</div>
      <div>☐ Follow the code conventions in CODE_STYLE.md</div>
      <div>☐ Handle loading, error, and empty states cleanly</div>
      <div>☐ Ensure fluid responsiveness across all breakpoints</div>
      <div>☐ Write accessible, semantic, and clean markup</div>
    </div>
  </div>

  <!-- 05 Security & Best Practices (Rose Pastel) -->
  <div style="background: #FFF1F2; border: 1px solid #FFE4E6; border-radius: 14px; padding: 20px;">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
      <span style="color: #E11D48; font-weight: 800; font-size: 16px;">05</span>
      <h3 style="font-size: 16px; font-weight: 700; color: #9F1239; margin: 0;">Security & Best Practices</h3>
    </div>
    <div style="font-size: 18px; margin-bottom: 12px;">🛡️</div>
    <div style="font-size: 13px; color: #881337; line-height: 1.9;">
      <div>☐ Never expose API keys, salts, or credentials</div>
      <div>☐ Keep all secrets in environment variables (.env)</div>
      <div>☐ Validate all inputs on both client and server</div>
      <div>☐ Enforce two-step email OTP for sensitive actions</div>
      <div>☐ Enforce 15-minute lockout on 5 failed logins</div>
      <div>☐ Auto-logout inactive sessions after 15 minutes</div>
      <div>☐ Follow security protocols in SECURITY.md</div>
      <div>☐ Preserve user data privacy at all times</div>
    </div>
  </div>

</div>

<!-- 06 Useful Commands & 07 Need Help? (Side by Side Grid) -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
  
  <!-- 06 Useful Commands (Indigo/Purple Pastel) -->
  <div style="background: #F5F3FF; border: 1px solid #EDE9FE; border-radius: 14px; padding: 20px;">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
      <span style="color: #7C3AED; font-weight: 800; font-size: 16px;">06</span>
      <h3 style="font-size: 16px; font-weight: 700; color: #5B21B6; margin: 0;">Useful Commands</h3>
    </div>
    <div style="font-size: 18px; margin-bottom: 12px;">💻</div>
    <div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #4C1D95; line-height: 1.8;">
      <div style="color: #6D28D9;"># Install dependencies</div>
      <div style="font-weight: 700;">npm install</div>
      <div style="color: #6D28D9; margin-top: 6px;"># Run Python AI agent (port 8000)</div>
      <div style="font-weight: 700;">uvicorn app.main:app --port 8000</div>
      <div style="color: #6D28D9; margin-top: 6px;"># Run Node server (port 5000)</div>
      <div style="font-weight: 700;">npm run dev</div>
      <div style="color: #6D28D9; margin-top: 6px;"># Run React frontend (port 5173)</div>
      <div style="font-weight: 700;">npm run dev</div>
      <div style="color: #6D28D9; margin-top: 6px;"># Production build check</div>
      <div style="font-weight: 700;">npm run build</div>
    </div>
  </div>

  <!-- 07 Need Help? (Teal/Mint Pastel) -->
  <div style="background: #F0FDFA; border: 1px solid #CCFBF1; border-radius: 14px; padding: 20px;">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
      <span style="color: #0D9488; font-weight: 800; font-size: 16px;">07</span>
      <h3 style="font-size: 16px; font-weight: 700; color: #115E59; margin: 0;">Need Help?</h3>
    </div>
    <div style="font-size: 18px; margin-bottom: 12px;">💡</div>
    <div style="font-size: 13px; color: #134E4A; line-height: 1.8;">
      <p style="margin: 0 0 10px; font-weight: 600;">If you're unsure about something:</p>
      <ul style="margin: 0; padding-left: 18px;">
        <li>Check the documentation in <code>/docs</code></li>
        <li>Inspect existing patterns in <code>/frontend/src</code></li>
        <li>Review route controllers in <code>/server/src</code></li>
        <li>Ask for clarification before making big architectural changes</li>
      </ul>
      <p style="margin: 14px 0 0; font-weight: 700; color: #0F766E;">
        Let's build something amazing! 🚀
      </p>
    </div>
  </div>

</div>

</div>
