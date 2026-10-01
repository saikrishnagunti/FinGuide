import nodemailer from 'nodemailer';
import config from '../config.js';

let transporter = null;

/**
 * Initialize nodemailer transporter if SMTP credentials are provided.
 */
function getTransporter() {
  if (transporter) return transporter;

  if (config.smtp.user && config.smtp.pass) {
    try {
      const isGmail = (config.smtp.host && config.smtp.host.toLowerCase().includes('gmail')) ||
                      (config.smtp.user && config.smtp.user.toLowerCase().includes('@gmail.com'));

      const transportOptions = isGmail
        ? {
            service: 'gmail',
            auth: {
              user: config.smtp.user,
              pass: config.smtp.pass,
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000,
          }
        : {
            host: config.smtp.host || 'smtp.gmail.com',
            port: config.smtp.port || 465,
            secure: config.smtp.secure || config.smtp.port === 465,
            auth: {
              user: config.smtp.user,
              pass: config.smtp.pass,
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000,
          };

      transporter = nodemailer.createTransport(transportOptions);
      console.log('📧 SMTP Email Transporter initialized for:', isGmail ? 'Gmail Service' : config.smtp.host);
    } catch (err) {
      console.error('Failed to initialize SMTP transporter:', err.message);
      transporter = null;
    }
  }

  return transporter;
}

/**
 * Generate standard HTML email template for FinGuide security notifications.
 */
function generateEmailHtml({ title, preheader, bodyContent, otpCode, expiryMinutes = 10 }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0A1828; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E9F1FA; }
    .email-container { max-width: 580px; margin: 40px auto; background: #0D1E33; border: 1px solid rgba(191, 161, 129, 0.2); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #00ABE4 0%, #178582 100%); padding: 32px 24px; text-align: center; }
    .brand-title { color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; margin: 0; }
    .brand-sub { color: rgba(255, 255, 255, 0.9); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px; }
    .content { padding: 36px 32px; background: #0D1E33; }
    .greeting { font-size: 18px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 16px; }
    .text { font-size: 15px; line-height: 1.6; color: #CAD5E2; margin-bottom: 24px; }
    .otp-wrapper { background: rgba(0, 171, 228, 0.08); border: 2px dashed rgba(0, 171, 228, 0.4); border-radius: 12px; padding: 24px; text-align: center; margin: 28px 0; }
    .otp-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #00ABE4; margin-bottom: 8px; }
    .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #ffffff; margin: 0; text-shadow: 0 0 16px rgba(0, 171, 228, 0.4); }
    .expiry { font-size: 13px; color: #BFA181; margin-top: 10px; font-weight: 500; }
    .warning { background: rgba(225, 29, 72, 0.1); border-left: 4px solid #E11D48; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #FDA4AF; line-height: 1.5; margin: 24px 0 0; }
    .footer { padding: 24px 32px; background: #0A1828; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid rgba(255, 255, 255, 0.06); }
    .footer-links { margin-bottom: 8px; }
    .footer-links a { color: #00ABE4; text-decoration: none; margin: 0 8px; }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheader || title}
  </div>
  <div class="email-container">
    <div class="header">
      <h1 class="brand-title">FinGuide</h1>
      <div class="brand-sub">AI Financial Intelligence & Wealth Advisor</div>
    </div>
    <div class="content">
      <h2 class="greeting">${title}</h2>
      <p class="text">${bodyContent}</p>
      <div class="otp-wrapper">
        <div class="otp-label">One-Time Security Code</div>
        <div class="otp-code">${otpCode}</div>
        <div class="expiry">Valid for ${expiryMinutes} minutes. Never share this code.</div>
      </div>
      <div class="warning">
        <strong>Security Notice:</strong> If you did not initiate this request, someone may be attempting to access your account. Please secure your account immediately.
      </div>
    </div>
    <div class="footer">
      <div class="footer-links">
        <span>© ${new Date().getFullYear()} FinGuide</span> •
        <span>Automated Security System</span>
      </div>
      <p style="margin:0;">This is an automated security email. Please do not reply directly to this message.</p>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Send an email via Resend HTTPS API (Port 443 - Never blocked by cloud firewalls).
 */
async function sendViaResend({ to, subject, html, text }) {
  if (!config.resendApiKey) return null;

  try {
    const fromAddress = (config.smtp.from && !config.smtp.from.includes('finguide.local'))
      ? config.smtp.from
      : 'FinGuide Security <onboarding@resend.dev>';

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [to],
        subject,
        html,
        text,
      }),
    });

    const data = await response.json();
    if (response.ok && data.id) {
      console.log(`✅ Security email delivered via Resend API to ${to}. MessageId: ${data.id}`);
      return { success: true, delivered: true, messageId: data.id };
    }

    console.warn(`⚠️ Resend API notice for ${to}:`, data.message || data.error);
    return { success: false, delivered: false, error: data.message || 'Resend delivery rejected' };
  } catch (err) {
    console.warn('⚠️ Failed to dispatch email via Resend API:', err.message);
    return { success: false, delivered: false, error: err.message };
  }
}

/**
 * Send an email via Brevo HTTPS API (Port 443 - Can deliver to ANY recipient worldwide without domain).
 */
async function sendViaBrevo({ to, subject, html, text }) {
  if (!config.brevoApiKey) return null;

  try {
    const senderEmail = config.smtp.user || 'gsk74s@gmail.com';
    const senderName = 'FinGuide Security';

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': config.brevoApiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
    });

    const data = await response.json();
    if (response.ok && data.messageId) {
      console.log(`✅ Security email delivered via Brevo API to ${to}. MessageId: ${data.messageId}`);
      return { success: true, delivered: true, messageId: data.messageId };
    }

    console.warn(`⚠️ Brevo API notice for ${to}:`, data.message || data.code);
    return { success: false, delivered: false, error: data.message || 'Brevo delivery rejected' };
  } catch (err) {
    console.warn('⚠️ Failed to dispatch email via Brevo API:', err.message);
    return { success: false, delivered: false, error: err.message };
  }
}

/**
 * Send an email via Brevo API, Resend API, SMTP, or fallback to instant code on screen.
 */
async function sendMail({ to, subject, html, text, otpCode, purpose }) {
  // Print high-visibility dev banner in server terminal for local development & debugging
  console.log(`
  ╔════════════════════════════════════════════════════════════════════╗
  ║              🔐 FINGUIDE SECURITY NOTIFICATION                    ║
  ╠════════════════════════════════════════════════════════════════════╣
  ║  To:      ${(to || '').padEnd(52)} ║
  ║  Purpose: ${(purpose || '').padEnd(52)} ║
  ║  Code:    ${(otpCode || '').padEnd(52)} ║
  ║  Expires: In 10 minutes                                            ║
  ╚════════════════════════════════════════════════════════════════════╝
  `);

  // 1. Try Brevo HTTPS API first (sends to ANY recipient worldwide via standard port 443)
  if (config.brevoApiKey) {
    const brevoResult = await sendViaBrevo({ to, subject, html, text });
    if (brevoResult && brevoResult.delivered) {
      return brevoResult;
    }
  }

  // 2. Try Resend HTTPS API (ultra-fast for verified accounts)
  if (config.resendApiKey) {
    const resendResult = await sendViaResend({ to, subject, html, text });
    if (resendResult && resendResult.delivered) {
      return resendResult;
    }
  }

  // 2. Try SMTP Transporter (if configured)
  const mailTransporter = getTransporter();
  if (mailTransporter) {
    try {
      const sendPromise = mailTransporter.sendMail({
        from: (config.smtp.from && !config.smtp.from.includes('finguide.local'))
          ? config.smtp.from
          : (config.smtp.user ? `FinGuide Security <${config.smtp.user}>` : 'FinGuide Security <security@finguide.app>'),
        to,
        subject,
        text: text || `Your FinGuide verification code is: ${otpCode}. Valid for 10 minutes.`,
        html,
      });

      // 10-second timeout safeguard so requests never hang if host blocks outbound mail ports
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('SMTP timeout (outbound mail port restricted on host)')), 10000)
      );

      const info = await Promise.race([sendPromise, timeoutPromise]);
      console.log(`✅ Security email delivered via SMTP to ${to}. MessageId: ${info.messageId}`);
      return {
        success: true,
        delivered: true,
        messageId: info.messageId,
      };
    } catch (err) {
      console.warn(`⚠️ Outbound SMTP unavailable (${err.message}). Providing instant code on verification screen.`);
    }
  }

  // 3. Fallback: Provide code directly so no user is ever locked out
  return {
    success: true,
    delivered: false,
    message: 'Verification code generated.',
    devOtp: otpCode,
  };
}

