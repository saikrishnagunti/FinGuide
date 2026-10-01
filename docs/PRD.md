<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 24px; color: #0F172A;">

<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
  <div style="font-size: 13px; color: #64748B;">docs &gt; <strong>PRD.md</strong></div>
  <span style="background: #F3E8FF; color: #7E22CE; padding: 5px 16px; border-radius: 9999px; font-size: 12px; font-weight: 700; letter-spacing: 0.2px;">Turn ideas into products.</span>
</div>

<h1 style="font-size: 34px; font-weight: 800; color: #0F172A; margin: 6px 0 8px; letter-spacing: -0.5px;">Product Requirements Document</h1>
<p style="font-size: 15px; color: #64748B; margin: 0 0 28px;">A clear plan for what we're building, why it matters, and how we'll make it happen.</p>

<!-- 01 Product Overview -->
<div style="margin-bottom: 28px;">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
    <span style="color: #9333EA; font-weight: 800; font-size: 18px;">01</span>
    <h2 style="font-size: 18px; font-weight: 700; color: #0F172A; margin: 0;">Product Overview</h2>
  </div>
  
  <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
    <table style="width: 100%; border-collapse: collapse;">
      <tr style="border-bottom: 1px solid #F1F5F9;">
        <td style="padding: 10px 0; width: 140px; font-weight: 600; color: #64748B; font-size: 14px;">Product Name</td>
        <td style="padding: 10px 0; font-weight: 700; color: #0F172A; font-size: 14px;">FinGuide — AI Financial Intelligence & Wealth OS</td>
      </tr>
      <tr style="border-bottom: 1px solid #F1F5F9;">
        <td style="padding: 10px 0; font-weight: 600; color: #64748B; font-size: 14px;">Tagline</td>
        <td style="padding: 10px 0; color: #334155; font-size: 14px;">Autonomous financial clarity, smart budgeting, and wealth forecasting powered by AI.</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; font-weight: 600; color: #64748B; font-size: 14px; vertical-align: top;">Description</td>
        <td style="padding: 10px 0; color: #334155; font-size: 14px; line-height: 1.5;">An intelligent, privacy-first personal finance platform that bridges the gap between raw bank statements and actionable wealth management. By combining deterministic statement extraction, statistical cash-flow modeling (ARIMA/SARIMA/ETS), and Gemini 3.5 Flash Lite reasoning with Human-in-the-Loop review, FinGuide empowers users to eliminate debt and systematically build wealth.</td>
      </tr>
    </table>
  </div>
</div>

<!-- 02 Problem -->
<div style="margin-bottom: 28px;">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
    <span style="color: #EC4899; font-weight: 800; font-size: 18px;">02</span>
    <h2 style="font-size: 18px; font-weight: 700; color: #0F172A; margin: 0;">Problem</h2>
  </div>
  <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0;">
    Managing personal finances today is fragmented, tedious, and anxiety-inducing. Spreadsheets require painful manual data entry that users inevitably abandon. Open-banking aggregators demand intrusive credentials that privacy-conscious individuals refuse to grant. Furthermore, traditional budgeting tools display passive historical charts without proactive, actionable answers to forward-looking questions like <em>"Can I afford a ₹50,000 purchase in 4 months without draining my emergency fund?"</em>
  </p>
</div>

<!-- 03 Goal -->
<div style="margin-bottom: 28px;">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
    <span style="color: #3B82F6; font-weight: 800; font-size: 18px;">03</span>
    <h2 style="font-size: 18px; font-weight: 700; color: #0F172A; margin: 0;">Goal</h2>
  </div>
  <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0;">
    Help users gain complete financial clarity in <strong>under 2 minutes</strong> by uploading their bank statement, reviewing verified transactions, and receiving tailored AI guidance with <strong>100% user control and privacy</strong>.
  </p>
</div>

