import { verifyAccessToken } from '../utils/tokens.js';
import { UnauthorizedError } from '../utils/errors.js';

/**
 * Authentication middleware verifying JWT Bearer token
 */
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or malformed authorization header. Format: Bearer <token>');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Authorization token was not provided');
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded; // { id, email, role, fullName }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Access token has expired', { expiredAt: error.expiredAt }));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Invalid access token'));
    }
    next(error);
  }
};
