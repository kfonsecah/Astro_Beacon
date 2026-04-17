import { Router } from 'express';
import {
  getAstronaut,
  createOrUpdateAstronaut,
  updateAstronaut,
  getDashboard
} from '../controllers/astronaut.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/astronaut - Get astronaut profile
router.get('/', getAstronaut);

// PUT /api/v1/astronaut - Update astronaut profile
router.put('/', createOrUpdateAstronaut);

// GET /api/v1/astronaut/stats - Get dashboard stats
router.get('/stats', getDashboard);

export default router;