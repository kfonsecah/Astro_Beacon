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

// All routes require authentication
router.use(authenticate);

// GET /api/v1/species - List all species (paginated, with filters)
router.get('/', getSpecies);

// GET /api/v1/species/:id - Get single species
router.get('/:id', getSpeciesById);

// POST /api/v1/species - Create species
router.post('/', createSpecies);

// PUT /api/v1/species/:id - Update species
router.put('/:id', updateSpecies);

// DELETE /api/v1/species/:id - Delete species
router.delete('/:id', deleteSpecies);

export default router;