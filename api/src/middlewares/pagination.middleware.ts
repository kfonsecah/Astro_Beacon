import { Request, Response, NextFunction, RequestHandler } from 'express';
import { calculatePagination, PaginationResult } from '../utils/pagination.js';

declare global {
  namespace Express {
    interface Request {
      pagination?: PaginationResult;
    }
  }
}

/**
 * Extract page and limit from query params and attach pagination to request
 * Query params: ?page=1&limit=20
 * - page: defaults to 1
 * - limit: defaults to 20, max 100
 */
export const paginationMiddleware: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  req.pagination = calculatePagination(page, limit, 0);

  next();
};