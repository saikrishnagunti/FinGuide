<div align="right">
<span style="background: #FEE2E2; color: #B91C1C; padding: 5px 16px; border-radius: 9999px; font-size: 12px; font-weight: 700; letter-spacing: 0.2px;">Zero trust. Defense in depth. Private.</span>
</div>

# 🛡️ SECURITY.md
# Security Architecture
<p style="color: #64748B; font-size: 16px; margin-top: -6px;">Threat model, authentication protocols, rate limiting, and data privacy safeguards.</p>

---

<div style="margin-bottom: 24px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
<span style="color: #9333EA; font-weight: 800; font-size: 16px;">01</span>
<h3 style="color: #0F172A; margin: 0; font-size: 16px;">Core Security Principles</h3>
</div>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
<div style="background: #EFF6FF; border: 1px solid #DBEAFE; border-radius: 12px; padding: 16px;">
<div style="font-size: 22px; margin-bottom: 4px;">🛡️</div>
<div style="font-size: 13px; font-weight: 700; color: #1E40AF; margin-bottom: 4px;">Defense in Depth</div>
<div style="font-size: 11px; color: #3B82F6; line-height: 1.4;">Multiple overlapping layers: rate limiting, OTPs, lockout, and idle session auto-logout.</div>
</div>

<div style="background: #F0FDF4; border: 1px solid #DCFCE7; border-radius: 12px; padding: 16px;">
<div style="font-size: 22px; margin-bottom: 4px;">🔒</div>
<div style="font-size: 13px; font-weight: 700; color: #166534; margin-bottom: 4px;">Zero-Knowledge Ingestion</div>
<div style="font-size: 11px; color: #16A34A; line-height: 1.4;">Bank statements are parsed securely in memory. No banking passwords are ever requested.</div>
</div>

<div style="background: #FAF5FF; border: 1px solid #E9D5FF; border-radius: 12px; padding: 16px;">
<div style="font-size: 22px; margin-bottom: 4px;">👤</div>
<div style="font-size: 13px; font-weight: 700; color: #6B21A8; margin-bottom: 4px;">Human Confirmation</div>
<div style="font-size: 11px; color: #9333EA; line-height: 1.4;">AI cannot create or modify budgets or goals without the user clicking explicit approval.</div>
</div>

<div style="background: #FFFBEB; border: 1px solid #FEF3C7; border-radius: 12px; padding: 16px;">
<div style="font-size: 22px; margin-bottom: 4px;">📜</div>
<div style="font-size: 13px; font-weight: 700; color: #92400E; margin-bottom: 4px;">Audit Accountability</div>
<div style="font-size: 11px; color: #B45309; line-height: 1.4;">Tamper-evident logs record logins, password updates, exports, and account changes.</div>
</div>
</div>
</div>

<div style="display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;">

