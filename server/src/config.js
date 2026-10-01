import 'dotenv/config';

function sanitizeUrl(rawUrl, fallback = 'http://127.0.0.1:8000') {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return fallback;
  }
  let trimmed = rawUrl.trim().replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(trimmed)) {
    if (trimmed.includes('localhost') || trimmed.includes('127.0.0.1') || /:\d+$/.test(trimmed)) {
      trimmed = `http://${trimmed}`;
    } else {
      trimmed = `https://${trimmed}`;
    }
  }
  try {
    new URL(trimmed);
    return trimmed;
  } catch {
    return fallback;
  }
}

const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  secretKey: process.env.SECRET_KEY || 'dev-secret-key-change-me',
  databasePath: process.env.DATABASE_PATH || './data/finguide.db',
  tursoDatabaseUrl: process.env.TURSO_DATABASE_URL || '',
  tursoAuthToken: process.env.TURSO_AUTH_TOKEN || '',
  agentServiceUrl: sanitizeUrl(process.env.AGENT_SERVICE_URL, 'http://127.0.0.1:8000'),
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  uploadDir: process.env.UPLOAD_DIR || './data/uploads',
  jwtExpiresIn: '7d',
  corsOrigin: process.env.CORS_ORIGIN || '',
  resendApiKey: process.env.RESEND_API_KEY || '',
  brevoApiKey: process.env.BREVO_API_KEY || '',

  // Email / SMTP Settings
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'FinGuide Security <security@finguide.local>',
  },

  // Security Policy Settings
  security: {
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 15,
    otpExpiresMinutes: 10,
    otpMaxVerifyAttempts: 5,
    inactivityTimeoutMinutes: 15,
  },
};

export default config;
