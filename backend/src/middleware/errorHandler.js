import { logger } from '../config/logger.js';
import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  // Log the error internally with details
  logger.error(`[${req.method}] ${req.originalUrl} - ${err.message}`, {
    stack: err.stack,
    name: err.name,
    code: err.code,
  });

  // Handle known application operational errors
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.code, err.details);
  }

  // Handle JSON parsing errors in body-parser
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 'Malformed JSON in request body', 400, 'BAD_REQUEST');
  }

  // Handle PostgreSQL known constraint error codes
  if (err.code) {
    switch (err.code) {
      case '23505': // unique_violation
        return sendError(res, 'A record with this information already exists.', 409, 'CONFLICT');
      case '23503': // foreign_key_violation
        return sendError(res, 'Referenced parent or dependent record does not exist.', 400, 'FOREIGN_KEY_VIOLATION');
      case '23514': // check_violation
        return sendError(res, 'The provided data violates a domain integrity check.', 400, 'CHECK_CONSTRAINT_VIOLATION');
      case '22P02': // invalid_text_representation
        return sendError(res, 'Invalid parameter data format provided.', 400, 'INVALID_INPUT_SYNTAX');
    }
  }

  // Fallback for unhandled unexpected server errors (never leak stack or SQL details)
  return sendError(
    res,
    'An unexpected internal server error occurred. Please try again later.',
    500,
    'INTERNAL_SERVER_ERROR'
  );
};
