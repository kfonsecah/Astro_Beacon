import { Request, Response, NextFunction } from 'express';
import { resourceService } from '../services/resource.service.js';
import {
  createResourceSchema,
  updateResourceSchema,
  createMovementSchema,
  resourceQuerySchema
} from '../schemas/resource.schema.js';

/**
 * GET /api/v1/resources
 * Get all resources for the authenticated user
 */
export async function getResources(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const query = resourceQuerySchema.parse(req.query);
    const userId = (req as any).user?.sub;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const { resources, pagination } = await resourceService.findAll(
      userId,
      query.page,
      query.limit
    );

    res.status(200).json({
      success: true,
      data: resources,
      pagination
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/resources/alerts
 * Get all resources below their threshold
 */
export async function getResourceAlerts(
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

    const alerts = await resourceService.getAlerts(userId);

    res.status(200).json({
      success: true,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/resources/:id
 * Get a single resource by ID
 */
export async function getResource(
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

    const resource = await resourceService.findOne(userId, id);

    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/resources
 * Create a new resource
 */
export async function createResource(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = createResourceSchema.parse(req.body);
    const userId = (req as any).user?.sub;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const resource = await resourceService.create(userId, input);

    res.status(201).json({
      success: true,
      data: resource
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/resources/:id
 * Update a resource
 */
export async function updateResource(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = updateResourceSchema.parse(req.body);
    const userId = (req as any).user?.sub;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const resource = await resourceService.update(userId, id, input);

    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/resources/:id
 * Delete a resource
 */
export async function deleteResource(
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

    await resourceService.delete(userId, id);

    res.status(200).json({
      success: true,
      data: { message: 'Resource deleted successfully' }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/resources/:id/movements
 * Record a movement (ingreso/egreso) on a resource
 */
export async function recordResourceMovement(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = createMovementSchema.parse(req.body);
    const userId = (req as any).user?.sub;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const resource = await resourceService.recordMovement(userId, id, input);

    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (error) {
    next(error);
  }
}
