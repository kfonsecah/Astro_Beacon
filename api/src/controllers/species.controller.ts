import { Request, Response, NextFunction } from 'express';
import { speciesService } from '../services/species.service.js';
import {
  createSpeciesSchema,
  updateSpeciesSchema,
  speciesQuerySchema
} from '../schemas/species.schema.js';

/**
 * GET /api/v1/species
 * Get all species for the authenticated user
 */
export async function getSpecies(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const query = speciesQuerySchema.parse(req.query);
    const userId = (req as any).user?.sub;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const { species, pagination } = await speciesService.findAll(
      query.page,
      query.limit,
      query.classification as any,
      query.dangerLevel as any
    );

    res.status(200).json({
      success: true,
      data: species,
      pagination
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/species/:id
 * Get a single species by ID
 */
export async function getSpeciesById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).user?.sub;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const species = await speciesService.findOne(id);

    res.status(200).json({
      success: true,
      data: species
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/species
 * Create a new species
 */
export async function createSpecies(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = createSpeciesSchema.parse(req.body);
    const userId = (req as any).user?.sub;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const species = await speciesService.create(userId, input);

    res.status(201).json({
      success: true,
      data: species
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/species/:id
 * Update a species
 */
export async function updateSpecies(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = updateSpeciesSchema.parse(req.body);
    const userId = (req as any).user?.sub;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const species = await speciesService.update(userId, id, input);

    res.status(200).json({
      success: true,
      data: species
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/species/:id
 * Delete a species
 */
export async function deleteSpecies(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).user?.sub;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    await speciesService.delete(userId, id);

    res.status(200).json({
      success: true,
      data: { message: 'Species deleted successfully' }
    });
  } catch (error) {
    next(error);
  }
}
