<div align="right">
<span style="background: #F3E8FF; color: #7E22CE; padding: 5px 16px; border-radius: 9999px; font-size: 12px; font-weight: 700; letter-spacing: 0.2px;">Build better, together.</span>
</div>

# 🤖 AGENTS.md
# Agent Instructions
<p style="color: #64748B; font-size: 16px; margin-top: -6px;">Guidelines for AI coding agents working on this project.</p>

---

<h3 style="color: #0F172A; margin-bottom: 8px;"><span style="color: #9333EA; font-weight: 800;">01</span> Purpose</h3>

<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.02); margin-bottom: 24px; color: #334155; line-height: 1.6; font-size: 14px;">
Hey! If you're an AI agent (Antigravity, Claude Code, Cursor, Copilot) helping me build FinGuide, welcome to the codebase. This document lays out our technical constraints, architecture rules, and conventions. Treat this as our team agreement: follow these rules so we keep the code clean, fast, and secure.
</div>

<div style="display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap;">

<div style="flex: 1; min-width: 280px; background: #FDF2F8; border: 1px solid #FCE7F3; border-radius: 14px; padding: 20px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
<span style="color: #DB2777; font-weight: 800; font-size: 16px;">02</span>
<h3 style="color: #9D174D; margin: 0; font-size: 16px;">Before You Start</h3>
</div>
<div style="font-size: 20px; margin-bottom: 10px;">📖</div>
<div style="color: #831843; font-size: 13px; line-height: 1.9;">
<div>☐ Read PRD.md to understand what we're building and why</div>
<div>☐ Read DESIGN_SYSTEM.md so you use our actual color tokens</div>
<div>☐ Read ARCHITECTURE.md to see how the 3 tiers talk to each other</div>
<div>☐ Check existing components in /frontend/src before writing new ones</div>
<div>☐ Check existing backend services before creating duplicate logic</div>
<div>☐ Check open requirements or security guidelines in SECURITY.md</div>
</div>
</div>

<div style="flex: 1; min-width: 280px; background: #ECFDF5; border: 1px solid #D1FAE5; border-radius: 14px; padding: 20px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
<span style="color: #059669; font-weight: 800; font-size: 16px;">03</span>
<h3 style="color: #065F46; margin: 0; font-size: 16px;">General Rules</h3>
</div>
<div style="font-size: 20px; margin-bottom: 10px;">⚙️</div>
<div style="color: #064E3B; font-size: 13px; line-height: 1.9;">
<div>☐ Use React 19 + Vite + Vanilla CSS tokens (no Tailwind)</div>
<div>☐ Follow the design system tokens in index.css strictly</div>
<div>☐ Reuse existing UI components and modals</div>
<div>☐ Keep code modular, clean, and self-documenting</div>
<div>☐ Add quick developer comments for complex financial calculations</div>
<div>☐ Don't create unnecessary files or bloated abstractions</div>
<div>☐ Always parameterize SQL queries to prevent injections</div>
<div>☐ Never hallucinate file deletions — verify before you touch</div>
</div>
</div>

</div>

<div style="display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap;">

<div style="flex: 1; min-width: 280px; background: #FFFBEB; border: 1px solid #FEF3C7; border-radius: 14px; padding: 20px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
<span style="color: #D97706; font-weight: 800; font-size: 16px;">04</span>
<h3 style="color: #92400E; margin: 0; font-size: 16px;">Code Guidelines</h3>
</div>
<div style="font-size: 20px; margin-bottom: 10px;">&lt;/&gt;</div>
<div style="color: #78350F; font-size: 13px; line-height: 1.9;">
<div>☐ Write clean functional components with modern React hooks</div>
<div>☐ Give variables and functions descriptive, self-explanatory names</div>
<div>☐ Use CSS variables (var(--accent-primary)) instead of hardcoded hex</div>
<div>☐ Keep components small, focused, and reusable</div>
<div>☐ Handle loading, empty, and error states gracefully in UI</div>
<div>☐ Ensure layouts look great on both desktop and mobile screens</div>
<div>☐ Write semantic, accessible markup with clean aria labels</div>
<div>☐ Always clean up event listeners & timers in useEffect return</div>
</div>
</div>

