<div align="right">
<span style="background: #F3E8FF; color: #7E22CE; padding: 5px 16px; border-radius: 9999px; font-size: 12px; font-weight: 700; letter-spacing: 0.2px;">Turn ideas into products.</span>
</div>

# 📄 PRD.md
# Product Requirements Document
<p style="color: #64748B; font-size: 16px; margin-top: -6px;">A clear plan for what we're building, why it matters, and how we'll make it happen.</p>

---

<h3 style="color: #0F172A; margin-bottom: 8px;"><span style="color: #9333EA; font-weight: 800;">01</span> Product Overview</h3>

<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.02); margin-bottom: 24px;">
<table style="width: 100%; border-collapse: collapse; font-size: 13px;">
<tbody>
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 10px 0; width: 140px; font-weight: 700; color: #64748B;">Product Name</td>
<td style="padding: 10px 0; font-weight: 800; color: #0F172A;">FinGuide — AI Financial Intelligence & Wealth OS</td>
</tr>
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 10px 0; font-weight: 700; color: #64748B;">Tagline</td>
<td style="padding: 10px 0; color: #334155;">Autonomous personal financial advisory, bank statement verification, and predictive wealth forecasting powered by AI.</td>
</tr>
<tr>
<td style="padding: 10px 0; font-weight: 700; color: #64748B; vertical-align: top;">Description</td>
<td style="padding: 10px 0; color: #334155; line-height: 1.6;">
An intelligent, privacy-first personal finance platform that bridges the gap between raw bank statements and actionable wealth building. By combining deterministic statement extraction (pdfplumber), statistical cash-flow modeling (ARIMA/SARIMA), and Gemini 3.5 Flash Lite reasoning with Human-in-the-Loop review, FinGuide empowers users to eliminate debt and systematically grow their net worth.
</td>
</tr>
</tbody>
</table>
</div>

<div style="margin-bottom: 24px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
<span style="color: #EC4899; font-weight: 800; font-size: 16px;">02</span>
<h3 style="color: #0F172A; margin: 0; font-size: 16px;">Problem</h3>
</div>
<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.02); font-size: 13px; line-height: 1.6; color: #475569;">
Managing personal finances today is fragmented, tedious, and anxiety-inducing. Spreadsheets require painful manual data entry that users inevitably abandon within weeks. Open-banking aggregators demand intrusive login credentials that privacy-conscious individuals refuse to grant. Furthermore, traditional budgeting tools display passive historical charts without proactive, actionable answers to forward-looking questions like <em>"Can I afford a ₹50,000 purchase in 4 months without draining my emergency fund?"</em>
</div>
</div>

<div style="margin-bottom: 24px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
<span style="color: #3B82F6; font-weight: 800; font-size: 16px;">03</span>
<h3 style="color: #0F172A; margin: 0; font-size: 16px;">Goal</h3>
</div>
<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.02); font-size: 13px; line-height: 1.6; color: #475569;">
Help users gain complete financial clarity in <strong>under 2 minutes</strong> by uploading their bank statement, reviewing verified transactions, and receiving tailored AI guidance with <strong>100% user control and privacy</strong>.
</div>
</div>

<div style="margin-bottom: 24px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
<span style="color: #10B981; font-weight: 800; font-size: 16px;">04</span>
<h3 style="color: #0F172A; margin: 0; font-size: 16px;">Target Users</h3>
</div>

<div style="display: flex; gap: 16px; flex-wrap: wrap;">

<div style="flex: 1; min-width: 280px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #334155; line-height: 1.9;">
<li><strong>Salaried Professionals</strong> seeking automated categorization and savings rate tracking</li>
<li><strong>Freelancers & Contractors</strong> with irregular cash flow needing trajectory forecasts</li>
<li><strong>Households & Couples</strong> planning budgets, debt reduction, and milestone savings</li>
<li><strong>Privacy-Conscious Individuals</strong> who refuse to link bank login credentials</li>
</ul>
</div>

<div style="flex: 1; min-width: 280px; background: #FAF5FF; border: 1px solid #E9D5FF; border-radius: 14px; padding: 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
<span style="font-size: 16px;">👤</span>
<strong style="color: #7E22CE; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">User Need</strong>
</div>
<p style="font-size: 13px; font-style: italic; color: #581C87; margin: 0; line-height: 1.6;">
"I want a smart financial companion that analyzes my actual bank statements, gives me honest advice about my spending habits, and helps me plan purchases — without selling my data or asking for my bank password."
</p>
</div>

</div>
</div>

<div style="margin-bottom: 24px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
<span style="color: #F59E0B; font-weight: 800; font-size: 16px;">05</span>
<h3 style="color: #0F172A; margin: 0; font-size: 16px;">Core Features</h3>
</div>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px;">

<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 16px; text-align: center; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<div style="width: 44px; height: 44px; border-radius: 50%; background: #FCE7F3; color: #DB2777; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; font-size: 20px;">📄</div>
<div style="font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 4px;">Statement Upload</div>
<div style="font-size: 11px; color: #64748B; line-height: 1.4;">Drag & drop bank PDFs or CSVs with interactive preview</div>
</div>

<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 16px; text-align: center; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<div style="width: 44px; height: 44px; border-radius: 50%; background: #EDE9FE; color: #7C3AED; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; font-size: 20px;">📊</div>
<div style="font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 4px;">Financial Health Audit</div>
<div style="font-size: 11px; color: #64748B; line-height: 1.4;">Instant vitals, spending breakdown, and diagnostics</div>
</div>

<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 16px; text-align: center; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<div style="width: 44px; height: 44px; border-radius: 50%; background: #E0F2FE; color: #0284C7; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; font-size: 20px;">📈</div>
<div style="font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 4px;">Predictive Forecasts</div>
<div style="font-size: 11px; color: #64748B; line-height: 1.4;">Statistical models predicting cash flow trajectories</div>
</div>

<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 16px; text-align: center; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<div style="width: 44px; height: 44px; border-radius: 50%; background: #DCFCE7; color: #16A34A; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; font-size: 20px;">🤖</div>
<div style="font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 4px;">AI Advisor & Actions</div>
<div style="font-size: 11px; color: #64748B; line-height: 1.4;">Contextual queries with human approval cards</div>
</div>

<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 16px; text-align: center; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<div style="width: 44px; height: 44px; border-radius: 50%; background: #FEF3C7; color: #D97706; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; font-size: 20px;">🛡️</div>
<div style="font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 4px;">Security Suite</div>
<div style="font-size: 11px; color: #64748B; line-height: 1.4;">Two-step OTP, 15m lockout, and idle auto-logout</div>
</div>

</div>
</div>

<div style="margin-bottom: 24px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
<span style="color: #6366F1; font-weight: 800; font-size: 16px;">06</span>
<h3 style="color: #0F172A; margin: 0; font-size: 16px;">Success Metrics</h3>
</div>

<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #334155; line-height: 1.9;">
<li><strong>Statement Extraction Accuracy:</strong> &gt; 98.5% across major bank statement PDF formats</li>
<li><strong>Time to First Financial Audit:</strong> Under 60 seconds from file upload</li>
<li><strong>User Action Adoption:</strong> &gt; 70% of proposed budgets & goals approved by users</li>
<li><strong>Session Security Integrity:</strong> 100% unattended sessions locked after 15 minutes of inactivity</li>
<li><strong>User Satisfaction Score:</strong> &ge; 4.8 / 5.0 in user budgeting clarity</li>
</ul>
</div>
</div>
