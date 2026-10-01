# 🎨 DESIGN_SYSTEM.md

> ![Design. Build. Ship. Consistently.](https://img.shields.io/badge/Design._Build._Ship._Consistently.-DB2777?style=flat-square)

# Design System

A consistent and scalable design system for a beautiful, modern, and accessible product.

---

<table width="100%">
<tr>
<th width="50%" align="left">01 &nbsp; Brand Identity</th>
<th width="50%" align="left">02 &nbsp; Theme Toggle</th>
</tr>
<tr>
<td valign="top">

Our visual identity reflects precision, trust, and financial clarity.

The app ships with **two full themes** — a clean light mode for daytime use and a premium dark mode for the late-night grinders. Users can switch between them with the toggle in the top-right navbar.

**Font:** Plus Jakarta Sans + JetBrains Mono (currency figures)

</td>
<td valign="top">

The theme toggle is always visible in the navbar. It switches `data-theme` between `light` and `dark` on the root element.

| Mode | Vibe | Primary Canvas |
| :--- | :--- | :--- |
| ☀️ **Light** | Drone.io Tech Cloud | `#E9F1FA` soft blue |
| 🌙 **Dark** | Slumber Midnight Luxury | `#0A1828` deep navy |

> [!TIP]
> All tokens auto-switch. You never write separate CSS for each mode — just use `var(--bg-primary)`, `var(--text-primary)`, etc.

</td>
</tr>
</table>

---

<table width="100%">
<tr>
<th width="50%" align="left">03 &nbsp; Light Mode Palette</th>
<th width="50%" align="left">04 &nbsp; Dark Mode Palette</th>
</tr>
<tr>
<td valign="top">

☀️ *Drone.io Tech Cloud Aesthetic*

| | Token | Hex |
| :---: | :--- | :--- |
| ![#E9F1FA](https://img.shields.io/badge/-E9F1FA-E9F1FA) | `--bg-primary` | `#E9F1FA` |
| ![#FFFFFF](https://img.shields.io/badge/-FFFFFF-FFFFFF) | `--bg-card` | `#FFFFFF` |
| ![#F2F7FC](https://img.shields.io/badge/-F2F7FC-F2F7FC) | `--bg-card-hover` | `#F2F7FC` |
| ![#00ABE4](https://img.shields.io/badge/-00ABE4-00ABE4) | `--accent-primary` | `#00ABE4` |
| ![#178582](https://img.shields.io/badge/-178582-178582) | `--accent-secondary` | `#178582` |
| ![#0A1828](https://img.shields.io/badge/-0A1828-0A1828) | `--text-primary` | `#0A1828` |
| ![#3B5266](https://img.shields.io/badge/-3B5266-3B5266) | `--text-secondary` | `#3B5266` |
| ![#748B9F](https://img.shields.io/badge/-748B9F-748B9F) | `--text-muted` | `#748B9F` |
| ![#BFA181](https://img.shields.io/badge/-BFA181-BFA181) | `--accent-gold` | `#BFA181` |

</td>
<td valign="top">

🌙 *Slumber Midnight Luxury Aesthetic*

| | Token | Hex |
| :---: | :--- | :--- |
| ![#0A1828](https://img.shields.io/badge/-0A1828-0A1828) | `--bg-primary` | `#0A1828` |
| ![#0D1E33](https://img.shields.io/badge/-0D1E33-0D1E33) | `--bg-card` | `rgba(16,35,59)` |
| ![#102641](https://img.shields.io/badge/-102641-102641) | `--bg-card-hover` | `rgba(22,46,76)` |
| ![#00ABE4](https://img.shields.io/badge/-00ABE4-00ABE4) | `--accent-primary` | `#00ABE4` |
| ![#178582](https://img.shields.io/badge/-178582-178582) | `--accent-secondary` | `#178582` |
| ![#FFFFFF](https://img.shields.io/badge/-FFFFFF-FFFFFF) | `--text-primary` | `#FFFFFF` |
| ![#E9F1FA](https://img.shields.io/badge/-E9F1FA-E9F1FA) | `--text-secondary` | `#E9F1FA` |
| ![#7E95AC](https://img.shields.io/badge/-7E95AC-7E95AC) | `--text-muted` | `#7E95AC` |
| ![#BFA181](https://img.shields.io/badge/-BFA181-BFA181) | `--accent-gold` | `#BFA181` |

</td>
</tr>
</table>

---

<table width="100%">
<tr>
<th width="50%" align="left">05 &nbsp; Status Colors</th>
<th width="50%" align="left">06 &nbsp; Gradients</th>
</tr>
<tr>
<td valign="top">

These are shared across both themes (with slight alpha tweaks in dark mode).

| | State | Light | Dark |
| :---: | :--- | :---: | :---: |
| ![#178582](https://img.shields.io/badge/-178582-178582) | Success | `#178582` | `#20A39E` |
| ![#E11D48](https://img.shields.io/badge/-E11D48-E11D48) | Danger | `#E11D48` | `#EF4444` |
| ![#BFA181](https://img.shields.io/badge/-BFA181-BFA181) | Warning | `#BFA181` | `#BFA181` |
| ![#00ABE4](https://img.shields.io/badge/-00ABE4-00ABE4) | Info | `#00ABE4` | `#00ABE4` |

</td>
<td valign="top">

Key gradients used for buttons, cards, and hero sections:

| Token | Direction |
| :--- | :--- |
| `--gradient-primary` | `#00ABE4 → #178582` |
| `--gradient-success` | `#178582 → #20A39E` |
| `--gradient-danger` | `#E11D48 → #F43F5E` |
| `--gradient-gold` | `#BFA181 → #D4AF37` |

</td>
</tr>
</table>

---

<table width="100%">
<tr>
<th width="50%" align="left">07 &nbsp; Typography</th>
<th width="50%" align="left">08 &nbsp; Spacing</th>
</tr>
<tr>
<td valign="top">

I use **Plus Jakarta Sans** for a clean, modern look. **JetBrains Mono** for currency figures.

| Style | Size | Line Height | Weight |
| :--- | :---: | :---: | :--- |
| **H1** | 40px | 48px | Bold |
| **H2** | 28px | 36px | Semibold |
| **H3** | 20px | 28px | Semibold |
| **H4** | 16px | 24px | Medium |
| **Body** | 15px | 24px | Regular |
| **Caption** | 13px | 20px | Regular |
| **Currency** | 14px | 20px | Mono 600 |

</td>
<td valign="top">

Use an **8px spacing system** for consistent layout.

| Token | Value |
| :--- | :---: |
| `--space-xs` | 4px |
| `--space-sm` | 8px |
| `--space-md` | 16px |
| `--space-lg` | 24px |
| `--space-xl` | 32px |
| `--space-2xl` | 48px |
| `--space-3xl` | 64px |

</td>
</tr>
</table>

---

<table width="100%">
<tr>
<th width="50%" align="left">09 &nbsp; Border Radius</th>
<th width="50%" align="left">10 &nbsp; Components</th>
</tr>
<tr>
<td valign="top">

Use consistent radius values.

| Token | Value | Use case |
| :--- | :---: | :--- |
| `--radius-sm` | 6px | Tags, tooltips |
| `--radius-md` | 10px | Buttons, inputs |
| `--radius-lg` | 14px | Cards, widgets |
| `--radius-xl` | 20px | Modals, drawers |
| `--radius-full` | 9999px | Avatars, pills |

</td>
<td valign="top">

Reusable UI components for faster, consistent development.

**Buttons**

<kbd>&nbsp; ✦ Primary Button &nbsp;</kbd> &ensp; <kbd>&nbsp; Secondary &nbsp;</kbd> &ensp; <kbd>&nbsp; Ghost &nbsp;</kbd>

**Badges**

`🟢 Verified` &ensp; `🔴 Locked` &ensp; `🟡 Warning` &ensp; `🔵 Info`

**Input Field**

`[ ✉️ Enter your email ]`

</td>
</tr>
</table>

---

<table width="100%">
<tr>
<th width="50%" align="left">11 &nbsp; Icons</th>
<th width="50%" align="left">12 &nbsp; Responsive Breakpoints</th>
</tr>
<tr>
<td valign="top">

I use **Lucide React** for icons.

| | | | | |
| :---: | :---: | :---: | :---: | :---: |
| 🏠 | 🔍 | 👤 | ⚙️ | 🔔 |
| Home | Search | User | Settings | Notifications |

</td>
<td valign="top">

Design for all screen sizes.

| | Device | Viewport |
| :---: | :--- | :--- |
| 📱 | Mobile | < 640px |
| 📲 | Tablet | 640px – 1024px |
| 💻 | Laptop | 1024px – 1440px |
| 🖥️ | Desktop | > 1440px |

</td>
</tr>
</table>
