import { ValidationError } from '../utils/errors.js';

/**
 * Validate incoming HTTP requests using Zod schemas
 * @param {object} schema - { body?: ZodSchema, query?: ZodSchema, params?: ZodSchema }
 */
export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      next();
    } catch (err) {
      if (err.errors) {
        const details = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
          rule: e.code,
        }));
        return next(new ValidationError('Request validation failed', details));
      }
      next(err);
    }
  };
};
