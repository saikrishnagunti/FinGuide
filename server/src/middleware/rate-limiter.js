import rateLimit from 'express-rate-limit';

/**
 * Standard API rate limiter.
 * Protects server against DDoS and abusive traffic.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP address. Please slow down and try again later.',
  },
});

/**
 * Strict rate limiter for authentication endpoints:
 * - Login
 * - Request OTP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 requests per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts from this IP address. Please wait a few minutes before trying again.',
  },
});

/**
 * Very strict rate limiter for OTP verification endpoints.
 */
export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25, // Max 25 verification attempts per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many code verification attempts. Please wait 15 minutes before trying again.',
  },
});