<!-- 04 Target Users -->
<div style="margin-bottom: 32px;">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
    <span style="color: #10B981; font-weight: 800; font-size: 18px;">04</span>
    <h2 style="font-size: 18px; font-weight: 700; color: #0F172A; margin: 0;">Target Users</h2>
  </div>
  
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
    <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px;">
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #334155; line-height: 1.8;">
        <li><strong>Salaried Professionals</strong> seeking automated categorization and savings rate tracking</li>
        <li><strong>Freelancers & Contractors</strong> with irregular cash flow needing trajectory forecasts</li>
        <li><strong>Households & Couples</strong> planning budgets, debt reduction, and milestone savings</li>
        <li><strong>Privacy-Conscious Individuals</strong> who refuse to link bank login credentials</li>
      </ul>
    </div>
    
    <div style="background: #FAF5FF; border: 1px solid #E9D5FF; border-radius: 12px; padding: 18px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="font-size: 16px;">👤</span>
        <strong style="color: #7E22CE; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">User Need</strong>
      </div>
      <p style="font-size: 14px; font-style: italic; color: #581C87; margin: 0; line-height: 1.5;">
        "I want a smart financial companion that analyzes my actual bank statements, gives me honest advice about my spending habits, and helps me plan purchases — without selling my data or asking for my bank password."
      </p>
    </div>
  </div>
</div>

<!-- 05 Core Features -->
<div style="margin-bottom: 32px;">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
    <span style="color: #F59E0B; font-weight: 800; font-size: 18px;">05</span>
    <h2 style="font-size: 18px; font-weight: 700; color: #0F172A; margin: 0;">Core Features</h2>
  </div>
  
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px;">
    <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; text-align: center;">
      <div style="width: 42px; height: 42px; border-radius: 50%; background: #FCE7F3; color: #DB2777; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; font-size: 20px;">📄</div>
      <div style="font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 4px;">Statement Upload</div>
      <div style="font-size: 11px; color: #64748B; line-height: 1.4;">Drag & drop bank PDFs or CSVs with interactive preview</div>
    </div>
    
    <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; text-align: center;">
      <div style="width: 42px; height: 42px; border-radius: 50%; background: #EDE9FE; color: #7C3AED; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; font-size: 20px;">📊</div>
      <div style="font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 4px;">Financial Health Audit</div>
      <div style="font-size: 11px; color: #64748B; line-height: 1.4;">Instant vitals, spending breakdown, and diagnostics</div>
    </div>
    
    <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; text-align: center;">
      <div style="width: 42px; height: 42px; border-radius: 50%; background: #E0F2FE; color: #0284C7; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; font-size: 20px;">📈</div>
      <div style="font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 4px;">Predictive Forecasts</div>
      <div style="font-size: 11px; color: #64748B; line-height: 1.4;">Statistical models predicting cash flow trajectories</div>
    </div>
    
    <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; text-align: center;">
      <div style="width: 42px; height: 42px; border-radius: 50%; background: #DCFCE7; color: #16A34A; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; font-size: 20px;">🤖</div>
      <div style="font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 4px;">AI Advisor & Approvals</div>
      <div style="font-size: 11px; color: #64748B; line-height: 1.4;">Contextual queries with human approval cards</div>
    </div>
    
    <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; text-align: center;">
      <div style="width: 42px; height: 42px; border-radius: 50%; background: #FEF3C7; color: #D97706; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; font-size: 20px;">🛡️</div>
      <div style="font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 4px;">Security Suite</div>
      <div style="font-size: 11px; color: #64748B; line-height: 1.4;">Two-step OTP, 15m lockout, and inactivity auto-logout</div>
    </div>
  </div>
</div>

<!-- 06 Success Metrics -->
<div>
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
    <span style="color: #6366F1; font-weight: 800; font-size: 18px;">06</span>
    <h2 style="font-size: 18px; font-weight: 700; color: #0F172A; margin: 0;">Success Metrics</h2>
  </div>
  
  <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px;">
    <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #334155; line-height: 1.8;">
      <li><strong>Statement Extraction Accuracy:</strong> &gt; 98.5% across major bank statement PDF formats</li>
      <li><strong>Time to First Financial Audit:</strong> Under 60 seconds from file upload</li>
      <li><strong>User Action Adoption:</strong> &gt; 70% of proposed budgets & goals approved by users</li>
      <li><strong>Session Security Integrity:</strong> 100% unattended sessions locked after 15 minutes of inactivity</li>
      <li><strong>User Satisfaction Score:</strong> &ge; 4.8 / 5.0 in user budgeting clarity</li>
    </ul>
  </div>
</div>

</div>
