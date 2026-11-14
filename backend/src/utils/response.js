/**
 * Standard API response envelope helpers
 */

/**
 * Send standard successful response
 * @param {import('express').Response} res
 * @param {any} data
 * @param {number} statusCode
 * @param {object|null} meta
 */
export const sendSuccess = (res, data = null, statusCode = 200, meta = null) => {
  if (statusCode === 204) {
    return res.status(204).send();
  }

  return res.status(statusCode).json({
    success: true,
    data,
    error: null,
    meta,
  });
};

/**
 * Send standard error response
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} statusCode
 * @param {string} code
 * @param {any} details
 */
export const sendError = (res, message = 'An error occurred', statusCode = 500, code = 'INTERNAL_ERROR', details = null) => {
  return res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      message,
      code,
      details,
    },
    meta: null,
  });
};
