# Design System

> **FinGuide UI Tokens, Typography, Spacing Scale & Component Specifications**

---

## 1. Brand Identity

- **Brand Name**: FinGuide
- **Positioning**: AI Financial Intelligence & Wealth Operating System
- **Tone**: Institutional, precise, modern, and trustworthy
- **Visual Theme**: Deep Oceanic Night (`#0A1828`) accented with Electric Drone Blue (`#00ABE4`) and Mint Turquoise (`#178582`).

---

## 2. Color Palette Tokens

FinGuide strictly enforces CSS custom properties (variables) defined in [`frontend/src/index.css`](file:///d:/JOB/AI/FinGuide/frontend/src/index.css). Never hardcode raw hex values directly in component JSX.

### Core Brand Tokens

| Token Name | Hex Code | Visual Preview | Usage |
| :--- | :---: | :---: | :--- |
| `--accent-primary` | `#00ABE4` | `🔵` | Primary buttons, active tab indicators, key metric highlights |
| `--brand-turquoise` | `#178582` | `🟢` | Success states, investment gains, positive savings rates |
| `--bg-dark` | `#0A1828` | `⬛` | App viewport background, dark mode root canvas |
| `--bg-card` | `#0D1E33` | `🟦` | Primary card panels, modals, drawer surfaces |
| `--gold-tier` | `#BFA181` | `🟤` | VIP accents, milestone celebrations, advisory recommendations |
| `--bg-light` | `#E9F1FA` | `⬜` | Light mode canvas, high-contrast text accents |

### Functional & Status Tokens

| Semantic Token | Hex Code | Purpose |
| :--- | :---: | :--- |
| `--status-success` | `#178582` | Positive balances, savings surplus, verified status |
| `--status-danger` | `#E11D48` | Budget overruns, negative cash flow, security lockouts |
| `--status-warning` | `#BFA181` | Impending spending limits, warning countdowns |
| `--status-info` | `#00ABE4` | AI guidance notices, informative tooltips |
| `--text-muted` | `#748B9F` | Secondary labels, timestamp metadata, inactive icons |

---

## 3. Typography Scale

FinGuide utilizes **Plus Jakarta Sans** for modern legibility and numeric alignment across all financial tables.

| Role | Font Size | Line Height | Weight | Tailwind / CSS Utility |
| :--- | :---: | :---: | :---: | :--- |
| **Display H1** | `40px` | `48px` | `800` (Extra Bold) | `.text-display-h1` |
| **Section H2** | `28px` | `36px` | `700` (Bold) | `.text-title-h2` |
| **Card H3** | `20px` | `28px` | `600` (Semibold) | `.text-section-h3` |
| **Subtitle H4** | `16px` | `24px` | `600` (Semibold) | `.text-subtitle-h4` |
| **Body Regular** | `15px` | `24px` | `400` (Regular) | `body`, `p` |
| **Caption / Meta**| `13px` | `20px` | `500` (Medium) | `.text-caption` |
| **Currency Monospace** | `14px` | `20px` | `600` (Semibold) | Monospace tabular figures |

---

## 4. Spacing Scale (8px Grid)

Layouts, margins, and gutters strictly adhere to an 8-pixel geometric scale:

| Token | Size | Common Application |
| :--- | :---: | :--- |
| `--space-xs` | `4px` | Compact icon badges, inline chips |
| `--space-sm` | `8px` | Gap between icon and button label |
| `--space-md` | `16px` | Internal card padding on mobile, form input spacing |
| `--space-lg` | `24px` | Standard desktop card padding, grid gutters |
| `--space-xl` | `32px` | Page section separators, dashboard headers |
| `--space-2xl`| `48px` | Major page hero section margins |
| `--space-3xl`| `64px` | Landing page section offsets |

---

## 5. Border Radius Tokens

| Token | Size | Typical Target Elements |
| :--- | :---: | :--- |
| `--radius-sm` | `4px` | Inline tags, code snippets |
| `--radius-md` | `8px` | Input fields, standard action buttons |
| `--radius-lg` | `12px` | Content cards, metric panels, popovers |
| `--radius-xl` | `16px` | Large dialogs, advisor drawer, auth containers |
| `--radius-full` | `9999px` | Avatars, status pills, pill buttons |

---

## 6. Standard Component Specifications

### Buttons
- **Primary Action**: Gradient background (`linear-gradient(135deg, #00ABE4, #178582)`), white text, `8px` border radius, subtle hover elevation (`translateY(-1px)`).
- **Secondary Action**: Bordered button (`border: 1px solid rgba(0, 171, 228, 0.3)`), transparent background, hover state with `10%` accent tint.
- **Ghost Action**: Zero border, subtle muted hover background.

### Input Fields
- Dark canvas with subtle `1px solid rgba(255, 255, 255, 0.1)` border.
- Active focus state: glows with `box-shadow: 0 0 0 2px rgba(0, 171, 228, 0.4)` and border turns `--accent-primary`.

### Status Badges
- Pill-shaped (`border-radius: 9999px`) with `font-size: 11px`, `font-weight: 700`, uppercase tracking.

---

## 7. Responsive Breakpoints

FinGuide layouts are mobile-first and fluid across all screen sizes:

| Breakpoint | Viewport Range | Layout Behavior |
| :--- | :---: | :--- |
| **Mobile (`sm`)** | `< 640px` | Single-column stack, collapsible sidebar turns into bottom drawer, full-width modals. |
| **Tablet (`md`)** | `640px – 1024px` | Two-column cards, condensed metrics grid, collapsed icon-only sidebar. |
| **Laptop (`lg`)** | `1024px – 1440px` | Full sidebar navigation, three-column metric widgets, floating advisor panel. |
| **Desktop (`xl`)** | `≥ 1440px` | Wide container view, multi-column analytics, expanded financial ledger table. |
