import { NotFoundError } from '../utils/errors.js';

export const notFound = (req, res, next) => {
  next(new NotFoundError(`Cannot find endpoint [${req.method}] ${req.originalUrl}`));
};
