# 🤖 AGENTS.md

> ![Build better, together.](https://img.shields.io/badge/Build_better,_together.-7E22CE?style=flat-square)

# Agent Instructions

Guidelines for AI coding agents working on this project.

---

<table width="100%">
<tr><td colspan="2">

### 01 &nbsp; Purpose

This file is for AI agents (Claude Code, Cursor, Copilot, Antigravity) helping me build FinGuide. If you're an agent working in this repo — read this first. It'll save us both time.

I built FinGuide as a three-tier financial intelligence platform: React 19 frontend, Node.js Express gateway, and a Python FastAPI AI agent. This doc explains how it all fits together and what rules I expect you to follow.

</td></tr>
</table>

---

<table width="100%">
<tr>
<th width="50%" align="left">02 &nbsp; Before You Start</th>
<th width="50%" align="left">03 &nbsp; General Rules</th>
</tr>
<tr>
<td valign="top">

📖

- [ ] Read [PRD.md](PRD.md) to understand the product and goals
- [ ] Read [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for UI/UX guidelines
- [ ] Read [ARCHITECTURE.md](ARCHITECTURE.md) for technical structure
- [ ] Check existing components in `frontend/src/components/`
- [ ] Understand the folder structure before adding files
- [ ] Look at [SECURITY.md](SECURITY.md) before changing auth flows

</td>
<td valign="top">

⚙️

- [ ] Use React 19 + Vite + Vanilla CSS tokens (no Tailwind)
- [ ] Follow the design system — use `var(--accent-primary)` etc.
- [ ] Reuse existing components before creating new ones
- [ ] Keep code modular and scalable
- [ ] Write clean, readable code with descriptive names
- [ ] Add comments for complex logic (especially financial math)
- [ ] Don't create unnecessary files
- [ ] Follow the project structure

</td>
</tr>
</table>

---

<table width="100%">
<tr>
<th width="50%" align="left">04 &nbsp; Code Guidelines</th>
<th width="50%" align="left">05 &nbsp; Security & Best Practices</th>
</tr>
<tr>
<td valign="top">

`</>`

- [ ] Use functional components with React hooks
- [ ] Use meaningful variable and function names
- [ ] Prefer existing UI components over new ones
- [ ] Keep components small and reusable
- [ ] Follow the code style in [CODE_STYLE.md](CODE_STYLE.md)
- [ ] Handle loading, error and empty states
- [ ] Ensure responsiveness across breakpoints
- [ ] Write accessible and semantic code

</td>
<td valign="top">

🛡️

- [ ] Never expose API keys or sensitive data
- [ ] Use environment variables (`.env`)
- [ ] Validate all user inputs
- [ ] Follow authentication and authorization rules
- [ ] Implement error handling everywhere
- [ ] Avoid hardcoding secrets
- [ ] Follow the guidelines in [SECURITY.md](SECURITY.md)
- [ ] Be mindful of data privacy and user safety

</td>
</tr>
</table>

---

<table width="100%">
<tr>
<th width="50%" align="left">06 &nbsp; Useful Commands</th>
<th width="50%" align="left">07 &nbsp; Need Help?</th>
</tr>
<tr>
<td valign="top">

📋

```bash
# Run the AI Agent (Port 8000)
cd agent && uvicorn app.main:app --port 8000

# Run the Express Gateway (Port 5000)
cd server && npm run dev

# Run the React Frontend (Port 5173)
cd frontend && npm run dev

# Production build check
cd frontend && npm run build
```

</td>
<td valign="top">

💡 If you're unsure about something:

- Check the documentation in `/docs`
- Look at existing code examples
- Follow the patterns already in use
- Ask for clarification before making big changes

> [!TIP]
> Let's build something amazing! 🚀

</td>
</tr>
</table>
