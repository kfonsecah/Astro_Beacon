import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.util.js';
import { AppError } from '../utils/AppError.js';

/**
 * Authenticate: Verify JWT from Authorization: Bearer <token>
 * Attaches decoded user to req.user
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.slice(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);

    // Attach user to request
    (req as any).user = decoded;

    next();
  } catch (error) {
    next(error);
  }
}