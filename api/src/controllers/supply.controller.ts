import { Request, Response, NextFunction } from 'express';
import { supplyService } from '../services/supply.service.js';
import {
  createSupplySchema,
  updateSupplySchema,
  collectSupplySchema,
  nearbyQuerySchema
} from '../schemas/supply.schema.js';
import { SupplyDropStatus } from '../models/supply.model.js';

/**
 * GET /api/v1/supplies
 * Get all supplies with pagination and optional status filter
 */
export async function getSupplies(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as SupplyDropStatus | undefined;
    const userId = (req as any).user?.sub;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const { supplies, pagination } = await supplyService.findAll(
      userId,
      page,
      limit,
      status
    );

    res.status(200).json({
      success: true,
      data: supplies,
      pagination
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/supplies/:id
 * Get a single supply by ID
 */
export async function getSupply(
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

    const supply = await supplyService.findOne(userId, id);

    res.status(200).json({
      success: true,
      data: supply
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/supplies
 * Create a new supply
 */
export async function createSupply(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = createSupplySchema.parse(req.body);
    const userId = (req as any).user?.sub;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const supply = await supplyService.create(userId, input);
    res.status(201).json({ success: true, data: supply });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/supplies/:id/collect
 * Collect a supply (status: pendiente -> recogido)
 */
export async function collectSupply(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = collectSupplySchema.parse(req.body);
    const userId = (req as any).user?.sub;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const supply = await supplyService.collect(userId, id, input);

    res.status(200).json({
      success: true,
      data: supply
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/supplies/:id/expire
 * Expire a supply (status: pendiente -> expirado)
 * Note: typically called by a scheduled job, not by user
 */
export async function expireSupply(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.params.id as string;

    const supply = await supplyService.expire(id);

    res.status(200).json({
      success: true,
      data: supply
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/supplies/nearby
 * Find nearby supplies using geospatial query
 */
export async function getNearbySupplies(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const query = nearbyQuerySchema.parse(req.query);
    const userId = (req as any).user?.sub;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const supplies = await supplyService.findNearby(
      userId,
      query.lat,
      query.lng,
      query.radius,
      query.status as SupplyDropStatus | undefined
    );

    res.status(200).json({
      success: true,
      data: supplies
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/supplies/:id
 * Update a supply (partial update)
 */
export async function updateSupply(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = updateSupplySchema.parse(req.body);
    const userId = (req as any).user?.sub;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const supply = await supplyService.update(userId, id, input);

    res.status(200).json({
      success: true,
      data: supply
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/supplies/:id
 * Delete a supply
 */
export async function deleteSupply(
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

    await supplyService.delete(userId, id);

    res.status(200).json({
      success: true,
      data: { message: 'Supply deleted successfully' }
    });
  } catch (error) {
    next(error);
  }
}