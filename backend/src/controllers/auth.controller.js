import { authService } from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';
import {
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_OPTIONS,
} from '../utils/tokens.js';

export const authController = {
  /**
   * Register a new user
   */
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      
      // Set httpOnly refresh cookie
      res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, REFRESH_COOKIE_OPTIONS);

      return sendSuccess(
        res,
        {
          user: result.user,
          accessToken: result.accessToken,
        },
        201
      );
    } catch (err) {
      next(err);
    }
  },

  /**
   * Log in an existing user
   */
  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);

      // Set httpOnly refresh cookie
      res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, REFRESH_COOKIE_OPTIONS);

      return sendSuccess(
        res,
        {
          user: result.user,
          accessToken: result.accessToken,
        },
        200
      );
    } catch (err) {
      next(err);
    }
  },

  /**
   * Refresh expired access token using httpOnly refresh token
   */
  async refresh(req, res, next) {
    try {
      const rawToken = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;
      const result = await authService.refreshToken(rawToken);

      // Set rotated refresh cookie
      res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, REFRESH_COOKIE_OPTIONS);

      return sendSuccess(
        res,
        {
          accessToken: result.accessToken,
          user: result.user,
        },
        200
      );
    } catch (err) {
      next(err);
    }
  },

  /**
   * Logout user and revoke tokens
   */
  async logout(req, res, next) {
    try {
      const rawToken = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;
      await authService.logout(rawToken, req.user?.id);

      res.clearCookie(REFRESH_COOKIE_NAME, {
        ...REFRESH_COOKIE_OPTIONS,
        maxAge: 0,
      });

      return sendSuccess(res, { message: 'Logged out successfully' }, 200);
    } catch (err) {
      next(err);
    }
  },
};
