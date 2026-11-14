import { ForbiddenError, UnauthorizedError } from '../utils/errors.js';

/**
 * Role-based authorization middleware
 * @param  {...string} allowedRoles - e.g. 'admin', 'provider', 'user'
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required prior to authorization'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access forbidden: Role '${req.user.role}' is not authorized to access this resource.`
        )
      );
    }

    next();
  };
};
