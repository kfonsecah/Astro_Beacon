import { Request, Response, NextFunction } from 'express';
import { logbookService } from '../services/logbook.service.js';
import {
  createLogbookSchema,
  updateLogbookSchema,
  logbookQuerySchema
} from '../schemas/logbook.schema.js';

/**
 * GET /api/v1/logbook
 * Get all logbook entries for the authenticated user
 */
export async function getLogbookEntries(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const query = logbookQuerySchema.parse(req.query);
    const userId = (req as any).user?.sub;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const { entries, pagination } = await logbookService.findAll(
      userId,
      query.page,
      query.limit,
      query.speciesId
    );

    res.status(200).json({
      success: true,
      data: entries,
      pagination
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/logbook/:id
 * Get a single logbook entry by ID
 */
export async function getLogbookEntryById(
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

    const entry = await logbookService.findOne(userId, id);

    res.status(200).json({
      success: true,
      data: entry
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/logbook
 * Create a new logbook entry
 */
export async function createLogbookEntry(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = createLogbookSchema.parse(req.body);
    const userId = (req as any).user?.sub;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const entry = await logbookService.create(userId, input);

    res.status(201).json({
      success: true,
      data: entry
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/logbook/:id
 * Update a logbook entry
 */
export async function updateLogbookEntry(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = updateLogbookSchema.parse(req.body);
    const userId = (req as any).user?.sub;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const entry = await logbookService.update(userId, id, input);

    res.status(200).json({
      success: true,
      data: entry
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/logbook/:id
 * Delete a logbook entry
 */
export async function deleteLogbookEntry(
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

    await logbookService.delete(userId, id);

    res.status(200).json({
      success: true,
      data: { message: 'Logbook entry deleted successfully' }
    });
  } catch (error) {
    next(error);
  }
}
