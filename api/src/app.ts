import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import expressRateLimit from 'express-rate-limit';
import 'express-async-errors';

import { config } from './config/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import resourceRoutes from './routes/resource.routes.js';
import speciesRoutes from './routes/species.routes.js';
import logbookRoutes from './routes/logbook.routes.js';
import astronautRoutes from './routes/astronaut.routes.js';
import tripRoutes from './routes/trip.routes.js';
import supplyRoutes from './routes/supply.routes.js';
import walkChallengeRoutes from './routes/walk-challenge.routes.js';
import { authenticate } from './middlewares/auth.middleware.js';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);

    if (config.CORS.ALLOWED_ORIGINS.includes('*') ||
        config.CORS.ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Rate limiting - general API
const generalLimiter = expressRateLimit({
  windowMs: config.RATE_LIMIT.WINDOW_MS,
  max: config.RATE_LIMIT.MAX_REQUESTS,
  message: { success: false, error: 'Too many requests, please try again later' }
});
app.use('/api', generalLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check route (before routes, no rate limit)
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV
    }
  });
});

// Auth routes (public)
app.use('/api/v1/auth', authRoutes);

// Domain routes (protected by JWT)
app.use('/api/v1/resources', authenticate, resourceRoutes);
app.use('/api/v1/species', authenticate, speciesRoutes);
app.use('/api/v1/logbook', authenticate, logbookRoutes);
app.use('/api/v1/astronaut', authenticate, astronautRoutes);
app.use('/api/v1/trips', authenticate, tripRoutes);
app.use('/api/v1/supplies', authenticate, supplyRoutes);
app.use('/api/v1/walks', authenticate, walkChallengeRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Global error handler - MUST BE LAST
app.use(errorHandler);

export default app;
