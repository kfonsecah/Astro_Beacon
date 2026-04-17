import { Router } from 'express';
import {
  getLogbookEntries,
  getLogbookEntryById,
  createLogbookEntry,
  updateLogbookEntry,
  deleteLogbookEntry
} from '../controllers/logbook.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/logbook - List all logbook entries (paginated, with species filter)
router.get('/', getLogbookEntries);

// GET /api/v1/logbook/:id - Get single logbook entry
router.get('/:id', getLogbookEntryById);

// POST /api/v1/logbook - Create logbook entry
router.post('/', createLogbookEntry);

// PUT /api/v1/logbook/:id - Update logbook entry
router.put('/:id', updateLogbookEntry);

// DELETE /api/v1/logbook/:id - Delete logbook entry
router.delete('/:id', deleteLogbookEntry);

export default router;