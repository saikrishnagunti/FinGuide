# 🎨 DESIGN_SYSTEM.md

> ![Design. Build. Ship. Consistently.](https://img.shields.io/badge/Design._Build._Ship._Consistently.-DB2777?style=flat-square)

# Design System

A consistent and scalable design system for a beautiful, modern, and accessible product.

---

<table width="100%">
<tr>
<th width="50%" align="left">01 &nbsp; Brand Identity</th>
<th width="50%" align="left">02 &nbsp; Color Palette</th>
</tr>
<tr>
<td valign="top">

Our visual identity reflects precision, trust, and financial clarity.

The brand is built around a **deep oceanic dark mode** (`#0A1828`) accented by electric blue (`#00ABE4`) and mint turquoise (`#178582`). It should feel like a premium banking dashboard — not a toy.

**Font:** Plus Jakarta Sans

</td>
<td valign="top">

Use these colors consistently across the product.

| | Token | Hex |
| :---: | :--- | :--- |
| ![#00ABE4](https://img.shields.io/badge/-00ABE4-00ABE4) | Primary | `#00ABE4` |
| ![#178582](https://img.shields.io/badge/-178582-178582) | Turquoise | `#178582` |
| ![#0A1828](https://img.shields.io/badge/-0A1828-0A1828) | Background | `#0A1828` |
| ![#0D1E33](https://img.shields.io/badge/-0D1E33-0D1E33) | Card Dark | `#0D1E33` |
| ![#BFA181](https://img.shields.io/badge/-BFA181-BFA181) | Gold | `#BFA181` |
| ![#E9F1FA](https://img.shields.io/badge/-E9F1FA-E9F1FA) | Light | `#E9F1FA` |
| | | |
| ![#178582](https://img.shields.io/badge/-178582-178582) | Success | `#178582` |
| ![#E11D48](https://img.shields.io/badge/-E11D48-E11D48) | Error | `#E11D48` |
| ![#D97706](https://img.shields.io/badge/-D97706-D97706) | Warning | `#D97706` |
| ![#00ABE4](https://img.shields.io/badge/-00ABE4-00ABE4) | Info | `#00ABE4` |
| ![#748B9F](https://img.shields.io/badge/-748B9F-748B9F) | Text Muted | `#748B9F` |

</td>
</tr>
</table>

---

<table width="100%">
<tr>
<th width="50%" align="left">03 &nbsp; Typography</th>
<th width="50%" align="left">04 &nbsp; Spacing</th>
</tr>
<tr>
<td valign="top">

I use **Plus Jakarta Sans** for a clean and modern look.

| Style | Font Size | Line Height | Weight |
| :--- | :---: | :---: | :--- |
| **H1** | 40px | 48px | Bold |
| **H2** | 28px | 36px | Semibold |
| **H3** | 20px | 28px | Semibold |
| **H4** | 16px | 24px | Medium |
| **Body** | 15px | 24px | Regular |
| **Caption** | 13px | 20px | Regular |

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
<th width="50%" align="left">05 &nbsp; Border Radius</th>
<th width="50%" align="left">06 &nbsp; Components</th>
</tr>
<tr>
<td valign="top">

Use consistent radius values.

| Token | Value | Use case |
| :--- | :---: | :--- |
| `--radius-sm` | 4px | Tags, tooltips |
| `--radius-md` | 8px | Buttons, inputs |
| `--radius-lg` | 12px | Cards, widgets |
| `--radius-xl` | 16px | Modals, drawers |
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
<th width="50%" align="left">07 &nbsp; Icons</th>
<th width="50%" align="left">08 &nbsp; Responsive Breakpoints</th>
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