<div style="flex: 1; min-width: 280px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
<span style="color: #EC4899; font-weight: 800; font-size: 16px;">02</span>
<h3 style="color: #0F172A; margin: 0; font-size: 16px;">Password Policy</h3>
</div>
<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<div style="font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 8px;">Enforced Criteria:</div>
<div style="font-size: 12px; color: #334155; line-height: 1.8;">
<div>✔ <strong>Min 8 characters</strong> in length</div>
<div>✔ <strong>Uppercase letter</strong> (A&ndash;Z)</div>
<div>✔ <strong>Lowercase letter</strong> (a&ndash;z)</div>
<div>✔ <strong>Number</strong> (0&ndash;9)</div>
<div>✔ <strong>Special symbol</strong> (!@#$%^&*...)</div>
</div>
<div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #F1F5F9; font-size: 11px; color: #64748B;">
🔒 Hashed with <strong>bcrypt</strong> (cost factor = 12). Raw passwords never hit logs or persistent disk storage.
</div>
</div>
</div>

<div style="flex: 1; min-width: 280px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
<span style="color: #3B82F6; font-weight: 800; font-size: 16px;">03</span>
<h3 style="color: #0F172A; margin: 0; font-size: 16px;">Two-Step Email OTP</h3>
</div>
<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<div style="display: flex; flex-direction: column; gap: 8px; font-size: 12px; color: #334155;">
<div style="background: #F8FAFC; padding: 8px 12px; border-radius: 8px; border: 1px solid #E2E8F0;">
<strong>Account Registration:</strong> Code sent to confirm email before account creation.
</div>
<div style="background: #F8FAFC; padding: 8px 12px; border-radius: 8px; border: 1px solid #E2E8F0;">
<strong>Forgot Password:</strong> 6-digit one-time code required before password reset.
</div>
<div style="background: #F8FAFC; padding: 8px 12px; border-radius: 8px; border: 1px solid #E2E8F0;">
<strong>Settings Password Change:</strong> Email verification required to change password.
</div>
</div>
<div style="margin-top: 10px; font-size: 11px; color: #64748B;">
⏱️ 10-minute expiry &bull; 5-attempt anti-brute force revocation &bull; Single-use consumption
</div>
</div>
</div>

</div>

<div style="display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;">

<div style="flex: 1; min-width: 280px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
<span style="color: #E11D48; font-weight: 800; font-size: 16px;">04</span>
<h3 style="color: #0F172A; margin: 0; font-size: 16px;">Failed Login Lockout</h3>
</div>
<div style="background: #FFF1F2; border: 1px solid #FFE4E6; border-radius: 14px; padding: 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
<span style="font-size: 18px;">⏱️</span>
<strong style="color: #9F1239; font-size: 13px;">15-Minute Cooldown Lockout</strong>
</div>
<p style="font-size: 12px; color: #881337; line-height: 1.5; margin: 0 0 10px;">
Tracks consecutive failed attempts by IP and email. Upon the <strong>5th failed attempt</strong>, authentication is temporarily locked out for 15 minutes.
</p>
<div style="background: #FFFFFF; border: 1px solid #FECDD3; border-radius: 8px; padding: 8px 12px; font-size: 11px; color: #9F1239;">
UI features a live countdown timer banner and locks the submit button until cooldown expires.
</div>
</div>
</div>

<div style="flex: 1; min-width: 280px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
<span style="color: #F59E0B; font-weight: 800; font-size: 16px;">05</span>
<h3 style="color: #0F172A; margin: 0; font-size: 16px;">Inactivity Auto-Logout</h3>
</div>
<div style="background: #FFFBEB; border: 1px solid #FEF3C7; border-radius: 14px; padding: 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
<span style="font-size: 18px;">🔔</span>
<strong style="color: #92400E; font-size: 13px;">15-Minute Idle Detection</strong>
</div>
<p style="font-size: 12px; color: #78350F; line-height: 1.5; margin: 0 0 10px;">
Monitors mouse movement, typing, and scrolling. If no activity is detected for 13 minutes, a countdown warning modal appears for 120 seconds.
</p>
<div style="background: #FFFFFF; border: 1px solid #FDE68A; border-radius: 8px; padding: 8px 12px; font-size: 11px; color: #92400E;">
Users can click "Keep Working" or the system safely logs out to keep ledger records private.
</div>
</div>
</div>

</div>

<div style="margin-bottom: 24px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
<span style="color: #6366F1; font-weight: 800; font-size: 16px;">06</span>
<h3 style="color: #0F172A; margin: 0; font-size: 16px;">Security Audit Trail</h3>
</div>

<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
<table style="width: 100%; border-collapse: collapse; font-size: 12px;">
<thead>
<tr style="text-align: left; color: #64748B; border-bottom: 1px solid #E2E8F0;">
<th style="padding: 8px 0;">Action Name</th>
<th>User-Facing Badge</th>
<th>Trigger Description</th>
</tr>
</thead>
<tbody style="color: #334155;">
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 8px 0; font-family: monospace;">LOGIN_SUCCESS</td>
<td><span style="background: rgba(23, 133, 130, 0.12); color: #178582; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 11px;">Signed In</span></td>
<td>User authenticated with valid password</td>
</tr>
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 8px 0; font-family: monospace;">LOGIN_FAILED</td>
<td><span style="background: rgba(225, 29, 72, 0.1); color: #E11D48; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 11px;">Sign-In Failed</span></td>
<td>Incorrect password submitted</td>
</tr>
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 8px 0; font-family: monospace;">ACCOUNT_LOCKED</td>
<td><span style="background: rgba(225, 29, 72, 0.1); color: #E11D48; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 11px;">Account Locked</span></td>
<td>15m cooldown initiated after 5 failed attempts</td>
</tr>
<tr style="border-bottom: 1px solid #F1F5F9;">
<td style="padding: 8px 0; font-family: monospace;">PASSWORD_CHANGED</td>
<td><span style="background: rgba(23, 133, 130, 0.12); color: #178582; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 11px;">Password Changed</span></td>
<td>Password updated with verified email authorization code</td>
</tr>
<tr>
<td style="padding: 8px 0; font-family: monospace;">DATA_EXPORTED</td>
<td><span style="background: rgba(0, 171, 228, 0.12); color: #00ABE4; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 11px;">Backup Downloaded</span></td>
<td>User downloaded JSON or CSV financial backup</td>
</tr>
</tbody>
</table>
</div>
</div>
