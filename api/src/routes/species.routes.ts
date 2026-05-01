import { Router } from 'express';
import {
  getSpecies,
  getSpeciesById,
  createSpecies,
  updateSpecies,
  deleteSpecies
} from '../controllers/species.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// All routes require authentication (for create/update/delete), but species are global
router.use(authenticate);

// GET /api/v1/species - List all species (global, no userId filter)
router.get('/', getSpecies);

// GET /api/v1/species/:id - Get single species by ID (global)
router.get('/:id', getSpeciesById);

// POST /api/v1/species - Create new species (requires auth)
router.post('/', createSpecies);

// PUT /api/v1/species/:id - Update species (requires auth)
router.put('/:id', updateSpecies);

// DELETE /api/v1/species/:id - Delete species (requires auth)
router.delete('/:id', deleteSpecies);

export default router;