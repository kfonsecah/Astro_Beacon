import { Router } from 'express';
import {
  getSupplies,
  getSupply,
  collectSupply,
  expireSupply,
  getNearbySupplies
} from '../controllers/supply.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/supplies - List all supplies (paginated, with status filter)
router.get('/', getSupplies);

// GET /api/v1/supplies/nearby - Find nearby supplies
router.get('/nearby', getNearbySupplies);

// GET /api/v1/supplies/:id - Get single supply
router.get('/:id', getSupply);

// POST /api/v1/supplies/:id/collect - Collect supply
router.post('/:id/collect', collectSupply);

// POST /api/v1/supplies/:id/expire - Expire supply (typically for scheduled jobs)
router.post('/:id/expire', expireSupply);

export default router;