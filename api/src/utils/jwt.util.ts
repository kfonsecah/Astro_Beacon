import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/index.js';
import { AppError } from './AppError.js';

/**
 * Generate JWT access token (1 hour expiry)
 */
export function signToken(payload: object, expiresIn: SignOptions['expiresIn'] = config.JWT.EXPIRES_IN as SignOptions['expiresIn']): string {
  return jwt.sign(payload, config.JWT.SECRET, { expiresIn });
}

/**
 * Generate JWT refresh token (7 days expiry)
 */
export function signRefreshToken(payload: object): string {
  return jwt.sign(payload, config.JWT.SECRET, { expiresIn: config.JWT.REFRESH_EXPIRES_IN as SignOptions['expiresIn'] });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): jwt.JwtPayload {
  try {
    return jwt.verify(token, config.JWT.SECRET) as jwt.JwtPayload;
  } catch (error) {
    throw new AppError('Invalid or expired token', 401);
  }
}

/**
 * Hash a refresh token for storage (allows revocation without storing plaintext)
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate a new refresh token string
 */
export function generateRefreshToken(userId: string): string {
  return signRefreshToken({ sub: userId });
}
