import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, refresh, logout } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// Rate limiter for auth endpoints: 5 attempts per 15 minutes
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    error: 'Too many attempts. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// POST /api/v1/auth/register - rate limited
router.post('/register', authRateLimiter, register);

// POST /api/v1/auth/login - rate limited
router.post('/login', authRateLimiter, login);

// POST /api/v1/auth/refresh - no rate limit (uses refresh token)
router.post('/refresh', refresh);

// POST /api/v1/auth/logout - requires auth
router.post('/logout', authenticate, logout);

export default router;