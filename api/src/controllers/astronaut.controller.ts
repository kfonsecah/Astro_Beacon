import { Request, Response, NextFunction } from 'express';
import { astronautService } from '../services/astronaut.service.js';
import {
  createAstronautSchema,
  updateAstronautSchema
} from '../schemas/astronaut.schema.js';

/**
 * POST /api/v1/astronauts
 * Create or update astronaut profile
 */
export async function createOrUpdateAstronaut(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = createAstronautSchema.parse(req.body);
    const userId = (req as any).user?.sub;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const astronaut = await astronautService.createOrUpdate(userId, input);

    res.status(201).json({
      success: true,
      data: astronaut
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/astronauts
 * Get astronaut profile by userId
 */
export async function getAstronaut(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).user?.sub;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const astronaut = await astronautService.findByUser(userId);

    if (!astronaut) {
      res.status(404).json({
        success: false,
        error: 'Astronaut profile not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: astronaut
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/astronauts/:id
 * Update astronaut profile
 */
export async function updateAstronaut(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = updateAstronautSchema.parse(req.body);
    const userId = (req as any).user?.sub;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const astronaut = await astronautService.update(userId, id, input);

    res.status(200).json({
      success: true,
      data: astronaut
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/astronauts/dashboard
 * Get dashboard stats
 */
export async function getDashboard(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).user?.sub;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const dashboard = await astronautService.getDashboard(userId);

    res.status(200).json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    next(error);
  }
}