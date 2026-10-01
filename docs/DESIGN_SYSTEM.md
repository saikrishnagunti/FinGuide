# 🎨 Design System

<div align="center">

![FinGuide UI](https://img.shields.io/badge/FinGuide-Design_System-00ABE4?style=for-the-badge&logo=figma&logoColor=white)
![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vanilla CSS](https://img.shields.io/badge/CSS-Design_Tokens-178582?style=for-the-badge&logo=css3&logoColor=white)
![Plus Jakarta Sans](https://img.shields.io/badge/Font-Plus_Jakarta_Sans-0A1828?style=for-the-badge)

<p><em>Institutional-grade clarity, oceanic night aesthetic, and accessible design tokens for wealth management.</em></p>

</div>

---

### 01 Brand Identity

| Brand Emblem | Identity & Positioning |
| :---: | :--- |
| <img src="https://img.shields.io/badge/FG-FinGuide-00ABE4?style=for-the-badge" height="38"/> | **FinGuide — AI Financial Intelligence & Wealth OS**<br/>Our visual identity reflects precision, institutional confidence, and user autonomy. Engineered for a **deep oceanic dark mode** (`#0A1828`) accented by electric drone blue (`#00ABE4`) and mint turquoise (`#178582`). |

---

### 02 Color Palette Tokens

> All color variables are defined once in [`frontend/src/index.css`](../frontend/src/index.css). Always reference `var(--token-name)`.

#### Core Brand Colors

| Color Token | Visual Badge Preview | Hex Code | CSS Custom Property | Primary Application |
| :--- | :---: | :---: | :---: | :--- |
| **Primary Accent** | ![#00ABE4](https://img.shields.io/badge/Primary-%2300ABE4-00ABE4?style=for-the-badge) | `#00ABE4` | `var(--accent-primary)` | Main call-to-actions, active tab indicators, key metric highlights |
| **Brand Turquoise** | ![#178582](https://img.shields.io/badge/Turquoise-%23178582-178582?style=for-the-badge) | `#178582` | `var(--brand-turquoise)` | Positive balances, savings surplus, investment gains, verified states |
| **Navy Dark** | ![#0A1828](https://img.shields.io/badge/Navy_Dark-%230A1828-0A1828?style=for-the-badge) | `#0A1828` | `var(--bg-dark)` | Root viewport background canvas |
| **Card Dark** | ![#0D1E33](https://img.shields.io/badge/Card_Dark-%230D1E33-0D1E33?style=for-the-badge) | `#0D1E33` | `var(--bg-card)` | Primary card panels, modal dialogs, drawer surfaces |
| **Gold Tier** | ![#BFA181](https://img.shields.io/badge/Gold_Tier-%23BFA181-BFA181?style=for-the-badge) | `#BFA181` | `var(--gold-tier)` | Advisory recommendations, milestone celebrations, VIP badges |
| **Canvas Light** | ![#E9F1FA](https://img.shields.io/badge/Canvas_Light-%23E9F1FA-E9F1FA?style=for-the-badge&logoColor=black) | `#E9F1FA` | `var(--bg-light)` | High-contrast light backgrounds and card borders |

#### Functional & Status Colors

| Semantic State | Visual Badge Preview | Hex Code | CSS Custom Property | Trigger Condition |
| :--- | :---: | :---: | :---: | :--- |
| **Success** | ![#178582](https://img.shields.io/badge/Success-%23178582-178582?style=for-the-badge) | `#178582` | `var(--status-success)` | Transaction verified, goal achieved, OTP accepted |
| **Danger** | ![#E11D48](https://img.shields.io/badge/Danger-%23E11D48-E11D48?style=for-the-badge) | `#E11D48` | `var(--status-danger)` | Budget overrun, failed login lockout, transaction deleted |
| **Warning** | ![#D97706](https://img.shields.io/badge/Warning-%23D97706-D97706?style=for-the-badge) | `#D97706` | `var(--status-warning)` | Spending approaching threshold, session inactivity countdown |
| **Info** | ![#00ABE4](https://img.shields.io/badge/Info-%2300ABE4-00ABE4?style=for-the-badge) | `#00ABE4` | `var(--status-info)` | AI advisor guidance cards, statement upload hints |
| **Muted** | ![#748B9F](https://img.shields.io/badge/Muted-%23748B9F-748B9F?style=for-the-badge) | `#748B9F` | `var(--text-muted)` | Helper copy, timestamps, inactive icons, table borders |

---

### 03 Typography Scale

We use **Plus Jakarta Sans** across the application, paired with monospace figures for financial ledgers.

| Role | Font Size | Line Height | Weight | Tailwind / CSS Utility | Example Usage |
| :--- | :---: | :---: | :---: | :--- | :--- |
| **H1 Display** | `40px` | `48px` | `800` Bold | `.text-display-h1` | Hero dashboard balances, page headlines |
| **H2 Title** | `28px` | `36px` | `700` Bold | `.text-title-h2` | Section titles, major analytics cards |
| **H3 Section** | `20px` | `28px` | `600` Semibold | `.text-section-h3` | Drawer headers, widget subheadings |
| **H4 Subtitle**| `16px` | `24px` | `600` Medium | `.text-subtitle-h4` | Form section titles, card labels |
| **Body Regular** | `15px` | `24px` | `400` Regular | `body, p` | Paragraphs, transaction descriptions |
| **Caption** | `13px` | `20px` | `500` Regular | `.text-caption` | Timestamps, helper notes, table captions |
| **Currency Mono** | `14px` | `20px` | `600` Tabular | `tabular-nums font-mono` | Ledger balances, monetary transaction values |

---

### 04 Spacing Scale (8px Geometric Grid)

| Spacing Token | Pixel Value | Visual Density Bar | Common Application |
| :--- | :---: | :--- | :--- |
| `--space-xs` | `4px` | `█` | Inline chip padding, tight icon margins |
| `--space-sm` | `8px` | `██` | Gap between button icon and label, list item padding |
| `--space-md` | `16px` | `████` | Internal card padding on mobile, form input spacing |
| `--space-lg` | `24px` | `██████` | Standard desktop card padding, layout gutters |
| `--space-xl` | `32px` | `████████` | Section separators, dashboard headers |
| `--space-2xl`| `48px` | `████████████` | Hero section top and bottom offsets |
| `--space-3xl`| `64px` | `████████████████` | Page container padding on wide screens |

---

### 05 Border Radius Tokens

| Radius Token | Pixel Value | Visual Preview | Target Elements |
| :--- | :---: | :---: | :--- |
| `--radius-sm` | `4px` | `[ ▪ ]` | Inline code badges, tags, tooltips |
| `--radius-md` | `8px` | `[ ◼ ]` | Input text boxes, action buttons, alert banners |
| `--radius-lg` | `12px` | `( ◼ )` | Content cards, metric widgets, popovers |
| `--radius-xl` | `16px` | `( ⬤ )` | Large modal dialogs, AI advisor drawer panel |
| `--radius-full`| `9999px`| `(  ●  )` | User profile avatars, status pills, filter buttons |

---

### 06 Component Specifications

| Component | Visual Representation on GitHub | Implementation Specification |
| :--- | :---: | :--- |
| **Primary Action Button** | <kbd>&nbsp;✦ Primary Button&nbsp;</kbd> | `background: linear-gradient(135deg, #00ABE4, #178582); color: #fff;` |
| **Secondary Button** | <kbd>&nbsp;Secondary Action&nbsp;</kbd> | `border: 1px solid rgba(0, 171, 228, 0.4); background: transparent;` |
| **Ghost Button** | <kbd>&nbsp;Dismiss&nbsp;</kbd> | `border: none; background: transparent; color: var(--text-muted);` |
| **Input Field** | `[ ✉️ user@example.com ]` | `background: var(--bg-card); border: 1px solid rgba(255,255,255,0.1);` |
| **Badge: Verified** | `🟢 Verified` | `background: rgba(23, 133, 130, 0.15); color: #178582;` |
| **Badge: Locked** | `🔴 Account Locked` | `background: rgba(225, 29, 72, 0.15); color: #E11D48;` |
| **Badge: Warning** | `🟡 High Utilization` | `background: rgba(217, 119, 6, 0.15); color: #D97706;` |
| **Badge: Info** | `🔵 AI Suggestion` | `background: rgba(0, 171, 228, 0.15); color: #00ABE4;` |

---

### 07 Iconography (Lucide React)

| Navigation & System | Financial Operations | Analytics & AI | Status & Security |
| :---: | :---: | :---: | :---: |
| 🏠 `Home` | 💰 `Wallet` | 📊 `Analytics` | 🛡️ `Security` |
| ⚙️ `Settings` | 💳 `Transactions` | 📈 `Forecasts` | 🔒 `Locked` |
| 👤 `Profile` | 📄 `Statements` | ✨ `AI Advisor` | 🔔 `Alerts` |
| 🔍 `Search` | 🎯 `Goals` | 🧠 `Reasoning` | ✅ `Verified` |

---

### 08 Responsive Breakpoints

| Device Category | Visual Device | Viewport Width | Application Layout Strategy |
| :--- | :---: | :---: | :--- |
| **Mobile** | 📱 | `< 640px` | Single-column vertical stack, bottom navigation bar, full-screen modals |
| **Tablet** | 📲 | `640px – 1024px` | 2-column metric cards, collapsed icon sidebar, floating advisor toggle |
| **Laptop** | 💻 | `1024px – 1440px` | Full navigation sidebar, 3-column financial analytics, persistent drawer |
| **Desktop** | 🖥️ | `≥ 1440px` | Expanded transaction ledger, multi-pane charts, widescreen workspace |
