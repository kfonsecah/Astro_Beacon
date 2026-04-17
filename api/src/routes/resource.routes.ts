import { Router } from 'express';
import {
  getResources,
  getResourceAlerts,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  recordResourceMovement
} from '../controllers/resource.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/resources - List all resources (paginated)
router.get('/', getResources);

// GET /api/v1/resources/alerts - Get resources below threshold
router.get('/alerts', getResourceAlerts);

// GET /api/v1/resources/:id - Get single resource
router.get('/:id', getResource);

// POST /api/v1/resources - Create resource
router.post('/', createResource);

// PUT /api/v1/resources/:id - Update resource
router.put('/:id', updateResource);

// DELETE /api/v1/resources/:id - Delete resource
router.delete('/:id', deleteResource);

// POST /api/v1/resources/:id/movements - Record movement
router.post('/:id/movements', recordResourceMovement);

export default router;