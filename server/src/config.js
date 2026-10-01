import 'dotenv/config';

const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  secretKey: process.env.SECRET_KEY || 'dev-secret-key-change-me',
  databasePath: process.env.DATABASE_PATH || './data/finguide.db',
  agentServiceUrl: process.env.AGENT_SERVICE_URL || 'http://127.0.0.1:8000',
  uploadDir: process.env.UPLOAD_DIR || './data/uploads',
  jwtExpiresIn: '7d',
  corsOrigin: process.env.CORS_ORIGIN || '',

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
