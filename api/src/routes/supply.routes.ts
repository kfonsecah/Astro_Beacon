import { Router } from 'express';
import {
  getSupplies,
  getSupply,
  createSupply,
  updateSupply,
  deleteSupply,
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

// POST /api/v1/supplies - Create supply
router.post('/', createSupply);

// GET /api/v1/supplies/nearby - Find nearby supplies
router.get('/nearby', getNearbySupplies);

// GET /api/v1/supplies/:id - Get single supply
router.get('/:id', getSupply);

// POST /api/v1/supplies/:id/collect - Collect supply
router.post('/:id/collect', collectSupply);

// POST /api/v1/supplies/:id/expire - Expire supply (typically for scheduled jobs)
router.post('/:id/expire', expireSupply);

// PUT /api/v1/supplies/:id - Update supply
router.put('/:id', updateSupply);

// DELETE /api/v1/supplies/:id - Delete supply
router.delete('/:id', deleteSupply);

export default router;