import dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  DATABASE: {
    URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/astro_beacon'
  },
  
  JWT: {
    SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  
  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
  },
  
  CORS: {
    ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || '*').split(',')
  }
};