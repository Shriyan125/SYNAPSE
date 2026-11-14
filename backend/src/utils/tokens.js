import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';

export const REFRESH_COOKIE_NAME = 'synapse_refresh_token';

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
  maxAge: env.jwt.refreshExpirationDays * 24 * 60 * 60 * 1000,
  path: '/',
};

/**
 * Sign JWT access token (15 minutes)
 * @param {object} payload - { id, email, role, full_name }
 * @returns {string}
 */
export const signAccessToken = (payload) => {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiration,
  });
};

/**
 * Verify JWT access token
 * @param {string} token
 * @returns {object}
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.jwt.accessSecret);
};

/**
 * Generate a cryptographically secure random refresh token
 * @returns {string}
 */
export const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

/**
 * Compute SHA-256 hash of refresh token for database persistence
 * @param {string} token
 * @returns {string}
 */
export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