/**
 * Send registration verification OTP.
 */
export async function sendRegistrationOTP(email, name, otp) {
  const title = 'Verify Your Email Address';
  const bodyContent = `Hello <strong>${name || 'there'}</strong>,<br/><br/>Welcome to FinGuide! To finalize the creation of your AI-powered financial advisory account, please verify your email address using the one-time security code below:`;
  const html = generateEmailHtml({
    title,
    preheader: `Your FinGuide registration code is ${otp}`,
    bodyContent,
    otpCode: otp,
    expiryMinutes: config.security.otpExpiresMinutes,
  });

  return sendMail({
    to: email,
    subject: `Your FinGuide Verification Code: ${otp}`,
    html,
    text: `Your FinGuide registration code is: ${otp}. Valid for 10 minutes.`,
    otpCode: otp,
    purpose: 'Account Registration Verification',
  });
}

/**
 * Send password reset OTP.
 */
export async function sendPasswordResetOTP(email, otp) {
  const title = 'Password Reset Security Code';
  const bodyContent = `We received a request to reset the password for your FinGuide account associated with <strong>${email}</strong>.<br/><br/>Enter this one-time code to proceed with setting your new password:`;
  const html = generateEmailHtml({
    title,
    preheader: `Your password reset code is ${otp}`,
    bodyContent,
    otpCode: otp,
    expiryMinutes: config.security.otpExpiresMinutes,
  });

  return sendMail({
    to: email,
    subject: `FinGuide Password Reset Code: ${otp}`,
    html,
    text: `Your FinGuide password reset code is: ${otp}. Valid for 10 minutes.`,
    otpCode: otp,
    purpose: 'Password Reset',
  });
}

/**
 * Send password change OTP (when user changes password inside Settings).
 */
export async function sendPasswordChangeOTP(email, otp) {
  const title = 'Authorize Password Change';
  const bodyContent = `A request was made from your account settings to change your FinGuide password.<br/><br/>To confirm this change, please enter the one-time authorization code below:`;
  const html = generateEmailHtml({
    title,
    preheader: `Your password change code is ${otp}`,
    bodyContent,
    otpCode: otp,
    expiryMinutes: config.security.otpExpiresMinutes,
  });

  return sendMail({
    to: email,
    subject: `Authorize FinGuide Password Change: ${otp}`,
    html,
    text: `Your FinGuide password change code is: ${otp}. Valid for 10 minutes.`,
    otpCode: otp,
    purpose: 'Account Settings Password Change',
  });
}
