import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const generalLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      data: null,
      error: {
        message: 'Too many requests from this IP, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        details: null,
      },
      meta: null,
    });
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.rateLimit.authMax, // strict limit (15 requests per 15 min)
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      data: null,
      error: {
        message: 'Too many authentication attempts. Please wait 15 minutes before retrying.',
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        details: null,
      },
      meta: null,
    });
  },
});
