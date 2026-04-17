import { Request, Response, NextFunction } from 'express';
import { tripService } from '../services/trip.service.js';
import {
  createTripSchema,
  updateTripSchema,
  startTripSchema,
  endTripSchema,
  addO2AdjustmentSchema
} from '../schemas/trip.schema.js';
import { TripStatus } from '../models/trip.model.js';

/**
 * POST /api/v1/trips
 * Create a new trip
 */
export async function createTrip(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = createTripSchema.parse(req.body);
    const userId = (req as any).user?.sub;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const trip = await tripService.create(userId, input);

    res.status(201).json({
      success: true,
      data: trip
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/trips
 * Get all trips with pagination and optional status filter
 */
export async function getTrips(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as TripStatus | undefined;
    const userId = (req as any).user?.sub;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const { trips, pagination } = await tripService.findAll(
      userId,
      page,
      limit,
      status
    );

    res.status(200).json({
      success: true,
      data: trips,
      pagination
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/trips/:id
 * Get a single trip by ID
 */
export async function getTrip(
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

    const trip = await tripService.findOne(userId, id);

    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/trips/:id
 * Update a trip
 */
export async function updateTrip(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = updateTripSchema.parse(req.body);
    const userId = (req as any).user?.sub;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const trip = await tripService.update(userId, id, input);

    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/trips/:id/start
 * Start a trip (status: planificado -> activo)
 */
export async function startTrip(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = startTripSchema.parse(req.body);
    const userId = (req as any).user?.sub;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const trip = await tripService.start(userId, id, input);

    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/trips/:id/complete
 * Complete a trip (status: activo -> completado)
 */
export async function completeTrip(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = endTripSchema.parse(req.body);
    const userId = (req as any).user?.sub;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const trip = await tripService.complete(userId, id, input);

    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/trips/:id/abort
 * Abort a trip (status: activo -> abortado)
 */
export async function abortTrip(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = endTripSchema.parse(req.body);
    const userId = (req as any).user?.sub;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const trip = await tripService.abort(userId, id, input);

    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/trips/:id/o2
 * Get calculated O2 for a trip
 */
export async function getTripO2(
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

    // Verify ownership
    await tripService.findOne(userId, id);
    
    const o2Consumed = await tripService.calculateO2(id);

    res.status(200).json({
      success: true,
      data: { o2Consumed }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/trips/:id/o2
 * Add manual O2 adjustment to a trip
 */
export async function addTripO2(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = addO2AdjustmentSchema.parse(req.body);
    const userId = (req as any).user?.sub;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const trip = await tripService.addManualO2(userId, id, input);

    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    next(error);
  }
}