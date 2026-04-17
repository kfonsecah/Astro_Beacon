import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';

/**
 * POST /api/v1/auth/register
 * Create new user account
 */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    // Validate input
    const input = registerSchema.parse(req.body);

    // Call service
    const result = await authService.register(input);

    // Response envelope
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/login
 * Authenticate user and return tokens
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    // Validate input
    const input = loginSchema.parse(req.body);

    // Call service
    const result = await authService.login(input);

    // Response envelope
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/refresh
 * Exchange refresh token for new access token
 */
export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    // Validate input
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
      return;
    }

    // Call service
    const result = await authService.refresh(refreshToken);

    // Response envelope
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/logout
 * Revoke refresh token(s)
 */
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    // Validate input (refreshToken is optional)
    const { refreshToken } = req.body;

    // Get user ID from request (set by auth middleware)
    const userId = (req as any).user?.sub;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    // Call service
    const result = await authService.logout(userId, refreshToken);

    // Response envelope
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}