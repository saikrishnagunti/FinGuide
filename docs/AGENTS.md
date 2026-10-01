# 🤖 Agent Instructions

<div align="center">

![Agent Role](https://img.shields.io/badge/Agent_Role-Pair_Programming_Partner-7E22CE?style=for-the-badge&logo=probot&logoColor=white)
![Stack](https://img.shields.io/badge/Stack-React_19_•_Node_•_FastAPI-00ABE4?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active_Development-178582?style=for-the-badge)
![Security](https://img.shields.io/badge/Security-Zero_Trust_OTP-E11D48?style=for-the-badge)

<p><em>Guidelines, quality standards, and operational rules for AI coding assistants working in the FinGuide repository.</em></p>

</div>

---

### 01 Purpose

> [!NOTE]
> **Welcome to FinGuide!** If you're an AI agent (Antigravity, Claude Code, Cursor, Copilot) helping build this project, this document is our team agreement. It explains how our three tiers connect, where files belong, and the rules we enforce to keep the code fast, accessible, and secure.

---

<table width="100%">
<tr>
<th width="50%" align="left">📖 02 Before You Start</th>
<th width="50%" align="left">⚙️ 03 General Engineering Rules</th>
</tr>
<tr>
<td valign="top">

- [ ] Read [**`PRD.md`**](PRD.md) to understand product requirements and user goals
- [ ] Read [**`DESIGN_SYSTEM.md`**](DESIGN_SYSTEM.md) to use our actual color tokens
- [ ] Read [**`ARCHITECTURE.md`**](ARCHITECTURE.md) to see how the 3 tiers communicate
- [ ] Inspect existing components in `/frontend/src/components` before creating new ones
- [ ] Inspect existing backend routes in `/server/src/routes` before writing duplicate logic
- [ ] Check security rules in [**`SECURITY.md`**](SECURITY.md) before altering auth flows

</td>
<td valign="top">

- [ ] **React 19 + Vite + Vanilla CSS tokens**: Never install TailwindCSS
- [ ] **CSS Design Tokens**: Strictly use `var(--accent-primary)`, `var(--bg-dark)`
- [ ] **Modular Code**: Keep components small, focused, and reusable
- [ ] **Developer Comments**: Add quick notes explaining complex financial math
- [ ] **SQL Safety**: Always parameterize database queries to prevent SQL injections
- [ ] **Zero Hallucination**: Never delete files without confirming dependencies

</td>
</tr>
</table>

---

<table width="100%">
<tr>
<th width="50%" align="left">💻 04 Code Guidelines</th>
<th width="50%" align="left">🛡️ 05 Security & Best Practices</th>
</tr>
<tr>
<td valign="top">

- [ ] Write clean functional components with modern React hooks
- [ ] Give variables and functions descriptive, self-explanatory names
- [ ] Never hardcode hex values like `#00ABE4` directly in JSX
- [ ] Handle loading, empty, and error states gracefully in UI
- [ ] Ensure layouts are responsive across mobile, tablet, and desktop
- [ ] Write semantic, accessible markup with proper ARIA attributes
- [ ] Always return cleanup functions in `useEffect` for listeners and intervals

</td>
<td valign="top">

- [ ] Never commit API keys, salts, or passwords to Git
- [ ] Store all secrets in `.env` files and cloud environment dashboards
- [ ] Validate all incoming payloads on both client and backend
- [ ] Require Two-Step Email OTP for user registration and password resets
- [ ] Enforce 15-minute lockout on 5 consecutive failed logins
- [ ] Auto-logout idle sessions after 15 minutes of inactivity
- [ ] Preserve user privacy: statements are parsed in-memory, never sold

</td>
</tr>
</table>

---

<table width="100%">
<tr>
<th width="50%" align="left">⚡ 06 Useful Commands</th>
<th width="50%" align="left">💡 07 Need Help?</th>
</tr>
<tr>
<td valign="top">

```bash
# 1. Run Python AI Agent (Port 8000)
cd agent && uvicorn app.main:app --port 8000

# 2. Run Node Express Gateway (Port 5000)
cd server && npm run dev

# 3. Run React 19 Frontend (Port 5173)
cd frontend && npm run dev

# 4. Run Production Build Check
cd frontend && npm run build
```

</td>
<td valign="top">

If you're unsure about how something should work:
- Check the specifications in [**`/docs`**](./)
- Look at existing working patterns in `/frontend/src`
- Review existing routes in `/server/src/routes`
- Ask for clarification before making huge architectural changes

> [!TIP]
> **Let's build something amazing together! 🚀**

</td>
</tr>
</table>
