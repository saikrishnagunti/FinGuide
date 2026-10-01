# Master Prompt for Claude: Professional FinGuide Documentation (.docx)

> **How to use this with Claude:**
> 1. Open [Claude.ai](https://claude.ai) (Claude 3.5 Sonnet or Claude Opus recommended).
> 2. Upload your **entire FinGuide project folder** (or a zip file of it).
> 3. Upload your **live web page screenshots** (Dashboard, Upload, AI Advisor, Budget, Goals, Light & Dark themes, Login/OTP).
> 4. Copy the complete prompt below (between the triple backticks or lines) and paste it into Claude.
> 5. Claude will generate the comprehensive documentation text and provide a Python script (`generate_finguide_docs.py`) using `python-docx` that compiles a beautifully styled, publication-ready Microsoft Word file with your screenshots cleanly embedded!

---

```text
You are an elite Senior Technical Writer and Product Architect collaborating with me, Sai Krishna (the creator and lead developer of FinGuide). 

I have uploaded:
1. The complete source code and documentation of my project "FinGuide" (encompassing the React 19 frontend, Node.js Express API gateway, Python FastAPI AI agent service, Turso cloud database schemas, and documentation files).
2. Multiple high-resolution screenshots of the live, deployed FinGuide web application (including Dashboard metrics, Cash Flow & Wealth Trajectory Map, Spending Breakdown, Bank Statement Upload dropzone, ReAct AI Advisor drawer, Budget Planner, Goals Tracker, Light and Dark themes, and Authentication/OTP screens).

YOUR TASK:
Prepare a comprehensive, publication-grade, professional Project Documentation in Microsoft Word (.docx) format for FinGuide. 

================================================================================
CRITICAL REQUIREMENTS & CONSTRAINTS:
================================================================================

1. DUAL-LAYER AUDIENCE (THE "NON-TECH FRIENDLY" RULE):
   - The documentation must be completely understandable to non-technical stakeholders, business leaders, investors, recruiters, and clients, while remaining technically rigorous for senior engineers and evaluators.
   - For every major concept, feature, and architectural component, use a "Dual-Layer" structure:
     * Layer A: The Plain-English Explanation (For Everyone) — Use relatable real-world analogies, intuitive metaphors, and clear business benefits (e.g., comparing bank statement parsing to a smart scanner that reads messy paper receipts, or explaining the ReAct AI agent like a personal accountant who uses a calculator and always asks your permission before touching your money).
     * Layer B: The Engineering Deep-Dive (Under the Hood) — Provide exact technical specifications: React 19 hooks, Express routing, FastAPI endpoints, ReAct Thought-Action-Observation loops, ARIMA/SARIMA mathematical time-series modeling, Brevo OTP email delivery, and Turso libSQL TLS replication.

2. IMAGE EDITING, ANNOTATION & VISUAL EXPLANATION (EXPLICIT PERMISSION & DIRECTIVES):
   - YOU ARE FULLY AUTHORIZED, ENCOURAGED, AND EXPECTED TO USE, CROP, EDIT, AND ANNOTATE THE UPLOADED SCREENSHOTS to make every explanation visually obvious, especially for non-technical readers.
   - Image Editing & Enhancement Guidelines:
     * Smart Cropping & Focal Zoom-Ins: Do not only display full desktop captures. Crop and zoom in on specific UI highlights (e.g., zoom directly into the Inflow/Outflow metric cards, crop the forecast horizon `+1M / +2M` pills, zoom into the ReAct Thought-Action reasoning drawer, crop the 50/30/20 category progress bars, and crop the email OTP prompt).
     * Visual Overlay Annotations: Add or programmatically draw clean visual callouts:
       - Numbered badges (①, ②, ③, ④) directly over key interactive elements.
       - Colored bounding boxes / highlight outlines (using FinGuide brand colors: Accent Blue `#00ABE4`, Turquoise `#178582`, Warm Gold `#BFA181`, or Crimson `#E11D48` for warnings).
       - Callout labels and arrows pointing to key buttons, badges, and chart tooltips.
     * Side-by-Side & Composite Figures: Create side-by-side comparison images (e.g., Light Mode vs Dark Mode comparison, or "Before: Drag-and-Drop Statement Upload" vs "After: Extracted Transaction Table").
     * Automated Image Processing Script: Provide a Python script (`prepare_and_annotate_images.py`) using `Pillow` (`PIL`) that automatically performs the crops, overlays the numbered circle badges, adds highlight borders, and outputs the final clean images into an `./images/` folder ready for the Word document.
   - For Every Inserted Image, Include:
     * A formal figure title (e.g., "Figure 3.2: Cash Flow & Wealth Trajectory Map with 12-Month SARIMA Forecast Horizon Controls (Annotated)")
     * A high-level explanatory caption (1-2 sentences summarizing what the user is seeing)
     * An "Annotated Interface Breakdown" mapping each numbered badge (①, ②, ③) to plain-English explanations of what the button or metric does.
     * Clean framing: centered alignment, subtle 1pt border, generous spacing.

3. AUTHENTIC DEVELOPER VOICE:
   - Write from my perspective as the creator/developer (Sai Krishna), explaining my motivation, architectural choices, trade-offs, and design philosophy.
   - Avoid generic, robotic AI tropes (do NOT say "In today's fast-paced digital world", "delve into", "testament to", "revolutionize"). Speak with genuine engineering clarity, pride of craftsmanship, and practical problem-solving logic.

4. DUAL DELIVERY FORMAT (TEXT + AUTOMATED PYTHON-DOCX SCRIPT):
   - Part 1: Provide the complete, fully written, executive-level documentation text directly in the chat with clear Word styling markings (Heading 1, Heading 2, Heading 3, Callout boxes, Tables, and Image placement anchors).
   - Part 2: Provide a complete, production-ready Python script named `generate_finguide_docs.py` using the `python-docx` library. This script will programmatically generate the entire `.docx` document with:
     * Custom corporate color palette (Dark Navy `#0A1828`, Turquoise `#178582`, Warm Gold `#BFA181`, Accent Blue `#00ABE4`, Background `#F8FAFC`)
     * Custom typography hierarchy (Headings in Arial/Plus Jakarta Sans bold, body in Calibri/Segoe UI, currency/numbers in JetBrains Mono or Consolas)
     * Styled callout quote boxes with left accent borders for "Plain-English Metaphors" and "Security Highlights"
     * Professional alternating-row shaded data tables with bold headers
     * Automatic image insertion: The script will search for image files in an `./images/` directory, scale them to fit standard Word margins (5.5 to 6 inches wide), center them, add subtle borders, and append formatted figure captions!

================================================================================
EXHAUSTIVE DOCUMENTATION BLUEPRINT (CHAPTER OUTLINE):
================================================================================

Ensure the document covers all of the following chapters in rich, detailed depth:

--- COVER / TITLE PAGE ---
- Document Title: FinGuide — Next-Generation AI Financial Intelligence Platform
- Subtitle: Comprehensive Architectural, Algorithmic, and Operational Manual
- Author: Sai Krishna (Lead Software Engineer & Architect)
- Project Repository: https://github.com/saikrishnagunti/FinGuide
- Tech Stack Badges: React 19 | Node.js Express | Python FastAPI | Turso Cloud | Google Gemini 3.5 | Brevo Email API | Statsmodels ARIMA
- Version: 1.0.0 Production Release | Classification: Engineering & Product Documentation

--- TABLE OF CONTENTS ---
- Formal hierarchical table of contents with page numbering placeholders.

--- CHAPTER 1: EXECUTIVE SUMMARY & PROJECT GENESIS ---
1.1 The Real-World Problem:
    - Why personal finance is broken: Spreadsheets are manual, error-prone, and painful to maintain; traditional bank aggregator apps demand invasive credentials, bank passwords, or third-party screen-scraping permissions that create severe privacy risks.
    - The pain of messy bank statements: Banks export complex, multi-page PDFs with inconsistent column headers, hidden debit/credit flags, and nested transaction descriptions.
1.2 The FinGuide Solution:
    - Zero-credential privacy: Drag & drop statements (PDF/CSV) with 100% in-memory parsing. Passwords are never requested.
    - AI-Powered Financial Telemetry: Instant categorization, cash flow velocity analysis, statistical future projections, and interactive financial advisory.
1.3 Core Value Propositions & Business Impact:
    - Comparative table: Traditional Spreadsheets vs Bank Aggregators vs FinGuide.

--- CHAPTER 2: HIGH-LEVEL PLATFORM OVERVIEW (THE 60-SECOND PITCH) ---
2.1 What FinGuide Does in Plain English:
    - Simple 4-step workflow: Upload -> Extract -> Analyze -> Guide.
2.2 Who FinGuide is Built For:
    - Freelancers & Solopreneurs (irregular cash flows, invoice tracking)
    - Salaried Professionals (savings optimization, 50/30/20 budgeting)
    - Privacy-Conscious Individuals (zero third-party bank linking)
2.3 Complete Feature Matrix:
    - Highlighting Core Features: Dashboard Telemetry, Statistical Forecasting (ARIMA/SARIMA/ETS), ReAct AI Advisor, Direct Bank Statement PDF Parser, Manual Income & Expense Ledger, Budget Planner (50/30/20), Goals Tracker, Guest Sandbox Mode, Dual-Theme Engine, Enterprise Security & Email OTP.

--- CHAPTER 3: END-TO-END PRODUCT TOUR & INTERFACE WALKTHROUGH ---
(Include clean image placement anchors, figure numbers, and annotated UI breakdowns for all uploaded screenshots)

3.1 Landing Page & Value Showcase:
    - Hero section, trust badges, quick navigation.
    - [INSERT SCREENSHOT: Landing Page Hero & Feature Cards]
3.2 Frictionless Onboarding & Guest Sandbox Mode:
    - Instant guest mode: Test the platform without creating an account using preloaded mock telemetry or real PDF drops.
    - [INSERT SCREENSHOT: Guest Mode Interface]
3.3 Secure Authentication & 2-Step Email OTP:
    - Password validation, Brevo HTTPS OTP verification, brute-force lockout safeguards.
    - [INSERT SCREENSHOT: Login & OTP Verification Screen]
3.4 The Executive Financial Dashboard:
    - Inflow, Outflow, Net Wealth Delta (Surplus/Deficit), Savings Efficiency metrics.
    - [INSERT SCREENSHOT: Dashboard Overview with Stat Cards]
3.5 Cash Flow & Wealth Trajectory Map:
    - Interactive chart views: Volumetric Area Flow, Monthly Bar Comparison, Net Delta Line.
    - 1M / 2M predictive forecast horizons and 12-month data eligibility badges.
    - [INSERT SCREENSHOT: Cash Flow Trajectory Chart & Forecast Controls]
3.6 Spending Breakdown & Category Analytics:
    - Donut chart with category percentage allocations, hover states, and dynamic expense tagging.
    - [INSERT SCREENSHOT: Spending Donut Chart & Category Breakdown]
3.7 Intelligent Bank Statement Ingestion:
    - Drag & drop PDF dropzone supporting SBI, HDFC, ICICI, Axis, Kotak, Chase, BofA, and international statements.
    - [INSERT SCREENSHOT: Bank Statement Upload Dropzone & Extracted Table Preview]
3.8 The ReAct AI Advisor Drawer:
    - Interactive conversation with Google Gemini, Thought-Action-Observation inspection, and Human-in-the-Loop (HITL) proposal cards for creating goals and budget caps.
    - [INSERT SCREENSHOT: AI Advisor Drawer with ReAct Reasoning & HITL Approval Card]
3.9 Budget Planner & the 50/30/20 Rule:
    - Categorization into Needs (50%), Wants (30%), and Savings/Investments (20%).
    - [INSERT SCREENSHOT: Budget Planner Interface & Progress Bars]
3.10 Milestone Goals Tracker:
    - Goal progress tracking, target deadlines, calculated monthly required contribution.
    - [INSERT SCREENSHOT: Goals Tracker with Progress Bars]
3.11 Dual Theme Aesthetic:
    - Light Mode ("Drone.io Tech Cloud": #E9F1FA canvas, #00ABE4 blue) vs Dark Mode ("Slumber Midnight Luxury": #0A1828 canvas, #178582 turquoise, #BFA181 gold).
    - [INSERT SCREENSHOT: Light Mode vs Dark Mode Comparison]

--- CHAPTER 4: SYSTEM ARCHITECTURE & DATA TOPOLOGY ---
4.1 The Three-Tier Decoupled Architecture:
    - Client Tier: React 19 SPA with Vite, Recharts, and custom CSS design tokens.
    - Gateway Tier: Node.js Express server acting as the secure reverse proxy, authentication authority, and database synchronizer.
    - Intelligence Tier: Python FastAPI microservice dedicated to heavy computation (PDF extraction, statsmodels ARIMA, Gemini ReAct agent).
4.2 Microservices Communication Flow:
    - Sequence diagram / step-by-step description: Browser -> Express (via REST/JWT) -> FastAPI (internal HTTP) -> Turso libSQL Cloud.
4.3 Cloud Database Architecture:
    - Turso libSQL cloud database with edge replication, TLS encryption, and automated SQLite local fallback for seamless development.

--- CHAPTER 5: THE AI & MATHEMATICAL FORECASTING CORE ---
5.1 The ReAct (Reasoning + Acting) Agent Engine:
    - Plain-English explanation: How the agent thinks before it acts, executes tools, observes data, and formulates final advice.
    - The Tool Registry: `query_spending_summary`, `simulate_savings_timeline`, `calculate_affordability`, `propose_create_goal`, `propose_budget_cap`.
5.2 Human-in-the-Loop (HITL) Safety Architecture:
    - Strict guardrail: The AI cannot modify user financial data directly. It creates a cryptographic proposal that renders an interactive "Approve" or "Reject" card in the UI.
5.3 Statistical Time-Series Forecasting (Zero-Hallucination Machine Learning):
    - Why LLMs are NOT used for numeric cash flow forecasting (eliminating hallucination risk).
    - Mathematical models evaluated: ARIMA (AutoRegressive Integrated Moving Average), SARIMA (Seasonal ARIMA with 12-month periodicity), and Holt-Winters ETS (Exponential Smoothing).
    - Model selection logic: Automated backtesting on historical data using MAPE (Mean Absolute Percentage Error) and RMSE (Root Mean Square Error) to select the "Best Fit" model.
5.4 Deterministic Bank Statement Parsing Engine:
    - In-memory PDF text extraction using `pdfplumber` without sending files to external OCR APIs.
    - Multi-bank regex heuristics handling 19+ Indian and global banks, varying date conventions, Cr/Dr balance indicators, and noisy narrative strings.

--- CHAPTER 6: ENTERPRISE SECURITY, PRIVACY & COMPLIANCE ---
6.1 Privacy-by-Design Philosophy:
    - Bank credentials are never requested; bank statements are processed in volatile memory and never stored as raw PDFs on disk.
6.2 Authentication & Access Control:
    - Bcrypt salted password hashing, JWT stateless authentication with HMAC-SHA256.
6.3 Two-Step Email OTP Delivery via Brevo:
    - Secure out-of-band verification over HTTPS (Port 443) preventing SMTP port-blocking on cloud hosting platforms.
6.4 Brute-Force & Session Protection:
    - Failed login tracking: 5 consecutive failed attempts trigger an automated 15-minute IP/account lockout.
    - Session Inactivity Handler: 13-minute warning modal followed by automatic session termination at 15 minutes of idle time.

--- CHAPTER 7: DESIGN SYSTEM & VISUAL AESTHETICS ---
7.1 Design Philosophy:
    - Moving away from generic bootstrap templates to bespoke, premium fintech styling.
7.2 Color Palettes & Tokens:
    - Detailed token reference table for both Light ("Drone.io Tech Cloud") and Dark ("Slumber Midnight Luxury") modes.
7.3 Typography & Tabular Numerics:
    - Plus Jakarta Sans for high-legibility UI text, and JetBrains Mono with `tabular-nums` for rock-solid financial figures that align perfectly.

--- CHAPTER 8: CLOUD DEPLOYMENT & DEVOPS ---
8.1 Production Cloud Topology:
    - Frontend: Vercel Global Edge CDN with automated HTTPS and rewrite rules.
    - Gateway Server: Render Web Service (Node.js LTS).
    - AI Agent Microservice: Render Web Service (Python 3.11 with libgomp/statsmodels).
    - Database: Turso Cloud (libSQL over HTTP/TLS).
8.2 Environment Configuration & Secrets Management:
    - Clear mapping of environment variables (`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `BREVO_API_KEY`, `GEMINI_API_KEY`, `JWT_SECRET`).

--- CHAPTER 9: DEVELOPER QUICKSTART GUIDE ---
9.1 Prerequisites & System Requirements.
9.2 Local Development Setup (Step-by-step commands for running AI Agent, Express Gateway, and React Frontend concurrently).
9.3 Testing & Pre-Deployment Verification Protocol.

--- CHAPTER 10: PROJECT RETROSPECTIVE & ROADMAP ---
10.1 Key Engineering Challenges & Solutions Encountered by Sai Krishna:
    - Handling messy multi-bank statement formats with irregular table structures.
    - Eliminating LLM hallucination in numeric financial forecasts via statsmodels.
    - Resolving cloud SMTP port blocks by migrating to Brevo's direct HTTPS API.
10.2 Future Roadmap (Multi-currency auto-conversion, tax filing assistant, mobile app PWA).

================================================================================
SCRIPT GENERATION REQUIREMENTS (PYTHON AUTOMATION SUITE):
================================================================================

In addition to writing out the complete documentation text directly in the chat, provide two production-ready Python automation scripts that I can run locally:

SCRIPT 1: `prepare_and_annotate_images.py` (Pillow / PIL Image Processing)
- Reads the raw uploaded screenshots from a `./raw_screenshots/` folder.
- Crops them into focused visual highlights (e.g. Inflow/Outflow metric cards, 12M forecast horizon selector, ReAct HITL approval modal, 50/30/20 budget breakdown).
- Overlays clean, anti-aliased visual annotations:
  * Numbered callout circles (①, ②, ③, ④) using FinGuide Accent Blue `#00ABE4` and Turquoise `#178582`.
  * Highlight rectangles with rounded corners around critical buttons and chart elements.
  * Side-by-side composite images (e.g. Light Mode vs Dark Mode comparison).
- Saves all processed, high-resolution annotated images into an `./images/` folder.

SCRIPT 2: `generate_finguide_docs.py` (python-docx Document Builder)
- Sets document geometry: Standard Letter/A4 with 1-inch margins.
- Applies custom FinGuide design theme:
  * Heading 1: Deep Navy (`#0A1828`), 20pt bold, with a colored accent underline.
  * Heading 2: Turquoise Teal (`#178582`), 14pt bold.
  * Heading 3: Accent Blue (`#00ABE4`), 12pt bold.
  * Body Text: Charcoal (`#2D3748`), 10.5pt, 1.15 line spacing, 4pt space after.
- Includes helper functions:
  * `add_callout_box(doc, text, title="KEY TAKEAWAY", box_type="info")`: Inserts a shaded single-cell table with a 3pt left colored border for plain-English analogies, security notices, and key metrics.
  * `add_styled_table(doc, headers, data, col_widths=None)`: Inserts a table with styled dark navy header rows, white text, alternating row shading (`#F8FAFC` and `#FFFFFF`), and subtle cell borders.
  * `add_screenshot(doc, image_filename, caption_text, figure_num, notes_list=None)`: Checks for the image in `./images/`; if present, inserts it scaled to 5.5 inches wide, centered, with a clean caption paragraph in italicized gray text, followed by the annotated bulleted notes. If the file is not found, inserts an elegant bordered placeholder box showing `[Screenshot: {image_filename} - {caption_text}]`.
- Fully populates all 10 chapters with the rich content generated in Part 1.
- Saves the output as `FinGuide_Professional_Documentation.docx`.

Now, review the uploaded codebase and screenshots, and generate the complete, immaculate professional documentation, the image annotation script, and the python-docx builder script!
```