<div style="flex: 1; min-width: 280px; background: #FFF1F2; border: 1px solid #FFE4E6; border-radius: 14px; padding: 20px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
<span style="color: #E11D48; font-weight: 800; font-size: 16px;">05</span>
<h3 style="color: #9F1239; margin: 0; font-size: 16px;">Security & Best Practices</h3>
</div>
<div style="font-size: 20px; margin-bottom: 10px;">🛡️</div>
<div style="color: #881337; font-size: 13px; line-height: 1.9;">
<div>☐ Never commit API keys, salts, or passwords to Git</div>
<div>☐ Keep all secrets in .env files and cloud environment panels</div>
<div>☐ Validate all incoming payloads on both client and backend</div>
<div>☐ Require 2-step email OTP for sign-up and password resets</div>
<div>☐ Enforce 15-minute lockout on 5 consecutive failed logins</div>
<div>☐ Auto-logout idle sessions after 15 minutes of inactivity</div>
<div>☐ Follow all security protocols outlined in SECURITY.md</div>
<div>☐ User privacy comes first: never send raw bank logins anywhere</div>
</div>
</div>

</div>

<div style="display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;">

<div style="flex: 1; min-width: 280px; background: #F5F3FF; border: 1px solid #EDE9FE; border-radius: 14px; padding: 20px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
<span style="color: #7C3AED; font-weight: 800; font-size: 16px;">06</span>
<h3 style="color: #5B21B6; margin: 0; font-size: 16px;">Useful Commands</h3>
</div>
<div style="font-size: 20px; margin-bottom: 10px;">💻</div>
<div style="background: #0F172A; border-radius: 10px; padding: 14px; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 12px; color: #E2E8F0; line-height: 1.7;">
<span style="color: #94A3B8;"># 1. Run Python AI Agent (Port 8000)</span><br/>
<span style="color: #38BDF8;">cd agent && uvicorn app.main:app --port 8000</span><br/><br/>
<span style="color: #94A3B8;"># 2. Run Node Express Gateway (Port 5000)</span><br/>
<span style="color: #4ADE80;">cd server && npm run dev</span><br/><br/>
<span style="color: #94A3B8;"># 3. Run React 19 Frontend (Port 5173)</span><br/>
<span style="color: #F472B6;">cd frontend && npm run dev</span><br/><br/>
<span style="color: #94A3B8;"># 4. Production build check</span><br/>
<span style="color: #FBBF24;">cd frontend && npm run build</span>
</div>
</div>

<div style="flex: 1; min-width: 280px; background: #F0FDFA; border: 1px solid #CCFBF1; border-radius: 14px; padding: 20px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
<span style="color: #0D9488; font-weight: 800; font-size: 16px;">07</span>
<h3 style="color: #115E59; margin: 0; font-size: 16px;">Need Help?</h3>
</div>
<div style="font-size: 20px; margin-bottom: 10px;">💡</div>
<div style="color: #134E4A; font-size: 13px; line-height: 1.8;">
<p style="margin: 0 0 10px; font-weight: 700;">If you're unsure about how something should work:</p>
<ul style="margin: 0; padding-left: 20px;">
<li>Check the relevant spec in <a href="PRD.md" style="color: #0D9488; font-weight: 700;">/docs</a></li>
<li>Look at existing working components in <code>/frontend/src</code></li>
<li>Review existing routes & middleware in <code>/server/src</code></li>
<li>Ask me for clarification before making huge architectural leaps</li>
</ul>
<p style="margin: 16px 0 0; font-weight: 800; color: #0F766E; font-size: 14px;">
Let's build something amazing together! 🚀
</p>
</div>
</div>

</div>
