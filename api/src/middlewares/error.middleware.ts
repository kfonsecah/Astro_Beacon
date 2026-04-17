import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err.message);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err as any).map((e: any) => e.message);
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      data: errors
    });
    return;
  }

  // Mongoose duplicate key error
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    res.status(409).json({
      success: false,
      error: `${field} already exists`
    });
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
    return;
  }

  // Operational errors (our custom errors)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
    return;
  }

  // Default error - hide details in production
  const statusCode = 500;
  const message = config.NODE_ENV === 'development' ? err.message : 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(config.NODE_ENV === 'development' && { stack: err.stack })
  });
};
